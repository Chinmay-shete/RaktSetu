const request = require('supertest');
const app = require('../server');

describe('Emergency Routing API (Phase 4)', () => {
  let token;

  beforeAll(async () => {
    // Log in to get token for hospital admin
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'hospital_admin@example.com',
        password: 'password123'
      });
    token = loginRes.body.token;
  });

  test('GET /hospital/emergencies - Should return emergencies list for authenticated staff', async () => {
    const res = await request(app)
      .get('/api/v1/hospital/emergencies')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /emergency/search - Should search nearest hospitals with matching inventory and disable caching', async () => {
    const res = await request(app)
      .get('/api/v1/emergency/search')
      .query({
        bloodGroup: 'A+',
        lat: 18.5204,
        lng: 73.8567,
        radius: 10
      })
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    // Caching headers check (must disable client/CDN caching)
    expect(res.headers['cache-control']).toContain('no-store');
    expect(res.headers['cache-control']).toContain('no-cache');
  });

  test('GET /emergency/search - Should return empty if out of radius', async () => {
    const res = await request(app)
      .get('/api/v1/emergency/search')
      .query({
        bloodGroup: 'A+',
        lat: 10.0,
        lng: 70.0, // remote coordinates
        radius: 10
      })
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });
});
