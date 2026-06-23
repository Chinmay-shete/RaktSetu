const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

// Define API routes under v1
router.get('/health', healthController.getHealth);

// Sample error trigger route to verify standardized error response handling
router.get('/error-test', (req, res, next) => {
  const err = new Error('This is a test error triggered for validation.');
  err.statusCode = 400;
  err.code = 'TEST_VALIDATION_ERROR';
  next(err);
});

module.exports = router;
