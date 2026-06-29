const request = require('supertest');
const app = require('../server');
const { pool } = require('../config/db');

describe('Transfers & Security Boundaries API (Phase 5 & Phase 6)', () => {
  let tokenHosp1; // KP Hospital (Admin)
  let tokenHosp2; // Pune Life Care (Admin)
  let tokenState; // State Admin (Maharashtra)

  beforeAll(async () => {
    // 1. Log in KP Hospital Admin (user 3, hospital 1)
    const KPRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'hospital_admin1@example.com',
        password: 'password123'
      });
    tokenHosp1 = KPRes.body.token;

    // 2. Log in Pune Life Care Admin (user 2, hospital 2)
    const PLRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'hospital_admin@example.com',
        password: 'password123'
      });
    tokenHosp2 = PLRes.body.token;

    // 3. Log in State Admin (user 5, district 1, state Maharashtra)
    const stateRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'state_admin@example.com',
        password: 'password123'
      });
    tokenState = stateRes.body.token;
  });

  test('POST /hospital/transfers - Should create a transfer request', async () => {
    const key = `idemp-key-test-${Date.now()}`;
    const res = await request(app)
      .post('/api/v1/hospital/transfers')
      .set('Authorization', `Bearer ${tokenHosp2}`)
      .set('Idempotency-Key', key)
      .send({
        fromHospitalId: 1, // KP Hospital is source
        bloodGroup: 'O+',
        units: 2,
        priority: 'high',
        message: 'Need 2 units of O+'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('pending');
  });

  test('POST /hospital/transfers - Should return cached response on duplicate Idempotency-Key', async () => {
    const key = `idemp-key-test-dup-${Date.now()}`;
    const payload = {
      fromHospitalId: 1,
      bloodGroup: 'O+',
      units: 1,
      priority: 'medium',
      message: 'Idempotency test'
    };

    // First request
    const res1 = await request(app)
      .post('/api/v1/hospital/transfers')
      .set('Authorization', `Bearer ${tokenHosp2}`)
      .set('Idempotency-Key', key)
      .send(payload);

    // Duplicate request
    const res2 = await request(app)
      .post('/api/v1/hospital/transfers')
      .set('Authorization', `Bearer ${tokenHosp2}`)
      .set('Idempotency-Key', key)
      .send(payload);

    expect(res1.statusCode).toBe(201);
    expect(res2.statusCode).toBe(201);
    expect(res1.body.id).toBe(res2.body.id);
  });

  test('PATCH /hospital/transfers/:id/status - Should approve local transfer and reserve inventory', async () => {
    // 1. Create a transfer request first
    const key = `idemp-key-local-appr-${Date.now()}`;
    const createRes = await request(app)
      .post('/api/v1/hospital/transfers')
      .set('Authorization', `Bearer ${tokenHosp2}`) // Pune Life Care requests
      .set('Idempotency-Key', key)
      .send({
        fromHospitalId: 1, // KP Hospital supplies
        bloodGroup: 'O+',
        units: 3,
        priority: 'high'
      });

    const transferId = createRes.body.id;

    // 2. Approve using supplying hospital token (KP Admin)
    const approveRes = await request(app)
      .patch(`/api/v1/hospital/transfers/${transferId}/status`)
      .set('Authorization', `Bearer ${tokenHosp1}`)
      .send({ status: 'accepted' });

    expect(approveRes.statusCode).toBe(200);
    expect(approveRes.body.status).toBe('accepted');

    // 3. Verify reserved_units in supplying batch (KP has batch 4 for O+)
    const [batches] = await pool.query('SELECT reserved_units FROM blood_batches WHERE id = 4');
    expect(batches[0].reserved_units).toBe(8); // 5 originally seeded + 3 reserved
  });

  test('PATCH /hospital/transfers/:id/status - Should reject duplicate status transition', async () => {
    // Re-approving the same transfer should fail
    const [lastTransfer] = await pool.query("SELECT id FROM transfer_requests WHERE status = 'accepted' LIMIT 1");
    if (lastTransfer.length > 0) {
      const res = await request(app)
        .patch(`/api/v1/hospital/transfers/${lastTransfer[0].id}/status`)
        .set('Authorization', `Bearer ${tokenHosp1}`)
        .send({ status: 'accepted' });
      expect(res.statusCode).toBe(400);
      expect(res.body.code).toBe('INVALID_STATUS_TRANSITION');
    }
  });

  test('PATCH /state/transfers/:id/approve - Should approve cross-district transfer at state-level', async () => {
    // 1. Create a cross-district transfer (hospital 2 in Pune to hospital 3 in Mumbai)
    const [insRes] = await pool.query(`
      INSERT INTO transfer_requests (from_hospital, to_hospital, blood_group, units, status, priority, message)
      VALUES (2, 3, 'A+', 3, 'pending', 'high', 'Cross-district request')
    `);
    const transferId = insRes.insertId;

    // 2. Approve via State Admin
    const approveRes = await request(app)
      .patch(`/api/v1/state/transfers/${transferId}/approve`)
      .set('Authorization', `Bearer ${tokenState}`);

    expect(approveRes.statusCode).toBe(200);
    expect(approveRes.body.status).toBe('accepted');

    // 3. Verify reserved_units in Pune Life Care (hospital 2) batch (A+ is batch 1, originally 0 reserved)
    const [batches] = await pool.query('SELECT reserved_units FROM blood_batches WHERE id = 1');
    expect(batches[0].reserved_units).toBe(3);

    // 4. Verify audit_logs entry exists
    const [logs] = await pool.query("SELECT * FROM audit_logs WHERE action LIKE ? ORDER BY id DESC LIMIT 1", [`%cross_district_transfer_approved%ID: ${transferId}%`]);
    expect(logs.length).toBe(1);
    expect(logs[0].actor_id).toBe(5); // State Admin ID
    expect(logs[0].severity).toBe('warning');
  });

  test('PATCH /state/transfers/:id/approve - Should throw FORBIDDEN when transfer is from different state', async () => {
    // 1. Create a transfer originating from Gujarat (hospital 4 is Surat Municipal)
    const [insRes] = await pool.query(`
      INSERT INTO transfer_requests (from_hospital, to_hospital, blood_group, units, status, priority, message)
      VALUES (4, 3, 'A+', 2, 'pending', 'high', 'Gujarat to Mumbai cross-state')
    `);
    const transferId = insRes.insertId;

    // 2. Try to approve with Maharashtra state admin token
    const res = await request(app)
      .patch(`/api/v1/state/transfers/${transferId}/approve`)
      .set('Authorization', `Bearer ${tokenState}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
    expect(res.body.message).toContain('boundaries');
  });

  test('PATCH /state/transfers/:id/approve - Should throw 400 when stock is insufficient', async () => {
    // 1. Create request for 200 units (insufficient inventory)
    const [insRes] = await pool.query(`
      INSERT INTO transfer_requests (from_hospital, to_hospital, blood_group, units, status, priority, message)
      VALUES (2, 3, 'A+', 200, 'pending', 'high', 'Large request')
    `);
    const transferId = insRes.insertId;

    // 2. Try to approve via State Admin
    const res = await request(app)
      .patch(`/api/v1/state/transfers/${transferId}/approve`)
      .set('Authorization', `Bearer ${tokenState}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('INSUFFICIENT_INVENTORY');
  });
});
