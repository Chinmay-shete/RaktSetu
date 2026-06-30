/**
 * Donor Firebase Authentication Routes
 * 
 * These routes handle donor-only authentication via Firebase Phone Auth.
 * All other user types continue using the existing /auth/login endpoint.
 */
const express = require('express');
const { firebaseRegister, firebaseLogin } = require('../controllers/donorFirebaseController');
const { loginRateLimiter } = require('../middleware/rateLimiter');
const { validateRequest } = require('../middleware/validation');
const { z } = require('zod');

const router = express.Router();

// Validation schema for Firebase token requests
const firebaseTokenSchema = z.object({
  idToken: z.string().min(1, 'Firebase ID token is required')
});

// POST /auth/donor/firebase-register
router.post(
  '/firebase-register',
  loginRateLimiter,
  validateRequest(firebaseTokenSchema),
  firebaseRegister
);

// POST /auth/donor/firebase-login
router.post(
  '/firebase-login',
  loginRateLimiter,
  validateRequest(firebaseTokenSchema),
  firebaseLogin
);

module.exports = router;
