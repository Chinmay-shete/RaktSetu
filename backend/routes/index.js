const express = require('express');
const { getHealth } = require('../controllers/healthController');
const authRoutes = require('./authRoutes');
const donorAuthRoutes = require('./donorAuthRoutes');
const donorRoutes = require('./donorRoutes');
const landingRoutes = require('./landingRoutes');
const hospitalRoutes = require('./hospitalRoutes');
const adminRoutes = require('./adminRoutes');
const systemAdminRoutes = require('./systemAdminRoutes');

const router = express.Router();

// Health Check Route
router.get('/health', getHealth);

// Auth Routes
router.use('/auth', authRoutes);

// Donor Firebase Auth Routes
router.use('/auth/donor', donorAuthRoutes);

// Donor Portal Routes
router.use('/donor', donorRoutes);

// Public Landing Page Routes
router.use('/landing', landingRoutes);

// Hospital Staff & Emergency Routing Routes
router.use('/', hospitalRoutes);

// District and State Admin Routes
router.use('/', adminRoutes);

// System Admin Routes
router.use('/', systemAdminRoutes);

module.exports = router;



