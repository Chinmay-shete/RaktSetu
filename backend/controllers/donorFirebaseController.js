/**
 * Donor Firebase Authentication Controller
 * 
 * Handles donor registration and login via Firebase Phone Auth.
 * 
 * Flow:
 *   1. Client calls Firebase signInWithPhoneNumber (client-side OTP)
 *   2. Client verifies OTP via confirmationResult.confirm()
 *   3. Client gets a Firebase ID token via user.getIdToken()
 *   4. Client sends the ID token to these endpoints
 *   5. Backend verifies the ID token using Firebase Admin SDK
 *   6. Backend creates/finds the donor user in MySQL
 *   7. Backend issues its own JWT (access + refresh tokens)
 */
const { firebaseAuth } = require('../services/firebaseService');
const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { issueTokens } = require('./authController');

/**
 * POST /auth/donor/firebase-register
 * 
 * Register a new donor using a verified Firebase Phone Auth token.
 * If the phone number already exists, returns an error.
 * 
 * Body: { idToken: string }
 */
async function firebaseRegister(req, res, next) {
  try {
    if (!firebaseAuth) {
      throw new ApiError('Firebase Auth is not configured on the server.', 503, 'FIREBASE_NOT_CONFIGURED');
    }

    const { idToken } = req.body;
    if (!idToken) {
      throw new ApiError('Firebase ID token is required.', 400, 'TOKEN_REQUIRED');
    }

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await firebaseAuth.verifyIdToken(idToken);
    } catch (err) {
      console.error('[Firebase] Token verification failed:', err.message);
      throw new ApiError('Invalid or expired Firebase token.', 401, 'INVALID_FIREBASE_TOKEN');
    }

    const phone = decodedToken.phone_number;
    if (!phone) {
      throw new ApiError('Firebase token does not contain a phone number.', 400, 'NO_PHONE_IN_TOKEN');
    }

    const firebaseUid = decodedToken.uid;

    // Check if phone already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existingUsers.length > 0) {
      throw new ApiError('Phone number already registered. Please use login instead.', 409, 'PHONE_EXISTS');
    }

    // Create new donor user
    // Generate a placeholder email for phone-only registration
    const cleanPhone = phone.replace(/\+/g, '');
    const placeholderEmail = `${cleanPhone}@donor.raktsetu.local`;

    const [userResult] = await pool.query(
      'INSERT INTO users (email, phone, password_hash, role) VALUES (?, ?, NULL, ?)',
      [placeholderEmail, phone, 'donor']
    );

    const userId = userResult.insertId;

    // Fetch the newly created user
    const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = userRows[0];

    // Update last_login
    const now = new Date();
    await pool.query('UPDATE users SET last_login = ? WHERE id = ?', [now, userId]);
    user.last_login = now;

    // Issue JWT tokens using existing helper
    const result = await issueTokens(user);
    result.message = 'Donor registered successfully via Firebase Phone Auth.';

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/donor/firebase-login
 * 
 * Log in an existing donor using a verified Firebase Phone Auth token.
 * 
 * Body: { idToken: string }
 */
async function firebaseLogin(req, res, next) {
  try {
    if (!firebaseAuth) {
      throw new ApiError('Firebase Auth is not configured on the server.', 503, 'FIREBASE_NOT_CONFIGURED');
    }

    const { idToken } = req.body;
    if (!idToken) {
      throw new ApiError('Firebase ID token is required.', 400, 'TOKEN_REQUIRED');
    }

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await firebaseAuth.verifyIdToken(idToken);
    } catch (err) {
      console.error('[Firebase] Token verification failed:', err.message);
      throw new ApiError('Invalid or expired Firebase token.', 401, 'INVALID_FIREBASE_TOKEN');
    }

    const phone = decodedToken.phone_number;
    if (!phone) {
      throw new ApiError('Firebase token does not contain a phone number.', 400, 'NO_PHONE_IN_TOKEN');
    }

    // Find existing user by phone number
    const [userRows] = await pool.query('SELECT * FROM users WHERE phone = ?', [phone]);
    if (userRows.length === 0) {
      throw new ApiError('No account found for this phone number. Please register first.', 404, 'USER_NOT_FOUND');
    }

    const user = userRows[0];

    // Ensure only donors can use phone OTP login
    if (user.role !== 'donor') {
      throw new ApiError('Phone OTP login is only available for donors.', 403, 'OTP_LOGIN_FORBIDDEN');
    }

    // Check if user is suspended
    if (user.status === 'Suspended') {
      throw new ApiError('Your account has been suspended. Please contact support.', 403, 'SUSPENDED_USER');
    }

    // Update last_login
    const now = new Date();
    await pool.query('UPDATE users SET last_login = ? WHERE id = ?', [now, user.id]);
    user.last_login = now;

    // Issue JWT tokens using existing helper
    const result = await issueTokens(user);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  firebaseRegister,
  firebaseLogin
};
