const Redis = require('ioredis');

let redis;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    lazyConnect: true,
    enableOfflineQueue: false,
    connectTimeout: 2000,
  });
} else {
  redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    lazyConnect: true,
    enableOfflineQueue: false,
    connectTimeout: 2000,
  });
}

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));

module.exports = redis;
