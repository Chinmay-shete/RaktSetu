import time
import datetime
import os
import json
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
r = redis.Redis.from_url(REDIS_URL)

@app.before_request
def require_internal_token():
    # Allow health check to pass without token
    if request.path == '/api/v1/health':
        return
    
    token = request.headers.get('X-Internal-Token')
    if not token or token != settings.internal_api_secret:
        return jsonify({"error": "Unauthorized inter-service request"}), 401

def get_db_connection():
    return mysql.connector.connect(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        database=settings.db_name,
        connect_timeout=5
    )

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
                'ai_service': {
                    'status': 'healthy'
                }
            }
        }
        
        if db_error:
            response['services']['database']['error'] = "Database connection issue"
            
        status_code = 200 if db_status == 'healthy' else 500
        return jsonify(response), status_code
    except Exception as e:
        app.logger.error(f"Error in health check: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

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

        # Check Redis Cache
        cache_key = f"forecast:{hospital_id}:{blood_group}:{days}"
        cached = r.get(cache_key)
        
        if cached:
            return jsonify({'status': 'ready', 'data': json.loads(cached), 'source': 'cache'}), 200
        
        # Dispatch background Celery task
        task = generate_forecast_task.delay(hospital_id, blood_group, days)
        return jsonify({
            'status': 'generating',
            'task_id': task.id,
            'message': 'Forecast is being generated in background. Poll status endpoint.'
        }), 202

    except Exception as e:
        app.logger.error(f"Error in forecast trigger: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

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
        app.logger.error(f"Error in task status check: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

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
        
        # 1. Fetch inventory batches (current supply + collections history)
        query = "SELECT units, reserved_units, expiry_date, blood_group, collection_date FROM blood_batches"
        params = []
        if hospital_id:
            query += " WHERE hospital_id = %s"
            params.append(hospital_id)
            
        cursor.execute(query, params)
        batches_rows = cursor.fetchall()
        
        # 2. Fetch surgical schedules (demand history)
        schedules_query = "SELECT units, blood_group, surgery_date FROM surgical_schedules"
        schedules_params = []
        if hospital_id:
            schedules_query += " WHERE hospital_id = %s"
            schedules_params.append(hospital_id)
        cursor.execute(schedules_query, schedules_params)
        schedules_rows = cursor.fetchall()
        
        # 3. Fetch transfer requests (success rate calculation)
        transfers_query = "SELECT status FROM transfer_requests"
        transfers_params = []
        if hospital_id:
            transfers_query += " WHERE from_hospital = %s OR to_hospital = %s"
            transfers_params.extend([hospital_id, hospital_id])
        cursor.execute(transfers_query, transfers_params)
        transfers_rows = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # ─── Calculate Core Metrics ───
        df = pd.DataFrame(batches_rows)
        
        if df.empty:
            total_collected = 0
            total_reserved = 0
            total_available = 0
            total_expired = 0
            expiring_soon = 0
            wastage_rate = 0.0
            usage_rate = 0.0
        else:
            df['expiry_date'] = pd.to_datetime(df['expiry_date'])
            today = pd.to_datetime(datetime.date.today())
            
            total_collected = int(df['units'].sum())
            total_reserved = int(df['reserved_units'].sum())
            total_available = int((df['units'] - df['reserved_units']).sum())
            
            # Expired: expiry_date < today
            expired_mask = df['expiry_date'] < today
            total_expired = int(df.loc[expired_mask, 'units'].sum())
            
            # Expiring soon: today <= expiry_date <= today + 30 days
            expiring_soon_mask = (df['expiry_date'] >= today) & (df['expiry_date'] <= today + pd.Timedelta(days=30))
            expiring_soon = int(df.loc[expiring_soon_mask, 'units'].sum())
            
            wastage_rate = round((total_expired / total_collected) * 100, 2) if total_collected > 0 else 0.0
            usage_rate = round(((total_collected - total_available) / total_collected) * 100, 2) if total_collected > 0 else 0.0

        # ─── Calculate Monthly Usage vs Collections (Last 6 Months) ───
        from collections import OrderedDict
        today_date = datetime.date.today()
        months_dict = OrderedDict()
        for i in range(5, -1, -1):
            # approximate 30 days step back
            d = today_date - datetime.timedelta(days=i*30)
            month_name = d.strftime('%b')
            months_dict[month_name] = {'usage': 0, 'collections': 0}
            
        for row in schedules_rows:
            surgery_date = row['surgery_date']
            if isinstance(surgery_date, (datetime.date, datetime.datetime)):
                month_name = surgery_date.strftime('%b')
                if month_name in months_dict:
                    months_dict[month_name]['usage'] += int(row['units'])
                    
        for row in batches_rows:
            collection_date = row['collection_date']
            if isinstance(collection_date, (datetime.date, datetime.datetime)):
                month_name = collection_date.strftime('%b')
                if month_name in months_dict:
                    months_dict[month_name]['collections'] += int(row['units'])
                    
        monthly_usage_list = [
            {'month': m, 'usage': val['usage'], 'collections': val['collections']}
            for m, val in months_dict.items()
        ]
        
        # ─── Calculate Blood Group Demand vs Supply ───
        blood_groups = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-']
        demand_dict = {bg: 0 for bg in blood_groups}
        supply_dict = {bg: 0 for bg in blood_groups}
        
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
        
        # ─── Calculate Peer Transfer Success Rate ───
        completed_transfers = 0
        failed_transfers = 0
        for row in transfers_rows:
            status = row['status']
            if status in ['accepted', 'completed']:
                completed_transfers += 1
            elif status in ['rejected', 'cancelled']:
                failed_transfers += 1
                
        total_transfers = completed_transfers + failed_transfers
        transfer_success_rate = 100.0
        if total_transfers > 0:
            transfer_success_rate = round((completed_transfers / total_transfers) * 100, 2)
            
        return jsonify({
            'totalCollected': total_collected,
            'totalReserved': total_reserved,
            'totalAvailable': total_available,
            'totalExpired': total_expired,
            'expiringSoon': expiring_soon,
            'wastageRate': wastage_rate,
            'usageRate': usage_rate,
            'monthlyUsage': monthly_usage_list,
            'bloodDemandByGroup': blood_demand_by_group,
            'transferSuccessRate': transfer_success_rate,
            'totalTransfers': total_transfers,
            'completedTransfers': completed_transfers,
            'failedTransfers': failed_transfers
        }), 200
        
    except Exception as e:
        app.logger.error(f"Error in waste analytics: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    print(f"Starting RaktSetu Flask AI service on port {settings.port}...")
    app.run(host='0.0.0.0', port=settings.port, debug=settings.flask_debug)
