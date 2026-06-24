import time
from flask import Flask, jsonify
import mysql.connector

from config.config import get_settings

app = Flask(__name__)
settings = get_settings()

@app.route('/api/v1/health', methods=['GET'])
def health_check():
    db_status = 'unknown'
    db_error = None
    start_time = time.time()
    try:
        # Try to connect to MySQL
        conn = mysql.connector.connect(
            host=settings.db_host,
            port=settings.db_port,
            user=settings.db_user,
            password=settings.db_password,
            database=settings.db_name,
            connect_timeout=3
        )
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
        response['services']['database']['error'] = db_error
        
    status_code = 200 if db_status == 'healthy' else 500
    return jsonify(response), status_code

if __name__ == '__main__':
    # Run the application on host 0.0.0.0 and port 5001
    print(f"Starting RaktSetu Flask AI service on port {settings.port}...")
    app.run(host='0.0.0.0', port=settings.port, debug=settings.flask_debug)
