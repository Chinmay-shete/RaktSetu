const jwt = require('jsonwebtoken');
const { ApiError } = require('../middleware/errorHandler');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_OTP_SECRET = process.env.JWT_OTP_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('CRITICAL ERROR: JWT_SECRET environment variable is missing or shorter than 32 characters.');
  process.exit(1);
}

if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.length < 32) {
  console.error('CRITICAL ERROR: JWT_REFRESH_SECRET environment variable is missing or shorter than 32 characters.');
  process.exit(1);
}

if (!JWT_OTP_SECRET || JWT_OTP_SECRET.length < 32) {
  console.error('CRITICAL ERROR: JWT_OTP_SECRET environment variable is missing or shorter than 32 characters.');
  process.exit(1);
}

const TOKEN_TYPE_ACCESS = 'access';
const TOKEN_TYPE_REFRESH = 'refresh';
const TOKEN_TYPE_OTP = 'otp_verification';

/**
 * Encodes a payload into a JWT.
 */
function encode(payload, secret) {
  return jwt.sign(payload, secret);
}

/**
 * Decodes and verifies a JWT.
 */
function decodeToken(token, expectedType = null) {
  try {
    const unverified = jwt.decode(token);
    if (!unverified || !unverified.type) {
      throw new ApiError('Invalid token structure', 401, 'INVALID_TOKEN');
    }

    let secret;
    if (unverified.type === TOKEN_TYPE_REFRESH) {
      secret = JWT_REFRESH_SECRET;
    } else if (unverified.type === TOKEN_TYPE_OTP) {
      secret = JWT_OTP_SECRET;
    } else {
      secret = JWT_SECRET;
    }

    const payload = jwt.verify(token, secret);
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
function createAccessToken(userId, role, hospitalId = null, districtId = null, tokenVersion = 0) {
  const expiresMinutes = parseInt(process.env.JWT_ACCESS_EXPIRES_MINUTES || '60', 10);
  const payload = {
    sub: String(userId),
    role,
    hospital_id: hospitalId,
    district_id: districtId,
    type: TOKEN_TYPE_ACCESS,
    token_version: tokenVersion,
    exp: Math.floor(Date.now() / 1000) + (expiresMinutes * 60),
    iat: Math.floor(Date.now() / 1000)
  };
  return encode(payload, JWT_SECRET);
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
    token: encode(payload, JWT_REFRESH_SECRET),
    expiresAt
  };
}

/**
 * Creates an OTP verification token.
 * The `target` can be either a phone number or an email address depending
 * on which channel the OTP was sent through.
 */
function createOtpVerificationToken(target, purpose) {
  const expiresMinutes = parseInt(process.env.OTP_EXPIRES_MINUTES || '5', 10);
  const payload = {
    target,
    purpose,
    type: TOKEN_TYPE_OTP,
    exp: Math.floor(Date.now() / 1000) + (expiresMinutes * 60),
    iat: Math.floor(Date.now() / 1000)
  };
  return encode(payload, JWT_OTP_SECRET);
}

/**
 * Verifies that the OTP verification token matches the target (email or phone) and purpose.
 * Backward-compatible: accepts both `target` (new) and `phone` (legacy) payload fields.
 */
function verifyOtpVerificationToken(token, target, purpose) {
  const payload = decodeToken(token, TOKEN_TYPE_OTP);
  const storedTarget = payload.target || payload.phone; // backward-compat
  if (storedTarget !== target) {
    throw new ApiError('OTP verification token does not match target', 401, 'INVALID_OTP_TOKEN');
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
