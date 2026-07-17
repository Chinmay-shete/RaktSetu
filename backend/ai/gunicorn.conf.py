import os
import multiprocessing

bind             = f"0.0.0.0:{os.environ.get('PORT', '10000')}"
workers          = multiprocessing.cpu_count() * 2 + 1
worker_class     = "gevent"
worker_connections = 100
timeout          = 30
keepalive        = 5
max_requests     = 1000
max_requests_jitter = 100
preload_app      = True