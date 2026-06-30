const crypto = require('crypto');
const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { hashPassword, verifyPassword } = require('../services/passwordService');
const otpService = require('../services/otpService');
const jwtService = require('../services/jwtService');

/**
 * Utility to hash a refresh token string using SHA-256.
 */
function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Utility to serialize a user object for responses.
 */
function serializeUser(user) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    hospitalId: user.hospital_id,
    hospital_id: user.hospital_id,
    districtId: user.district_id,
    district_id: user.district_id,
    createdAt: user.created_at,
    created_at: user.created_at,
    lastLogin: user.last_login,
    last_login: user.last_login,
    mustChangePassword: !!user.must_change_password,
    must_change_password: !!user.must_change_password
  };
}

/**
 * Helper to dynamically find or create a district.
 */
async function findOrCreateDistrict(connection, city, state) {
  const [rows] = await connection.query(
    'SELECT id FROM districts WHERE name = ? AND state = ? LIMIT 1',
    [city, state]
  );
  if (rows.length > 0) {
    return rows[0].id;
  }
  const [result] = await connection.query(
    'INSERT INTO districts (name, state) VALUES (?, ?)',
    [city, state]
  );
  return result.insertId;
}

/**
 * Helper to issue access and refresh tokens, saving the refresh token in the DB.
 */
async function issueTokens(user) {
  const accessToken = jwtService.createAccessToken(
    user.id,
    user.role,
    user.hospital_id,
    user.district_id,
    user.token_version || 0
  );
  
  const { token: refreshToken, expiresAt } = jwtService.createRefreshToken(user.id);
  const tokenHash = hashRefreshToken(refreshToken);

  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [user.id, tokenHash, expiresAt]
  );

  return {
    token: accessToken,
    refreshToken,
    refresh_token: refreshToken, // Supporting both cases
    user: serializeUser(user),
    role: user.role
  };
}

/**
 * POST /auth/send-otp
 */
async function sendOtp(req, res, next) {
  try {
    const { phone, purpose = 'registration' } = req.body;
    const result = await otpService.sendOtp(phone, purpose);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/verify-otp
 */
async function verifyOtp(req, res, next) {
  try {
    const { phone, otp, purpose = 'registration' } = req.body;
    const result = await otpService.verifyOtp(phone, otp, purpose);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/register
 */
async function register(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { role = 'donor' } = req.body;

    if (role === 'donor') {
      const { phone, email, password, verificationToken, verification_token } = req.body;
      const tokenToVerify = verificationToken || verification_token;

      if (!tokenToVerify) {
        throw new ApiError('Verification token is required for phone registration', 400, 'TOKEN_REQUIRED');
      }

      // Verify OTP verification token
      jwtService.verifyOtpVerificationToken(tokenToVerify, phone, 'registration');

      // Check if phone already exists
      const [existingPhone] = await connection.query('SELECT id FROM users WHERE phone = ?', [phone]);
      if (existingPhone.length > 0) {
        throw new ApiError('Phone number already registered', 409, 'PHONE_EXISTS');
      }

      // Email is optional for mobile-only registration
      const finalEmail = email ? email.toLowerCase() : `${phone}@donor.raktsetu.local`;
      const [existingEmail] = await connection.query('SELECT id FROM users WHERE email = ?', [finalEmail]);
      if (existingEmail.length > 0) {
        throw new ApiError('Email already registered', 409, 'EMAIL_EXISTS');
      }

      const passwordHash = password ? await hashPassword(password) : null;

      // Insert User
      const [userResult] = await connection.query(
        'INSERT INTO users (email, phone, password_hash, role) VALUES (?, ?, ?, ?)',
        [finalEmail, phone, passwordHash, 'donor']
      );

      const user_id = userResult.insertId;
      await connection.commit();

      const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [user_id]);
      const result = await issueTokens(userRows[0]);
      return res.status(201).json(result);

    } else if (role === 'admin') {
      // Hospital registration
      const { email, phone, password, hospitalName, hospitalType, license_no, address, city, state, pincode, lat, lng, licenseDocument, license_document } = req.body;
      const uploadedDoc = licenseDocument || license_document || null;

      const finalEmail = email.toLowerCase();
      const [existingEmail] = await connection.query('SELECT id FROM users WHERE email = ?', [finalEmail]);
      if (existingEmail.length > 0) {
        throw new ApiError('Email already registered', 409, 'EMAIL_EXISTS');
      }

      const [existingPhone] = await connection.query('SELECT id FROM users WHERE phone = ?', [phone]);
      if (existingPhone.length > 0) {
        throw new ApiError('Phone number already registered', 409, 'PHONE_EXISTS');
      }

      // Handle district
      const districtId = await findOrCreateDistrict(connection, city, state);

      // Insert Hospital in pending state
      const [hospitalResult] = await connection.query(
        `INSERT INTO hospitals (name, district_id, type, lat, lng, location, license_no, address, contact, city, state, pincode, verification_status, license_document)
         VALUES (?, ?, ?, ?, ?, ST_GeomFromText(?, 4326), ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [
          hospitalName,
          districtId,
          hospitalType,
          lat,
          lng,
          `POINT(${lng} ${lat})`, // Longitude first, then Latitude
          license_no,
          address,
          phone,
          city,
          state,
          pincode,
          uploadedDoc
        ]
      );

      const hospitalId = hospitalResult.insertId;
      const passwordHash = await hashPassword(password);

      // Insert Admin User
      const [userResult] = await connection.query(
        'INSERT INTO users (email, phone, password_hash, role, hospital_id) VALUES (?, ?, ?, ?, ?)',
        [finalEmail, phone, passwordHash, 'admin', hospitalId]
      );

      const user_id = userResult.insertId;
      await connection.commit();

      const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [user_id]);
      const result = await issueTokens(userRows[0]);
      result.message = 'Hospital registration submitted. Awaiting verification.';
      return res.status(201).json(result);

    } else {
      throw new ApiError('Invalid registration role. Only donor or hospital admin can register.', 400, 'INVALID_ROLE');
    }
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

/**
 * POST /auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password, phone, otp, verificationToken, verification_token } = req.body;
    let user;

    if (email) {
      // Email + Password Login
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
      if (rows.length === 0) {
        throw new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }
      user = rows[0];

      const isPasswordValid = await verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        throw new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }
    } else if (phone) {
      // OTP Login (for donors)
      const tokenToVerify = verificationToken || verification_token;
      
      if (otp) {
        // Direct OTP verification + Login
        await otpService.verifyOtp(phone, otp, 'login');
      } else if (tokenToVerify) {
        // Verification token supplied
        jwtService.verifyOtpVerificationToken(tokenToVerify, phone, 'login');
      } else {
        throw new ApiError('Either OTP or verification token is required', 400, 'VERIFICATION_REQUIRED');
      }

      const [rows] = await pool.query('SELECT * FROM users WHERE phone = ?', [phone]);
      if (rows.length === 0) {
        throw new ApiError('No account found for this phone number', 44, 'USER_NOT_FOUND');
      }
      user = rows[0];

      if (user.role !== 'donor') {
        throw new ApiError('Phone OTP login is only available for donors', 403, 'OTP_LOGIN_FORBIDDEN');
      }
    } else {
      throw new ApiError('Email or Phone is required to log in', 400, 'CREDENTIALS_REQUIRED');
    }

    if (user.status === 'Suspended') {
      throw new ApiError('Your account has been suspended. Please contact support.', 403, 'SUSPENDED_USER');
    }

    // Check if hospital is pending
    if (user.role === 'admin' && user.hospital_id) {
      const [hospRows] = await pool.query('SELECT verification_status FROM hospitals WHERE id = ?', [user.hospital_id]);
      if (hospRows.length > 0 && hospRows[0].verification_status === 'pending') {
        // Return tokens but notify pending status
        const result = await issueTokens(user);
        result.message = 'Hospital status pending verification by System Admin';
        return res.status(200).json(result);
      }
    }

    // Update last login
    const now = new Date();
    await pool.query('UPDATE users SET last_login = ? WHERE id = ?', [now, user.id]);
    user.last_login = now;

    const result = await issueTokens(user);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/logout
 */
async function logout(req, res, next) {
  try {
    const refreshToken = req.body.refreshToken || req.body.refresh_token;
    if (!refreshToken) {
      throw new ApiError('Refresh token is required to log out', 400, 'TOKEN_REQUIRED');
    }

    const payload = jwtService.decodeToken(refreshToken, 'refresh');
    const tokenHash = hashRefreshToken(refreshToken);

    await pool.query(
      `UPDATE refresh_tokens 
       SET revoked_at = ? 
       WHERE token_hash = ? AND user_id = ? AND revoked_at IS NULL`,
      [new Date(), tokenHash, parseInt(payload.sub, 10)]
    );

    await pool.query(
      `UPDATE users 
       SET token_version = token_version + 1 
       WHERE id = ?`,
      [parseInt(payload.sub, 10)]
    );

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /auth/validate-invite-token/:token
 */
async function validateInviteToken(req, res, next) {
  try {
    const { token } = req.params;
    const now = new Date();

    const [rows] = await pool.query(
      `SELECT si.email, si.expires_at, si.used_at, h.name AS hospital_name 
       FROM staff_invites si
       INNER JOIN hospitals h ON h.id = si.hospital_id
       WHERE si.token = ? 
       LIMIT 1`,
      [token]
    );

    if (rows.length === 0) {
      throw new ApiError('Invalid invite token', 404, 'INVALID_INVITE');
    }

    const invite = rows[0];

    if (invite.used_at !== null) {
      throw new ApiError('Invite token already used', 410, 'INVITE_USED');
    }

    if (new Date(invite.expires_at) < now) {
      throw new ApiError('Invite token expired', 410, 'INVITE_EXPIRED');
    }

    return res.status(200).json({
      name: invite.hospital_name,
      email: invite.email
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/set-password
 */
async function setPassword(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { token, password } = req.body;
    const now = new Date();

    const [inviteRows] = await connection.query(
      'SELECT id, email, hospital_id, expires_at, used_at FROM staff_invites WHERE token = ? LIMIT 1',
      [token]
    );

    if (inviteRows.length === 0) {
      throw new ApiError('Invalid invite token', 404, 'INVALID_INVITE');
    }

    const invite = inviteRows[0];

    if (invite.used_at !== null) {
      throw new ApiError('Invite token already used', 410, 'INVITE_USED');
    }

    if (new Date(invite.expires_at) < now) {
      throw new ApiError('Invite token expired', 410, 'INVITE_EXPIRED');
    }

    // Verify user doesn't already exist
    const [existingUser] = await connection.query('SELECT id FROM users WHERE email = ?', [invite.email]);
    if (existingUser.length > 0) {
      throw new ApiError('User already exists for this invite', 409, 'USER_EXISTS');
    }

    const passwordHash = await hashPassword(password);

    // Insert staff user
    await connection.query(
      'INSERT INTO users (email, password_hash, role, hospital_id) VALUES (?, ?, ?, ?)',
      [invite.email, passwordHash, 'staff', invite.hospital_id]
    );

    // Mark invite as used
    await connection.query(
      'UPDATE staff_invites SET used_at = ? WHERE id = ?',
      [now, invite.id]
    );

    await connection.commit();
    return res.status(200).json({ message: 'Password set successfully. You can now log in.' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

/**
 * POST /auth/refresh
 */
async function refresh(req, res, next) {
  try {
    const refreshToken = req.body.refreshToken || req.body.refresh_token;
    if (!refreshToken) {
      throw new ApiError('Refresh token is required', 400, 'TOKEN_REQUIRED');
    }

    const payload = jwtService.decodeToken(refreshToken, 'refresh');
    const userId = parseInt(payload.sub, 10);
    const tokenHash = hashRefreshToken(refreshToken);
    const now = new Date();

    const [tokenRows] = await pool.query(
      'SELECT id, revoked_at, expires_at FROM refresh_tokens WHERE token_hash = ? AND user_id = ? LIMIT 1',
      [tokenHash, userId]
    );

    if (tokenRows.length === 0 || tokenRows[0].revoked_at !== null) {
      throw new ApiError('Refresh token revoked', 401, 'TOKEN_REVOKED');
    }

    if (new Date(tokenRows[0].expires_at) < now) {
      throw new ApiError('Refresh token expired', 401, 'TOKEN_EXPIRED');
    }

    const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    const user = userRows[0];
    const accessToken = jwtService.createAccessToken(
      user.id,
      user.role,
      user.hospital_id,
      user.district_id,
      user.token_version || 0
    );

    return res.status(200).json({
      token: accessToken,
      refreshToken,
      refresh_token: refreshToken,
      user: serializeUser(user),
      role: user.role
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/change-password
 */
async function changePassword(req, res, next) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }
    const user = rows[0];

    const isPasswordValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new ApiError('Invalid current password', 400, 'INVALID_CURRENT_PASSWORD');
    }

    const hashedNew = await hashPassword(newPassword);

    await pool.query(
      'UPDATE users SET password_hash = ?, must_change_password = 0, token_version = token_version + 1 WHERE id = ?',
      [hashedNew, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Password rotated successfully. Please sign in again.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  sendOtp,
  verifyOtp,
  register,
  login,
  logout,
  validateInviteToken,
  setPassword,
  refresh,
  changePassword,
  // Exported for reuse by donorFirebaseController
  issueTokens,
  serializeUser
};
