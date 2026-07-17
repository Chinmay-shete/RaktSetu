const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const { sendEmail } = require('../services/emailService');

/**
 * Helper to validate environment parameters against a strict whitelist.
 */
function isValidConfigParam(val) {
  return /^[a-zA-Z0-9.\-_]+$/.test(val);
}

/**
 * Helper to format a date to YYYY-MM-DD.
 */
function formatDate(dateVal) {
  if (!dateVal) return null;
  if (typeof dateVal === 'string') {
    return dateVal.split('T')[0];
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * GET /systemadmin/dashboard
 */
async function getSystemDashboard(req, res, next) {
  try {
    // 1. Calculate uptime
    const uptimeSec = process.uptime();
    const hrs = Math.floor(uptimeSec / 3600);
    const mins = Math.floor((uptimeSec % 3600) / 60);
    const secs = Math.floor(uptimeSec % 60);
    const uptime = `${hrs}h ${mins}m ${secs}s`;

    // 2. Database Status check
    let dbStatus = 'Disconnected';
    try {
      await pool.query('SELECT 1');
      dbStatus = 'Connected';
    } catch (e) {
      dbStatus = 'Disconnected';
    }

    // 3. Overall Stats
    const [userRows] = await pool.query('SELECT COUNT(*) AS count FROM users');
    const [hospRows] = await pool.query('SELECT COUNT(*) AS count FROM hospitals');
    const [campRows] = await pool.query('SELECT COUNT(*) AS count FROM donation_camps');

    return res.status(200).json({
      uptime,
      dbStatus,
      totalUsers: userRows[0].count,
      totalHospitals: hospRows[0].count,
      totalCamps: campRows[0].count,
      latency: '1ms' // mock or approximate database ping
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /systemadmin/pending-approvals
 */
async function getPendingApprovals(req, res, next) {
  try {
    // 1. Get hospitals awaiting verification
    const [hospRows] = await pool.query(
      `SELECT id, name, type, license_no, address, contact, city, state, created_at, verification_status
       FROM hospitals
       WHERE verification_status IN ('pending', 'district_approved')
       ORDER BY created_at DESC`
    );

    const pendingHospitals = hospRows.map(h => ({
      id: h.id,
      name: h.name,
      type: h.type,
      licenseNo: h.license_no,
      area: h.address,
      city: h.city,
      state: h.state,
      contact: h.contact,
      appliedAt: formatDate(h.created_at) || 'Recent',
      verificationStatus: h.verification_status
    }));

    // 2. Get district officers awaiting approval
    // Note: district officers who register/created with status = 'Pending'
    const [officerRows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.designation, d.name AS district_name, u.created_at
       FROM users u
       LEFT JOIN districts d ON d.id = u.district_id
       WHERE u.role = 'district' AND u.status = 'Pending'
       ORDER BY u.created_at DESC`
    );

    const pendingOfficers = officerRows.map(o => ({
      id: o.id,
      name: o.full_name || 'District Officer',
      district: o.district_name || 'Unassigned',
      email: o.email,
      designation: o.designation || 'District Health Officer',
      appliedAt: formatDate(o.created_at) || 'Recent'
    }));

    return res.status(200).json({
      pendingHospitals,
      pendingOfficers
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /systemadmin/hospitals/:id/approve
 */
async function approveOrRejectHospital(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const hospitalId = req.params.id;
    const { status } = req.body; // 'verified' or 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
      throw new ApiError("Invalid status, must be 'verified' or 'rejected'", 400, 'INVALID_STATUS');
    }

    // Verify hospital exists
    const [hospRows] = await connection.query(
      'SELECT id, name FROM hospitals WHERE id = ?',
      [hospitalId]
    );

    if (hospRows.length === 0) {
      throw new ApiError('Hospital not found', 404, 'HOSPITAL_NOT_FOUND');
    }

    // Update hospital verification_status
    await connection.query(
      'UPDATE hospitals SET verification_status = ? WHERE id = ?',
      [status, hospitalId]
    );

    const [adminUserRows] = await connection.query(
      "SELECT email, full_name FROM users WHERE hospital_id = ? AND role = 'admin' LIMIT 1",
      [hospitalId]
    );

    let tempPassword = null;
    // If verified, activate any linked admin/staff user account who is pending
    if (status === 'verified') {
      const bcrypt = require('bcryptjs');
      tempPassword = `RS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const tempPasswordHash = await bcrypt.hash(tempPassword, 10);

      // Set admin password to temporary password, activate account, and set must_change_password = 1
      await connection.query(
        "UPDATE users SET password_hash = ?, status = 'Active', must_change_password = 1 WHERE hospital_id = ? AND role = 'admin'",
        [tempPasswordHash, hospitalId]
      );

      // Activate other pending staff members
      await connection.query(
        "UPDATE users SET status = 'Active' WHERE hospital_id = ? AND role = 'staff' AND status = 'Pending'",
        [hospitalId]
      );

      // Send approval welcome email
      if (adminUserRows.length > 0 && adminUserRows[0].email) {
        const adminEmail = adminUserRows[0].email;
        const adminName = adminUserRows[0].full_name || 'Hospital Representative';
        const hospitalName = hospRows[0].name;
        const getFrontendOrigin = () => {
          const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
          const firstOrigin = corsOrigin.split(',')[0].trim();
          return firstOrigin.replace(/\/+$/, '');
        };
        const loginUrl = `${getFrontendOrigin()}/login`;
        const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

        const approvalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RaktSetu – Hospital Application Approved</title>
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

            <h2 style="margin:0 0 8px;color:#1a1210;font-size:22px;font-weight:700;">Registration Approved</h2>
            <p style="margin:0 0 28px;color:#685c59;font-size:14px;">Hospital Access Authorization — ${hospitalName}</p>

            <p style="font-size:15px;color:#1a1210;line-height:1.7;margin:0 0 16px;">
              Dear <strong>${adminName}</strong>,
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">
              We are pleased to inform you that your application to register <strong>${hospitalName}</strong> on the RaktSetu National Blood Logistics Platform has been approved. Your account as Hospital Admin has been successfully activated.
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 32px;">
              Please find your temporary login credentials below. You are required to change your password upon first login.
            </p>

            <!-- Credentials Card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6f6;border:1.5px solid #ffdad8;border-radius:12px;margin-bottom:32px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9e001f;">Your Login Credentials</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid #fce8e8;">
                        <span style="font-size:12px;color:#685c59;font-weight:600;">EMAIL ADDRESS</span><br/>
                        <span style="font-size:15px;color:#1a1210;font-weight:700;">${adminEmail}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0 0;">
                        <span style="font-size:12px;color:#685c59;font-weight:600;">TEMPORARY PASSWORD</span><br/>
                        <span style="font-size:20px;color:#9e001f;font-weight:800;letter-spacing:3px;font-family:monospace;">${tempPassword}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td align="center">
                  <a href="${loginUrl}" style="display:inline-block;background:#9e001f;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.3px;">Login to RaktSetu Portal →</a>
                </td>
              </tr>
            </table>

            <p style="font-size:13px;color:#9A9A9A;line-height:1.6;margin:0 0 8px;">
              ⚠️ This is a system-generated temporary password. Please do not share it with anyone. You will be prompted to set a new password upon your first login.
            </p>
            <p style="font-size:13px;color:#9A9A9A;line-height:1.6;margin:0;">
              If you did not expect this email or believe this is an error, please contact the RaktSetu support team.
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
          to: adminEmail,
          subject: `RaktSetu – Hospital Application Approved: ${hospitalName}`,
          html: approvalHtml
        });
      }
    } else if (status === 'rejected') {
      // Suspend linked admin/staff users in DB
      await connection.query(
        "UPDATE users SET status = 'Suspended' WHERE hospital_id = ?",
        [hospitalId]
      );

      // Send rejection notification email
      if (adminUserRows.length > 0 && adminUserRows[0].email) {
        const adminEmail = adminUserRows[0].email;
        const adminName = adminUserRows[0].full_name || 'Hospital Representative';
        const hospitalName = hospRows[0].name;
        const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

        const rejectionHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RaktSetu – Hospital Application Declined</title>
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

            <h2 style="margin:0 0 8px;color:#1a1210;font-size:22px;font-weight:700;">Registration Update</h2>
            <p style="margin:0 0 28px;color:#685c59;font-size:14px;">Hospital Application Status — ${hospitalName}</p>

            <p style="font-size:15px;color:#1a1210;line-height:1.7;margin:0 0 16px;">
              Dear <strong>${adminName}</strong>,
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">
              Thank you for your application to register <strong>${hospitalName}</strong> on the RaktSetu National Blood Logistics Platform.
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
              After reviewing the verification details and submitted documents, we regret to inform you that your application has been **declined** at this time.
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 32px;">
              If you believe this decision is in error, or if you would like to submit additional documentation or re-apply with corrected information, please reach out to our support team at support@raktsetu.online.
            </p>

            <p style="font-size:13px;color:#9A9A9A;line-height:1.6;margin:0;">
              If you did not expect this email or believe this is an error, please contact the RaktSetu support team.
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
          to: adminEmail,
          subject: `RaktSetu – Hospital Application Update: ${hospitalName}`,
          html: rejectionHtml
        });
      }
    }

    await connection.commit();

    return res.status(200).json({
      message: `Hospital registration has been successfully ${status === 'verified' ? 'approved' : 'rejected'}`,
      hospitalId: parseInt(hospitalId, 10),
      status,
      tempPassword
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

/**
 * GET /systemadmin/users
 */
async function listUsers(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.phone, u.role, u.status, u.full_name, u.designation, u.last_login, u.created_at
       FROM users u
       ORDER BY u.created_at DESC`
    );

    const serialized = rows.map(row => ({
      id: row.id,
      name: row.full_name || (row.role === 'donor' ? 'Donor' : 'User'),
      email: row.email || row.phone,
      role: row.role,
      status: row.status,
      designation: row.designation || (row.role === 'donor' ? 'Blood Donor' : `${row.role.toUpperCase()} Role`),
      lastActive: row.last_login ? formatDate(row.last_login) : (row.created_at ? formatDate(row.created_at) : 'Never')
    }));

    return res.status(200).json(serialized);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /systemadmin/users/:id
 */
async function updateUser(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const userId = req.params.id;
    const { role, status } = req.body;

    const [userCheck] = await connection.query(
      'SELECT id, email, role, status, district_id, full_name, designation FROM users WHERE id = ?',
      [userId]
    );
    if (userCheck.length === 0) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }
    const currentUser = userCheck[0];

    const updates = [];
    const params = [];

    if (role !== undefined) {
      const allowedRoles = ['donor', 'staff', 'admin', 'district', 'state', 'sysadmin'];
      if (!allowedRoles.includes(role)) {
        throw new ApiError('Invalid user role provided', 400, 'INVALID_ROLE');
      }
      updates.push('role = ?');
      params.push(role);
    }

    let tempPassword = null;
    if (status !== undefined) {
      const allowedStatuses = ['Active', 'Suspended', 'Pending'];
      if (!allowedStatuses.includes(status)) {
        throw new ApiError('Invalid user status provided', 400, 'INVALID_STATUS');
      }
      
      // If we are activating a pending district officer, generate temporary password
      if (status === 'Active' && currentUser.role === 'district' && currentUser.status === 'Pending') {
        const bcrypt = require('bcryptjs');
        tempPassword = `RS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const tempPasswordHash = await bcrypt.hash(tempPassword, 10);
        
        updates.push('password_hash = ?');
        params.push(tempPasswordHash);
        
        updates.push('must_change_password = 1');

        let districtName = 'Assigned District';
        // Update district table to link this officer
        if (currentUser.district_id) {
          const [distRows] = await connection.query(
            'SELECT name, state FROM districts WHERE id = ?',
            [currentUser.district_id]
          );
          if (distRows.length > 0) {
            districtName = `${distRows[0].name}, ${distRows[0].state}`;
          }
          await connection.query(
            'UPDATE districts SET officer_id = ? WHERE id = ?',
            [userId, currentUser.district_id]
          );
        }

        // Send welcome email to district officer
        if (currentUser.email) {
          const getFrontendOrigin = () => {
            const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
            const firstOrigin = corsOrigin.split(',')[0].trim();
            return firstOrigin.replace(/\/+$/, '');
          };
          const loginUrl = `${getFrontendOrigin()}/login`;
          const designationLabel = currentUser.designation || 'District Health Officer';
          const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

          const welcomeHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RaktSetu – Appointment Letter</title>
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

            <h2 style="margin:0 0 8px;color:#1a1210;font-size:22px;font-weight:700;">Appointment Letter</h2>
            <p style="margin:0 0 28px;color:#685c59;font-size:14px;">District Officer Commission — ${districtName}</p>

            <p style="font-size:15px;color:#1a1210;line-height:1.7;margin:0 0 16px;">
              Dear <strong>${currentUser.full_name || 'Officer'}</strong>,
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">
              We are pleased to inform you that your application as <strong>${designationLabel}</strong> for the district of <strong>${districtName}</strong> on the RaktSetu National Blood Logistics Platform has been approved. Your account is now active.
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 32px;">
              Please find your temporary login credentials below. You are required to change your password upon first login.
            </p>

            <!-- Credentials Card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6f6;border:1.5px solid #ffdad8;border-radius:12px;margin-bottom:32px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9e001f;">Your Login Credentials</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid #fce8e8;">
                        <span style="font-size:12px;color:#685c59;font-weight:600;">EMAIL ADDRESS</span><br/>
                        <span style="font-size:15px;color:#1a1210;font-weight:700;">${currentUser.email}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0 0;">
                        <span style="font-size:12px;color:#685c59;font-weight:600;">TEMPORARY PASSWORD</span><br/>
                        <span style="font-size:20px;color:#9e001f;font-weight:800;letter-spacing:3px;font-family:monospace;">${tempPassword}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td align="center">
                  <a href="${loginUrl}" style="display:inline-block;background:#9e001f;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.3px;">Login to RaktSetu Portal →</a>
                </td>
              </tr>
            </table>

            <p style="font-size:13px;color:#9A9A9A;line-height:1.6;margin:0 0 8px;">
              ⚠️ This is a system-generated temporary password. Please do not share it with anyone. You will be prompted to set a new password upon your first login.
            </p>
            <p style="font-size:13px;color:#9A9A9A;line-height:1.6;margin:0;">
              If you did not expect this email or believe this is an error, please contact the RaktSetu support team.
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
            to: currentUser.email,
            subject: `RaktSetu – Your Appointment as ${designationLabel}`,
            html: welcomeHtml
          });
        }
      }

      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      throw new ApiError('No update fields provided', 400, 'MISSING_FIELDS');
    }

    params.push(userId);
    await connection.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    await connection.commit();

    const redis = require('../config/redis');
    try {
      await redis.del(`user:${userId}`);
      await redis.del(`token_version:${userId}`);
    } catch (redisErr) {
      console.warn('[Redis] Connection failed on user update:', redisErr.message);
    }

    const [updatedRows] = await pool.query('SELECT id, role, status FROM users WHERE id = ?', [userId]);
    const updatedUser = updatedRows[0];

    return res.status(200).json({
      message: 'User details updated successfully',
      userId: updatedUser.id,
      role: updatedUser.role,
      status: updatedUser.status,
      tempPassword
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

/**
 * GET /systemadmin/audit-logs
 */
async function getAuditLogs(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT al.id, al.actor_id, al.action, al.severity, al.ip_address, al.timestamp, u.email AS actor_email
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.actor_id
       ORDER BY al.timestamp DESC`
    );

    const serialized = rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp ? new Date(row.timestamp).toISOString().replace('T', ' ').substring(0, 19) : '',
      actor: row.actor_email || 'System',
      action: row.action,
      severity: row.severity ? row.severity.charAt(0).toUpperCase() + row.severity.slice(1) : 'Info',
      ipAddress: row.ip_address || '127.0.0.1'
    }));

    return res.status(200).json(serialized);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /systemadmin/backup
 */
async function triggerBackup(req, res, next) {
  try {
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filename = `raktsetu_backup_${Date.now()}.sql`;
    const filepath = path.join(backupDir, filename);

    const dbUser = process.env.DB_USER || process.env.DB_USERNAME || 'root';
    const dbHost = process.env.DB_HOST || '127.0.0.1';
    const dbName = process.env.DB_NAME || process.env.DB_DATABASE || 'raktsetu';
    const dbPort = process.env.DB_PORT || '3306';

    // Validate parameters
    if (!isValidConfigParam(dbUser) || !isValidConfigParam(dbHost) || !isValidConfigParam(dbName) || !isValidConfigParam(dbPort)) {
      throw new ApiError('Invalid database configuration parameters', 400, 'INVALID_CONFIG');
    }

    const args = ['-u', dbUser, '-h', dbHost, '-P', dbPort];
    const env = { ...process.env };
    if (process.env.DB_PASSWORD) {
      env.MYSQL_PWD = process.env.DB_PASSWORD;
    }
    args.push(dbName);

    const writeStream = fs.createWriteStream(filepath);
    const child = execFile('mysqldump', args, { env }, async (error) => {
      writeStream.end();
      if (error) {
        fs.unlink(filepath, () => {});
        console.warn('mysqldump failed, executing JSON export fallback:', error.message);
        try {
          const tables = [
            'districts', 'hospitals', 'users', 'blood_batches', 'transfer_requests',
            'emergency_requests', 'notifications', 'donors', 'donation_camps',
            'forecasts', 'surgical_schedules', 'alert_thresholds', 'audit_logs'
          ];
          const backupData = {};

          for (const table of tables) {
            const [rows] = await pool.query(`SELECT * FROM ${table}`);
            backupData[table] = rows;
          }

          const jsonFilename = `raktsetu_backup_${Date.now()}.json`;
          const jsonFilepath = path.join(backupDir, jsonFilename);
          fs.writeFileSync(jsonFilepath, JSON.stringify(backupData, null, 2));

          return res.status(200).json({
            message: 'Database backup completed successfully (JSON fallback)',
            filename: jsonFilename,
            filepath: jsonFilepath,
            fallback: true
          });
        } catch (fallbackErr) {
          return next(fallbackErr);
        }
      }

      return res.status(200).json({
        message: 'Database backup completed successfully',
        filename,
        filepath,
        fallback: false
      });
    });

    child.stdout.pipe(writeStream);
  } catch (error) {
    next(error);
  }
}

async function createStateAdmin(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { email, fullName, stateName, designation } = req.body;

    // Check if email already exists
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase().trim()]
    );
    if (existing.length > 0) {
      throw new ApiError('Email already registered', 400, 'EMAIL_EXISTS');
    }

    const bcrypt = require('bcryptjs');
    // Generate raw temporary password
    const tempPassword = `RS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Insert user with role 'state'
    const [result] = await connection.query(
      `INSERT INTO users (email, password_hash, role, status, full_name, designation, state, must_change_password)
       VALUES (?, ?, 'state', 'Active', ?, ?, ?, 1)`,
      [
        email.toLowerCase().trim(),
        passwordHash,
        fullName,
        designation || 'State Health Coordinator',
        stateName
      ]
    );

    // ── Send welcome / appointment letter email ──────────────────────────────
    const getFrontendOrigin = () => {
      const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
      const firstOrigin = corsOrigin.split(',')[0].trim();
      return firstOrigin.replace(/\/+$/, '');
    };
    const loginUrl = `${getFrontendOrigin()}/state/login`;
    const designationLabel = designation || 'State Health Coordinator';
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const welcomeHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RaktSetu – Appointment Letter</title>
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

            <h2 style="margin:0 0 8px;color:#1a1210;font-size:22px;font-weight:700;">Appointment Letter</h2>
            <p style="margin:0 0 28px;color:#685c59;font-size:14px;">State Health Administration — ${stateName}</p>

            <p style="font-size:15px;color:#1a1210;line-height:1.7;margin:0 0 16px;">
              Dear <strong>${fullName}</strong>,
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">
              We are pleased to appoint you as <strong>${designationLabel}</strong> for the state of <strong>${stateName}</strong> on the RaktSetu National Blood Logistics Platform. Your role grants you administrative access to manage blood banks, hospitals, donation camps, and cross-district transfers within your jurisdiction.
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 32px;">
              Please find your temporary login credentials below. You are required to change your password upon first login.
            </p>

            <!-- Credentials Card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6f6;border:1.5px solid #ffdad8;border-radius:12px;margin-bottom:32px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9e001f;">Your Login Credentials</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid #fce8e8;">
                        <span style="font-size:12px;color:#685c59;font-weight:600;">EMAIL ADDRESS</span><br/>
                        <span style="font-size:15px;color:#1a1210;font-weight:700;">${email.toLowerCase().trim()}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0 0;">
                        <span style="font-size:12px;color:#685c59;font-weight:600;">TEMPORARY PASSWORD</span><br/>
                        <span style="font-size:20px;color:#9e001f;font-weight:800;letter-spacing:3px;font-family:monospace;">${tempPassword}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td align="center">
                  <a href="${loginUrl}" style="display:inline-block;background:#9e001f;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.3px;">Login to RaktSetu Portal →</a>
                </td>
              </tr>
            </table>

            <p style="font-size:13px;color:#9A9A9A;line-height:1.6;margin:0 0 8px;">
              ⚠️ This is a system-generated temporary password. Please do not share it with anyone. You will be prompted to set a new password upon your first login.
            </p>
            <p style="font-size:13px;color:#9A9A9A;line-height:1.6;margin:0;">
              If you did not expect this email or believe this is an error, please contact the RaktSetu system administrator immediately.
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
      to: email.toLowerCase().trim(),
      subject: `RaktSetu – Your Appointment as ${designationLabel}, ${stateName}`,
      html: welcomeHtml
    });
    // ── End welcome email ────────────────────────────────────────────────────

    await connection.commit();

    return res.status(201).json({
      message: 'State Admin created successfully. Welcome email sent.',
      user: {
        id: result.insertId,
        email: email.toLowerCase().trim(),
        role: 'state',
        fullName,
        stateName,
        designation: designation || 'State Health Coordinator'
      },
      tempPassword
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

module.exports = {
  getSystemDashboard,
  getPendingApprovals,
  approveOrRejectHospital,
  listUsers,
  updateUser,
  getAuditLogs,
  triggerBackup,
  createStateAdmin
};
