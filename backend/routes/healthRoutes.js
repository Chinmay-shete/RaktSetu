const express = require('express');
const { pool } = require('../config/db');
const redis = require('../config/redis');

const router = express.Router();

router.get('/health', async (req, res) => {
  const checks = {};
  let overallOk = true;

  // DB check
  try {
    await pool.query('SELECT 1');
    checks.database = 'ok';
  } catch (err) {
    checks.database = 'error';
    overallOk = false;
  }

  // Redis check
  try {
    await redis.ping();
    checks.redis = 'ok';
  } catch (err) {
    checks.redis = 'degraded'; // Non-critical for system availability but degraded
  }

  // Flask AI check (with 2s timeout)
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2000);
    const flaskUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    const r = await fetch(`${flaskUrl}/api/v1/health`, { signal: ctrl.signal });
    clearTimeout(t);
    checks.ai_service = r.ok ? 'ok' : 'degraded';
  } catch (err) {
    checks.ai_service = 'degraded'; // Non-critical
  }

  checks.uptime = process.uptime();
  checks.memoryMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

  res.status(overallOk ? 200 : 503).json({
    status: overallOk ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks
  });
});

module.exports = router;
