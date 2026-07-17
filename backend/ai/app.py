# ─── MUST BE ABSOLUTE FIRST — before any other imports ───
from gevent import monkey
monkey.patch_all()

# ─── Standard imports ───
import time
import datetime
import os
import json
import pandas as pd  # ← was missing, caused crash in waste analytics
from collections import OrderedDict

from flask import Flask, jsonify, request
import mysql.connector
import redis
from celery.result import AsyncResult

from config.config import get_settings
from tasks import celery_app, generate_forecast_task

app = Flask(__name__)
settings = get_settings()

# Initialize Redis client
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
r = redis.Redis.from_url(REDIS_URL, decode_responses=True)

# ─── Auth middleware ───
@app.before_request
def require_internal_token():
    if request.path == '/api/v1/health':
        return
    token = request.headers.get('X-Internal-Token')
    if not token or token != settings.internal_api_secret:
        return jsonify({"error": "Unauthorized inter-service request"}), 401

# ─── DB helper ───
def get_db_connection():
    conn_args = {
        'host': settings.db_host,
        'port': settings.db_port,
        'user': settings.db_user,
        'password': settings.db_password,
        'database': settings.db_name,
        'connect_timeout': 5
    }
    if os.getenv('DB_SSL') == 'true':
        conn_args['ssl_disabled'] = False
        if os.getenv('DB_SSL_REJECT_UNAUTHORIZED') == 'false':
            conn_args['ssl_verify_cert'] = False
    return mysql.connector.connect(**conn_args)

# ─── Health check ───
@app.route('/api/v1/health', methods=['GET'])
def health_check():
    try:
        db_status = 'unknown'
        db_error = None
        start_time = time.time()
        try:
            conn = get_db_connection()
            if conn.is_connected():
                db_status = 'healthy'
                conn.close()
        except Exception as e:
            db_status = 'unhealthy'
            db_error = str(e)

        latency = time.time() - start_time
        response = {
            'status': 'OK' if db_status == 'healthy' else 'DEGRADED',
            'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'services': {
                'database': {
                    'status': db_status,
                    'latencyMs': round(latency * 1000, 2)
                },
                'ai_service': {'status': 'healthy'}
            }
        }
        if db_error:
            response['services']['database']['error'] = "Database connection issue"
        return jsonify(response), 200 if db_status == 'healthy' else 500
    except Exception as e:
        app.logger.error(f"Health check error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# ─── Forecast trigger ───
@app.route('/api/v1/forecast', methods=['POST'])
def get_forecast():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({'error': 'Request body must be valid JSON'}), 400

        required = ['blood_group', 'hospital_id', 'days']
        missing = [f for f in required if f not in data]
        if missing:
            return jsonify({'error': f'Missing required fields: {missing}'}), 400

        blood_group = str(data['blood_group']).strip()
        valid_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        if blood_group not in valid_groups:
            return jsonify({'error': f'Invalid blood group. Must be one of: {valid_groups}'}), 400

        try:
            days = int(data['days'])
            if not (1 <= days <= 90):
                raise ValueError
        except (ValueError, TypeError):
            return jsonify({'error': 'days must be an integer between 1 and 90'}), 400

        try:
            hospital_id = int(data['hospital_id'])
        except (ValueError, TypeError):
            return jsonify({'error': 'hospital_id must be a valid integer'}), 400

        cache_key = f"forecast:{hospital_id}:{blood_group}:{days}"
        cached = r.get(cache_key)
        if cached:
            return jsonify({
                'status': 'ready',
                'data': json.loads(cached),
                'source': 'cache'
            }), 200

        task = generate_forecast_task.delay(hospital_id, blood_group, days)
        return jsonify({
            'status': 'generating',
            'task_id': task.id,
            'message': 'Forecast is being generated. Poll /api/v1/forecast/status/<task_id>'
        }), 202

    except Exception as e:
        app.logger.error(f"Forecast trigger error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# ─── Forecast status ───
@app.route('/api/v1/forecast/status/<task_id>', methods=['GET'])
def forecast_status(task_id):
    try:
        result = AsyncResult(task_id, app=celery_app)
        if result.state == 'SUCCESS':
            return jsonify({'status': 'ready', 'data': result.result}), 200
        elif result.state == 'FAILURE':
            app.logger.error(f"Celery task {task_id} failed: {result.result}")
            return jsonify({'status': 'error', 'message': str(result.result)}), 500
        return jsonify({'status': result.state.lower()}), 200
    except Exception as e:
        app.logger.error(f"Task status error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# ─── Waste analytics ───
@app.route('/api/v1/waste-analytics', methods=['GET'])
def get_waste_analytics():
    try:
        hospital_id = request.args.get('hospitalId')
        if hospital_id:
            try:
                hospital_id = int(hospital_id)
            except (ValueError, TypeError):
                return jsonify({'error': 'hospitalId must be a valid integer'}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = "SELECT units, reserved_units, expiry_date, blood_group, collection_date FROM blood_batches"
        params = []
        if hospital_id:
            query += " WHERE hospital_id = %s"
            params.append(hospital_id)
        cursor.execute(query, params)
        batches_rows = cursor.fetchall()

        schedules_query = "SELECT units, blood_group, surgery_date FROM surgical_schedules"
        schedules_params = []
        if hospital_id:
            schedules_query += " WHERE hospital_id = %s"
            schedules_params.append(hospital_id)
        cursor.execute(schedules_query, schedules_params)
        schedules_rows = cursor.fetchall()

        transfers_query = "SELECT status FROM transfer_requests"
        transfers_params = []
        if hospital_id:
            transfers_query += " WHERE from_hospital = %s OR to_hospital = %s"
            transfers_params.extend([hospital_id, hospital_id])
        cursor.execute(transfers_query, transfers_params)
        transfers_rows = cursor.fetchall()

        cursor.close()
        conn.close()

        df = pd.DataFrame(batches_rows)

        if df.empty:
            total_collected = total_reserved = total_available = 0
            total_expired = expiring_soon = 0
            wastage_rate = usage_rate = 0.0
        else:
            df['expiry_date'] = pd.to_datetime(df['expiry_date'])
            today = pd.to_datetime(datetime.date.today())
            total_collected   = int(df['units'].sum())
            total_reserved    = int(df['reserved_units'].sum())
            total_available   = int((df['units'] - df['reserved_units']).sum())
            expired_mask      = df['expiry_date'] < today
            total_expired     = int(df.loc[expired_mask, 'units'].sum())
            soon_mask         = (df['expiry_date'] >= today) & \
                                (df['expiry_date'] <= today + pd.Timedelta(days=30))
            expiring_soon     = int(df.loc[soon_mask, 'units'].sum())
            wastage_rate = round((total_expired / total_collected) * 100, 2) \
                           if total_collected > 0 else 0.0
            usage_rate   = round(((total_collected - total_available) / total_collected) * 100, 2) \
                           if total_collected > 0 else 0.0

        today_date = datetime.date.today()
        months_dict = OrderedDict()
        for i in range(5, -1, -1):
            d = today_date - datetime.timedelta(days=i * 30)
            months_dict[d.strftime('%b')] = {'usage': 0, 'collections': 0}

        for row in schedules_rows:
            sd = row['surgery_date']
            if isinstance(sd, (datetime.date, datetime.datetime)):
                m = sd.strftime('%b')
                if m in months_dict:
                    months_dict[m]['usage'] += int(row['units'])

        for row in batches_rows:
            cd = row['collection_date']
            if isinstance(cd, (datetime.date, datetime.datetime)):
                m = cd.strftime('%b')
                if m in months_dict:
                    months_dict[m]['collections'] += int(row['units'])

        monthly_usage_list = [
            {'month': m, 'usage': v['usage'], 'collections': v['collections']}
            for m, v in months_dict.items()
        ]

        blood_groups = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-']
        demand_dict  = {bg: 0 for bg in blood_groups}
        supply_dict  = {bg: 0 for bg in blood_groups}

        for row in schedules_rows:
            bg = row['blood_group']
            if bg in demand_dict:
                demand_dict[bg] += int(row['units'])

        for row in batches_rows:
            bg = row['blood_group']
            if bg in supply_dict:
                supply_dict[bg] += int(row['units'] - row['reserved_units'])

        blood_demand_by_group = {
            'labels': blood_groups,
            'demand': [demand_dict[bg] for bg in blood_groups],
            'supply': [supply_dict[bg] for bg in blood_groups]
        }

        completed_transfers = failed_transfers = 0
        for row in transfers_rows:
            if row['status'] in ['accepted', 'completed']:
                completed_transfers += 1
            elif row['status'] in ['rejected', 'cancelled']:
                failed_transfers += 1

        total_transfers = completed_transfers + failed_transfers
        transfer_success_rate = round(
            (completed_transfers / total_transfers) * 100, 2
        ) if total_transfers > 0 else 100.0

        return jsonify({
            'totalCollected':       total_collected,
            'totalReserved':        total_reserved,
            'totalAvailable':       total_available,
            'totalExpired':         total_expired,
            'expiringSoon':         expiring_soon,
            'wastageRate':          wastage_rate,
            'usageRate':            usage_rate,
            'monthlyUsage':         monthly_usage_list,
            'bloodDemandByGroup':   blood_demand_by_group,
            'transferSuccessRate':  transfer_success_rate,
            'totalTransfers':       total_transfers,
            'completedTransfers':   completed_transfers,
            'failedTransfers':      failed_transfers
        }), 200

    except Exception as e:
        app.logger.error(f"Waste analytics error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# ─── Local dev only — Gunicorn ignores this block on Render ───
if __name__ == '__main__':
    port = int(os.environ.get('PORT', settings.port))
    print(f"Starting RaktSetu Flask AI on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=settings.flask_debug)