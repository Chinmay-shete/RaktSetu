const express = require('express');
const donorController = require('../controllers/donorController');
const { validateRequest, demoRequestSchema } = require('../middleware/validation');
const { pool } = require('../config/db');

const router = express.Router();

// Landing page pilot demo requests
router.post('/demo-request', validateRequest(demoRequestSchema), donorController.saveDemoRequest);

// Public Districts & States lookup
router.get('/districts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT name, state FROM districts ORDER BY state ASC, name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Public Camp Schedule Lookup
router.get('/camps', async (req, res) => {
  try {
    const { state, district } = req.query;
    let query = `
      SELECT c.id, c.name, c.camp_date, c.address, c.organizer, c.capacity, c.expected_donors, c.status,
             d.name AS district_name, d.state AS state_name,
             ST_Y(c.location) AS lat, ST_X(c.location) AS lng
      FROM donation_camps c
      JOIN districts d ON c.district_id = d.id
      WHERE c.status = 'upcoming'
    `;
    const params = [];
    if (state && state !== 'Select State') {
      query += ` AND d.state = ?`;
      params.push(state);
    }
    if (district && district !== 'Select District') {
      query += ` AND d.name = ?`;
      params.push(district);
    }
    query += ` ORDER BY c.camp_date ASC`;
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Public Blood Stock Lookup
router.get('/stocks', async (req, res) => {
  try {
    const { state, district, bloodGroup } = req.query;
    let query = `
      SELECT h.id AS hospital_id, h.name AS hospital_name, h.type, h.address, h.city, h.state, h.pincode, h.contact,
             b.blood_group, SUM(b.units - b.reserved_units) AS available_units,
             MAX(b.collection_date) AS last_updated
      FROM blood_batches b
      JOIN hospitals h ON b.hospital_id = h.id
      JOIN districts d ON h.district_id = d.id
      WHERE h.verification_status = 'verified' AND b.expiry_date >= CURDATE()
    `;
    const params = [];
    if (state && state !== 'Select State') {
      query += ` AND h.state = ?`;
      params.push(state);
    }
    if (district && district !== 'Select District') {
      query += ` AND h.city = ?`;
      params.push(district);
    }
    if (bloodGroup && bloodGroup !== 'All') {
      query += ` AND b.blood_group = ?`;
      params.push(bloodGroup);
    }
    query += ` GROUP BY h.id, b.blood_group ORDER BY h.name ASC`;
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Public Blood Center Directory Lookup
router.get('/hospitals', async (req, res) => {
  try {
    const { state, district, keyword } = req.query;
    let query = `
      SELECT h.id, h.name, h.type, h.license_no, h.address, h.city, h.state, h.pincode, h.contact, h.lat, h.lng
      FROM hospitals h
      JOIN districts d ON h.district_id = d.id
      WHERE h.verification_status = 'verified'
    `;
    const params = [];
    if (state && state !== 'Select State') {
      query += ` AND h.state = ?`;
      params.push(state);
    }
    if (district && district !== 'Select District') {
      query += ` AND h.city = ?`;
      params.push(district);
    }
    if (keyword) {
      query += ` AND (h.name LIKE ? OR h.address LIKE ?)`;
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    query += ` ORDER BY h.name ASC`;
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
