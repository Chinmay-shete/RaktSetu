const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { createAccessToken } = require('../services/jwtService');

/**
 * Validates Truecaller accessToken and returns the user's phone profile.
 * We use the native fetch API to call Truecaller's profile endpoint.
 */
async function fetchTruecallerProfile(accessToken) {
  if (accessToken === 'mock_truecaller_access_token_for_dev') {
    return {
      phoneNumbers: ['+919322966139'],
      name: { first: 'Chinmay', last: 'Developer' }
    };
  }

  try {
    const response = await fetch('https://profile4.truecaller.com/v1/default', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Truecaller API Error:', response.status, errorText);
      throw new Error(`Truecaller API responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Truecaller profile verification failed:', error);
    throw new ApiError('Failed to verify Truecaller token.', 401, 'TRUECALLER_VERIFY_FAILED');
  }
}

/**
 * Handles the Truecaller Login request from the frontend.
 */
exports.truecallerLogin = async (req, res, next) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      throw new ApiError('Access token is required for Truecaller login', 400, 'MISSING_TOKEN');
    }

    // 1. Verify token with Truecaller and get the profile data
    const truecallerProfile = await fetchTruecallerProfile(accessToken);
    
    // The profile typically contains phoneNumbers array and other details
    const phoneObj = truecallerProfile.phoneNumbers?.[0] || truecallerProfile.phone;
    let phoneNumber;
    
    if (typeof phoneObj === 'string') {
      phoneNumber = phoneObj;
    } else if (phoneObj && phoneObj.phoneNumber) {
      phoneNumber = phoneObj.phoneNumber;
    }

    if (!phoneNumber) {
      throw new ApiError('Truecaller profile did not contain a valid phone number.', 400, 'MISSING_PHONE');
    }

    // Format phone number to E.164 if missing the + sign
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = `+${phoneNumber}`;
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 2. Check if this donor already exists in our database
      const [existingUsers] = await connection.query(
        'SELECT * FROM users WHERE phone = ?',
        [phoneNumber]
      );

      let user;

      if (existingUsers.length > 0) {
        user = existingUsers[0];
        // Update last login
        await connection.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
      } else {
        // 3. Register new donor using Truecaller profile info (name, etc.)
        const name = truecallerProfile.name 
          ? (truecallerProfile.name.first + ' ' + (truecallerProfile.name.last || '')).trim()
          : 'Truecaller User';
          
        const [insertResult] = await connection.query(
          'INSERT INTO users (phone, full_name, role, status, created_at, last_login) VALUES (?, ?, ?, ?, NOW(), NOW())',
          [phoneNumber, name, 'donor', 'Active']
        );

        const [newUser] = await connection.query('SELECT * FROM users WHERE id = ?', [insertResult.insertId]);
        user = newUser[0];
      }

      await connection.commit();

      // 4. Generate RaktSetu JWT for the session
      const token = createAccessToken(user.id, 'donor', null, null, user.token_version || 0);

      // Hide sensitive fields in the response
      const safeUser = { ...user };
      delete safeUser.password_hash;
      delete safeUser.verification_token;

      res.status(200).json({
        message: 'Truecaller login successful',
        token,
        user: safeUser,
        isNewUser: existingUsers.length === 0
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (err) {
    next(err);
  }
};
