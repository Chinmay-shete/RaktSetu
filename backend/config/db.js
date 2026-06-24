const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'raktsetu',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL_SIZE || '10', 10),
  queueLimit: 0,
  // Add support for spatial coordinates if needed, but standard query results are fine
});

// Test connection function
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
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
  pool,
  testConnection
};
