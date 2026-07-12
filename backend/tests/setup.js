require('dotenv').config();
const { pool } = require('../config/db');
const redis = require('../config/redis');

const { execSync } = require('child_process');
const path = require('path');

// Clean Redis cache and reset DB before all tests to prevent cross-test contamination
beforeAll(async () => {
  try {
    // Reset database to initial seed state
    execSync('node seed.js', { cwd: path.join(__dirname, '..'), stdio: 'ignore' });
  } catch (err) {
    console.error('DATABASE SEEDING FAILED IN SETUP:', err);
  }
  try {
    await redis.flushall();
  } catch (err) {
    console.error('FLUSHALL FAILED:', err);
  }
});

// Close database pool and Redis connection after all tests complete
afterAll(async () => {
  await pool.end();
  try {
    await redis.quit();
  } catch (err) {
    // Ignore
  }
});
