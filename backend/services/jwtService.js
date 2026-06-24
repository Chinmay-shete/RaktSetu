const jwt = require('jsonwebtoken');
const { ApiError } = require('../middleware/errorHandler');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_raktsetu_key_2026';

const TOKEN_TYPE_ACCESS = 'access';
const TOKEN_TYPE_REFRESH = 'refresh';
const TOKEN_TYPE_OTP = 'otp_verification';

/**
 * Encodes a payload into a JWT.
 */
function encode(payload) {
  return jwt.sign(payload, JWT_SECRET);
}

/**
 * Decodes and verifies a JWT.
 */
function decodeToken(token, expectedType = null) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (expectedType && payload.type !== expectedType) {
      throw new ApiError('Invalid token type', 401, 'INVALID_TOKEN_TYPE');
    }
    return payload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError('Token has expired', 401, 'TOKEN_EXPIRED');
    }
    throw new ApiError('Invalid token', 401, 'INVALID_TOKEN');
  }
}

/**
 * Creates an access token.
 */
function createAccessToken(userId, role, hospitalId = null, districtId = null) {
  const expiresMinutes = parseInt(process.env.JWT_ACCESS_EXPIRES_MINUTES || '60', 10);
  const payload = {
    sub: String(userId),
    role,
    hospital_id: hospitalId,
    district_id: districtId,
    type: TOKEN_TYPE_ACCESS,
    exp: Math.floor(Date.now() / 1000) + (expiresMinutes * 60),
    iat: Math.floor(Date.now() / 1000)
  };
  return encode(payload);
}

/**
 * Creates a refresh token and returns the token string and expiry timestamp.
 */
function createRefreshToken(userId) {
  const expiresDays = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '7', 10);
  const durationSeconds = expiresDays * 24 * 60 * 60;
  const expiresAt = new Date(Date.now() + (durationSeconds * 1000));
  
  const payload = {
    sub: String(userId),
    type: TOKEN_TYPE_REFRESH,
    exp: Math.floor(expiresAt.getTime() / 1000),
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomBytes(8).toString('hex')
  };
  
  return {
    token: encode(payload),
    expiresAt
  };
}

/**
 * Creates an OTP verification token.
 */
function createOtpVerificationToken(phone, purpose) {
  const expiresMinutes = parseInt(process.env.OTP_EXPIRES_MINUTES || '5', 10);
  const payload = {
    phone,
    purpose,
    type: TOKEN_TYPE_OTP,
    exp: Math.floor(Date.now() / 1000) + (expiresMinutes * 60),
    iat: Math.floor(Date.now() / 1000)
  };
  return encode(payload);
}

/**
 * Verifies that the OTP verification token matches the phone number and purpose.
 */
function verifyOtpVerificationToken(token, phone, purpose) {
  const payload = decodeToken(token, TOKEN_TYPE_OTP);
  if (payload.phone !== phone) {
    throw new ApiError('OTP verification token does not match phone number', 401, 'INVALID_OTP_TOKEN');
  }
  if (payload.purpose !== purpose) {
    throw new ApiError('OTP verification token purpose mismatch', 401, 'INVALID_OTP_TOKEN');
  }
  return true;
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  createOtpVerificationToken,
  decodeToken,
  verifyOtpVerificationToken,
  TOKEN_TYPE_ACCESS,
  TOKEN_TYPE_REFRESH
};
