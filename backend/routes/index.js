const express = require('express');
const { getHealth } = require('../controllers/healthController');

const router = express.Router();

// Health Check Route
router.get('/health', getHealth);

module.exports = router;
