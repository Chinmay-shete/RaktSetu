const { pool } = require('./config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SEVERITY HIGH WARNING: Database seeding is disabled in production to prevent data loss.');
  }
  console.log('Starting clean database reset and seeding...');
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Disable FK checks to clear tables
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const tables = [
      'refresh_tokens', 'notifications', 'emergency_pledges', 'donations',
      'blood_batches', 'transfer_requests', 'emergency_requests', 'donors',
      'donation_camps', 'forecasts', 'surgical_schedules', 'alert_thresholds',
      'audit_logs', 'users', 'hospitals', 'districts', 'otp_codes'
    ];

    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE ${table}`);
      console.log(`Truncated table: ${table}`);
    }

    // 2. Hash password (password123)
    const passwordHash = bcrypt.hashSync('password123', 10);

    // 3. Insert Districts with Coordinates
    console.log('Inserting default districts...');
    await connection.query(`
      INSERT INTO districts (id, name, state, officer_id, zone, lat, lng) VALUES
      (1, 'Pune', 'Maharashtra', NULL, 'West', 18.5204, 73.8567),
      (2, 'Mumbai', 'Maharashtra', NULL, 'West', 19.0760, 72.8777),
      (3, 'Surat', 'Gujarat', NULL, 'West', 21.1702, 72.8311)
    `);

    // 4. Insert Single System Admin User
    console.log('Inserting main System Admin user...');
    await connection.query(`
      INSERT INTO users (id, email, phone, password_hash, role, hospital_id, district_id, status, full_name, designation) VALUES
      (1, 'system@raktsetu.gov', '9876543210', '${passwordHash}', 'sysadmin', NULL, NULL, 'Active', 'System Administrator', 'Root Admin')
    `);

    await connection.commit();
    console.log('Clean database seeding completed successfully.');
  } catch (error) {
    await connection.rollback();
    console.error('Clean database seeding failed:', error.message);
  } finally {
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    connection.release();
    process.exit(0);
  }
}

seed();
