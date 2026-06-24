const { pool } = require('../config/db');

// Close database pool after all tests complete to prevent hanging
afterAll(async () => {
  await pool.end();
});
