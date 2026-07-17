const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Helper to fetch a donor by their user_id.
 */
async function getDonorByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT d.*, u.email, u.phone 
     FROM donors d
     INNER JOIN users u ON u.id = d.user_id
     WHERE d.user_id = ?`,
    [userId]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Utility to serialize a donor profile object to camelCase.
 */
function serializeProfile(donor) {
  return {
    id: donor.id,
    donorCode: donor.donor_code,
    fullName: donor.full_name,
    age: donor.age,
    gender: donor.gender,
    city: donor.city,
    pincode: donor.pincode,
    bloodGroup: donor.blood_group,
    weight: donor.weight ? parseFloat(donor.weight) : null,
    chronicIllness: !!donor.chronic_illness,
    lastDonatedDate: donor.last_donated_date ? new Date(donor.last_donated_date).toISOString().split('T')[0] : null,
    lat: donor.lat ? parseFloat(donor.lat) : 0,
    lng: donor.lng ? parseFloat(donor.lng) : 0,
    email: donor.email,
    phone: donor.phone,
    availableForDonation: !!donor.available_for_donation,
    address: donor.address || null,
    district: donor.district || null,
    pastDonations: donor.past_donations || 0,
    createdAt: donor.created_at,
    updatedAt: donor.updated_at
  };
}

/**
 * GET /donor/profile
 */
async function getProfile(req, res, next) {
  try {
    const donor = await getDonorByUserId(req.user.id);
    if (!donor) {
      throw new ApiError('Donor profile not found. Complete profile setup first.', 404, 'PROFILE_NOT_FOUND');
    }
    return res.status(200).json(serializeProfile(donor));
  } catch (error) {
    next(error);
  }
}

/**
 * POST /donor/profile & POST /donor/profile-setup
 */
async function createProfile(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (req.user.role !== 'donor') {
      throw new ApiError('Only donors can create a donor profile', 403, 'FORBIDDEN');
    }

    const existingDonor = await getDonorByUserId(req.user.id);
    if (existingDonor) {
      throw new ApiError('Donor profile already exists', 409, 'PROFILE_EXISTS');
    }

    const { fullName, age, gender, bloodGroup, weight, chronicIllness, lastDonatedDate, pastDonations } = req.body;
    const finalLastDonated = lastDonatedDate && lastDonatedDate.trim() !== '' ? lastDonatedDate : null;

    // Insert donor profile with default coordinates (0, 0)
    const [result] = await connection.query(
      `INSERT INTO donors (
        user_id, full_name, age, gender, city, pincode, blood_group,
        weight, chronic_illness, last_donated_date, past_donations, lat, lng, location
      )
      VALUES (?, ?, ?, ?, 'Unknown', '000000', ?, ?, ?, ?, ?, 0.0, 0.0, ST_GeomFromText('POINT(0 0)', 4326))`,
      [
        req.user.id,
        fullName,
        age,
        gender,
        bloodGroup,
        weight,
        chronicIllness ? 1 : 0,
        finalLastDonated,
        parseInt(pastDonations || '0', 10)
      ]
    );

    const donorId = result.insertId;
    const year = new Date().getFullYear();
    const donorCode = `RS-${year}-${String(donorId).padStart(4, '0')}`;

    // Update with generated donor code
    await connection.query('UPDATE donors SET donor_code = ? WHERE id = ?', [donorCode, donorId]);

    await connection.commit();

    const [newDonorRows] = await pool.query(
      `SELECT d.*, u.email, u.phone 
       FROM donors d
       INNER JOIN users u ON u.id = d.user_id
       WHERE d.id = ?`,
      [donorId]
    );

    return res.status(201).json(serializeProfile(newDonorRows[0]));
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

/**
 * PUT /donor/profile
 */
async function updateProfile(req, res, next) {
  try {
    const donor = await getDonorByUserId(req.user.id);
    if (!donor) {
      throw new ApiError('Donor profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    const { fullName, age, gender, weight, chronicIllness, availableForDonation, lastDonatedDate, pastDonations } = req.body;
    
    const updates = [];
    const params = [];

    if (fullName !== undefined) {
      updates.push('full_name = ?');
      params.push(fullName);
    }
    if (age !== undefined) {
      updates.push('age = ?');
      params.push(age);
    }
    if (gender !== undefined) {
      updates.push('gender = ?');
      params.push(gender);
    }
    if (weight !== undefined) {
      updates.push('weight = ?');
      params.push(weight);
    }
    if (chronicIllness !== undefined) {
      updates.push('chronic_illness = ?');
      params.push(chronicIllness ? 1 : 0);
    }
    if (availableForDonation !== undefined) {
      updates.push('available_for_donation = ?');
      params.push(availableForDonation ? 1 : 0);
    }
    if (lastDonatedDate !== undefined) {
      updates.push('last_donated_date = ?');
      params.push(lastDonatedDate && lastDonatedDate.trim() !== '' ? lastDonatedDate : null);
    }
    if (pastDonations !== undefined) {
      updates.push('past_donations = ?');
      params.push(parseInt(pastDonations || '0', 10));
    }

    if (updates.length === 0) {
      throw new ApiError('No valid fields provided for update', 400, 'VALIDATION_ERROR');
    }

    params.push(donor.id);

    await pool.query(`UPDATE donors SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updatedRows] = await pool.query(
      `SELECT d.*, u.email, u.phone 
       FROM donors d
       INNER JOIN users u ON u.id = d.user_id
       WHERE d.id = ?`,
      [donor.id]
    );

    return res.status(200).json(serializeProfile(updatedRows[0]));
  } catch (error) {
    next(error);
  }
}

/**
 * POST /donor/location
 */
async function saveLocation(req, res, next) {
  try {
    const donor = await getDonorByUserId(req.user.id);
    if (!donor) {
      throw new ApiError('Donor profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    const { lat, lng, city, pincode, address, district } = req.body;
    const pointStr = `POINT(${lng} ${lat})`; // Longitude first

    await pool.query(
      `UPDATE donors
       SET lat = ?,
           lng = ?,
           location = ST_GeomFromText(?, 4326),
           city = COALESCE(?, city),
           pincode = COALESCE(?, pincode),
           address = ?,
           district = ?
       WHERE id = ?`,
      [lat, lng, pointStr, city, pincode, address || null, district || null, donor.id]
    );

    const [updatedRows] = await pool.query(
      `SELECT d.*, u.email, u.phone 
       FROM donors d
       INNER JOIN users u ON u.id = d.user_id
       WHERE d.id = ?`,
      [donor.id]
    );

    return res.status(200).json({
      message: 'Location saved successfully',
      profile: serializeProfile(updatedRows[0])
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /donor/donations
 */
async function listDonations(req, res, next) {
  try {
    const donor = await getDonorByUserId(req.user.id);
    if (!donor) {
      throw new ApiError('Donor profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    const [rows] = await pool.query(
      `SELECT id, donation_date, location_name, donation_type, units, status
       FROM donations
       WHERE donor_id = ?
       ORDER BY donation_date DESC, id DESC`,
      [donor.id]
    );

    const donations = rows.map(row => ({
      id: row.id,
      date: new Date(row.donation_date).toISOString().split('T')[0],
      location: row.location_name,
      type: row.donation_type === 'whole_blood' ? 'Whole Blood' : row.donation_type === 'platelets' ? 'Platelets' : 'Plasma',
      units: row.units,
      status: row.status.charAt(0).toUpperCase() + row.status.slice(1)
    }));

    return res.status(200).json({ donations });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /donor/stats
 */
async function getStats(req, res, next) {
  try {
    const donor = await getDonorByUserId(req.user.id);
    if (!donor) {
      throw new ApiError('Donor profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    const [rows] = await pool.query(
      `SELECT COALESCE(SUM(units), 0) AS total_units,
              COUNT(*) AS donation_count
       FROM donations
       WHERE donor_id = ? AND status = 'completed'`,
      [donor.id]
    );

    const totalDonations = parseInt(rows[0].donation_count, 10) + (donor.past_donations || 0);
    const totalUnits = parseInt(rows[0].total_units, 10) + (donor.past_donations || 0);
    const livesImpacted = totalUnits * 3;

    let lastDonatedDate = donor.last_donated_date;
    
    // Fallback to donations table if last_donated_date is not set on the profile
    if (!lastDonatedDate && totalDonations > 0) {
      const [lastRows] = await pool.query(
        `SELECT MAX(donation_date) AS last_date
         FROM donations
         WHERE donor_id = ? AND status = 'completed'`,
        [donor.id]
      );
      if (lastRows.length > 0 && lastRows[0].last_date) {
        lastDonatedDate = lastRows[0].last_date;
      }
    }

    let nextEligibleDate = null;
    let isEligibleNow = true;

    if (lastDonatedDate) {
      const lastDateObj = new Date(lastDonatedDate);
      const nextEligibleObj = new Date(lastDateObj.getTime() + (90 * 24 * 60 * 60 * 1000));
      nextEligibleDate = nextEligibleObj.toISOString().split('T')[0];
      isEligibleNow = new Date() >= nextEligibleObj;
    }

    return res.status(200).json({
      totalDonations,
      totalUnits,
      livesImpacted,
      nextEligibleDate,
      isEligibleNow,
      lastDonatedDate: lastDonatedDate ? new Date(lastDonatedDate).toISOString().split('T')[0] : null
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /donor/urgent-requests
 */
async function listUrgentRequests(req, res, next) {
  try {
    const donor = await getDonorByUserId(req.user.id);
    if (!donor) {
      throw new ApiError('Donor profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    // Check if coordinates are set (if lat/lng is 0, they haven't set their GPS location yet)
    if (parseFloat(donor.lat) === 0 && parseFloat(donor.lng) === 0) {
      throw new ApiError('Set your location before viewing urgent requests', 400, 'LOCATION_REQUIRED');
    }

    const radiusMeters = 10000; // 10km radius
    const radiusKm = radiusMeters / 1000;
    const latitude = parseFloat(donor.lat);
    const longitude = parseFloat(donor.lng);

    const deltaLat = radiusKm / 111.045;
    const deltaLng = radiusKm / (111.045 * Math.cos(latitude * Math.PI / 180));

    const minLat = latitude - deltaLat;
    const maxLat = latitude + deltaLat;
    const minLng = longitude - deltaLng;
    const maxLng = longitude + deltaLng;

    const envelopeStr = `POLYGON((${minLng} ${minLat}, ${maxLng} ${minLat}, ${maxLng} ${maxLat}, ${minLng} ${maxLat}, ${minLng} ${minLat}))`;
    const pointStr = `POINT(${longitude} ${latitude})`;

    const [rows] = await pool.query(
      `SELECT er.id, er.blood_group, er.units, er.status, er.message, er.target_timestamp, er.lat, er.lng,
              h.name AS hospital_name,
              ST_Distance_Sphere(ST_GeomFromText(?, 4326), er.location) AS distance_m
       FROM emergency_requests er
       INNER JOIN hospitals h ON h.id = er.hospital_id
       WHERE er.status IN ('pending', 'open', 'matched')
         AND ST_Within(er.location, ST_GeomFromText(?, 4326))
         AND ST_Distance_Sphere(ST_GeomFromText(?, 4326), er.location) <= ?
       ORDER BY distance_m ASC, er.target_timestamp ASC`,
      [pointStr, envelopeStr, pointStr, radiusMeters]
    );

    const requests = [];
    for (const row of rows) {
      const [pledgeRows] = await pool.query(
        `SELECT COUNT(*) AS pledge_count 
         FROM emergency_pledges 
         WHERE emergency_id = ? AND status IN ('pledged', 'completed')`,
        [row.id]
      );
      
      const pledgeCount = parseInt(pledgeRows[0].pledge_count, 10);
      const unitsNeeded = parseInt(row.units, 10);
      const progress = unitsNeeded > 0 ? Math.min(100, Math.round((pledgeCount / unitsNeeded) * 100)) : 0;
      
      const urgencyLabel = (progress < 50 || unitsNeeded >= 5) ? 'Critical Shortage' : 'Moderate Need';

      requests.push({
        id: row.id,
        hospitalName: row.hospital_name,
        bloodGroup: row.blood_group,
        unitsNeeded,
        status: row.status,
        message: row.message,
        targetTimestamp: row.target_timestamp,
        distanceKm: parseFloat((row.distance_m / 1000).toFixed(1)),
        fulfillmentProgress: progress,
        urgencyLabel,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng)
      });
    }

    return res.status(200).json({
      requests,
      radiusKm: radiusMeters / 1000
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /donor/pledge
 */
async function pledgeEmergency(req, res, next) {
  try {
    const donor = await getDonorByUserId(req.user.id);
    if (!donor) {
      throw new ApiError('Donor profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    const { emergencyId } = req.body;

    const [emergencyRows] = await pool.query(
      `SELECT id, status, blood_group, units 
       FROM emergency_requests 
       WHERE id = ?`,
      [emergencyId]
    );

    if (emergencyRows.length === 0) {
      throw new ApiError('Emergency request not found', 404, 'NOT_FOUND');
    }

    const emergency = emergencyRows[0];

    if (!['pending', 'open', 'matched'].includes(emergency.status)) {
      throw new ApiError('Emergency request is no longer active', 400, 'EMERGENCY_CLOSED');
    }

    if (emergency.blood_group !== donor.blood_group) {
      throw new ApiError('Your blood group does not match this emergency request', 400, 'BLOOD_GROUP_MISMATCH');
    }

    // Check if already pledged
    const [existingPledges] = await pool.query(
      `SELECT id FROM emergency_pledges 
       WHERE donor_id = ? AND emergency_id = ?`,
      [donor.id, emergencyId]
    );

    if (existingPledges.length > 0) {
      throw new ApiError('You have already pledged for this emergency', 409, 'ALREADY_PLEDGED');
    }

    await pool.query(
      `INSERT INTO emergency_pledges (donor_id, emergency_id, status) 
       VALUES (?, ?, 'pledged')`,
      [donor.id, emergencyId]
    );

    return res.status(200).json({
      message: 'Pledge recorded successfully',
      emergencyId,
      status: 'pledged'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /donor/camps
 */
async function listCamps(req, res, next) {
  try {
    const donor = await getDonorByUserId(req.user.id);
    const { city, state, lat, lng } = req.query;

    let camps = [];
    const now = new Date();

    // Perform geospatial search if coordinates are supplied or the donor has location set
    if ((lat && lng) || (donor && parseFloat(donor.lat) !== 0 && parseFloat(donor.lng) !== 0)) {
      const searchLat = lat ? parseFloat(lat) : parseFloat(donor.lat);
      const searchLng = lng ? parseFloat(lng) : parseFloat(donor.lng);
      const pointStr = `POINT(${searchLng} ${searchLat})`;
      const radiusMeters = 10000; // 10km

      const [rows] = await pool.query(
        `SELECT c.id, c.name, c.camp_date, c.address, c.organizer, c.capacity, c.expected_donors, c.status,
                d.name AS district_name, d.state,
                ST_Distance_Sphere(ST_GeomFromText(?, 4326), c.location) AS distance_m
         FROM donation_camps c
         INNER JOIN districts d ON d.id = c.district_id
         WHERE c.status = 'upcoming'
           AND c.camp_date >= CURDATE()
           AND ST_Distance_Sphere(ST_GeomFromText(?, 4326), c.location) <= ?
         ORDER BY distance_m ASC, c.camp_date ASC`,
        [pointStr, pointStr, radiusMeters]
      );
      camps = rows.map(row => ({
        id: row.id,
        name: row.name,
        campDate: new Date(row.camp_date).toISOString().split('T')[0],
        location: row.address,
        organizer: row.organizer,
        capacity: row.capacity,
        expectedDonors: row.expected_donors,
        status: row.status,
        district: row.district_name,
        state: row.state,
        distanceKm: parseFloat((row.distance_m / 1000).toFixed(1)),
        type: row.expected_donors >= row.capacity * 0.8 ? 'High Need' : 'Standard'
      }));
    } else {
      // Fallback search based on city/district
      let queryStr = `
        SELECT c.id, c.name, c.camp_date, c.address, c.organizer, c.capacity, c.expected_donors, c.status,
               d.name AS district_name, d.state
        FROM donation_camps c
        INNER JOIN districts d ON d.id = c.district_id
        WHERE c.status = 'upcoming'
          AND c.camp_date >= CURDATE()`;
      const params = [];

      if (city) {
        queryStr += ` AND d.name = ?`;
        params.push(city);
      } else if (donor && donor.city && donor.city !== 'Unknown') {
        queryStr += ` AND d.name = ?`;
        params.push(donor.city);
      }

      queryStr += ` ORDER BY c.camp_date ASC LIMIT 50`;

      const [rows] = await pool.query(queryStr, params);
      camps = rows.map(row => ({
        id: row.id,
        name: row.name,
        campDate: new Date(row.camp_date).toISOString().split('T')[0],
        location: row.address,
        organizer: row.organizer,
        capacity: row.capacity,
        expectedDonors: row.expected_donors,
        status: row.status,
        district: row.district_name,
        state: row.state,
        type: row.expected_donors >= row.capacity * 0.8 ? 'High Need' : 'Standard'
      }));
    }

    return res.status(200).json({
      camps,
      filters: { city: city || (donor ? donor.city : null), state: state || null, lat: lat || null, lng: lng || null }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /landing/demo-request
 */
async function saveDemoRequest(req, res, next) {
  try {
    const { email } = req.body;
    
    // Check if duplicate demo request
    const [existing] = await pool.query('SELECT id FROM demo_requests WHERE email = ?', [email]);
    if (existing.length > 0) {
      throw new ApiError('This email has already been registered for a demo', 409, 'EMAIL_EXISTS');
    }

    await pool.query('INSERT INTO demo_requests (email) VALUES (?)', [email]);

    return res.status(200).json({
      message: "Request received! We'll be in touch within 24 hours."
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /donor/appointments
 */
async function bookAppointment(req, res, next) {
  try {
    const donor = await getDonorByUserId(req.user.id);
    if (!donor) {
      throw new ApiError('Donor profile not found. Please complete profile setup first.', 404, 'PROFILE_NOT_FOUND');
    }

    const { itemId, date, timeSlot } = req.body;
    if (!itemId || !date) {
      throw new ApiError('Location ID and preferred date are required', 400, 'MISSING_FIELDS');
    }

    // Parse whether it's a camp or a hospital
    const isCamp = itemId.startsWith('camp-');
    const isHospital = itemId.startsWith('hosp-');
    const originalId = parseInt(itemId.replace(/^(camp-|hosp-)/, ''), 10);

    let hospitalId = null;
    let campId = null;
    let locationName = '';

    if (isCamp) {
      campId = originalId;
      const [campRows] = await pool.query('SELECT name, address FROM donation_camps WHERE id = ?', [campId]);
      if (campRows.length === 0) {
        throw new ApiError('Donation camp not found', 404, 'CAMP_NOT_FOUND');
      }
      locationName = campRows[0].name || campRows[0].address;
    } else if (isHospital) {
      hospitalId = originalId;
      const [hospRows] = await pool.query('SELECT name, address FROM hospitals WHERE id = ?', [hospitalId]);
      if (hospRows.length === 0) {
        throw new ApiError('Hospital not found', 404, 'HOSPITAL_NOT_FOUND');
      }
      locationName = hospRows[0].name;
    } else {
      throw new ApiError('Invalid location/item identifier', 400, 'INVALID_ITEM_ID');
    }

    // Insert pending donation (acting as appointment booking)
    const [result] = await pool.query(
      `INSERT INTO donations (donor_id, hospital_id, camp_id, donation_date, location_name, donation_type, units, status)
       VALUES (?, ?, ?, ?, ?, 'whole_blood', 1, 'pending')`,
      [donor.id, hospitalId, campId, date, locationName]
    );

    // Create system notification for hospital / camp if it's hospital-associated
    if (hospitalId) {
      try {
        await pool.query(
          `INSERT INTO notifications (hospital_id, title, message, type)
           VALUES (?, ?, ?, 'info')`,
          [
            hospitalId,
            'New Blood Donation Appointment',
            `Donor ${donor.full_name} (${donor.blood_group}) booked a slot for ${date} at ${timeSlot || '09:00 AM'}`
          ]
        );
      } catch (notifErr) {
        console.warn('Failed to dispatch notification:', notifErr.message);
      }
    }

    return res.status(201).json({
      message: 'Slot booked successfully',
      bookingId: result.insertId
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  createProfile,
  updateProfile,
  saveLocation,
  listDonations,
  getStats,
  listUrgentRequests,
  pledgeEmergency,
  listCamps,
  saveDemoRequest,
  bookAppointment
};

