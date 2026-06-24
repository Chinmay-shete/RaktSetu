const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

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

    let query = `SELECT id, full_name, blood_group, city, pincode, last_donated_date FROM donors WHERE 1=1`;
    const params = [];

    if (bloodGroup) {
      query += ` AND blood_group = ?`;
      params.push(bloodGroup);
    }

    if (location) {
      query += ` AND (city LIKE ? OR pincode = ?)`;
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

    const pointStr = `POINT(${longitude} ${latitude})`;

    // MySQL Spatial index query using ST_Distance_Sphere
    const [rows] = await pool.query(
      `SELECT h.id, h.name, h.address, h.city, h.pincode, h.contact, h.lat, h.lng,
              SUM(bb.units - bb.reserved_units) AS available_units,
              ST_Distance_Sphere(ST_GeomFromText(?, 4326), h.location) AS distance_m
       FROM hospitals h
       INNER JOIN blood_batches bb ON bb.hospital_id = h.id
       WHERE bb.blood_group = ?
         AND (bb.units - bb.reserved_units) > 0
         AND ST_Distance_Sphere(ST_GeomFromText(?, 4326), h.location) <= ?
       GROUP BY h.id
       ORDER BY distance_m ASC`,
      [pointStr, bloodGroup, pointStr, searchRadiusMeters]
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
  markAllNotificationsRead
};
