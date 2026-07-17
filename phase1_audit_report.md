# Phase 1 Audit & Bug Fix Report: Local Verification Complete

This report details the outcomes of the local audit and bug fixes for **RaktSetu** in Phase 1. 

---

## 1. Environment Variable Inventory

Here is the exhaustive list of environment variables used by the respective services:

### 🅰️ Frontend (Vercel)
*   `VITE_API_URL` / `VITE_API_BASE_URL`: Base API URL for backend calls (e.g. `http://localhost:5000/api/v1` locally).
*   `VITE_FIREBASE_API_KEY`: Firebase web API Key (for SMS OTP support).
*   `VITE_FIREBASE_AUTH_DOMAIN`: Firebase Auth Domain.
*   `VITE_FIREBASE_PROJECT_ID`: Firebase Project ID.
*   `VITE_FIREBASE_STORAGE_BUCKET`: Firebase Storage Bucket.
*   `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase Messaging Sender ID.
*   `VITE_FIREBASE_APP_ID`: Firebase App ID.

### Node.js Backend (Render Web Service)
*   `PORT`: Backend listening port (default `5000`).
*   `NODE_ENV`: Deployment environment (`development` | `production` | `test`).
*   `DB_HOST`: Primary database hostname (Aiven host).
*   `DB_PORT`: Database port (e.g. `3306` or `24683`).
*   `DB_USER` / `DB_USERNAME`: Database user.
*   `DB_PASSWORD`: Database password.
*   `DB_NAME` / `DB_DATABASE`: Database name.
*   `DB_SSL`: Must be set to `true` on production for Aiven SSL requirements.
*   `DB_SSL_REJECT_UNAUTHORIZED`: Set to `false` to connect securely without supplying the root certificate authority file directly.
*   `DB_POOL_SIZE`: Write connection pool size (default `50`).
*   `DB_READ_HOST`: Read replica hostname (optional; falls back to `DB_HOST`).
*   `DB_READ_POOL_SIZE`: Read connection pool size (default `100`).
*   `REDIS_URL`: Redis server URL (e.g., `redis://localhost:6379/0`). Used for caching/Celery.
*   `JWT_SECRET`: Secret key for JWT access tokens.
*   `JWT_REFRESH_SECRET`: Secret key for JWT refresh tokens.
*   `JWT_OTP_SECRET`: Secret key for OTP tokens.
*   `JWT_ACCESS_EXPIRES_MINUTES`: Expiration for access tokens (default `60`).
*   `JWT_REFRESH_EXPIRES_DAYS`: Expiration for refresh tokens (default `7`).
*   `OTP_EXPIRES_MINUTES`: Expiration for OTPs (default `5`).
*   `CORS_ORIGIN`: Comma-separated list of allowed origins (e.g. `https://yourdomain.online,https://www.yourdomain.online`).
*   `AI_SERVICE_URL`: URL of the Python AI service (e.g. `http://localhost:5001`).
*   `INTERNAL_API_SECRET`: Shared inter-service authentication token (must match the Python service secret).
*   `EMAIL_API_KEY`: API token from Resend.
*   `EMAIL_FROM_ADDRESS`: Send-from email address (e.g. `[email protected]`).
*   `ALLOW_PRODUCTION_SEED`: Set to `true` to programmatically allow safe-seeding of database tables.

### 🐍 Python AI Service (Render Web Service)
*   `FLASK_ENV`: Flask deployment environment (e.g., `production`).
*   `FLASK_DEBUG`: Debug mode toggle (`0` | `1`).
*   `PORT` / `AI_PORT`: AI service listening port (default `5001`).
*   `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME`: MySQL connection credentials.
*   `DB_SSL`: Must be set to `true` on production for Aiven SSL requirements.
*   `DB_SSL_REJECT_UNAUTHORIZED`: Set to `false` to bypass custom certificate verification.
*   `INTERNAL_API_SECRET`: Shared inter-service authentication token (must match the Node service secret).
*   `REDIS_URL`: Redis URL used for Celery task broker and backend.

---

## 2. Database Schema, Connection Code, & Indexing Audit

### ⚡ Connection Pooling
*   The Node backend's pooling configuration in [db.js](file:///Users/chinu/Developer/Code/RaktSetu/backend/config/db.js) uses `waitForConnections: true`, `connectionLimit: 50` (write) / `100` (read), and `enableKeepAlive: true`. This prevents connection drops under load.

### 🩸 Profile Save Feature Bugs
*   **The Problem:** The "Profile Save" was failing in production because the `donors` table lacked `address` and `district` columns. The frontend attempted to update these fields on the `/donor/location` endpoint, causing MySQL to reject the query with a column-not-found error.
*   **The Fix:** 
    *   Created `004_add_donor_address_district.sql` migration to add both columns.
    *   Automated migration execution and database seeding on server startup inside [server.js](file:///Users/chinu/Developer/Code/RaktSetu/backend/server.js). The backend will now automatically apply missing columns and restore test users on launch (perfect for Render Free tier where SSH is not available).

### 🔍 Database Indexes
We verified that indexes are set up on all frequently queried lookup columns:
*   `idx_donors_blood_location` on `donors(blood_group, lat, lng, available_for_donation)`
*   `idx_emergency_blood_status` on `emergency_requests(blood_group, status, urgency_level)`
*   `idx_donations_donor_date` on `donations(donor_id, donation_date)`
*   `idx_users_token_version` on `users(id, token_version)`
*   `idx_users_role` on `users(role)`

---

## 3. Performance & Slow Loading Audits

### 💾 Backend Optimizations
*   **N+1 / Unbounded Selects:** 
    *   In [hospitalController.js](file:///Users/chinu/Developer/Code/RaktSetu/backend/controllers/hospitalController.js#L266-L288), the `getExpiryAlerts` endpoint was performing an unbounded query fetching *all* blood batches for a hospital and filtering them in Node memory.
    *   **The Fix:** Optimized the SQL query to filter active and soon-to-expire batches directly in MySQL:
        ```sql
        SELECT * FROM blood_batches 
        WHERE hospital_id = ? 
          AND expiry_date >= CURDATE()
          AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        ORDER BY expiry_date ASC
        ```

### 🖥️ Frontend Optimizations
*   **Bundle Size:** React routes are lazily loaded (`lazy()` + `Suspense`), separating the portal segments into lightweight, on-demand chunks.
*   **Images:** Unsplash image sizes are fully optimized using query parameters (`w=150&h=150`).

### 💤 Render Free Tier Cold Starts
*   **Outcome:** The "slow loading" on the initial page load in production is **confirmed to be a Render Free Tier limitation** (cold starts). Render spins down containers after 15 minutes of inactivity. When a new request hits the service, it takes 30-60+ seconds for the service to wake up.
*   **Mitigation:** The self-ping routine on the backend doesn't prevent this since Render sleeps containers based on external router traffic. We can configure a free external ping service (e.g. UptimeRobot) or upgrade the Web Service instance to bypass it.

---

## 4. Login Flow Audit

*   **Auth Flow Architecture:** We verified that JWTs are returned as JSON response bodies and stored in client `localStorage`. The frontend passes the token via the `Authorization: Bearer <token>` header. Since cookies are not used for authentication, cross-domain `sameSite` / `secure` cookie issues will not impact login.
*   **CORS Config:** Configured via `CORS_ORIGIN` in the environment variables, splitting multiple comma-separated domains and automatically expanding them to non-www and www variations.
*   **Bug Fixed in API Service:** 
    *   In [api.js](file:///Users/chinu/Developer/Code/RaktSetu/frontend/src/services/api.js#L60-L65), the automatic token refresh request was sending to an un-normalized URL path using the raw env variable. This could result in a 404 if the path lacked trailing slash or included double slashes. 
    *   **The Fix:** Changed the request to use the fully normalized `apiBaseUrl` variable.

---

## 5. Local Verification Test Results

We wrote and executed an integration test script that performs the full donor flow locally:
1.  **Request OTP** via email.
2.  **Retrieve OTP** directly from the local MySQL database.
3.  **Verify OTP** to retrieve the `verificationToken`.
4.  **Register Account** with password.
5.  **Log in** to acquire the JWT access token.
6.  **Create Profile** (saves successfully).
7.  **Save Location** (lat, lng, address, and district saved successfully).
8.  **Get Profile** (reloads data and confirms all fields persist).

### 🖥️ Shell Run Output:
```
🚀 Starting manual integration test with email: test_donor_1784293069536@example.com
1. Sending OTP request...
   Response: { message: 'OTP sent successfully', expires_in: 300 }
2. Retrieved OTP from database: 792539
3. Verifying OTP...
   OTP Verified! Token: eyJhbGciOiJIUzI1NiIsInR5c...
4. Registering donor...
   Registered successfully: { token: '...', user: { ... } }
5. Logging in...
   Logged in! Token acquired.
6. Creating donor profile...
   Profile created: { id: 2, donorCode: 'RS-2026-0002', ... }
7. Saving location...
   Location saved: { message: 'Location saved successfully', profile: { ... } }
8. Retrieving profile to verify persistence...
   Retrieved Profile: { ... }

🎉 SUCCESS! All end-to-end assertions passed with no errors.
```

All local tests, database updates, and node unit tests passed successfully.

---

### **Phase 1 is complete.** Please review the results and confirm when you are ready to proceed with Phase 2.
