const { pool } = require('../config/db');

async function getHealth(req, res, next) {
  try {
    // Check DB connection
    const start = Date.now();
    const [rows] = await pool.query('SELECT 1 as ok');
    const dbLatency = Date.now() - start;

    return res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'healthy',
          latencyMs: dbLatency
        },
        api: {
          status: 'healthy'
        }
      }
    });
  } catch (error) {
    console.error('Health check failed (Database Offline):', error);
    return res.status(500).json({
      status: 'unhealthy'
    });
  }
}

module.exports = {
  getHealth
};
