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
      (3, 'Surat', 'Gujarat', NULL, 'West', 21.1702, 72.8311),
      (4, 'Satara', 'Maharashtra', NULL, 'West', 17.6805, 73.9918),
      (5, 'Sangli', 'Maharashtra', NULL, 'West', 16.8524, 74.5815)
    `);

    // 3b. Insert Seed Hospitals
    console.log('Inserting seed hospitals...');
    await connection.query(`
      INSERT INTO hospitals (id, name, district_id, type, lat, lng, location, license_no, address, city, state, pincode, contact, verification_status) VALUES
      (1, 'Pune Ruby Hall Clinic', 1, 'Private', 18.5323, 73.8770, ST_GeomFromText('POINT(73.8770 18.5323)', 4326), 'LIC-PUNE-001', '40 Sassoon Road, near Pune Station', 'Pune', 'Maharashtra', '411001', '020-66455100', 'verified'),
      (2, 'KEM Hospital Pune', 1, 'Trust', 18.5255, 73.8690, ST_GeomFromText('POINT(73.8690 18.5255)', 4326), 'LIC-PUNE-002', '489 Rasta Peth, Sardar Moodliar Road', 'Pune', 'Maharashtra', '411011', '020-26217300', 'verified'),
      (3, 'Sassoon General Hospital Pune', 1, 'Government', 18.5283, 73.8732, ST_GeomFromText('POINT(73.8732 18.5283)', 4326), 'LIC-PUNE-003', 'Jai Prakash Narayan Road, near Pune Station', 'Pune', 'Maharashtra', '411001', '020-26128000', 'verified'),
      (4, 'Surat Municipal Hospital', 3, 'Government', 21.1702, 72.8311, ST_GeomFromText('POINT(72.8311 21.1702)', 4326), 'LIC-SATARA-001', 'Surat Municipal Road', 'Surat', 'Gujarat', '395003', '0261-234567', 'verified'),
      (5, 'Apex Hospital Satara', 4, 'Private', 17.6698, 73.9854, ST_GeomFromText('POINT(73.9854 17.6698)', 4326), 'LIC-SATARA-002', 'Sector-3 bypass, Satara Road', 'Satara', 'Maharashtra', '415002', '02162-245678', 'verified'),
      (6, 'Sangli Civil Hospital', 5, 'Government', 16.8624, 74.5950, ST_GeomFromText('POINT(74.5950 16.8624)', 4326), 'LIC-SANGLI-001', 'Civil Hospital Road, Sangli Miraj Block', 'Sangli', 'Maharashtra', '416416', '0233-2374644', 'verified'),
      (7, 'Bharati Vidyapeeth Hospital Sangli', 5, 'Trust', 16.8450, 74.5780, ST_GeomFromText('POINT(74.5780 16.8450)', 4326), 'LIC-SANGLI-002', 'Sangli-Miraj Road, Wanlesswadi', 'Sangli', 'Maharashtra', '416410', '0233-2231400', 'verified'),
      (8, 'KEM Hospital Mumbai', 2, 'Government', 19.0025, 72.8420, ST_GeomFromText('POINT(72.8420 19.0025)', 4326), 'LIC-MUMBAI-001', 'Acharya Donde Marg, Parel', 'Mumbai', 'Maharashtra', '400012', '022-24107000', 'verified'),
      (9, 'Lilavati Hospital Mumbai', 2, 'Trust', 19.0510, 72.8270, ST_GeomFromText('POINT(72.8270 19.0510)', 4326), 'LIC-MUMBAI-002', 'A-791 Bandra Reclamation, Bandra West', 'Mumbai', 'Maharashtra', '400050', '022-26751000', 'verified')
    `);

    // 3c. Insert Seed Donation Camps
    console.log('Inserting seed donation camps...');
    await connection.query(`
      INSERT INTO donation_camps (id, name, camp_date, address, location, district_id, organizer, capacity, expected_donors, status) VALUES
      (1, 'Pune Deccan Gymkhana Camp', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Deccan Gymkhana Sports Complex, Pune', ST_GeomFromText('POINT(73.8418 18.5159)', 4326), 1, 'Red Cross Pune Chapter', 200, 150, 'upcoming'),
      (2, 'Kothrud Blood Donation Drive', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Mahatma Society Ground, Kothrud, Pune', ST_GeomFromText('POINT(73.8077 18.5074)', 4326), 1, 'Rotary Club of Pune Metro', 150, 120, 'upcoming'),
      (3, 'Satara Red Cross Camp', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Civil Lines Community Hall, Satara', ST_GeomFromText('POINT(74.0015 17.6912)', 4326), 4, 'District Red Cross Satara', 100, 80, 'upcoming'),
      (4, 'Satara Community Blood Drive', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Central Park Ground, Satara', ST_GeomFromText('POINT(73.9942 17.6785)', 4326), 4, 'Satara Lion\\'s Club', 120, 95, 'upcoming'),
      (5, 'Sangli Station Camp', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Sangli Railway Station Hall, Sangli', ST_GeomFromText('POINT(74.5815 16.8524)', 4326), 5, 'Sangli Railway Authority', 80, 60, 'upcoming'),
      (6, 'Sangli Community Hall Drive', DATE_ADD(CURDATE(), INTERVAL 8 DAY), 'Nutan Kala Mandir, Sangli', ST_GeomFromText('POINT(74.5780 16.8450)', 4326), 5, 'Sangli Youth Association', 100, 75, 'upcoming'),
      (7, 'BKC Mega Blood Drive', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'MMRDA Grounds, Bandra Kurla Complex, Mumbai', ST_GeomFromText('POINT(72.8643 19.0596)', 4326), 2, 'Mumbai Health Department', 500, 450, 'upcoming')
    `);

    // 4. Insert Main System Admin User and Test Users
    console.log('Inserting admin and test users...');
    await connection.query(`
      INSERT INTO users (id, email, phone, password_hash, role, hospital_id, district_id, status, full_name, designation) VALUES
      (1, 'sysadmin@example.com', '9876543211', '${passwordHash}', 'sysadmin', NULL, NULL, 'Active', 'Test SysAdmin', 'Test Root'),
      (2, 'hospital_admin@example.com', '9876543213', '${passwordHash}', 'admin', 2, NULL, 'Active', 'Pune Life Care Admin', 'Admin'),
      (3, 'hospital_admin1@example.com', '9876543214', '${passwordHash}', 'admin', 1, NULL, 'Active', 'Pune Ruby Hall Admin', 'Admin'),
      (4, 'donor@example.com', '9876543212', '${passwordHash}', 'donor', NULL, NULL, 'Active', 'Test Donor', 'Volunteer'),
      (5, 'state_admin@example.com', '9876543215', '${passwordHash}', 'state', NULL, 1, 'Active', 'State Admin Maharashtra', 'State Coordinator'),
      (6, 'district_officer@example.com', '9876543216', '${passwordHash}', 'district', NULL, 1, 'Active', 'District Officer Pune', 'District Officer'),
      (7, 'system@raktsetu.gov', '9876543210', '${passwordHash}', 'sysadmin', NULL, NULL, 'Active', 'System Administrator', 'Root Admin')
    `);

    // 5. Insert Donors mapping
    console.log('Inserting test donor mapping...');
    await connection.query(`
      INSERT INTO donors (id, user_id, donor_code, full_name, age, gender, city, pincode, blood_group, weight, available_for_donation, lat, lng, location) VALUES
      (1, 4, 'DONOR-TEST-001', 'Test Donor', 25, 'Male', 'Pune', '411001', 'O+', 70.0, 1, 18.5204, 73.8567, ST_GeomFromText('POINT(73.8567 18.5204)', 4326))
    `);

    // 6. Insert Test Blood Batches
    console.log('Inserting test blood batches...');
    await connection.query(`
      INSERT INTO blood_batches (id, hospital_id, blood_group, units, reserved_units, collection_date, expiry_date, source) VALUES
      (1, 2, 'A+', 50, 0, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 35 DAY), 'Donation'),
      (4, 1, 'O+', 100, 5, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 35 DAY), 'Donation'),
      (5, 4, 'A+', 50, 0, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 35 DAY), 'Donation')
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
