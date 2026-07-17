/**
 * RaktSetu — Safe Seed Script (Non-Destructive)
 * ================================================
 * This script DOES NOT truncate or wipe any existing data.
 * It uses INSERT IGNORE to safely insert missing system accounts,
 * districts and hospitals only if they don't already exist.
 *
 * Use this to RESTORE missing accounts after a schema migration
 * without losing real user/donation data in production.
 *
 * Usage (from backend/ directory):
 *   node safe_seed.js
 *
 * On production (Render / VPS):
 *   ALLOW_PRODUCTION_SEED=true node safe_seed.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function safeSeed() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    console.error('❌ ERROR: Set ALLOW_PRODUCTION_SEED=true to run in production.');
    process.exit(1);
  }

  console.log('🌱 Starting SAFE (non-destructive) seed...');
  console.log('   This script will only INSERT missing records — no data will be deleted.\n');

  // Use a direct connection with multipleStatements for safe seed
  const conn = await mysql.createConnection({
    host:               process.env.DB_HOST     || '127.0.0.1',
    port:               parseInt(process.env.DB_PORT || '3306', 10),
    user:               process.env.DB_USER     || process.env.DB_USERNAME || 'root',
    password:           process.env.DB_PASSWORD || '',
    database:           process.env.DB_NAME     || process.env.DB_DATABASE || 'raktsetu',
    multipleStatements: true,
  });

  try {
    // ─── 1. Hash default password ────────────────────────────────────────────
    const passwordHash = bcrypt.hashSync('password123', 10);

    // ─── 2. Districts (INSERT IGNORE — skips if name+state already exists) ───
    console.log('📍 Ensuring districts exist...');
    await conn.execute(`
      INSERT IGNORE INTO districts (id, name, state, zone) VALUES
      (1, 'Pune',    'Maharashtra', 'West'),
      (2, 'Mumbai',  'Maharashtra', 'West'),
      (3, 'Surat',   'Gujarat',     'West'),
      (4, 'Satara',  'Maharashtra', 'West'),
      (5, 'Sangli',  'Maharashtra', 'West')
    `);
    console.log('   ✅ Districts OK');

    // ─── 3. Hospitals (INSERT IGNORE on license_no UNIQUE key) ───────────────
    console.log('🏥 Ensuring seed hospitals exist...');
    await conn.execute(`
      INSERT IGNORE INTO hospitals
        (id, name, district_id, type, lat, lng, location, license_no, address, city, state, pincode, contact, verification_status)
      VALUES
        (1, 'Pune Ruby Hall Clinic',           1, 'Private',    18.5323, 73.8770, ST_GeomFromText('POINT(73.8770 18.5323)', 4326), 'LIC-PUNE-001',   '40 Sassoon Road, near Pune Station',           'Pune',   'Maharashtra', '411001', '020-66455100', 'verified'),
        (2, 'KEM Hospital Pune',               1, 'Trust',      18.5255, 73.8690, ST_GeomFromText('POINT(73.8690 18.5255)', 4326), 'LIC-PUNE-002',   '489 Rasta Peth, Sardar Moodliar Road',         'Pune',   'Maharashtra', '411011', '020-26217300', 'verified'),
        (3, 'Sassoon General Hospital Pune',   1, 'Government', 18.5283, 73.8732, ST_GeomFromText('POINT(73.8732 18.5283)', 4326), 'LIC-PUNE-003',   'Jai Prakash Narayan Road, near Pune Station',  'Pune',   'Maharashtra', '411001', '020-26128000', 'verified'),
        (4, 'Surat Municipal Hospital',        3, 'Government', 21.1702, 72.8311, ST_GeomFromText('POINT(72.8311 21.1702)', 4326), 'LIC-SATARA-001', 'Surat Municipal Road',                         'Surat',  'Gujarat',     '395003', '0261-234567',  'verified'),
        (5, 'Apex Hospital Satara',            4, 'Private',    17.6698, 73.9854, ST_GeomFromText('POINT(73.9854 17.6698)', 4326), 'LIC-SATARA-002', 'Sector-3 bypass, Satara Road',                 'Satara', 'Maharashtra', '415002', '02162-245678', 'verified'),
        (6, 'Sangli Civil Hospital',           5, 'Government', 16.8624, 74.5950, ST_GeomFromText('POINT(74.5950 16.8624)', 4326), 'LIC-SANGLI-001', 'Civil Hospital Road, Sangli Miraj Block',      'Sangli', 'Maharashtra', '416416', '0233-2374644', 'verified'),
        (7, 'Bharati Vidyapeeth Hospital',     5, 'Trust',      16.8450, 74.5780, ST_GeomFromText('POINT(74.5780 16.8450)', 4326), 'LIC-SANGLI-002', 'Sangli-Miraj Road, Wanlesswadi',               'Sangli', 'Maharashtra', '416410', '0233-2231400', 'verified'),
        (8, 'KEM Hospital Mumbai',             2, 'Government', 19.0025, 72.8420, ST_GeomFromText('POINT(72.8420 19.0025)', 4326), 'LIC-MUMBAI-001', 'Acharya Donde Marg, Parel',                    'Mumbai', 'Maharashtra', '400012', '022-24107000', 'verified'),
        (9, 'Lilavati Hospital Mumbai',        2, 'Trust',      19.0510, 72.8270, ST_GeomFromText('POINT(72.8270 19.0510)', 4326), 'LIC-MUMBAI-002', 'A-791 Bandra Reclamation, Bandra West',        'Mumbai', 'Maharashtra', '400050', '022-26751000', 'verified')
    `);
    console.log('   ✅ Hospitals OK');

    // ─── 4. System Users (INSERT IGNORE on email UNIQUE key) ─────────────────
    console.log('👤 Ensuring system accounts exist...');
    await conn.execute(`
      INSERT IGNORE INTO users
        (id, email, phone, password_hash, role, hospital_id, district_id, status, full_name, designation)
      VALUES
        (1, 'sysadmin@example.com',      '9876543211', ?,  'sysadmin', NULL, NULL, 'Active', 'Test SysAdmin',              'Test Root'),
        (7, 'system@raktsetu.gov',       '9876543210', ?,  'sysadmin', NULL, NULL, 'Active', 'System Administrator',       'Root Admin'),
        (2, 'hospital_admin@example.com','9876543213', ?,  'admin',    2,    NULL, 'Active', 'KEM Hospital Admin',         'Admin'),
        (3, 'hospital_admin1@example.com','9876543214', ?, 'admin',    1,    NULL, 'Active', 'Pune Ruby Hall Admin',       'Admin'),
        (5, 'state_admin@example.com',   '9876543215', ?,  'state',    NULL, 1,    'Active', 'State Admin Maharashtra',    'State Coordinator'),
        (6, 'district_officer@example.com','9876543216',?, 'district', NULL, 1,    'Active', 'District Officer Pune',      'District Officer'),
        (4, 'donor@example.com',         '9876543212', ?,  'donor',    NULL, NULL, 'Active', 'Test Donor',                 'Volunteer')
    `, [
      passwordHash, passwordHash, passwordHash, passwordHash,
      passwordHash, passwordHash, passwordHash
    ]);
    console.log('   ✅ System accounts OK');

    // ─── 5. Test Donor Profile (INSERT IGNORE) ────────────────────────────────
    console.log('🩸 Ensuring test donor profile exists...');
    await conn.execute(`
      INSERT IGNORE INTO donors
        (id, user_id, donor_code, full_name, age, gender, city, pincode, blood_group, weight, available_for_donation, lat, lng, location)
      VALUES
        (1, 4, 'DONOR-TEST-001', 'Test Donor', 25, 'Male', 'Pune', '411001', 'O+', 70.0, 1, 18.5204, 73.8567, ST_GeomFromText('POINT(73.8567 18.5204)', 4326))
    `);
    console.log('   ✅ Donor profile OK');

    // ─── 6. Donation Camps (INSERT IGNORE) ───────────────────────────────────
    console.log('🏕️  Ensuring donation camps exist...');
    await conn.execute(`
      INSERT IGNORE INTO donation_camps
        (id, name, camp_date, address, location, district_id, organizer, capacity, expected_donors, status)
      VALUES
        (1, 'Pune Deccan Gymkhana Camp',    DATE_ADD(CURDATE(), INTERVAL 7 DAY),  'Deccan Gymkhana Sports Complex, Pune',         ST_GeomFromText('POINT(73.8418 18.5159)', 4326), 1, 'Red Cross Pune Chapter',        200, 150, 'upcoming'),
        (2, 'Kothrud Blood Donation Drive', DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'Mahatma Society Ground, Kothrud, Pune',        ST_GeomFromText('POINT(73.8077 18.5074)', 4326), 1, 'Rotary Club of Pune Metro',     150, 120, 'upcoming'),
        (3, 'Satara Red Cross Camp',        DATE_ADD(CURDATE(), INTERVAL 7 DAY),  'Civil Lines Community Hall, Satara',           ST_GeomFromText('POINT(74.0015 17.6912)', 4326), 4, 'District Red Cross Satara',     100, 80,  'upcoming'),
        (4, 'Satara Community Blood Drive', DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'Central Park Ground, Satara',                  ST_GeomFromText('POINT(73.9942 17.6785)', 4326), 4, 'Satara Lions Club',             120, 95,  'upcoming'),
        (5, 'Sangli Station Camp',          DATE_ADD(CURDATE(), INTERVAL 5 DAY),  'Sangli Railway Station Hall, Sangli',          ST_GeomFromText('POINT(74.5815 16.8524)', 4326), 5, 'Sangli Railway Authority',      80,  60,  'upcoming'),
        (6, 'Sangli Community Hall Drive',  DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'Nutan Kala Mandir, Sangli',                    ST_GeomFromText('POINT(74.5780 16.8450)', 4326), 5, 'Sangli Youth Association',      100, 75,  'upcoming'),
        (7, 'BKC Mega Blood Drive',         DATE_ADD(CURDATE(), INTERVAL 7 DAY),  'MMRDA Grounds, Bandra Kurla Complex, Mumbai',  ST_GeomFromText('POINT(72.8643 19.0596)', 4326), 2, 'Mumbai Health Department',      500, 450, 'upcoming')
    `);
    console.log('   ✅ Donation camps OK');

    // ─── 7. Test Blood Batches (INSERT IGNORE) ────────────────────────────────
    console.log('🧪 Ensuring test blood batches exist...');
    await conn.execute(`
      INSERT IGNORE INTO blood_batches
        (id, hospital_id, blood_group, units, reserved_units, collection_date, expiry_date, source)
      VALUES
        (1, 2, 'A+', 50,  0, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 35 DAY), 'Donation'),
        (4, 1, 'O+', 100, 5, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 35 DAY), 'Donation'),
        (5, 4, 'A+', 50,  0, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 35 DAY), 'Donation')
    `);
    console.log('   ✅ Blood batches OK');

    // ─── 8. Summary ──────────────────────────────────────────────────────────
    const [userCount]   = await conn.execute('SELECT COUNT(*) AS c FROM users');
    const [hospCount]   = await conn.execute('SELECT COUNT(*) AS c FROM hospitals');
    const [distCount]   = await conn.execute('SELECT COUNT(*) AS c FROM districts');
    const [donorCount]  = await conn.execute('SELECT COUNT(*) AS c FROM donors');
    const [campCount]   = await conn.execute('SELECT COUNT(*) AS c FROM donation_camps');
    const [batchCount]  = await conn.execute('SELECT COUNT(*) AS c FROM blood_batches');

    console.log('\n📊 Database summary after safe seed:');
    console.log(`   Users:          ${userCount[0].c}`);
    console.log(`   Hospitals:      ${hospCount[0].c}`);
    console.log(`   Districts:      ${distCount[0].c}`);
    console.log(`   Donors:         ${donorCount[0].c}`);
    console.log(`   Donation Camps: ${campCount[0].c}`);
    console.log(`   Blood Batches:  ${batchCount[0].c}`);

    console.log('\n✅ Safe seed completed successfully!');
    console.log('\n🔑 Default credentials (password: password123):');
    console.log('   SysAdmin:        system@raktsetu.gov');
    console.log('   Hospital Admin:  hospital_admin@example.com   (KEM Hospital Pune)');
    console.log('   Hospital Admin:  hospital_admin1@example.com  (Pune Ruby Hall)');
    console.log('   State Admin:     state_admin@example.com');
    console.log('   District Officer: district_officer@example.com');
    console.log('   Donor (OTP):     phone 9876543212');

  } catch (error) {
    console.error('\n❌ Safe seed failed:', error.message);
    console.error(error);
    if (require.main === module) {
      process.exit(1);
    }
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  safeSeed();
}

module.exports = { safeSeed };

