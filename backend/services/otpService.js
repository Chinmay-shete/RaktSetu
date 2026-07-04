const crypto = require('crypto');
const twilio = require('twilio');
const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { createOtpVerificationToken } = require('./jwtService');
const emailService = require('./emailService');

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new ApiError('Twilio credentials are not defined in environment variables.', 500, 'CONFIG_ERROR');
  }
  return twilio(accountSid, authToken);
}

async function sendOtp(target, purpose, isEmail = false) {
  const expiresMinutes = parseInt(process.env.OTP_EXPIRES_MINUTES || '5', 10);
  const expiresAt = new Date(Date.now() + (expiresMinutes * 60 * 1000));
  
  const isTest = process.env.NODE_ENV === 'test';
  
  // Always generate a secure 6-digit random code locally
  const code = String(crypto.randomInt(100000, 999999));
  
  // Log the generated OTP for easy local testing without email domain restrictions
  console.warn(`[DEVELOPMENT DEBUG] Generated OTP Code: ${code.split('').join(' ')}`);
  
  let sessionId = null;

  if (!isTest) {
    if (isEmail) {
      try {
        // Send the OTP code via Resend Email
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
      } catch (err) {
        console.error('Error sending Email via Resend:', err);
        throw new ApiError(`Failed to send Email OTP via Resend: ${err.message}`, 502, 'EMAIL_PROVIDER_ERROR');
      }
    } else {
      const twilioClient = getTwilioClient();
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
      if (!twilioPhone) {
        throw new ApiError('TWILIO_PHONE_NUMBER is not defined in environment variables.', 500, 'CONFIG_ERROR');
      }

      try {
        // Send the OTP code via Twilio SMS
        const message = await twilioClient.messages.create({
          body: `${code} is your OTP to verify phone number at RaktSetu. Please do not share OTP with anyone.`,
          from: twilioPhone,
          to: target // E.164 formatted (+919322966139) from the frontend
        });
        sessionId = message.sid; // Use Twilio message SID as sessionId
      } catch (err) {
        console.error('Error sending SMS via Twilio:', err);
        throw new ApiError(`Failed to send SMS OTP via Twilio: ${err.message}`, 502, 'SMS_PROVIDER_ERROR');
      }
    }
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Invalidate existing unused codes for this target & purpose
    await connection.query(
      'UPDATE otp_codes SET verified = 1 WHERE phone = ? AND purpose = ? AND verified = 0',
      [target, purpose]
    );

    // Insert new OTP record (with generated code and session ID)
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
    console.log(`[OTP] (Test Mode) Sent code ${code} to ${target} (Purpose: ${purpose}, Email: ${isEmail})`);
  }

  return {
    message: 'OTP sent successfully',
    expires_in: expiresMinutes * 60
  };
}

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

  // Compare user input securely using timingSafeEqual
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

  // Mark OTP as verified/used
  await pool.query('UPDATE otp_codes SET verified = 1 WHERE id = ?', [row.id]);

  // Create verification token that proves this target is verified
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
