const { decodeToken } = require('../services/jwtService');
const { pool } = require('../config/db');
const { ApiError } = require('./errorHandler');

/**
 * Resolves a scope ID (like hospital_id or district_id) from route params, query, or body.
 */
function resolveScopeId(req, key) {
  // Check snake_case and camelCase forms of the key
  const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  
  if (req.params[key] !== undefined) return req.params[key];
  if (req.params[camelKey] !== undefined) return req.params[camelKey];
  
  if (req.query[key] !== undefined) return req.query[key];
  if (req.query[camelKey] !== undefined) return req.query[camelKey];
  
  if (req.body && req.body[key] !== undefined) return req.body[key];
  if (req.body && req.body[camelKey] !== undefined) return req.body[camelKey];
  
  return null;
}

/**
 * Middleware to require valid JWT authentication.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      throw new ApiError('Missing or invalid Authorization header', 401, 'UNAUTHORIZED');
    }
    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new ApiError('Missing bearer token', 401, 'UNAUTHORIZED');
    }

    const payload = decodeToken(token, 'access');

    // Retrieve user from DB to verify active status
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [payload.sub]);
    if (rows.length === 0) {
      throw new ApiError('User not found', 401, 'UNAUTHORIZED');
    }

    // Attach user information to request object
    req.user = rows[0];
    req.token = payload;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to restrict endpoints by role.
 */
function requireRole(allowedRoles) {
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return [
    requireAuth,
    (req, res, next) => {
      if (!req.user || !rolesArray.includes(req.user.role)) {
        return next(new ApiError('You do not have permission to access this resource', 403, 'FORBIDDEN'));
      }
      next();
    }
  ];
}

/**
 * Middleware to enforce ownership constraints.
 * Ensures staff/admin can only access resources matching their hospital_id,
 * and district officers only their district_id.
 */
function requireOwnership(options = {}) {
  const hospitalParam = options.hospitalParam || 'hospital_id';
  const districtParam = options.districtParam || 'district_id';

  return [
    requireAuth,
    (req, res, next) => {
      const { role } = req.user;

      if (role === 'staff' || role === 'admin') {
        const userHospitalId = req.user.hospital_id;
        if (userHospitalId === null || userHospitalId === undefined) {
          return next(new ApiError('Hospital account is not linked to a facility', 403, 'FORBIDDEN'));
        }

        const targetHospitalId = resolveScopeId(req, hospitalParam);
        if (targetHospitalId !== null && targetHospitalId !== undefined && String(targetHospitalId) !== String(userHospitalId)) {
          return next(new ApiError('Cross-hospital access is not allowed', 403, 'FORBIDDEN'));
        }
      } else if (role === 'district') {
        const userDistrictId = req.user.district_id;
        if (userDistrictId === null || userDistrictId === undefined) {
          return next(new ApiError('District account is not linked to a district', 403, 'FORBIDDEN'));
        }

        const targetDistrictId = resolveScopeId(req, districtParam);
        if (targetDistrictId !== null && targetDistrictId !== undefined && String(targetDistrictId) !== String(userDistrictId)) {
          return next(new ApiError('Cross-district access is not allowed', 403, 'FORBIDDEN'));
        }
      }

      next();
    }
  ];
}

module.exports = {
  requireAuth,
  requireRole,
  requireOwnership
};
