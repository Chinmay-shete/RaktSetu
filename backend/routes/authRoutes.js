const express = require('express');
const authController = require('../controllers/authController');
const {
  loginRateLimiter,
  sendOtpRateLimiter,
  verifyOtpRateLimiter
} = require('../middleware/rateLimiter');
const { requireAuth } = require('../middleware/auth');
const {
  validateRequest,
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  loginSchema,
  logoutSchema,
  setPasswordSchema,
  refreshSchema,
  changePasswordSchema
} = require('../middleware/validation');

const router = express.Router();

// 1. Send OTP (Phone Verification dispatch)
router.post('/send-otp', sendOtpRateLimiter, validateRequest(sendOtpSchema), authController.sendOtp);

// 2. Verify OTP
router.post('/verify-otp', verifyOtpRateLimiter, validateRequest(verifyOtpSchema), authController.verifyOtp);

// 3. Register (Donor or Hospital Admin)
router.post('/register', validateRequest(registerSchema), authController.register);

// 4. Login (Email/Password or Phone/OTP)
router.post('/login', loginRateLimiter, validateRequest(loginSchema), authController.login);

// 5. Logout
router.post('/logout', validateRequest(logoutSchema), authController.logout);

// 6. Validate Invite Token (For staff invitation verification)
router.get('/validate-invite-token/:token', authController.validateInviteToken);

// 7. Set Password (Invited staff password activation)
router.post('/set-password', validateRequest(setPasswordSchema), authController.setPassword);

// 8. Refresh Token
router.post('/refresh', validateRequest(refreshSchema), authController.refresh);

// 9. Change Password (For direct staff password rotation)
router.post('/change-password', requireAuth, validateRequest(changePasswordSchema), authController.changePassword);

module.exports = router;
