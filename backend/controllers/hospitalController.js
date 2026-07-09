const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const crypto = require('crypto');
const { hashPassword } = require('../services/passwordService');
const { sendEmail } = require('../services/emailService');

// Memory caches for idempotency and forecasts
const idempotencyKeys = new Map();
const forecastCache = {
  forecast: null,
  forecastExpiry: null
};

/**
 * Helper to calculate days remaining from expiry date to today.
 */
function calculateDaysRemaining(expiryDateStr) {
  const expiryDate = new Date(expiryDateStr);
  const today = new Date();
  expiryDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = expiryDate.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Helper to calculate the blood batch status.
 */
function calculateBatchStatus(units, reservedUnits, daysRemaining) {
  if (daysRemaining < 0) {
    return 'Expired';
  }
  if (daysRemaining <= 30) {
    return 'Expiring Soon';
  }
  if ((units - reservedUnits) <= 3) {
    return 'Low Stock';
  }
  return 'Available';
}

/**
 * Serializes a blood batch record to camelCase.
 */
function serializeBatch(row) {
  const collectionDate = row.collection_date ? new Date(row.collection_date).toISOString().split('T')[0] : null;
  const expiryDate = row.expiry_date ? new Date(row.expiry_date).toISOString().split('T')[0] : null;
  const daysRemaining = expiryDate ? calculateDaysRemaining(expiryDate) : 0;
  const status = calculateBatchStatus(row.units, row.reserved_units, daysRemaining);

  return {
    id: row.id,
    bloodGroup: row.blood_group,
    units: row.units,
    reservedUnits: row.reserved_units,
    collectionDate,
    expiryDate,
    source: row.source,
    remarks: row.remarks,
    status,
    daysRemaining
  };
}

/**
 * Helper to serialize a notification.
 */
function serializeNotification(row) {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: !!row.is_read,
    timestamp: row.timestamp
  };
}

/**
 * GET /hospital/inventory
 */
async function getInventory(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM blood_batches WHERE hospital_id = ?',
      [hospitalId]
    );
    const totalItems = countRows[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated batches
    const [rows] = await pool.query(
      'SELECT * FROM blood_batches WHERE hospital_id = ? ORDER BY expiry_date ASC, id ASC LIMIT ? OFFSET ?',
      [hospitalId, limit, offset]
    );

    const serialized = rows.map(serializeBatch);

    return res.status(200).json({
      data: serialized,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /hospital/inventory
 */
async function addInventory(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    const { bloodGroup, units, collectionDate, expiryDate, source, remarks } = req.body;

    const [result] = await pool.query(
      `INSERT INTO blood_batches (
        hospital_id, blood_group, units, reserved_units, collection_date, expiry_date, source, remarks
      ) VALUES (?, ?, ?, 0, ?, ?, ?, ?)`,
      [
        hospitalId,
        bloodGroup,
        units,
        collectionDate,
        expiryDate,
        source || 'Donation',
        remarks || null
      ]
    );

    const [rows] = await pool.query('SELECT * FROM blood_batches WHERE id = ?', [result.insertId]);

    return res.status(201).json(serializeBatch(rows[0]));
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /hospital/inventory/:id
 */
async function updateInventory(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    const batchId = req.params.id;

    // Check if batch exists and belongs to this hospital
    const [batchRows] = await pool.query(
      'SELECT * FROM blood_batches WHERE id = ? AND hospital_id = ?',
      [batchId, hospitalId]
    );

    if (batchRows.length === 0) {
      throw new ApiError('Blood batch not found or access denied', 404, 'BATCH_NOT_FOUND');
    }

    const currentBatch = batchRows[0];
    const { bloodGroup, units, reservedUnits, collectionDate, expiryDate, source, remarks } = req.body;

    const updates = [];
    const params = [];

    if (bloodGroup !== undefined) {
      updates.push('blood_group = ?');
      params.push(bloodGroup);
    }
    if (units !== undefined) {
      updates.push('units = ?');
      params.push(units);
    }
    if (reservedUnits !== undefined) {
      updates.push('reserved_units = ?');
      params.push(reservedUnits);
    }
    if (collectionDate !== undefined) {
      updates.push('collection_date = ?');
      params.push(collectionDate);
    }
    if (expiryDate !== undefined) {
      updates.push('expiry_date = ?');
      params.push(expiryDate);
    }
    if (source !== undefined) {
      updates.push('source = ?');
      params.push(source);
    }
    if (remarks !== undefined) {
      updates.push('remarks = ?');
      params.push(remarks);
    }

    if (updates.length === 0) {
      throw new ApiError('No fields to update provided', 400, 'VALIDATION_ERROR');
    }

    params.push(batchId);

    await pool.query(
      `UPDATE blood_batches SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const [updatedRows] = await pool.query('SELECT * FROM blood_batches WHERE id = ?', [batchId]);

    return res.status(200).json(serializeBatch(updatedRows[0]));
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /hospital/inventory/:id
 */
async function deleteInventory(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    const batchId = req.params.id;

    // Check if batch exists and belongs to this hospital
    const [batchRows] = await pool.query(
      'SELECT id FROM blood_batches WHERE id = ? AND hospital_id = ?',
      [batchId, hospitalId]
    );

    if (batchRows.length === 0) {
      throw new ApiError('Blood batch not found or access denied', 404, 'BATCH_NOT_FOUND');
    }

    await pool.query('DELETE FROM blood_batches WHERE id = ?', [batchId]);

    return res.status(200).json({
      message: 'Blood batch deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /hospital/expiry-alerts
 */
async function getExpiryAlerts(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    // Retrieve all batches for this hospital
    const [rows] = await pool.query(
      'SELECT * FROM blood_batches WHERE hospital_id = ? ORDER BY expiry_date ASC',
      [hospitalId]
    );

    // Map and filter where daysRemaining <= 30
    const alerts = rows
      .map(serializeBatch)
      .filter(batch => batch.daysRemaining <= 30);

    return res.status(200).json(alerts);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /hospital/surgical-schedule
 */
async function listSurgicalSchedules(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    const [rows] = await pool.query(
      `SELECT id, surgery_date, surgery_type, blood_group, units 
       FROM surgical_schedules 
       WHERE hospital_id = ? 
       ORDER BY surgery_date ASC`,
      [hospitalId]
    );

    const serialized = rows.map(row => ({
      id: row.id,
      surgeryDate: row.surgery_date ? new Date(row.surgery_date).toISOString().split('T')[0] : null,
      surgeryType: row.surgery_type,
      bloodGroup: row.blood_group,
      units: row.units
    }));

    return res.status(200).json(serialized);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /hospital/surgical-schedule
 */
async function createSurgicalSchedule(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    const { surgeryDate, surgeryType, bloodGroup, units } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(surgeryDate) < today) {
      throw new ApiError('Surgery date cannot be in the past', 400, 'INVALID_DATE');
    }

    const [result] = await pool.query(
      `INSERT INTO surgical_schedules (
        hospital_id, surgery_date, surgery_type, blood_group, units
      ) VALUES (?, ?, ?, ?, ?)`,
      [hospitalId, surgeryDate, surgeryType, bloodGroup, units]
    );

    const [rows] = await pool.query(
      'SELECT * FROM surgical_schedules WHERE id = ?',
      [result.insertId]
    );

    const created = rows[0];

    return res.status(201).json({
      id: created.id,
      surgeryDate: created.surgery_date ? new Date(created.surgery_date).toISOString().split('T')[0] : null,
      surgeryType: created.surgery_type,
      bloodGroup: created.blood_group,
      units: created.units
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /hospital/donors/search
 */
async function searchDonors(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    const { bloodGroup, location } = req.query;

    let query = `
      SELECT d.id, d.user_id, d.full_name, d.blood_group, d.city, d.pincode, d.last_donated_date, u.phone, u.email 
      FROM donors d 
      LEFT JOIN users u ON d.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (bloodGroup) {
      query += ` AND d.blood_group = ?`;
      params.push(bloodGroup);
    }

    if (location) {
      query += ` AND (d.city LIKE ? OR d.pincode = ?)`;
      params.push(`%${location}%`, location);
    }

    const [rows] = await pool.query(query, params);

    const serialized = rows.map(row => {
      let status = 'Eligible';
      if (row.last_donated_date) {
        const lastDate = new Date(row.last_donated_date);
        const today = new Date();
        const diffTime = today.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 90) {
          status = 'Not Eligible';
        }
      }

      return {
        id: row.id,
        name: row.full_name,
        bloodGroup: row.blood_group,
        location: `${row.city}, ${row.pincode}`,
        lastDonated: row.last_donated_date ? new Date(row.last_donated_date).toISOString().split('T')[0] : null,
        phone: row.phone,
        email: row.email,
        status
      };
    });

    return res.status(200).json(serialized);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /hospital/emergencies
 */
async function listEmergencies(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    // Get current hospital coordinates to calculate distances
    const [hospRows] = await pool.query(
      'SELECT lat, lng FROM hospitals WHERE id = ?',
      [hospitalId]
    );

    if (hospRows.length === 0) {
      throw new ApiError('Hospital not found', 404, 'HOSPITAL_NOT_FOUND');
    }

    const { lat, lng } = hospRows[0];
    const pointStr = `POINT(${lng} ${lat})`;

    // Retrieve active SOS requests
    const [rows] = await pool.query(
      `SELECT er.id, er.blood_group, er.units, er.status, er.target_timestamp, er.message,
              h.name AS hospital_name,
              ST_Distance_Sphere(ST_GeomFromText(?, 4326), er.location) AS distance_m
       FROM emergency_requests er
       INNER JOIN hospitals h ON h.id = er.hospital_id
       WHERE er.status = 'pending'
       ORDER BY distance_m ASC`,
      [pointStr]
    );

    const serialized = rows.map(row => ({
      id: row.id,
      hospitalName: row.hospital_name,
      bloodGroup: row.blood_group,
      unitsRequired: row.units,
      distance: parseFloat((row.distance_m / 1000).toFixed(2)),
      status: row.status,
      targetTimestamp: row.target_timestamp,
      message: row.message
    }));

    return res.status(200).json(serialized);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /hospital/emergencies/:id/status
 */
async function updateEmergencyStatus(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    const emergencyId = req.params.id;
    const { status } = req.body;

    // Check if the emergency request exists
    const [emergencyRows] = await pool.query(
      'SELECT * FROM emergency_requests WHERE id = ?',
      [emergencyId]
    );

    if (emergencyRows.length === 0) {
      throw new ApiError('Emergency request not found', 404, 'EMERGENCY_NOT_FOUND');
    }

    await pool.query(
      'UPDATE emergency_requests SET status = ? WHERE id = ?',
      [status, emergencyId]
    );

    return res.status(200).json({
      message: 'Emergency request status updated successfully',
      id: parseInt(emergencyId, 10),
      status
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /emergency/search
 */
async function searchEmergencyBlood(req, res, next) {
  try {
    // Disable caching explicitly
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const { bloodGroup, lat, lng, radius } = req.query;

    if (!bloodGroup || !lat || !lng) {
      throw new ApiError('Missing required query parameters: bloodGroup, lat, lng', 400, 'VALIDATION_ERROR');
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadiusKm = parseFloat(radius) || 50; // Default to 50km
    const searchRadiusMeters = searchRadiusKm * 1000;

    const deltaLat = searchRadiusKm / 111.045;
    const deltaLng = searchRadiusKm / (111.045 * Math.cos(latitude * Math.PI / 180));

    const minLat = latitude - deltaLat;
    const maxLat = latitude + deltaLat;
    const minLng = longitude - deltaLng;
    const maxLng = longitude + deltaLng;

    const envelopeStr = `POLYGON((${minLng} ${minLat}, ${maxLng} ${minLat}, ${maxLng} ${maxLat}, ${minLng} ${maxLat}, ${minLng} ${minLat}))`;
    const pointStr = `POINT(${longitude} ${latitude})`;

    // MySQL Spatial index query using ST_Within and pre-filtering with bounding envelope to utilize spatial index
    const [rows] = await pool.query(
      `SELECT h.id, h.name, h.address, h.city, h.pincode, h.contact, h.lat, h.lng,
              SUM(bb.units - bb.reserved_units) AS available_units,
              ST_Distance_Sphere(ST_GeomFromText(?, 4326), h.location) AS distance_m
       FROM hospitals h
       INNER JOIN blood_batches bb ON bb.hospital_id = h.id
       WHERE bb.blood_group = ?
         AND (bb.units - bb.reserved_units) > 0
         AND ST_Within(h.location, ST_GeomFromText(?, 4326))
         AND ST_Distance_Sphere(ST_GeomFromText(?, 4326), h.location) <= ?
       GROUP BY h.id
       ORDER BY distance_m ASC`,
      [pointStr, bloodGroup, envelopeStr, pointStr, searchRadiusMeters]
    );

    const serialized = rows.map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      city: row.city,
      pincode: row.pincode,
      contact: row.contact,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
      availableUnits: parseInt(row.available_units, 10),
      distanceKm: parseFloat((row.distance_m / 1000).toFixed(2))
    }));

    return res.status(200).json(serialized);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /hospital/notifications
 */
async function listNotifications(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    // Retrieve notifications matching either user_id or hospital_id
    const [rows] = await pool.query(
      `SELECT id, title, message, type, is_read, timestamp 
       FROM notifications 
       WHERE hospital_id = ? OR user_id = ? 
       ORDER BY timestamp DESC`,
      [hospitalId, req.user.id]
    );

    const serialized = rows.map(serializeNotification);

    return res.status(200).json(serialized);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /hospital/notifications/:id/read
 */
async function markNotificationRead(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    const notificationId = req.params.id;

    // Check if the notification exists and belongs to this hospital/user
    const [rows] = await pool.query(
      'SELECT id FROM notifications WHERE id = ? AND (hospital_id = ? OR user_id = ?)',
      [notificationId, hospitalId, req.user.id]
    );

    if (rows.length === 0) {
      throw new ApiError('Notification not found or access denied', 404, 'NOTIFICATION_NOT_FOUND');
    }

    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ?',
      [notificationId]
    );

    return res.status(200).json({
      message: 'Notification marked as read successfully',
      id: parseInt(notificationId, 10),
      read: true
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /hospital/notifications/read-all
 */
async function markAllNotificationsRead(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE hospital_id = ? OR user_id = ?',
      [hospitalId, req.user.id]
    );

    return res.status(200).json({
      message: 'All notifications marked as read successfully',
      read: true
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /hospital/transfers
 */
async function listTransfers(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    const [rows] = await pool.query(
      `SELECT tr.id, tr.from_hospital, tr.to_hospital, tr.blood_group, tr.units, tr.priority, tr.status, tr.message, tr.created_at,
              h_from.name AS from_hospital_name,
              h_to.name AS to_hospital_name,
              ST_Distance_Sphere(h_from.location, h_to.location) AS distance_m
       FROM transfer_requests tr
       INNER JOIN hospitals h_from ON h_from.id = tr.from_hospital
       INNER JOIN hospitals h_to ON h_to.id = tr.to_hospital
       WHERE tr.from_hospital = ? OR tr.to_hospital = ?
       ORDER BY tr.created_at DESC`,
      [hospitalId, hospitalId]
    );

    const serialized = rows.map(row => {
      const isRecipient = row.to_hospital === hospitalId;
      const hospitalName = isRecipient ? row.from_hospital_name : row.to_hospital_name;
      const type = isRecipient ? 'outgoing' : 'incoming';

      return {
        id: row.id,
        hospitalName,
        bloodGroup: row.blood_group,
        unitsRequired: row.units,
        distance: parseFloat((row.distance_m / 1000).toFixed(2)),
        priority: row.priority,
        status: row.status,
        message: row.message,
        date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : null,
        type
      };
    });

    return res.status(200).json(serialized);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /hospital/transfers
 */
async function createTransfer(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    const idempotencyKey = req.headers['idempotency-key'];
    if (!idempotencyKey) {
      throw new ApiError('Idempotency-Key header is required', 400, 'IDEMPOTENCY_KEY_REQUIRED');
    }

    // Check cached idempotency response
    if (idempotencyKeys.has(idempotencyKey)) {
      const cached = idempotencyKeys.get(idempotencyKey);
      return res.status(cached.status).json(cached.body);
    }

    const { fromHospitalId, bloodGroup, units, priority, message } = req.body;

    if (String(fromHospitalId) === String(hospitalId)) {
      throw new ApiError('Cannot request transfer from your own hospital', 400, 'INVALID_TRANSFER');
    }

    // Verify supplying hospital exists
    const [supplierRows] = await pool.query('SELECT id FROM hospitals WHERE id = ?', [fromHospitalId]);
    if (supplierRows.length === 0) {
      throw new ApiError('Supplier hospital not found', 404, 'HOSPITAL_NOT_FOUND');
    }

    const [result] = await pool.query(
      `INSERT INTO transfer_requests (from_hospital, to_hospital, blood_group, units, priority, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [fromHospitalId, hospitalId, bloodGroup, units, priority, message || null]
    );

    // Fetch created record
    const [newRows] = await pool.query(
      `SELECT tr.*, 
              h_from.name AS from_hospital_name,
              h_to.name AS to_hospital_name,
              ST_Distance_Sphere(h_from.location, h_to.location) AS distance_m
       FROM transfer_requests tr
       INNER JOIN hospitals h_from ON h_from.id = tr.from_hospital
       INNER JOIN hospitals h_to ON h_to.id = tr.to_hospital
       WHERE tr.id = ?`,
      [result.insertId]
    );

    const created = newRows[0];
    const serialized = {
      id: created.id,
      hospitalName: created.from_hospital_name,
      bloodGroup: created.blood_group,
      unitsRequired: created.units,
      distance: parseFloat((created.distance_m / 1000).toFixed(2)),
      priority: created.priority,
      status: created.status,
      message: created.message,
      date: created.created_at ? new Date(created.created_at).toISOString().split('T')[0] : null,
      type: 'incoming'
    };

    // Cache the response
    idempotencyKeys.set(idempotencyKey, {
      status: 201,
      body: serialized,
      timestamp: Date.now()
    });

    return res.status(201).json(serialized);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /hospital/transfers/:id/status
 */
async function updateTransferStatus(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    const transferId = req.params.id;
    const { status } = req.body;

    const [transferRows] = await connection.query(
      'SELECT * FROM transfer_requests WHERE id = ? FOR UPDATE',
      [transferId]
    );

    if (transferRows.length === 0) {
      throw new ApiError('Transfer request not found', 404, 'TRANSFER_NOT_FOUND');
    }

    const transfer = transferRows[0];

    // Access check: only supplying hospital can approve/reject
    if (String(transfer.from_hospital) !== String(hospitalId)) {
      throw new ApiError('Only the supplying hospital can update status', 403, 'FORBIDDEN');
    }

    if (transfer.status !== 'pending') {
      throw new ApiError(`Transfer request is already ${transfer.status}`, 400, 'INVALID_STATUS_TRANSITION');
    }

    if (status === 'accepted') {
      // Find matching inventory batch of supplying hospital (FEFO: First Expired First Out)
      const [batches] = await connection.query(
        `SELECT * FROM blood_batches 
         WHERE hospital_id = ? AND blood_group = ? AND (units - reserved_units) >= ? AND expiry_date >= CURDATE()
         ORDER BY expiry_date ASC LIMIT 1
         FOR UPDATE`,
        [hospitalId, transfer.blood_group, transfer.units]
      );

      if (batches.length === 0) {
        throw new ApiError(
          `Insufficient unreserved units of blood group ${transfer.blood_group} to approve transfer of ${transfer.units} units`,
          400,
          'INSUFFICIENT_INVENTORY'
        );
      }

      const batch = batches[0];

      // Atomically increment reserved_units
      await connection.query(
        'UPDATE blood_batches SET reserved_units = reserved_units + ? WHERE id = ?',
        [transfer.units, batch.id]
      );
    }

    await connection.query(
      'UPDATE transfer_requests SET status = ? WHERE id = ?',
      [status, transferId]
    );

    await connection.commit();

    return res.status(200).json({
      message: `Transfer request status updated to ${status} successfully`,
      id: parseInt(transferId, 10),
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
 * GET /admin/forecast
 */
async function getForecastGateway(req, res, next) {
  try {
    const now = Date.now();
    if (forecastCache.forecast && forecastCache.forecastExpiry && now < forecastCache.forecastExpiry) {
      return res.status(200).json(forecastCache.forecast);
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL;
    const response = await fetch(`${aiServiceUrl}/api/v1/forecast`, {
      headers: {
        'X-Internal-Token': process.env.INTERNAL_API_SECRET || 'super_secret_internal_token_2026'
      }
    });
    if (!response.ok) {
      throw new ApiError('Failed to fetch forecast from AI service', 502, 'AI_SERVICE_ERROR');
    }

    const data = await response.json();

    forecastCache.forecast = data;
    forecastCache.forecastExpiry = now + (24 * 60 * 60 * 1000); // Cache for 24h

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /admin/waste-analytics
 */
async function getWasteAnalyticsGateway(req, res, next) {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL;
    const response = await fetch(`${aiServiceUrl}/api/v1/waste-analytics`, {
      headers: {
        'X-Internal-Token': process.env.INTERNAL_API_SECRET || 'super_secret_internal_token_2026'
      }
    });
    if (!response.ok) {
      throw new ApiError('Failed to fetch waste analytics from AI service', 502, 'AI_SERVICE_ERROR');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /admin/thresholds
 */
async function getThresholds(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    const [rows] = await pool.query(
      'SELECT * FROM alert_thresholds WHERE hospital_id = ?',
      [hospitalId]
    );

    if (rows.length === 0) {
      // Create defaults
      await pool.query(
        'INSERT INTO alert_thresholds (hospital_id, min_stock, max_stock, critical_units, expiry_days) VALUES (?, 10, 100, 5, 7)',
        [hospitalId]
      );
      return res.status(200).json({
        hospitalId,
        minStock: 10,
        maxStock: 100,
        criticalUnits: 5,
        expiryDays: 7
      });
    }

    const thresh = rows[0];
    return res.status(200).json({
      hospitalId: thresh.hospital_id,
      minStock: thresh.min_stock,
      maxStock: thresh.max_stock,
      criticalUnits: thresh.critical_units,
      expiryDays: thresh.expiry_days
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /admin/thresholds
 */
async function updateThresholds(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    const { minStock, maxStock, criticalUnits, expiryDays } = req.body;

    await pool.query(
      `INSERT INTO alert_thresholds (hospital_id, min_stock, max_stock, critical_units, expiry_days)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         min_stock = VALUES(min_stock),
         max_stock = VALUES(max_stock),
         critical_units = VALUES(critical_units),
         expiry_days = VALUES(expiry_days)`,
      [hospitalId, minStock, maxStock, criticalUnits, expiryDays]
    );

    // Check stock level
    const [stockRows] = await pool.query(
      'SELECT COALESCE(SUM(units - reserved_units), 0) AS total_stock FROM blood_batches WHERE hospital_id = ?',
      [hospitalId]
    );

    const totalStock = parseFloat(stockRows[0].total_stock);
    let alertTriggered = false;
    let notifiedCount = 0;

    if (totalStock < minStock) {
      alertTriggered = true;

      const [hospRows] = await pool.query('SELECT name, lat, lng, location FROM hospitals WHERE id = ?', [hospitalId]);
      if (hospRows.length > 0) {
        const hospital = hospRows[0];
        const pointStr = `POINT(${hospital.lng} ${hospital.lat})`;

        // Eligible donors within 10km (90-day cooldown)
        const [eligibleDonors] = await pool.query(
          `SELECT user_id, full_name 
           FROM donors
           WHERE available_for_donation = 1
             AND (last_donated_date IS NULL OR DATEDIFF(CURDATE(), last_donated_date) >= 90)
             AND ST_Distance_Sphere(ST_GeomFromText(?, 4326), location) <= 10000`,
          [pointStr]
        );

        for (const donor of eligibleDonors) {
          await pool.query(
            `INSERT INTO notifications (user_id, hospital_id, title, message, type, is_read)
             VALUES (?, ?, 'Urgent Blood Donation Request', ?, 'alert', 0)`,
            [
              donor.user_id,
              hospitalId,
              `Dear ${donor.full_name}, ${hospital.name} is running critically low on blood stock. Please consider visiting us to donate!`
            ]
          );
          notifiedCount++;
        }
      }
    }

    return res.status(200).json({
      message: 'Thresholds updated successfully',
      thresholds: {
        hospitalId,
        minStock,
        maxStock,
        criticalUnits,
        expiryDays
      },
      alertTriggered,
      notifiedCount
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /hospital/staff
 */
async function createStaff(req, res, next) {
  try {
    const adminHospitalId = req.user.hospital_id;
    if (!adminHospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    const { name, email, role, hospitalId: bodyHospitalId, hospital_id: bodyHospitalIdSnake } = req.body;
    const bodyHospId = bodyHospitalId !== undefined ? bodyHospitalId : bodyHospitalIdSnake;

    if (bodyHospId !== undefined && bodyHospId !== null && String(bodyHospId) !== String(adminHospitalId)) {
      throw new ApiError('Cannot create staff for another hospital', 400, 'BAD_REQUEST');
    }

    const finalEmail = email.toLowerCase().trim();

    // Check if email already registered
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [finalEmail]);
    if (existing.length > 0) {
      throw new ApiError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Generate random 8-char temp password
    const tempPassword = crypto.randomBytes(4).toString('hex');
    const passwordHash = await hashPassword(tempPassword);

    const [userResult] = await pool.query(
      'INSERT INTO users (email, password_hash, role, hospital_id, full_name, status, must_change_password) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [finalEmail, passwordHash, role, adminHospitalId, name, 'Active']
    );

    const newUserId = userResult.insertId;

    // Send temp password via notification service (database notifications)
    await pool.query(
      'INSERT INTO notifications (user_id, hospital_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
      [newUserId, adminHospitalId, 'Welcome to RaktSetu', `Your staff account has been created. Your temporary password is: ${tempPassword}`, 'welcome']
    );

    // Send temp password via email using Resend
    const emailSubject = 'Welcome to RaktSetu';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EDE7E1; border-radius: 12px;">
        <h2 style="color: #BE1F2E; border-bottom: 2px solid #BE1F2E; padding-bottom: 10px; font-family: Georgia, serif;">Welcome to RaktSetu</h2>
        <p>Dear ${name},</p>
        <p>Your hospital staff account has been successfully created by your administrator.</p>
        <div style="background-color: #FAF8F5; padding: 15px; border-radius: 8px; border: 1px solid #EDE7E1; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Account details:</strong></p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${finalEmail}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="font-size: 1.1em; color: #BE1F2E; font-weight: bold; background: #FFF; padding: 2px 6px; border: 1px solid #E0DAD4; border-radius: 4px;">${tempPassword}</code></p>
        </div>
        <p>Please note that you will be required to change this password upon your first login for security reasons.</p>
        <p style="margin-top: 30px; font-size: 0.9em; color: #777;">Sincerely,<br>RaktSetu Team</p>
      </div>
    `;

    try {
      await sendEmail({
        to: finalEmail,
        subject: emailSubject,
        html: emailHtml
      });
    } catch (emailErr) {
      console.error('Failed to send staff welcome email:', emailErr);
      throw emailErr;
    }

    if (process.env.NODE_ENV === 'production') {
      // In production, never expose the temp password in the response body;
      // it is delivered only via the in-app notification and email to the staff user.
      return res.status(201).json({
        success: true,
        message: "Staff account created. Credentials delivered via email and in-app notification."
      });
    }

    // In test/development, return tempPassword so integration tests and walkthroughs can verify it.
    return res.status(201).json({
      success: true,
      message: "Staff account created. Credentials delivered via email and in-app notification.",
      tempPassword,
      email: finalEmail,
      role
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /hospital/profile
 */
async function getHospitalProfile(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }
    const [rows] = await pool.query(
      `SELECT id, name, district_id, type, lat, lng, license_no, address, city, state, pincode, contact, verification_status 
       FROM hospitals WHERE id = ?`,
      [hospitalId]
    );
    if (rows.length === 0) {
      throw new ApiError('Hospital not found', 404, 'NOT_FOUND');
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /hospital/staff
 */
async function listStaff(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }

    const [rows] = await pool.query(
      `SELECT id, email, phone, role, status, full_name AS name, designation, last_login, created_at 
       FROM users 
       WHERE hospital_id = ? AND role = 'staff'`,
      [hospitalId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /hospital/donors/:id/contact
 */
const emailService = require('../services/emailService');
async function contactDonor(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    if (!hospitalId) {
      throw new ApiError('User is not associated with any hospital', 403, 'FORBIDDEN');
    }
    const { id } = req.params;
    const { message, subject } = req.body;

    if (!message) {
      throw new ApiError('Contact message is required', 400, 'MESSAGE_REQUIRED');
    }

    // Get donor info
    const [donorRows] = await pool.query(
      `SELECT d.user_id, d.full_name, u.email, u.phone 
       FROM donors d 
       LEFT JOIN users u ON d.user_id = u.id 
       WHERE d.id = ?`,
      [id]
    );

    if (donorRows.length === 0) {
      throw new ApiError('Donor not found', 404, 'NOT_FOUND');
    }

    const donor = donorRows[0];

    // Get hospital name
    const [hospRows] = await pool.query('SELECT name FROM hospitals WHERE id = ?', [hospitalId]);
    const hospitalName = hospRows.length > 0 ? hospRows[0].name : 'RaktSetu Hospital';

    // Insert database notification
    await pool.query(
      `INSERT INTO notifications (user_id, hospital_id, title, message, type) 
       VALUES (?, ?, ?, ?, ?)`,
      [donor.user_id, hospitalId, `Urgent Blood Need - ${hospitalName}`, message, 'emergency']
    );

    // Send email via Resend
    if (donor.email) {
      try {
        await emailService.sendEmail({
          to: donor.email,
          subject: subject || `Urgent Blood Donation Outreach - ${hospitalName}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EDE7E1; border-radius: 12px;">
              <h2 style="color: #BE1F2E; border-bottom: 2px solid #BE1F2E; padding-bottom: 10px; font-family: Georgia, serif;">Urgent Outreach</h2>
              <p>Dear ${donor.full_name},</p>
              <p>You have received an urgent message from <strong>${hospitalName}</strong> regarding critical blood donation needs:</p>
              <blockquote style="background-color: #FAF8F5; border-left: 4px solid #BE1F2E; padding: 15px; margin: 20px 0; font-style: italic;">
                "${message}"
              </blockquote>
              <p>If you are available to donate, please visit us or contact the hospital immediately.</p>
              <p>Thank you for saving lives.</p>
              <p style="font-size: 11px; color: #9A9A9A; border-top: 1px solid #EDE7E1; padding-top: 10px; margin-top: 30px;">
                This outreach was dispatched securely via RaktSetu.
              </p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Failed to send outreach email, fallback to in-app only:', emailErr);
      }
    }

    return res.status(200).json({ success: true, message: 'Donor successfully contacted.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getInventory,
  addInventory,
  updateInventory,
  deleteInventory,
  getExpiryAlerts,
  listSurgicalSchedules,
  createSurgicalSchedule,
  searchDonors,
  listEmergencies,
  updateEmergencyStatus,
  searchEmergencyBlood,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  listTransfers,
  createTransfer,
  updateTransferStatus,
  getForecastGateway,
  getWasteAnalyticsGateway,
  getThresholds,
  updateThresholds,
  createStaff,
  getHospitalProfile,
  listStaff,
  contactDonor
};

