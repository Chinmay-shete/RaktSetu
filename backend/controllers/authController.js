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
    hospitalName: user.hospital_name || null,
    hospital_name: user.hospital_name || null,
    districtId: user.district_id,
    district_id: user.district_id,
    districtName: user.district_name || null,
    district_name: user.district_name || null,
    state: user.state || null,
    createdAt: user.created_at,
    created_at: user.created_at,
    lastLogin: user.last_login,
    last_login: user.last_login,
    mustChangePassword: !!user.must_change_password,
    must_change_password: !!user.must_change_password,
    name: user.full_name || user.email,
    designation: user.designation || (
      user.role === 'admin' ? 'Hospital Administrator' :
      user.role === 'sysadmin' ? 'System Administrator' :
      user.role === 'district' ? 'District Officer' :
      user.role === 'state' ? 'State Admin' :
      'Hospital Staff'
    )
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
    const { phone, email, purpose = 'registration' } = req.body;
    const target = phone || email;
    const isEmail = !!email;
    const result = await otpService.sendOtp(target, purpose, isEmail);
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
    const { phone, email, otp, purpose = 'registration' } = req.body;
    const target = phone || email;
    const result = await otpService.verifyOtp(target, otp, purpose);
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
        throw new ApiError('Verification token is required for registration', 400, 'TOKEN_REQUIRED');
      }

      // The verified target is either the explicit email field or the phone field
      // (the frontend reuses the primary field for whichever was verified).
      const verifiedTarget = email || phone;
      if (!verifiedTarget) {
        throw new ApiError('Phone number or email is required for registration', 400, 'TARGET_REQUIRED');
      }

      // Detect whether the verified target is an email address or a phone number
      const isEmailTarget = String(verifiedTarget).includes('@');

      // Verify OTP verification token (token was issued for the same target value)
      jwtService.verifyOtpVerificationToken(tokenToVerify, verifiedTarget, 'registration');

      let finalPhone = isEmailTarget ? null : phone;
      let finalEmail = isEmailTarget
        ? verifiedTarget.toLowerCase()
        : (email ? email.toLowerCase() : `${phone}@donor.raktsetu.local`);

      if (finalPhone) {
        // Check if phone already exists
        const [existingPhone] = await connection.query('SELECT id FROM users WHERE phone = ?', [finalPhone]);
        if (existingPhone.length > 0) {
          throw new ApiError('Phone number already registered', 409, 'PHONE_EXISTS');
        }
      }

      const [existingEmail] = await connection.query('SELECT id FROM users WHERE email = ?', [finalEmail]);
      if (existingEmail.length > 0) {
        throw new ApiError('Email already registered', 409, 'EMAIL_EXISTS');
      }

      const passwordHash = password ? await hashPassword(password) : null;

      // Insert User
      const [userResult] = await connection.query(
        'INSERT INTO users (email, phone, password_hash, role) VALUES (?, ?, ?, ?)',
        [finalEmail, finalPhone, passwordHash, 'donor']
      );

      const user_id = userResult.insertId;
      await connection.commit();

      const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [user_id]);
      const result = await issueTokens(userRows[0]);
      return res.status(201).json(result);

    } else if (role === 'admin') {
      // Hospital registration
      const { email, phone, password, hospitalName, hospitalType, license_no, address, city, state, pincode, lat, lng, licenseDocument, license_document, district, ownerName } = req.body;
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

      // Check if license number already exists
      const [existingLicense] = await connection.query('SELECT id FROM hospitals WHERE license_no = ?', [license_no.trim()]);
      if (existingLicense.length > 0) {
        throw new ApiError('Hospital license registration number already registered', 409, 'LICENSE_EXISTS');
      }

      // Handle district
      const targetDistrict = district || city;
      const districtId = await findOrCreateDistrict(connection, targetDistrict, state);

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
          license_no.trim(),
          address,
          phone,
          city,
          state,
          pincode,
          uploadedDoc
        ]
      );

      const hospitalId = hospitalResult.insertId;
      // Set temporary password hash during registration, which gets replaced on approval
      const passwordHash = await hashPassword('PENDING_APPROVAL_TEMP_RESET');

      // Insert Admin User in Pending state
      const [userResult] = await connection.query(
        "INSERT INTO users (email, phone, password_hash, role, hospital_id, status, full_name, designation) VALUES (?, ?, ?, ?, ?, 'Pending', ?, 'Hospital Administrator')",
        [finalEmail, phone, passwordHash, 'admin', hospitalId, ownerName || 'Hospital Representative']
      );

      await connection.commit();

      // Dispatch confirmation email
      try {
        const { sendEmail } = require('../services/emailService');
        const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

        const welcomeHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RaktSetu – Registration Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#9e001f;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">RaktSetu</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:2px;text-transform:uppercase;">National Blood Logistics Platform</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="color:#685c59;font-size:13px;margin:0 0 24px;">Date: ${today}</p>

            <h2 style="margin:0 0 12px;color:#1a1210;font-size:22px;font-weight:700;">Registration Received</h2>
            <p style="margin:0 0 28px;color:#22a06b;font-size:15px;font-weight:600;">✓ Submission In Review — ${hospitalName}</p>

            <p style="font-size:15px;color:#1a1210;line-height:1.7;margin:0 0 16px;">
              Dear Administrator,
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">
              Thank you for registering <strong>${hospitalName}</strong> on the RaktSetu National Blood Logistics Platform. We have successfully received your facility details, license registration documents, and contact details.
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
              Your application is currently in progress. Over the next few hours, our district administration officers and system administrators will verify your license details:
            </p>

            <!-- Verification Timeline -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;border-left:2px solid #ede7e1;padding-left:16px;">
              <tr>
                <td style="padding:4px 0 16px;">
                  <span style="font-size:11px;font-weight:700;color:#22a06b;letter-spacing:1px;text-transform:uppercase;">STEP 1: DETAILS SUBMITTED</span><br/>
                  <span style="font-size:13px;color:#5a5a5a;">Your details are stored securely.</span>
                </td>
              </tr>
              <tr>
                <td style="padding:4px 0 16px;">
                  <span style="font-size:11px;font-weight:700;color:#9e001f;letter-spacing:1px;text-transform:uppercase;">STEP 2: DISTRICT & SYSTEM REVIEW</span><br/>
                  <span style="font-size:13px;color:#5a5a5a;">Officers review the license registration <strong>${license_no}</strong> for authenticity.</span>
                </td>
              </tr>
              <tr>
                <td style="padding:4px 0 0;">
                  <span style="font-size:11px;font-weight:700;color:#9a9a9a;letter-spacing:1px;text-transform:uppercase;">STEP 3: CREDENTIALS EMAIL</span><br/>
                  <span style="font-size:13px;color:#5a5a5a;">Upon verification, your account password and activation notice will be sent.</span>
                </td>
              </tr>
            </table>

            <p style="font-size:13px;color:#685c59;line-height:1.6;margin:0 0 24px;">
              If you have any questions or did not submit this request, please reply to this email to contact our support team.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#faf8f5;padding:20px 40px;border-top:1px solid #ede7e1;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9A9A9A;">© ${new Date().getFullYear()} RaktSetu — National Blood Logistics Platform</p>
            <p style="margin:4px 0 0;font-size:11px;color:#c4b8b5;">This is an automated message. Please do not reply to this email.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

        await sendEmail({
          to: finalEmail,
          subject: `RaktSetu – Registration Confirmation for ${hospitalName}`,
          html: welcomeHtml
        });
      } catch (emailErr) {
        console.error('Failed to send registration confirmation email:', emailErr);
      }

      return res.status(201).json({
        message: 'Hospital registration submitted successfully. Please wait for System Admin approval.'
      });

    } else if (role === 'district') {
      // District Officer registration
      const { email, phone, fullName, designation, districtName, state } = req.body;
      const finalEmail = email.toLowerCase();

      const [existingEmail] = await connection.query('SELECT id FROM users WHERE email = ?', [finalEmail]);
      if (existingEmail.length > 0) {
        throw new ApiError('Email already registered', 409, 'EMAIL_EXISTS');
      }

      const [existingPhone] = await connection.query('SELECT id FROM users WHERE phone = ?', [phone]);
      if (existingPhone.length > 0) {
        throw new ApiError('Phone number already registered', 409, 'PHONE_EXISTS');
      }

      // Find or create district
      const districtId = await findOrCreateDistrict(connection, districtName, state);

      // Set temporary password hash during registration, which gets replaced on approval
      const passwordHash = await hashPassword('PENDING_APPROVAL_TEMP_RESET');

      // Insert District User in Pending state
      await connection.query(
        `INSERT INTO users (email, phone, password_hash, role, full_name, designation, district_id, status) 
         VALUES (?, ?, ?, 'district', ?, ?, ?, 'Pending')`,
        [finalEmail, phone, passwordHash, fullName, designation, districtId]
      );

      await connection.commit();

      return res.status(201).json({
        message: 'District Officer registration submitted successfully. Please wait for System Admin approval.'
      });

    } else {
      throw new ApiError('Invalid registration role. Only donor, hospital admin, or district officer can register.', 400, 'INVALID_ROLE');
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
      const [rows] = await pool.query(
        `SELECT u.*, h.name AS hospital_name, d.name AS district_name 
         FROM users u 
         LEFT JOIN hospitals h ON u.hospital_id = h.id 
         LEFT JOIN districts d ON u.district_id = d.id
         WHERE u.email = ?`,
        [email.toLowerCase()]
      );
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
    if (['admin', 'staff'].includes(user.role) && user.hospital_id) {
      const [hospRows] = await pool.query('SELECT verification_status FROM hospitals WHERE id = ?', [user.hospital_id]);
      if (hospRows.length > 0 && hospRows[0].verification_status === 'pending') {
        throw new ApiError('Your hospital registration is pending verification. Please wait for System Admin approval.', 403, 'HOSPITAL_PENDING');
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

    const [userRows] = await pool.query(
      `SELECT u.*, h.name AS hospital_name 
       FROM users u 
       LEFT JOIN hospitals h ON u.hospital_id = h.id 
       WHERE u.id = ?`,
      [userId]
    );
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

/**
 * POST /auth/verify-mfa
 */
async function verifyMfa(req, res, next) {
  try {
    const { code } = req.body;
    if (!code || code.length !== 6) {
      throw new ApiError('Invalid MFA code format.', 400, 'INVALID_MFA_FORMAT');
    }
    // Accept '123456' as standard debug TOTP code
    if (code !== '123456') {
      throw new ApiError('Invalid MFA code. Use 123456 for local testing.', 400, 'INVALID_MFA_CODE');
    }
    return res.status(200).json({
      success: true,
      message: 'MFA verification successful.'
    });
  } catch (error) {
    next(error);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT u.*, h.name AS hospital_name, d.name AS district_name 
       FROM users u 
       LEFT JOIN hospitals h ON u.hospital_id = h.id 
       LEFT JOIN districts d ON u.district_id = d.id
       WHERE u.id = ?`,
      [userId]
    );
    if (rows.length === 0) {
      throw new ApiError('User not found', 404, 'NOT_FOUND');
    }
    return res.status(200).json({
      user: serializeUser(rows[0])
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
  verifyMfa,
  getCurrentUser,
  // Exported for reuse by donorFirebaseController
  issueTokens,
  serializeUser
};

