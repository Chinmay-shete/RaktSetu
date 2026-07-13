# gunicorn.conf.py — Production config for RaktSetu AI service
import multiprocessing

# Limit workers to 1 to fit within Render Free Tier's 512MB memory limit
workers = 1
worker_class = "gevent"
worker_connections = 100
timeout = 30
keepalive = 5
bind = "0.0.0.0:5001"
max_requests = 1000
max_requests_jitter = 100
preload_app = True  # Load model once, share across workers
