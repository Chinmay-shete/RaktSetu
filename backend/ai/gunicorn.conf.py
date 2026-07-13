# gunicorn.conf.py — Production config for RaktSetu AI service
import multiprocessing

# Limit workers to 1 to fit within Render Free Tier's 512MB memory limit
workers = 1
worker_class = "gevent"
worker_connections = 100
timeout = 30
keepalive = 5
# Bind dynamically to the PORT environment variable (default to 5001)
import os
port = os.environ.get("PORT", "5001")
bind = f"0.0.0.0:{port}"
max_requests = 1000
max_requests_jitter = 100
preload_app = True  # Load model once, share across workers
