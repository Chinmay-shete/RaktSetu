const { pool } = require('../config/db');

async function getHealth(req, res, next) {
  try {
    // Check database connectivity
    const connection = await pool.getConnection();
    let dbStatus = 'healthy';
    let dbVersion = 'unknown';

    try {
      const [rows] = await connection.query('SELECT VERSION() AS version');
      dbVersion = rows[0].version;
    } catch (dbError) {
      dbStatus = 'unhealthy';
      console.error('Database query failed in health check:', dbError);
    } finally {
      connection.release();
    }

    res.status(200).json({
      status: 'success',
      message: 'RaktSetu API is running.',
      timestamp: new Date(),
      uptime: process.uptime(),
      db: {
        status: dbStatus,
        version: dbVersion
      }
    });
  } catch (error) {
    // If we can't get a connection from the pool, DB is down
    res.status(500).json({
      error: true,
      message: 'API is up, but database connection failed: ' + error.message,
      code: 'DATABASE_CONNECTION_ERROR'
    });
  }
}

module.exports = {
  getHealth
};
