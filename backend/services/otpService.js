const crypto = require('crypto');
const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { createOtpVerificationToken } = require('./jwtService');

/**
 * Generates a 6-digit OTP.
 */
function generateCode() {
  return String(crypto.randomInt(100000, 999999));
}

/**
 * Dispatches a 6-digit OTP code to the phone number.
 */
async function sendOtp(phone, purpose) {
  const code = generateCode();
  const expiresMinutes = parseInt(process.env.OTP_EXPIRES_MINUTES || '5', 10);
  const expiresAt = new Date(Date.now() + (expiresMinutes * 60 * 1000));

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Invalidate existing unused codes for this phone & purpose
    await connection.query(
      'UPDATE otp_codes SET verified = 1 WHERE phone = ? AND purpose = ? AND verified = 0',
      [phone, purpose]
    );

    // Insert new OTP code
    await connection.query(
      'INSERT INTO otp_codes (phone, code, purpose, expires_at) VALUES (?, ?, ?, ?)',
      [phone, code, purpose, expiresAt]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  // Log to console for development verification
  console.log(`\n==================================================`);
  console.log(`[RaktSetu OTP Verification]`);
  console.log(`Phone:   ${phone}`);
  console.log(`Purpose: ${purpose}`);
  console.log(`Code:    ${code}`);
  console.log(`Expires: ${expiresAt.toISOString()}`);
  console.log(`==================================================\n`);

  return {
    message: 'OTP sent successfully',
    expires_in: expiresMinutes * 60
  };
}

/**
 * Verifies an OTP code for the given phone number and purpose.
 */
async function verifyOtp(phone, otp, purpose) {
  const now = new Date();

  const [rows] = await pool.query(
    `SELECT id, code, expires_at, verified 
     FROM otp_codes 
     WHERE phone = ? AND purpose = ? AND verified = 0
     ORDER BY created_at DESC 
     LIMIT 1`,
    [phone, purpose]
  );

  if (rows.length === 0) {
    throw new ApiError('No active OTP found for this phone number', 400, 'OTP_NOT_FOUND');
  }

  const row = rows[0];

  if (row.verified) {
    throw new ApiError('OTP already used', 400, 'OTP_ALREADY_USED');
  }

  if (new Date(row.expires_at) < now) {
    throw new ApiError('OTP has expired', 400, 'OTP_EXPIRED');
  }

  // Use timingSafeEqual to avoid timing attacks
  const codeBuffer = Buffer.from(row.code);
  const otpBuffer = Buffer.from(otp);
  
  let isMatch = false;
  if (codeBuffer.length === otpBuffer.length) {
    isMatch = crypto.timingSafeEqual(codeBuffer, otpBuffer);
  }

  if (!isMatch) {
    throw new ApiError('Invalid OTP code', 400, 'INVALID_OTP');
  }

  // Mark OTP as verified/used
  await pool.query('UPDATE otp_codes SET verified = 1 WHERE id = ?', [row.id]);

  // Create verification token that proves this phone is verified
  const verificationToken = createOtpVerificationToken(phone, purpose);

  return {
    message: 'OTP verified successfully',
    verification_token: verificationToken,
    phone
  };
}

module.exports = {
  sendOtp,
  verifyOtp
};
