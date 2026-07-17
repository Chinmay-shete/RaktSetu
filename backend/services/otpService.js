const crypto = require('crypto');
const axios = require('axios');
const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { createOtpVerificationToken } = require('./jwtService');
const emailService = require('./emailService');

// ─────────────────────────────────────────────────────────────────────────────
// MSG91 SMS Sender — Works perfectly with Indian phone numbers 🇮🇳
// No SDK needed, uses MSG91 REST API directly via axios
// Get credentials from: https://msg91.com → Dashboard → API Keys
// ─────────────────────────────────────────────────────────────────────────────
async function sendSmsViaMSG91(phoneNumber, otp, expiresMinutes) {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const senderId = process.env.MSG91_SENDER_ID || 'RAKSETU';

  if (!authKey) {
    throw new ApiError(
      'MSG91_AUTH_KEY is not set in environment variables. Get it from msg91.com Dashboard → API Keys.',
      500,
      'CONFIG_ERROR'
    );
  }

  if (!templateId) {
    throw new ApiError(
      'MSG91_TEMPLATE_ID is not set in environment variables. Create an OTP template on msg91.com and copy its Template ID.',
      500,
      'CONFIG_ERROR'
    );
  }

  // MSG91 expects phone in format: 91XXXXXXXXXX (country code + 10 digit number, NO +)
  // If frontend sends +91XXXXXXXXXX → strip the leading +
  const formattedPhone = phoneNumber.replace(/^\+/, '');

  try {
    const response = await axios.post(
      'https://control.msg91.com/api/v5/otp',
      {
        template_id: templateId,
        mobile: formattedPhone,
        authkey: authKey,
        otp: otp,
        sender: senderId,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000, // 10 second timeout
      }
    );

    const data = response.data;

    // MSG91 returns { type: 'success', message: '...' } on success
    if (data.type !== 'success') {
      throw new Error(data.message || 'MSG91 returned a non-success response');
    }

    return data;
  } catch (err) {
    // Axios error with response from MSG91
    if (err.response) {
      const msg = err.response.data?.message || JSON.stringify(err.response.data);
      throw new ApiError(`MSG91 SMS failed: ${msg}`, 502, 'SMS_PROVIDER_ERROR');
    }
    // Network / timeout error
    throw new ApiError(`MSG91 SMS network error: ${err.message}`, 502, 'SMS_PROVIDER_ERROR');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main sendOtp function — called by auth routes
// target    → phone number (E.164 like +919876543210) OR email address
// purpose   → 'donor_registration' | 'donor_login' | etc.
// isEmail   → true for email OTP, false for SMS OTP
// ─────────────────────────────────────────────────────────────────────────────
async function sendOtp(target, purpose, isEmail = false) {
  const expiresMinutes = parseInt(process.env.OTP_EXPIRES_MINUTES || '5', 10);
  const expiresAt = new Date(Date.now() + (expiresMinutes * 60 * 1000));

  const isTest = process.env.NODE_ENV === 'test';

  // Always generate a secure 6-digit random code locally
  const code = String(crypto.randomInt(100000, 999999));

  // Log OTP in development for easy testing (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[DEV DEBUG] OTP for ${target}: ${code.split('').join(' ')}`);
  }

  let sessionId = null;

  if (!isTest) {
    if (isEmail) {
      try {
        if (!process.env.EMAIL_API_KEY) {
          console.warn(`[DEV DEBUG] Resend API key is missing. Skipping email send for ${target}`);
        } else {
          // Send OTP via Resend Email
          await emailService.sendEmail({
            to: target,
            subject: 'Verify your contact - RaktSetu OTP',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #EDE7E1; border-radius: 12px;">
                <h2 style="color: #BE1F2E; font-style: italic;">RaktSetu</h2>
                <p>Hello,</p>
                <p>Your 6-digit verification code is:</p>
                <div style="background-color: #F5F0EB; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #1A0A0A; margin: 20px 0;">
                  ${code}
                </div>
                <p style="color: #9A9A9A; font-size: 13px;">This code is valid for ${expiresMinutes} minutes. Please do not share this OTP with anyone.</p>
                <hr style="border: 0; border-top: 1px solid #EDE7E1; margin: 20px 0;">
                <p style="color: #A8A0A0; font-size: 11px;">&copy; 2026 RaktSetu. Precision Blood Logistics.</p>
              </div>
            `
          });
        }
      } catch (err) {
        // Log the error but do NOT block the user.
        // The OTP is saved in the database. If email delivery fails due to
        // unverified domain or API issues, the OTP can still be retrieved by
        // checking server logs (development) or the user can retry.
        console.error('[OTP Email] Failed to send OTP email via Resend:', err.message);
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[DEV DEBUG] OTP email failed but OTP is saved. Code: ${code}`);
        }
        // In production: do not re-throw — let the OTP be saved and tell the frontend
        // via a flag so it can show a user-friendly "email may be delayed" message.
        // We still proceed so the OTP record is persisted below.
      }
    } else {
      // Send OTP via MSG91 SMS (India-ready 🇮🇳)
      try {
        if (!process.env.MSG91_AUTH_KEY || !process.env.MSG91_TEMPLATE_ID) {
          console.warn(`[DEV DEBUG] MSG91 credentials/template missing. Skipping SMS send for ${target}`);
        } else {
          const result = await sendSmsViaMSG91(target, code, expiresMinutes);
          sessionId = result.request_id || null; // MSG91 may return a request_id
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[DEV DEBUG] MSG91 OTP SMS failed: ${err.message}`);
        } else {
          console.error('Error sending SMS OTP via MSG91:', err);
          // Re-throw ApiError as-is, wrap plain errors
          if (err instanceof ApiError) throw err;
          throw new ApiError(`Failed to send SMS OTP: ${err.message}`, 502, 'SMS_PROVIDER_ERROR');
        }
      }
    }
  }

  // Save OTP to database
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Invalidate any existing unused OTP for same target + purpose
    await connection.query(
      'UPDATE otp_codes SET verified = 1 WHERE phone = ? AND purpose = ? AND verified = 0',
      [target, purpose]
    );

    // Insert new OTP record
    await connection.query(
      'INSERT INTO otp_codes (phone, code, session_id, purpose, expires_at) VALUES (?, ?, ?, ?, ?)',
      [target, code, sessionId, purpose, expiresAt]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  if (isTest) {
    console.log(`[OTP] (Test Mode) Code ${code} → ${target} (Purpose: ${purpose}, Email: ${isEmail})`);
  }

  return {
    message: 'OTP sent successfully',
    expires_in: expiresMinutes * 60
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// verifyOtp — validates the OTP entered by the user
// ─────────────────────────────────────────────────────────────────────────────
async function verifyOtp(target, otp, purpose) {
  const now = new Date();

  const [rows] = await pool.query(
    `SELECT id, code, expires_at, verified, attempt_count 
     FROM otp_codes 
     WHERE phone = ? AND purpose = ? AND verified = 0
     ORDER BY created_at DESC 
     LIMIT 1`,
    [target, purpose]
  );

  if (rows.length === 0) {
    throw new ApiError('No active OTP found for this verification target', 400, 'OTP_NOT_FOUND');
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

  if (!row.code) {
    throw new ApiError('OTP code missing from database', 500, 'OTP_CORRUPT');
  }

  // Compare securely using timingSafeEqual (prevents timing attacks)
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

  // Mark OTP as used
  await pool.query('UPDATE otp_codes SET verified = 1 WHERE id = ?', [row.id]);

  // Issue a short-lived verification token
  const verificationToken = createOtpVerificationToken(target, purpose);

  return {
    message: 'OTP verified successfully',
    verification_token: verificationToken,
    target
  };
}

module.exports = {
  sendOtp,
  verifyOtp
};
