const crypto = require('crypto');
const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { createOtpVerificationToken } = require('./jwtService');

function formatPhoneFor2Factor(phone) {
  let cleaned = phone.replace(/\D/g, ''); // strip non-digits
  if (cleaned.length === 10) {
    return '91' + cleaned;
  }
  return cleaned;
}

async function sendOtp(phone, purpose) {
  const expiresMinutes = parseInt(process.env.OTP_EXPIRES_MINUTES || '5', 10);
  const expiresAt = new Date(Date.now() + (expiresMinutes * 60 * 1000));
  
  const isTest = process.env.NODE_ENV === 'test';
  let sessionId = null;
  let code = null;

  if (isTest) {
    code = String(crypto.randomInt(100000, 999999));
  } else {
    const apiKey = process.env.OTP_API_KEY;
    if (!apiKey) {
      throw new ApiError('OTP_API_KEY environment variable is not defined', 500, 'CONFIG_ERROR');
    }
    const cleanPhone = formatPhoneFor2Factor(phone);
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/${cleanPhone}/AUTOGEN`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.Status !== 'Success') {
        throw new ApiError(`2Factor Send OTP failed: ${data.Details || 'Unknown error'}`, 502, 'OTP_SEND_FAILED');
      }
      sessionId = data.Details;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      console.error('Error calling 2Factor SMS:', err);
      throw new ApiError('Failed to send SMS OTP via 2Factor provider', 502, 'SMS_PROVIDER_ERROR');
    }
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Invalidate existing unused codes for this phone & purpose
    await connection.query(
      'UPDATE otp_codes SET verified = 1 WHERE phone = ? AND purpose = ? AND verified = 0',
      [phone, purpose]
    );

    // Insert new OTP record
    await connection.query(
      'INSERT INTO otp_codes (phone, code, session_id, purpose, expires_at) VALUES (?, ?, ?, ?, ?)',
      [phone, code, sessionId, purpose, expiresAt]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  if (isTest) {
    console.log(`[SMS OTP] (Test Mode) Sent code ${code} to ${phone} (Purpose: ${purpose})`);
  }

  return {
    message: 'OTP sent successfully',
    expires_in: expiresMinutes * 60
  };
}

async function verifyOtp(phone, otp, purpose) {
  const now = new Date();
  const isTest = process.env.NODE_ENV === 'test';

  const [rows] = await pool.query(
    `SELECT id, code, session_id, expires_at, verified, attempt_count 
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

  if (row.attempt_count >= 5) {
    throw new ApiError('Too many failed attempts. OTP is invalidated.', 400, 'OTP_INVALIDATED');
  }

  if (new Date(row.expires_at) < now) {
    throw new ApiError('OTP has expired', 400, 'OTP_EXPIRED');
  }

  if (isTest) {
    if (!row.code) {
      throw new ApiError('Local OTP code missing from database', 500, 'OTP_CORRUPT');
    }
    const codeBuffer = Buffer.from(row.code);
    const otpBuffer = Buffer.from(otp);
    
    let isMatch = false;
    if (codeBuffer.length === otpBuffer.length) {
      isMatch = crypto.timingSafeEqual(codeBuffer, otpBuffer);
    }

    if (!isMatch) {
      const newAttempts = row.attempt_count + 1;
      if (newAttempts >= 5) {
        await pool.query('UPDATE otp_codes SET attempt_count = ?, verified = 1 WHERE id = ?', [newAttempts, row.id]);
        throw new ApiError('Too many failed attempts. OTP is invalidated.', 400, 'OTP_INVALIDATED');
      } else {
        await pool.query('UPDATE otp_codes SET attempt_count = ? WHERE id = ?', [newAttempts, row.id]);
        throw new ApiError('Invalid OTP code', 400, 'INVALID_OTP');
      }
    }
  } else {
    // Real verify using 2Factor verify endpoint
    if (!row.session_id) {
      throw new ApiError('Missing SMS session ID for OTP verification', 400, 'SESSION_MISSING');
    }

    const apiKey = process.env.OTP_API_KEY;
    if (!apiKey) {
      throw new ApiError('OTP_API_KEY environment variable is not defined', 500, 'CONFIG_ERROR');
    }

    const url = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${row.session_id}/${otp}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.Status !== 'Success') {
        const newAttempts = row.attempt_count + 1;
        if (newAttempts >= 5) {
          await pool.query('UPDATE otp_codes SET attempt_count = ?, verified = 1 WHERE id = ?', [newAttempts, row.id]);
        } else {
          await pool.query('UPDATE otp_codes SET attempt_count = ? WHERE id = ?', [newAttempts, row.id]);
        }
        throw new ApiError('Invalid OTP code or OTP expired on provider side', 400, 'INVALID_OTP');
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
      console.error('Error verifying OTP with 2Factor:', err);
      throw new ApiError('Failed to verify OTP via SMS provider', 502, 'SMS_PROVIDER_ERROR');
    }
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
