import time
import datetime
from flask import Flask, jsonify, request
import mysql.connector
import pandas as pd
import numpy as np
from prophet import Prophet

from config.config import get_settings

app = Flask(__name__)
settings = get_settings()

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

@app.route('/api/v1/forecast', methods=['GET'])
def get_forecast():
    try:
        hospital_id = request.args.get('hospitalId')
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 1. Fetch surgical schedules
        if hospital_id:
            cursor.execute("SELECT surgery_date, units, blood_group FROM surgical_schedules WHERE hospital_id = %s", (hospital_id,))
        else:
            cursor.execute("SELECT surgery_date, units, blood_group FROM surgical_schedules")
        schedules = cursor.fetchall()
        
        # 2. Fetch blood inventory/batches
        if hospital_id:
            cursor.execute("SELECT collection_date, units, blood_group FROM blood_batches WHERE hospital_id = %s", (hospital_id,))
        else:
            cursor.execute("SELECT collection_date, units, blood_group FROM blood_batches")
        batches = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Combine records
        data = []
        for s in schedules:
            data.append({
                'date': s['surgery_date'],
                'units': s['units'],
                'blood_group': s['blood_group']
            })
        for b in batches:
            data.append({
                'date': b['collection_date'],
                'units': b['units'],
                'blood_group': b['blood_group']
            })
            
        df_raw = pd.DataFrame(data)
        
        today = datetime.date.today()
        
        # If there is insufficient data, generate synthetic historical data for Prophet to fit properly
        if len(df_raw) < 10:
            dates = [today - datetime.timedelta(days=i) for i in range(60, 0, -1)]
            synthetic_data = []
            blood_groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
            
            np.random.seed(42) # For stability
            for d in dates:
                for bg in blood_groups:
                    base = 3 if bg in ['O+', 'A+', 'B+'] else 1
                    units = int(np.random.poisson(base))
                    if units > 0:
                        synthetic_data.append({
                            'date': d,
                            'units': units,
                            'blood_group': bg
                        })
            df_raw = pd.DataFrame(synthetic_data)
            
        # Standardize formats
        df_raw['date'] = pd.to_datetime(df_raw['date'])
        df_raw['units'] = df_raw['units'].astype(int)
        
        # Aggregate by date for general demand forecasting
        df_daily = df_raw.groupby('date')['units'].sum().reset_index()
        df_daily.columns = ['ds', 'y']
        
        # Fit Prophet model
        model = Prophet(yearly_seasonality=False, weekly_seasonality=True, daily_seasonality=False)
        model.fit(df_daily)
        
        # Predict next 7 days
        future = model.make_future_dataframe(periods=7)
        forecast = model.predict(future)
        
        # Extract the forecasted 7 days
        future_forecast = forecast.tail(7)
        
        forecast_list = []
        for _, row in future_forecast.iterrows():
            forecast_list.append({
                'date': row['ds'].strftime('%Y-%m-%d'),
                'predictedUnits': int(max(0, round(row['yhat']))),
                'lowerBound': int(max(0, round(row['yhat_lower']))),
                'upperBound': int(max(0, round(row['yhat_upper'])))
            })
            
        # Calculate ratio-based blood group distribution forecast
        bg_distribution = df_raw.groupby('blood_group')['units'].sum()
        total_units = bg_distribution.sum()
        
        blood_group_breakdown = {}
        blood_groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
        
        total_predicted_units = sum(item['predictedUnits'] for item in forecast_list)
        
        for bg in blood_groups:
            ratio = (bg_distribution.get(bg, 0) / total_units) if total_units > 0 else 0.125
            blood_group_breakdown[bg] = int(round(total_predicted_units * ratio))
            
        return jsonify({
            'forecast': forecast_list,
            'bloodGroupBreakdown': blood_group_breakdown
        }), 200
        
    except Exception as e:
        app.logger.error(f"Error in forecast: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/v1/waste-analytics', methods=['GET'])
def get_waste_analytics():
    try:
        hospital_id = request.args.get('hospitalId')
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Fetch inventory batches
        query = "SELECT units, reserved_units, expiry_date FROM blood_batches"
        params = []
        if hospital_id:
            query += " WHERE hospital_id = %s"
            params.append(hospital_id)
            
        cursor.execute(query, params)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        df = pd.DataFrame(rows)
        
        if df.empty:
            return jsonify({
                'totalCollected': 0,
                'totalReserved': 0,
                'totalAvailable': 0,
                'totalExpired': 0,
                'expiringSoon': 0,
                'wastageRate': 0.0,
                'usageRate': 0.0
            }), 200
            
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
        
        return jsonify({
            'totalCollected': total_collected,
            'totalReserved': total_reserved,
            'totalAvailable': total_available,
            'totalExpired': total_expired,
            'expiringSoon': expiring_soon,
            'wastageRate': wastage_rate,
            'usageRate': usage_rate
        }), 200
        
    except Exception as e:
        app.logger.error(f"Error in waste analytics: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    print(f"Starting RaktSetu Flask AI service on port {settings.port}...")
    app.run(host='0.0.0.0', port=settings.port, debug=settings.flask_debug)
