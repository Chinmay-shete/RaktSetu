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
    // DB is offline or errored, but we still want to respond with 500 error code
    return res.status(500).json({
      error: true,
      message: `Health check failed: database connection issue: ${error.message}`,
      code: 'DATABASE_OFFLINE'
    });
  }
}

module.exports = {
  getHealth
};
