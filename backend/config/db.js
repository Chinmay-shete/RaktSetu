const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'raktsetu',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  // Enable support for multiple statements (crucial for executing schema.sql)
  multipleStatements: true
});

// Test connection function
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully.');
    // Check if spatial index capabilities exist (MySQL 5.7+ / 8.0)
    const [rows] = await connection.query('SELECT VERSION() AS version');
    console.log(`📡 MySQL Server Version: ${rows[0].version}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

module.exports = {
  pool,
  testConnection
};
