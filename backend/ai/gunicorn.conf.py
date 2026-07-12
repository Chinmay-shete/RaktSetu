# gunicorn.conf.py — Production config for RaktSetu AI service
import multiprocessing

# Workers: (2 × CPU cores) + 1 for I/O-bound; 
# Use gevent for async (important for Flask)
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gevent"
worker_connections = 100
timeout = 30
keepalive = 5
bind = "0.0.0.0:5001"
max_requests = 1000
max_requests_jitter = 100
preload_app = True  # Load model once, share across workers
