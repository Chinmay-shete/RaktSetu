/**
 * Firebase Client SDK Configuration
 * 
 * Used exclusively for donor phone OTP authentication.
 * All other user types use the existing email/password auth flow.
 * 
 * Required env vars (set in .env or .env.local):
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 */
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only initialize if config keys are present
let app = null;
let auth = null;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('[Firebase] Client SDK initialized.');
  } else {
    console.warn('[Firebase] Config keys missing. Phone OTP will not work.');
  }
} catch (err) {
  console.error('[Firebase] Initialization error:', err.message);
}

/**
 * Creates an invisible reCAPTCHA verifier on the given container element.
 * Must be called before signInWithPhoneNumber.
 * 
 * @param {string} containerId - DOM element ID for reCAPTCHA (e.g., 'recaptcha-container')
 * @returns {RecaptchaVerifier}
 */
export function createRecaptchaVerifier(containerId) {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved – allow signInWithPhoneNumber
    },
  });
}

/**
 * Sends an OTP to the given phone number via Firebase Phone Auth.
 * 
 * @param {string} phoneNumber - E.164 format (e.g., '+919876543210')
 * @param {RecaptchaVerifier} recaptchaVerifier - reCAPTCHA verifier instance
 * @returns {Promise<import('firebase/auth').ConfirmationResult>}
 */
export async function sendFirebaseOtp(phoneNumber, recaptchaVerifier) {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
}

export const isFirebaseConfigured = !!auth;

export { auth, RecaptchaVerifier };
