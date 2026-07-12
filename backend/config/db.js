const mysql = require('mysql2/promise');
require('dotenv').config();

// Write pool (primary DB)
const writePool = mysql.createPool({
  host:               process.env.DB_HOST || '127.0.0.1',
  port:               parseInt(process.env.DB_PORT || '3306', 10),
  user:               process.env.DB_USER || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME || 'raktsetu',
  waitForConnections: true,
  connectionLimit:    parseInt(process.env.DB_POOL_SIZE || '50', 10),    // Increased from 10 → 50
  queueLimit:         200,   // Queue up to 200 requests if pool is full
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0
});

// Read pool (replica — use same DB host until you add a real replica)
const readPool = mysql.createPool({
  host:               process.env.DB_READ_HOST || process.env.DB_HOST || '127.0.0.1',
  port:               parseInt(process.env.DB_PORT || '3306', 10),
  user:               process.env.DB_USER || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME || 'raktsetu',
  waitForConnections: true,
  connectionLimit:    parseInt(process.env.DB_READ_POOL_SIZE || '100', 10),   // Reads can have larger pool
  queueLimit:         500,
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0
});

// Helper: use readPool for SELECT, writePool for INSERT/UPDATE/DELETE
const db = {
  query: (sql, params) => {
    const isWrite = /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|REPLACE)/i.test(sql);
    return isWrite ? writePool.query(sql, params) : readPool.query(sql, params);
  },
  transaction: async (callback) => {
    const conn = await writePool.getConnection();
    await conn.beginTransaction();
    try {
      const result = await callback(conn);
      await conn.commit();
      conn.release();
      return result;
    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  }
};

// Test connection function
async function testConnection() {
  let connection;
  try {
    connection = await writePool.getConnection();
    console.log('Database connection pool established successfully.');
    return true;
  } catch (error) {
    console.error('Failed to connect to the database:', error.message);
    return false;
  } finally {
    if (connection) connection.release();
  }
}

module.exports = {
  pool: writePool,
  writePool,
  readPool,
  db,
  testConnection
};

