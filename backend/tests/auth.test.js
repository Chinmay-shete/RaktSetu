const request = require('supertest');
const app = require('../server');
const { pool } = require('../config/db');

describe('Auth API (Phase 2 & Phase 7 Hardening)', () => {
  
  test('POST /auth/login - Should successfully log in active sysadmin', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'sysadmin@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.role).toBe('sysadmin');
  });

  test('POST /auth/login - Should fail with incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'sysadmin@example.com',
        password: 'wrongpassword'
      });
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', true);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  test('POST /auth/login - Should fail with non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  test('POST /auth/login - Should block suspended user from logging in', async () => {
    // 1. Suspend the donor account first in the DB
    await pool.query("UPDATE users SET status = 'Suspended' WHERE email = 'donor@example.com'");

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'donor@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('SUSPENDED_USER');

    // Restore status to Active
    await pool.query("UPDATE users SET status = 'Active' WHERE email = 'donor@example.com'");
  });

  test('GET /systemadmin/dashboard - Should block suspended sysadmin from calling API', async () => {
    // 1. Get a valid token for sysadmin
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'sysadmin@example.com',
        password: 'password123'
      });
    const token = loginRes.body.token;

    // 2. Suspend sysadmin in DB
    await pool.query("UPDATE users SET status = 'Suspended' WHERE email = 'sysadmin@example.com'");

    // 3. Make authenticated request
    const dashboardRes = await request(app)
      .get('/api/v1/systemadmin/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(dashboardRes.statusCode).toBe(403);
    expect(dashboardRes.body.code).toBe('SUSPENDED_USER');

    // Restore status
    await pool.query("UPDATE users SET status = 'Active' WHERE email = 'sysadmin@example.com'");
  });

  test('POST /auth/register - Should fail if verificationToken is missing for donor', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        role: 'donor',
        phone: '+919999999999',
        email: 'newdonor@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('verificationToken');
  });

  test('POST /auth/register - Should fail if email already exists for hospital admin', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        role: 'admin',
        email: 'hospital_admin@example.com', // already exists
        phone: '+919999999998',
        password: 'password123',
        hospitalName: 'New Test Hospital',
        hospitalType: 'Private',
        license_no: 'LIC-000000',
        address: '123 New Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        lat: 19.0,
        lng: 72.8
      });
    
    expect(res.statusCode).toBe(409);
    expect(res.body.code).toBe('EMAIL_EXISTS');
  });

  test('POST /hospital/staff - Should allow hospital admin to create staff directly', async () => {
    // 1. Log in as hospital admin
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'hospital_admin@example.com',
        password: 'password123'
      });
    const adminToken = loginRes.body.token;

    // 2. Create new staff member
    const newStaffEmail = `staff-${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/v1/hospital/staff')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New Staff Member',
        email: newStaffEmail,
        role: 'staff'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('tempPassword');
    expect(res.body.email).toBe(newStaffEmail);
    expect(res.body.role).toBe('staff');
  });
});
