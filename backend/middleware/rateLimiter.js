const rateLimit = require('express-rate-limit');

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.DISABLE_RATE_LIMIT === 'true' ? 100 : 5, // Limit each IP to 5 login requests per window (100 if disabled)
  message: {
    error: true,
    message: 'Too many login attempts, please try again after 15 minutes.',
    code: 'TOO_MANY_LOGIN_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => process.env.NODE_ENV !== 'production' || process.env.DISABLE_RATE_LIMIT === 'true',
});

const sendOtpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // Limit each IP to 3 OTP requests per window
  message: {
    error: true,
    message: 'Too many OTP requests, please try again after 10 minutes.',
    code: 'TOO_MANY_OTP_REQUESTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => process.env.NODE_ENV !== 'production',
});

const verifyOtpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 OTP verification requests per window
  message: {
    error: true,
    message: 'Too many OTP verification attempts, please try again after 15 minutes.',
    code: 'TOO_MANY_OTP_VERIFICATIONS'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => process.env.NODE_ENV !== 'production',
});

module.exports = {
  loginRateLimiter,
  sendOtpRateLimiter,
  verifyOtpRateLimiter
};
