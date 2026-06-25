const { pool } = require('./config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('Starting database seeding...');
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Disable FK checks to clear tables
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const tables = [
      'refresh_tokens', 'notifications', 'emergency_pledges', 'donations',
      'blood_batches', 'transfer_requests', 'emergency_requests', 'donors',
      'donation_camps', 'forecasts', 'surgical_schedules', 'alert_thresholds',
      'audit_logs', 'users', 'hospitals', 'districts'
    ];

    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE ${table}`);
      console.log(`Truncated table: ${table}`);
    }

    // 2. Insert Districts
    console.log('Inserting districts...');
    await connection.query(`
      INSERT INTO districts (id, name, state, officer_id, zone) VALUES
      (1, 'Pune', 'Maharashtra', NULL, 'West'),
      (2, 'Mumbai', 'Maharashtra', NULL, 'West'),
      (3, 'Surat', 'Gujarat', NULL, 'West')
    `);

    // 3. Insert Hospitals
    console.log('Inserting hospitals...');
    await connection.query(`
      INSERT INTO hospitals (id, name, district_id, type, lat, lng, location, license_no, address, city, state, pincode, contact, verification_status) VALUES
      (1, 'Koregaon Park City Life Hospital', 1, 'Private', 18.5362, 73.8940, ST_GeomFromText('POINT(73.8940 18.5362)', 4326), 'LIC-99998', 'Koregaon Park Lane 1', 'Pune', 'Maharashtra', '411001', '+9120223344', 'verified'),
      (2, 'Pune Life Care Hospital', 1, 'Private', 18.5204, 73.8567, ST_GeomFromText('POINT(73.8567 18.5204)', 4326), 'LIC-99997', '456, MG Road, Camp', 'Pune', 'Maharashtra', '411001', '9876543210', 'verified'),
      (3, 'Mumbai General Hospital', 2, 'Government', 19.0760, 72.8777, ST_GeomFromText('POINT(72.8777 19.0760)', 4326), 'LIC-99995', 'Dharavi Main Road', 'Mumbai', 'Maharashtra', '400017', '+9122334455', 'pending'),
      (4, 'Surat Municipal Hospital', 3, 'Government', 21.1702, 72.8311, ST_GeomFromText('POINT(72.8311 21.1702)', 4326), 'LIC-99994', 'Surat Ring Road', 'Surat', 'Gujarat', '395003', '+91261223344', 'verified')
    `);

    // 4. Hash password
    const passwordHash = bcrypt.hashSync('password123', 10);

    // 5. Insert Users
    console.log('Inserting users...');
    
    // We insert:
    // User 1: Donor
    // User 2: Hospital Admin (Pune Life Care)
    // User 3: Hospital Admin (Koregaon Park)
    // User 4: District Admin (Pune)
    // User 5: State Admin (Maharashtra)
    // User 6: Sysadmin
    // User 7: Staff User (Pune Life Care)
    // User 8: Pending District Officer (Mumbai)
    await connection.query(`
      INSERT INTO users (id, email, phone, password_hash, role, hospital_id, district_id, status, full_name, designation) VALUES
      (1, 'donor@example.com', '+919876543210', '${passwordHash}', 'donor', NULL, NULL, 'Active', 'Amit Sharma', 'O+ Blood Donor'),
      (2, 'hospital_admin@example.com', '9876543210', '${passwordHash}', 'admin', 2, NULL, 'Active', 'Dr. Kavita Deshmukh', 'Blood Bank Manager'),
      (3, 'hospital_admin1@example.com', '9876543211', '${passwordHash}', 'admin', 1, NULL, 'Active', 'Dr. Alok Sen', 'Director KP Hospital'),
      (4, 'district_admin@example.com', '9876543212', '${passwordHash}', 'district', NULL, 1, 'Active', 'Rajesh Patil', 'District Health Officer'),
      (5, 'state_admin@example.com', '9876543213', '${passwordHash}', 'state', NULL, 1, 'Active', 'Vikram Malhotra', 'State Health Coordinator'),
      (6, 'sysadmin@example.com', '9876543214', '${passwordHash}', 'sysadmin', NULL, NULL, 'Active', 'System Administrator', 'Root Admin'),
      (7, 'hospital_staff@example.com', '9876543215', '${passwordHash}', 'staff', 2, NULL, 'Active', 'Rohan Joshi', 'Blood Bank Technician'),
      (8, 'pending_officer@example.com', '9876543216', '${passwordHash}', 'district', NULL, 2, 'Pending', 'Sneha Kulkarni', 'Deputy Health Director')
    `);

    // Update district officers
    await connection.query('UPDATE districts SET officer_id = 4 WHERE id = 1');
    await connection.query('UPDATE districts SET officer_id = 8 WHERE id = 2');

    // 6. Insert Donors
    console.log('Inserting donors...');
    await connection.query(`
      INSERT INTO donors (user_id, donor_code, full_name, age, gender, city, pincode, blood_group, weight, chronic_illness, last_donated_date, available_for_donation, lat, lng, location)
      VALUES (1, 'RS-2026-0001', 'Amit Sharma', 28, 'Male', 'Pune', '411001', 'O+', 70.00, 0, '2026-03-01', 1, 18.5204, 73.8567, ST_GeomFromText('POINT(73.8567 18.5204)', 4326))
    `);

    // 7. Insert Blood Batches (Inventory)
    console.log('Inserting blood batches...');
    await connection.query(`
      INSERT INTO blood_batches (id, hospital_id, blood_group, units, reserved_units, collection_date, expiry_date, source, remarks) VALUES
      (1, 2, 'A+', 12, 0, '2026-06-01', '2026-07-06', 'Donation', 'First test batch'),
      (2, 2, 'O+', 5, 0, '2026-05-01', '2026-06-10', 'Camp', 'Expired test batch'),
      (3, 2, 'B-', 8, 2, '2026-06-10', '2026-07-15', 'Donation', 'B- batch'),
      (4, 1, 'O+', 10, 5, '2026-06-01', '2026-08-30', 'Donation', 'KP batch'),
      (5, 4, 'A+', 15, 0, '2026-06-05', '2026-07-10', 'Donation', 'Surat batch')
    `);

    // 8. Alert Thresholds
    console.log('Inserting alert thresholds...');
    await connection.query(`
      INSERT INTO alert_thresholds (hospital_id, min_stock, max_stock, critical_units, expiry_days) VALUES
      (1, 10, 100, 5, 7),
      (2, 10, 100, 5, 7),
      (4, 15, 120, 8, 7)
    `);

    // 9. Surgical Schedules
    console.log('Inserting surgical schedules...');
    await connection.query(`
      INSERT INTO surgical_schedules (hospital_id, surgery_date, surgery_type, blood_group, units) VALUES
      (2, '2026-07-15', 'Cardiovascular Bypass', 'O+', 3),
      (1, '2026-07-20', 'Orthopedic Surgery', 'A+', 4)
    `);

    // 10. Forecasts (Prophet output mock)
    console.log('Inserting forecasts...');
    await connection.query(`
      INSERT INTO forecasts (hospital_id, blood_group, predicted_units, forecast_date) VALUES
      (1, 'O+', 6, '2026-06-25'),
      (1, 'A+', 4, '2026-06-25'),
      (2, 'O+', 8, '2026-06-25')
    `);

    // 11. Camps
    console.log('Inserting camps...');
    await connection.query(`
      INSERT INTO donation_camps (id, name, camp_date, address, location, district_id, organizer, capacity, expected_donors, status) VALUES
      (1, 'Kalyani Nagar Community Center Camp', '2026-06-29', 'Kalyani Nagar, Pune', ST_GeomFromText('POINT(73.9032 18.5463)', 4326), 1, 'Rotary Club Pune', 100, 50, 'active')
    `);

    // 12. Notifications (unread alert)
    console.log('Inserting notifications...');
    await connection.query(`
      INSERT INTO notifications (id, user_id, hospital_id, title, message, type, is_read) VALUES
      (3, NULL, 2, 'Urgent Blood Donation Request', 'Dear Chinmay Shete, Pune Life Care Hospital is running critically low on blood stock. Please consider visiting us to donate!', 'alert', 0)
    `);

    // 13. Audit logs
    console.log('Inserting audit logs...');
    await connection.query(`
      INSERT INTO audit_logs (id, actor_id, action, severity, ip_address) VALUES
      (1, 2, 'Approved Kothrud Community Camp', 'info', '10.24.8.12'),
      (2, 6, 'Enabled emergency routing feature flag', 'info', '192.168.1.102')
    `);

    await connection.commit();
    console.log('Database seeding successfully completed.');
  } catch (error) {
    await connection.rollback();
    console.error('Database seeding failed:', error.message);
  } finally {
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    connection.release();
    process.exit(0);
  }
}

seed();
