const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Resolves the state name for a logged-in state or district admin.
 */
async function resolveStateName(userId, districtId) {
  if (districtId) {
    const [rows] = await pool.query(
      'SELECT state FROM districts WHERE id = ? LIMIT 1',
      [districtId]
    );
    if (rows.length > 0) {
      return rows[0].state;
    }
  }
  
  // Fallback to searching first available district linked to user
  const [userRows] = await pool.query(
    'SELECT d.state FROM users u INNER JOIN districts d ON d.id = u.district_id WHERE u.id = ? LIMIT 1',
    [userId]
  );
  if (userRows.length > 0) {
    return userRows[0].state;
  }
  
  return 'Maharashtra'; // System default fallback
}

/**
 * Helper to calculate alert status based on stock vs demand ratio.
 */
function calculateHeatmapStatus(stock, demand) {
  if (demand === 0) {
    return stock >= 10 ? 'green' : 'red';
  }
  const ratio = stock / demand;
  if (ratio < 0.5) return 'red';
  if (ratio < 0.9) return 'yellow';
  return 'green';
}

/**
 * Helper to format a date to YYYY-MM-DD in local time to avoid timezone shifting.
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

// =============================================================================
// DISTRICT CONTROLLER ENDPOINTS
// =============================================================================

/**
 * GET /district/dashboard
 */
async function getDistrictDashboard(req, res, next) {
  try {
    const districtId = req.user.district_id;
    if (!districtId) {
      throw new ApiError('User is not associated with any district', 403, 'FORBIDDEN');
    }

    // 1. Get total hospitals count
    const [hospRows] = await pool.query(
      'SELECT COUNT(*) AS count FROM hospitals WHERE district_id = ?',
      [districtId]
    );
    const totalHospitals = hospRows[0].count;

    // 2. Get total stock available
    const [stockRows] = await pool.query(
      `SELECT COALESCE(SUM(bb.units - bb.reserved_units), 0) AS count 
       FROM blood_batches bb 
       INNER JOIN hospitals h ON h.id = bb.hospital_id 
       WHERE h.district_id = ?`,
      [districtId]
    );
    const totalStock = parseInt(stockRows[0].count, 10);

    // 3. Get active emergency requests count
    const [emergRows] = await pool.query(
      `SELECT COUNT(*) AS count 
       FROM emergency_requests er 
       INNER JOIN hospitals h ON h.id = er.hospital_id 
       WHERE h.district_id = ? AND er.status = 'pending'`,
      [districtId]
    );
    const totalActiveRequests = emergRows[0].count;

    // 4. Get upcoming camps count
    const [campRows] = await pool.query(
      "SELECT COUNT(*) AS count FROM donation_camps WHERE district_id = ? AND camp_date >= CURDATE() AND status = 'upcoming'",
      [districtId]
    );
    const totalCamps = campRows[0].count;

    // 5. Shortage heatmap statuses
    const [heatmapRows] = await pool.query(
      `SELECT h.id, h.name, h.lat, h.lng,
              COALESCE(SUM(bb.units - bb.reserved_units), 0) AS total_stock,
              (SELECT COALESCE(SUM(units), 0) FROM surgical_schedules WHERE hospital_id = h.id AND surgery_date >= CURDATE()) AS schedule_demand,
              (SELECT COALESCE(SUM(predicted_units), 0) FROM forecasts WHERE hospital_id = h.id AND forecast_date >= CURDATE()) AS forecast_demand
       FROM hospitals h
       LEFT JOIN blood_batches bb ON bb.hospital_id = h.id
       WHERE h.district_id = ?
       GROUP BY h.id`,
      [districtId]
    );

    const heatmap = heatmapRows.map(row => {
      const stock = parseInt(row.total_stock, 10);
      const demand = parseInt(row.schedule_demand, 10) + parseInt(row.forecast_demand, 10);
      const status = calculateHeatmapStatus(stock, demand);

      return {
        id: row.id,
        name: row.name,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        stock,
        demand,
        status
      };
    });

    return res.status(200).json({
      kpis: {
        totalHospitals,
        totalStock,
        totalActiveRequests,
        totalCamps
      },
      heatmap
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /district/hospitals
 */
async function getDistrictHospitals(req, res, next) {
  try {
    const districtId = req.user.district_id;
    if (!districtId) {
      throw new ApiError('User is not associated with any district', 403, 'FORBIDDEN');
    }

    const [rows] = await pool.query(
      `SELECT h.id, h.name, h.type, h.address, h.city, h.pincode, h.contact, h.license_no,
              COALESCE(SUM(bb.units - bb.reserved_units), 0) AS aggregate_stock
       FROM hospitals h
       LEFT JOIN blood_batches bb ON bb.hospital_id = h.id
       WHERE h.district_id = ?
       GROUP BY h.id
       ORDER BY h.name ASC`,
      [districtId]
    );

    // Fetch detailed blood group stock counts
    const [stockDetails] = await pool.query(
      `SELECT bb.hospital_id, bb.blood_group, SUM(bb.units - bb.reserved_units) AS units
       FROM blood_batches bb
       INNER JOIN hospitals h ON h.id = bb.hospital_id
       WHERE h.district_id = ? AND bb.expiry_date >= CURDATE()
       GROUP BY bb.hospital_id, bb.blood_group`,
      [districtId]
    );

    // Map detailed stock to a lookup dictionary
    const stockMap = {};
    stockDetails.forEach(s => {
      if (!stockMap[s.hospital_id]) {
        stockMap[s.hospital_id] = {};
      }
      stockMap[s.hospital_id][s.blood_group] = parseInt(s.units, 10);
    });

    const serialized = rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      address: row.address,
      city: row.city,
      pincode: row.pincode,
      contact: row.contact,
      licenseNo: row.license_no,
      lastUpdated: 'Just now',
      aggregateStock: parseInt(row.aggregate_stock, 10),
      stock: {
        'O+': 0, 'O-': 0, 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0,
        ...(stockMap[row.id] || {})
      }
    }));

    return res.status(200).json(serialized);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /district/alerts
 */
async function getDistrictAlerts(req, res, next) {
  try {
    const districtId = req.user.district_id;
    if (!districtId) {
      throw new ApiError('User is not associated with any district', 403, 'FORBIDDEN');
    }

    // Retrieve unread shortage alert notifications for hospitals in this district
    const [rows] = await pool.query(
      `SELECT n.id, n.title, n.message, n.type, n.timestamp, h.name AS hospital_name
       FROM notifications n
       INNER JOIN hospitals h ON h.id = n.hospital_id
       WHERE h.district_id = ? AND n.type = 'alert' AND n.is_read = 0
       ORDER BY n.timestamp DESC`,
      [districtId]
    );

    const serialized = rows.map(row => ({
      id: row.id,
      title: row.title,
      message: row.message,
      type: row.type,
      timestamp: row.timestamp,
      hospitalName: row.hospital_name
    }));

    return res.status(200).json(serialized);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /district/alerts/:id/resolve
 */
async function resolveDistrictAlert(req, res, next) {
  try {
    const districtId = req.user.district_id;
    if (!districtId) {
      throw new ApiError('User is not associated with any district', 403, 'FORBIDDEN');
    }

    const alertId = req.params.id;

    // Verify notification belongs to a hospital in this district
    const [checkRows] = await pool.query(
      `SELECT n.id FROM notifications n
       INNER JOIN hospitals h ON h.id = n.hospital_id
       WHERE n.id = ? AND h.district_id = ?`,
      [alertId, districtId]
    );

    if (checkRows.length === 0) {
      throw new ApiError('Alert not found or access denied', 404, 'ALERT_NOT_FOUND');
    }

    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ?',
      [alertId]
    );

    return res.status(200).json({
      message: 'Alert resolved successfully',
      id: parseInt(alertId, 10),
      resolved: true
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /district/camps
 */
async function listDistrictCamps(req, res, next) {
  try {
    const districtId = req.user.district_id;
    if (!districtId) {
      throw new ApiError('User is not associated with any district', 403, 'FORBIDDEN');
    }

    const [rows] = await pool.query(
      `SELECT id, name, camp_date, address, organizer, capacity, expected_donors, status 
       FROM donation_camps 
       WHERE district_id = ? 
       ORDER BY camp_date DESC`,
      [districtId]
    );

    const serialized = rows.map(row => ({
      id: row.id,
      name: row.name,
      date: formatDate(row.camp_date),
      address: row.address,
      organizer: row.organizer,
      capacity: row.capacity,
      expectedDonors: row.expected_donors,
      status: row.status
    }));

    return res.status(200).json(serialized);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /district/camps
 */
async function createDistrictCamp(req, res, next) {
  try {
    const districtId = req.user.district_id;
    if (!districtId) {
      throw new ApiError('User is not associated with any district', 403, 'FORBIDDEN');
    }

    const { name, campDate, address, lat, lng, organizer, capacity, expectedDonors } = req.body;
    const pointStr = `POINT(${lng} ${lat})`;

    const [result] = await pool.query(
      `INSERT INTO donation_camps (
        name, camp_date, address, location, district_id, organizer, capacity, expected_donors, status
      ) VALUES (?, ?, ?, ST_GeomFromText(?, 4326), ?, ?, ?, ?, 'upcoming')`,
      [
        name,
        campDate,
        address,
        pointStr,
        districtId,
        organizer,
        capacity || null,
        expectedDonors || null
      ]
    );

    const [rows] = await pool.query(
      'SELECT id, name, camp_date, address, organizer, capacity, expected_donors, status FROM donation_camps WHERE id = ?',
      [result.insertId]
    );

    const created = rows[0];

    return res.status(201).json({
      id: created.id,
      name: created.name,
      date: formatDate(created.camp_date),
      address: created.address,
      organizer: created.organizer,
      capacity: created.capacity,
      expectedDonors: created.expected_donors,
      status: created.status
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /district/camps/:id/status
 */
async function updateCampStatus(req, res, next) {
  try {
    const districtId = req.user.district_id;
    if (!districtId) {
      throw new ApiError('User is not associated with any district', 403, 'FORBIDDEN');
    }

    const campId = req.params.id;
    const { status } = req.body;

    const [checkRows] = await pool.query(
      'SELECT id FROM donation_camps WHERE id = ? AND district_id = ?',
      [campId, districtId]
    );

    if (checkRows.length === 0) {
      throw new ApiError('Donation camp not found or access denied', 404, 'CAMP_NOT_FOUND');
    }

    await pool.query(
      'UPDATE donation_camps SET status = ? WHERE id = ?',
      [status, campId]
    );

    return res.status(200).json({
      message: 'Donation camp status updated successfully',
      id: parseInt(campId, 10),
      status
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /district/map
 */
async function getDistrictMap(req, res, next) {
  try {
    const districtId = req.user.district_id;
    if (!districtId) {
      throw new ApiError('User is not associated with any district', 403, 'FORBIDDEN');
    }

    const [rows] = await pool.query(
      `SELECT h.id, h.name, h.lat, h.lng,
              COALESCE(SUM(bb.units - bb.reserved_units), 0) AS total_stock,
              (SELECT COALESCE(SUM(units), 0) FROM surgical_schedules WHERE hospital_id = h.id AND surgery_date >= CURDATE()) AS schedule_demand,
              (SELECT COALESCE(SUM(predicted_units), 0) FROM forecasts WHERE hospital_id = h.id AND forecast_date >= CURDATE()) AS forecast_demand
       FROM hospitals h
       LEFT JOIN blood_batches bb ON bb.hospital_id = h.id
       WHERE h.district_id = ?
       GROUP BY h.id`,
      [districtId]
    );

    const mapPins = rows.map(row => {
      const stock = parseInt(row.total_stock, 10);
      const demand = parseInt(row.schedule_demand, 10) + parseInt(row.forecast_demand, 10);
      const status = calculateHeatmapStatus(stock, demand);

      return {
        id: row.id,
        name: row.name,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        aggregateStock: stock,
        status
      };
    });

    return res.status(200).json(mapPins);
  } catch (error) {
    next(error);
  }
}

// =============================================================================
// STATE CONTROLLER ENDPOINTS
// =============================================================================

/**
 * GET /state/dashboard
 */
async function getStateDashboard(req, res, next) {
  try {
    const stateName = await resolveStateName(req.user.id, req.user.district_id);

    // 1. Total districts count
    const [distRows] = await pool.query(
      'SELECT COUNT(*) AS count FROM districts WHERE state = ?',
      [stateName]
    );
    const totalDistricts = distRows[0].count;

    // 2. Total hospitals count
    const [hospRows] = await pool.query(
      `SELECT COUNT(*) AS count 
       FROM hospitals h 
       INNER JOIN districts d ON d.id = h.district_id 
       WHERE d.state = ?`,
      [stateName]
    );
    const totalHospitals = hospRows[0].count;

    // 3. Total stock available
    const [stockRows] = await pool.query(
      `SELECT COALESCE(SUM(bb.units - bb.reserved_units), 0) AS count 
       FROM blood_batches bb 
       INNER JOIN hospitals h ON h.id = bb.hospital_id 
       INNER JOIN districts d ON d.id = h.district_id 
       WHERE d.state = ?`,
      [stateName]
    );
    const totalStock = parseInt(stockRows[0].count, 10);

    // 4. Cross-district active transfers
    const [transRows] = await pool.query(
      `SELECT COUNT(*) AS count 
       FROM transfer_requests tr 
       INNER JOIN hospitals h_from ON h_from.id = tr.from_hospital 
       INNER JOIN districts d ON d.id = h_from.district_id 
       INNER JOIN hospitals h_to ON h_to.id = tr.to_hospital
       WHERE d.state = ? AND h_from.district_id <> h_to.district_id AND tr.status = 'pending'`,
      [stateName]
    );
    const activeTransfersCount = transRows[0].count;

    // 5. Critical hospitals count (Red status overall)
    const [hospitalDemandRows] = await pool.query(
      `SELECT h.id,
              COALESCE(SUM(bb.units - bb.reserved_units), 0) AS total_stock,
              (SELECT COALESCE(SUM(units), 0) FROM surgical_schedules WHERE hospital_id = h.id AND surgery_date >= CURDATE()) AS schedule_demand,
              (SELECT COALESCE(SUM(predicted_units), 0) FROM forecasts WHERE hospital_id = h.id AND forecast_date >= CURDATE()) AS forecast_demand
       FROM hospitals h
       INNER JOIN districts d ON d.id = h.district_id
       LEFT JOIN blood_batches bb ON bb.hospital_id = h.id
       WHERE d.state = ?
       GROUP BY h.id`,
      [stateName]
    );

    let criticalHospitalsCount = 0;
    for (const row of hospitalDemandRows) {
      const stock = parseInt(row.total_stock, 10);
      const demand = parseInt(row.schedule_demand, 10) + parseInt(row.forecast_demand, 10);
      if (calculateHeatmapStatus(stock, demand) === 'red') {
        criticalHospitalsCount++;
      }
    }

    // 6. District breakdown list
    const [breakdownRows] = await pool.query(
      `SELECT d.id, d.name, d.zone,
              (SELECT COUNT(*) FROM hospitals WHERE district_id = d.id) AS hospital_count,
              (SELECT COALESCE(SUM(bb.units - bb.reserved_units), 0) FROM blood_batches bb INNER JOIN hospitals h ON h.id = bb.hospital_id WHERE h.district_id = d.id) AS total_stock,
              (SELECT COUNT(*) FROM emergency_requests er INNER JOIN hospitals h ON h.id = er.hospital_id WHERE h.district_id = d.id AND er.status = 'pending') AS active_emergencies
       FROM districts d
       WHERE d.state = ?
       ORDER BY d.name ASC`,
      [stateName]
    );

    // Fetch detailed blood group stock counts per district
    const [districtStockDetails] = await pool.query(
      `SELECT d.id AS district_id, bb.blood_group, SUM(bb.units - bb.reserved_units) AS units
       FROM blood_batches bb
       INNER JOIN hospitals h ON h.id = bb.hospital_id
       INNER JOIN districts d ON d.id = h.district_id
       WHERE d.state = ? AND bb.expiry_date >= CURDATE()
       GROUP BY d.id, bb.blood_group`,
      [stateName]
    );

    // Map detailed stock to a lookup dictionary: districtStockMap[district_id][blood_group] = units
    const districtStockMap = {};
    districtStockDetails.forEach(s => {
      if (!districtStockMap[s.district_id]) {
        districtStockMap[s.district_id] = {};
      }
      districtStockMap[s.district_id][s.blood_group] = parseInt(s.units, 10);
    });

    const districtBreakdown = breakdownRows.map(row => ({
      id: row.id,
      name: row.name,
      zone: row.zone || 'Western',
      hospitalsCount: row.hospital_count,
      totalStock: parseInt(row.total_stock, 10),
      activeEmergenciesCount: row.active_emergencies,
      stock: {
        'O+': 0, 'O-': 0, 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0,
        ...(districtStockMap[row.id] || {})
      }
    }));

    return res.status(200).json({
      totalDistricts,
      totalHospitals,
      totalStock,
      criticalHospitalsCount,
      activeTransfersCount,
      districtBreakdown
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /state/transfers
 */
async function getStateTransfers(req, res, next) {
  try {
    const stateName = await resolveStateName(req.user.id, req.user.district_id);

    const [rows] = await pool.query(
      `SELECT tr.id, tr.from_hospital, tr.to_hospital, tr.blood_group, tr.units, tr.priority, tr.status, tr.created_at,
              h_from.name AS from_hospital_name, d_from.name AS from_district_name,
              h_to.name AS to_hospital_name, d_to.name AS to_district_name
       FROM transfer_requests tr
       INNER JOIN hospitals h_from ON h_from.id = tr.from_hospital
       INNER JOIN districts d_from ON d_from.id = h_from.district_id
       INNER JOIN hospitals h_to ON h_to.id = tr.to_hospital
       INNER JOIN districts d_to ON d_to.id = h_to.district_id
       WHERE d_from.state = ? AND d_from.id <> d_to.id
       ORDER BY tr.created_at DESC`,
      [stateName]
    );

    const serialized = rows.map(row => ({
      id: row.id,
      fromHospitalName: row.from_hospital_name,
      toHospitalName: row.to_hospital_name,
      fromDistrictName: row.from_district_name,
      toDistrictName: row.to_district_name,
      bloodGroup: row.blood_group,
      units: row.units,
      priority: row.priority,
      status: row.status,
      date: formatDate(row.created_at)
    }));

    return res.status(200).json(serialized);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /state/transfers/:id/approve
 */
async function approveStateTransfer(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const stateName = await resolveStateName(req.user.id, req.user.district_id);
    const transferId = req.params.id;

    // Fetch transfer detail
    const [transferRows] = await connection.query(
      `SELECT tr.*, d_from.state AS from_state,
              h_from.name AS from_hospital_name, d_from.name AS from_district_name,
              h_to.name AS to_hospital_name, d_to.name AS to_district_name
       FROM transfer_requests tr
       INNER JOIN hospitals h_from ON h_from.id = tr.from_hospital
       INNER JOIN districts d_from ON d_from.id = h_from.district_id
       INNER JOIN hospitals h_to ON h_to.id = tr.to_hospital
       INNER JOIN districts d_to ON d_to.id = h_to.district_id
       WHERE tr.id = ? FOR UPDATE`,
      [transferId]
    );

    if (transferRows.length === 0) {
      throw new ApiError('Transfer request not found', 404, 'TRANSFER_NOT_FOUND');
    }

    const transfer = transferRows[0];

    // State boundary check
    if (transfer.from_state !== stateName) {
      throw new ApiError('Access denied: transfer request falls outside admin state boundaries', 403, 'FORBIDDEN');
    }

    if (transfer.status !== 'pending') {
      throw new ApiError(`Transfer request is already ${transfer.status}`, 400, 'INVALID_STATUS_TRANSITION');
    }

    // FEFO atomic reservation in the supplying hospital's batches
    const [batches] = await connection.query(
      `SELECT * FROM blood_batches 
       WHERE hospital_id = ? AND blood_group = ? AND (units - reserved_units) >= ? AND expiry_date >= CURDATE()
       ORDER BY expiry_date ASC LIMIT 1
       FOR UPDATE`,
      [transfer.from_hospital, transfer.blood_group, transfer.units]
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

    // Update status to accepted
    await connection.query(
      "UPDATE transfer_requests SET status = 'accepted' WHERE id = ?",
      [transferId]
    );

    // Write audit log entry (B4)
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const actionDesc = `Action: cross_district_transfer_approved | ID: ${transferId} | Status: pending->accepted | From: Hosp ${transfer.from_hospital} (${transfer.from_hospital_name}, Dist: ${transfer.from_district_name}) -> To: Hosp ${transfer.to_hospital} (${transfer.to_hospital_name}, Dist: ${transfer.to_district_name})`.slice(0, 255);
    await connection.query(
      "INSERT INTO audit_logs (actor_id, action, severity, ip_address) VALUES (?, ?, 'warning', ?)",
      [req.user.id, actionDesc, ipAddress]
    );

    await connection.commit();

    return res.status(200).json({
      message: 'Cross-district transfer approved successfully by State Admin',
      id: parseInt(transferId, 10),
      status: 'accepted'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

/**
 * GET /state/policy-alerts
 */
async function getStatePolicyAlerts(req, res, next) {
  try {
    const stateName = await resolveStateName(req.user.id, req.user.district_id);
    const policyAlerts = [];

    // 1. Scan for High Wastage Rate (hospitals in this state with > 15% wastage rate)
    const [wastageRows] = await pool.query(
      `SELECT h.id, h.name AS hospital_name, d.name AS district_name,
              COALESCE(SUM(bb.units), 0) AS total_units,
              COALESCE(SUM(CASE WHEN bb.expiry_date < CURDATE() THEN bb.units ELSE 0 END), 0) AS expired_units
       FROM hospitals h
       INNER JOIN districts d ON d.id = h.district_id
       INNER JOIN blood_batches bb ON bb.hospital_id = h.id
       WHERE d.state = ?
       GROUP BY h.id`,
      [stateName]
    );

    for (const row of wastageRows) {
      const total = parseInt(row.total_units, 10);
      const expired = parseInt(row.expired_units, 10);
      if (total > 0) {
        const rate = (expired / total) * 100;
        if (rate > 15.0) {
          policyAlerts.push({
            type: 'High Wastage',
            message: `Hospital ${row.hospital_name} has a critical blood wastage rate of ${rate.toFixed(1)}% (${expired} of ${total} units expired).`,
            severity: 'high',
            hospitalName: row.hospital_name,
            districtName: row.district_name
          });
        }
      }
    }

    // 2. Scan for Near Expiry stock (unreserved blood batches expiring in <= 5 days)
    const [expiryRows] = await pool.query(
      `SELECT h.name AS hospital_name, d.name AS district_name,
              bb.blood_group, (bb.units - bb.reserved_units) AS available_units, bb.expiry_date
       FROM blood_batches bb
       INNER JOIN hospitals h ON h.id = bb.hospital_id
       INNER JOIN districts d ON d.id = h.district_id
       WHERE d.state = ? AND bb.expiry_date >= CURDATE() AND bb.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 5 DAY)
         AND (bb.units - bb.reserved_units) > 0`,
      [stateName]
    );

    for (const row of expiryRows) {
      const units = parseInt(row.available_units, 10);
      const days = Math.max(0, Math.round((new Date(row.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)));
      policyAlerts.push({
        type: 'Near Expiry',
        message: `Hospital ${row.hospital_name} holds ${units} units of ${row.blood_group} blood expiring in ${days} days.`,
        severity: 'critical',
        hospitalName: row.hospital_name,
        districtName: row.district_name
      });
    }

    return res.status(200).json(policyAlerts);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDistrictDashboard,
  getDistrictHospitals,
  getDistrictAlerts,
  resolveDistrictAlert,
  listDistrictCamps,
  createDistrictCamp,
  updateCampStatus,
  getDistrictMap,
  getStateDashboard,
  getStateTransfers,
  approveStateTransfer,
  getStatePolicyAlerts
};
