const express = require('express');
const { getHealth } = require('../controllers/healthController');
const authRoutes = require('./authRoutes');
const donorRoutes = require('./donorRoutes');
const landingRoutes = require('./landingRoutes');

const router = express.Router();

// Health Check Route
router.get('/health', getHealth);

// Auth Routes
router.use('/auth', authRoutes);

// Donor Portal Routes
router.use('/donor', donorRoutes);

// Public Landing Page Routes
router.use('/landing', landingRoutes);

module.exports = router;
