const express = require('express');
const { getHealth } = require('../controllers/healthController');
const authRoutes = require('./authRoutes');
const donorRoutes = require('./donorRoutes');
const landingRoutes = require('./landingRoutes');
const hospitalRoutes = require('./hospitalRoutes');

const router = express.Router();

// Health Check Route
router.get('/health', getHealth);

// Auth Routes
router.use('/auth', authRoutes);

// Donor Portal Routes
router.use('/donor', donorRoutes);

// Public Landing Page Routes
router.use('/landing', landingRoutes);

// Hospital Staff & Emergency Routing Routes
router.use('/', hospitalRoutes);

module.exports = router;

