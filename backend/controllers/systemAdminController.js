const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

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
      `SELECT id, name, type, license_no, address, contact, created_at
       FROM hospitals
       WHERE verification_status = 'pending'
       ORDER BY created_at DESC`
    );

    const pendingHospitals = hospRows.map(h => ({
      id: h.id,
      name: h.name,
      type: h.type,
      licenseNo: h.license_no,
      area: h.address,
      contact: h.contact,
      appliedAt: formatDate(h.created_at) || 'Recent'
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

    // If verified, activate any linked admin/staff user account who is pending
    if (status === 'verified') {
      await connection.query(
        "UPDATE users SET status = 'Active' WHERE hospital_id = ? AND status = 'Pending'",
        [hospitalId]
      );
    }

    await connection.commit();

    return res.status(200).json({
      message: `Hospital registration has been successfully ${status === 'verified' ? 'approved' : 'rejected'}`,
      hospitalId: parseInt(hospitalId, 10),
      status
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
  try {
    const userId = req.params.id;
    const { role, status } = req.body;

    const [userCheck] = await pool.query('SELECT id, role, status FROM users WHERE id = ?', [userId]);
    if (userCheck.length === 0) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

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

    if (status !== undefined) {
      const allowedStatuses = ['Active', 'Suspended', 'Pending'];
      if (!allowedStatuses.includes(status)) {
        throw new ApiError('Invalid user status provided', 400, 'INVALID_STATUS');
      }
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      throw new ApiError('No update fields provided', 400, 'MISSING_FIELDS');
    }

    params.push(userId);
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const [updatedRows] = await pool.query('SELECT id, role, status FROM users WHERE id = ?', [userId]);
    const updatedUser = updatedRows[0];

    return res.status(200).json({
      message: 'User details updated successfully',
      userId: updatedUser.id,
      role: updatedUser.role,
      status: updatedUser.status
    });
  } catch (error) {
    next(error);
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

    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD ? `-p${process.env.DB_PASSWORD}` : '';
    const dbHost = process.env.DB_HOST || '127.0.0.1';
    const dbName = process.env.DB_NAME || 'raktsetu';

    const cmd = `mysqldump -u ${dbUser} ${dbPassword} -h ${dbHost} ${dbName} > "${filepath}"`;

    exec(cmd, async (error) => {
      if (error) {
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
        message: 'Database backup completed successfully (SQL)',
        filename,
        filepath
      });
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSystemDashboard,
  getPendingApprovals,
  approveOrRejectHospital,
  listUsers,
  updateUser,
  getAuditLogs,
  triggerBackup
};
