/**
 * Firebase Admin SDK Service
 * 
 * Initializes the Firebase Admin SDK for server-side operations.
 * Used exclusively for verifying donor phone OTP tokens.
 * 
 * Requires FIREBASE_SA_PATH env variable pointing to the service account JSON file.
 */
const { initializeApp, cert } = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');
require('dotenv').config();

const saPath = process.env.FIREBASE_SA_PATH;

let firebaseAuth = null;

if (saPath) {
  try {
    const resolvedPath = path.resolve(saPath);
    const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));

    const app = initializeApp({
      credential: cert(serviceAccount),
    });

    firebaseAuth = getAuth(app);
    logger.info('[Firebase] Admin SDK initialized successfully.');
  } catch (err) {
    logger.error(`[Firebase] Failed to initialize Admin SDK: ${err.message}`);
    logger.error('[Firebase] Donor phone OTP via Firebase will not work.');
  }
} else {
  logger.warn('[Firebase] FIREBASE_SA_PATH not set. Firebase Auth disabled.');
  logger.warn('[Firebase] Donor phone OTP will not work until configured.');
}

module.exports = { firebaseAuth };
