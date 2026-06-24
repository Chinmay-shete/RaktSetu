# 🩸 RaktSetu — Unified Backend Agent Prompts & Context

This is the single source of truth for building the RaktSetu hybrid backend. It contains the **overall project context** followed by **7 step-by-step prompts** that you can copy and paste to your coding agent one by one.

---

## 📖 PART 1: Overall Project Context & Scope
*Provide this context to your agent before starting, or use it as a reference.*

### Project Overview
RaktSetu is an AI-powered coordination layer on top of India's eRaktKosh blood bank system. It reduces the 8-10% annual blood wastage in India via AI demand forecasting, cross-hospital expiry transfer automation, and real-time emergency blood search. The project is completely Web-Only (React web interface for all roles). No mobile apps or Flutter.

### Tech Stack (Hybrid Architecture)
* **Backend Core API:** Node.js + Express, REST architecture (Port 5000)
* **AI Microservice:** Python + Flask (Port 5001), Facebook Prophet for forecasting, called internally by Node.js (not exposed to frontend)
* **Database:** MySQL 8.0+ (with spatial support)
* **Auth:** JWT (email/password), role-based access control (no Google OAuth)
* **Notifications:** Firebase Cloud Messaging (web push) + Twilio (SMS) / WhatsApp Business API mockup

---

## 🔑 Role-by-Role Authentication & Onboarding Specifications
The backend APIs must align with the exact flows implemented in the React frontend:

### 1. Blood Donor Onboarding Flow (Web-Only)
* **Step 1: Registration (`/register-donor`)**:
  * Donor enters either **Email** or **Mobile Number** and requests verification.
  * System sends a 6-digit OTP code.
  * System verifies OTP. 
  * **Onboarding Branching**:
    * If registering with a **Mobile Number**, the password setup step is bypassed completely. The user is logged in as verified and redirected directly to `/profile-setup`.
    * If registering with an **Email**, the user is sent to Step 3 (`/register-donor` Step 3) to create and confirm a password, then redirected to `/profile-setup`.
* **Step 2: Physiology & Health Screening (`/profile-setup`)**:
  * Donor enters basic details: `fullName` (first and last name), `age` (18–65), biological `gender` (Male/Female/Other), and selects `bloodGroup` (A+, A-, B+, B-, O+, O-, AB+, AB-).
  * Donor completes a 9-question NBTC (National Blood Transfusion Council) health screening checklist (Yes/No answers).
* **Step 3: Geolocation & Cooldown (`/location`)**:
  * Donor enters `city` (supported suggestions: Mumbai, Pune, Nagpur, Satara, Kolhapur) and `pincode` (exactly 6 digits).
  * Donor declares previous donations (`donatedBefore` toggle). If true, records approx `donationTimes` count, `lastDonation` date, and `donationType` (Whole Blood / Platelets / Plasma).
  * Donor toggles GPS location, which reverse-geocodes coordinates using Nominatim OpenStreetMap and stores `{ latitude, longitude }` in local storage, updating the MySQL spatial POINT column.
* **Authentication Methods**: Mobile-registered donors log in via Mobile + 6-digit OTP. Email-registered donors log in via Email + Password.

### 2. Hospital Admin Onboarding Flow
* **Registration (`/admin/register`)**:
  * Hospital Admin registers the institution by submitting `hospitalName`, `hospitalType` (Government, Private, Trust, Semi-Govt), registration number, license number, blood bank license, address, city, state, pincode, authorized email, phone number, and uploads a license document file (PDF/JPG/PNG up to 5MB).
  * Upon submission, the account is set to a **Pending Review** status, redirecting the user to `/admin/pending` to await verification by the System Admin.
* **Login (`/admin/login`)**:
  * Once approved by the System Admin, the Hospital Admin logs in using Email + Password.

### 3. Hospital Staff Onboarding Flow
* **Invitation**:
  * There is no public registration page for Hospital Staff.
  * A Hospital Admin creates a staff invitation from inside the admin dashboard. This generates a secure token-based URL (`/staff/token/:token`).
* **Token Verification (`/staff/token/:token`)**:
  * Invited staff clicks the link, which verifies the cryptographic token session and displays their hospital details.
* **Activation (`/staff/set-password/:token`)**:
  * Staff continues to the password setup page to create and confirm a secure password (minimum 8 characters, enforcing strength validation).
* **Login (`/staff/login`)**:
  * Staff logs in using Email + Password.

### 4. District Officer Flow
* **Provisioning**: Created manually and authorized by the System Admin (no public registration page).
* **Login (`/district/login`)**: Logs in using government email (e.g. `officer@pune.gov.in`) and password.

### 5. State Admin Flow
* **Provisioning**: Created manually by the System Admin.
* **Login (`/state/login`)**: Logs in using email + password.

### 6. System Admin Flow
* **Provisioning**: Seeded directly in the database.
* **Login (`/systemadmin/login`)**: Logs in using system admin credentials.

---

## 🛠️ PART 3: Step-by-Step Coding Prompts
*Copy and paste these prompts to your agent one by one. Wait for the agent to complete each phase and confirm before pasting the next prompt.*

### 📋 STEP 1: Project Setup, Hybrid Architecture & Database Schema
**Copy and paste the prompt below:**
```text
We are building the backend for RaktSetu — an AI layer on top of India's eRaktKosh system to reduce blood wastage. The project is entirely Web-only (React frontend, no mobile/Flutter apps). The backend follows a Hybrid architecture:
1. Main API Server: Node.js + Express, REST architecture, handling I/O operations, user authentication, inventory CRUD, transfer logs, and notifications. (Port 5000)
2. AI Microservice: Python + Flask, handling time-series forecasting (Facebook Prophet) and complex waste analytics. (Port 5001)
3. Database: MySQL (version 8.0+ with spatial support).

CRITICAL REQUIREMENT:
All backend initialization, directories, and code files MUST be created inside the `backend/` folder at the root of the workspace.
- The Node.js application will live directly inside `backend/` (routes/, controllers/, middleware/, models/, services/, config/).
- The Python AI microservice will live inside `backend/ai/` (routes/, services/, config/, app.py, requirements.txt).

Phase 1: Project Setup & Database (Ensure all operations and files are inside the `backend/` directory)
1. Initialize the modular folder structures:
   - For Node.js (in `backend/`): routes/, controllers/, middleware/, models/, services/, config/
   - For Python Flask (in `backend/ai/`): routes/, services/, config/
2. Set up environment-based config:
   - Node.js: `backend/.env` and `backend/.env.example` with DB credentials and the internal AI Service URL (`AI_SERVICE_URL=http://localhost:5001`).
   - Python Flask: `backend/ai/.env` or direct configuration reading for MySQL connection.
3. Implement the MySQL connection pool in Node.js (using `mysql2/promise`).
4. Create the complete database schema file in `backend/models/schema.sql`. Ensure proper foreign keys, indexes, and constraints.
- `districts` (id, name, state, officer_id FK, zone)
- `hospitals` (id, name, district_id FK, type, lat, lng, location POINT SRID 4326, license_no, address, contact, verification_status)
- `users` (id, email, phone, password_hash, role ENUM['donor','staff','admin','district','state','sysadmin'], hospital_id FK, district_id FK, created_at, last_login)
- `blood_batches` (id, hospital_id FK, blood_group, units, reserved_units, collection_date, expiry_date, source, remarks) — frontend computes status based on expiry_date.
- `transfer_requests` (id, from_hospital FK, to_hospital FK, blood_group, units, status, priority, message, created_at)
- `emergency_requests` (id, hospital_id FK, blood_group, units, target_timestamp, status, message, lat, lng, location POINT SRID 4326)
- `notifications` (id, user_id/hospital_id FK, title, message, type, is_read, timestamp)
- `donors` (id, user_id FK, full_name, age, gender, city, pincode, blood_group, weight, chronic_illness, last_donated_date, location POINT SRID 4326)
- `donation_camps` (id, name, camp_date, location POINT SRID 4326, district_id FK, organizer, capacity, expected_donors, status)
- `forecasts` (id, hospital_id FK, blood_group, predicted_units, forecast_date)
- `surgical_schedules` (id, hospital_id FK, surgery_date, surgery_type, blood_group, units, created_at)
- `alert_thresholds` (hospital_id FK, min_stock, max_stock, critical_units, expiry_days)
- `audit_logs` (id, actor_id, action, severity, ip_address, timestamp)

5. Add indexes on: hospital_id+blood_group, expiry_date, lat/lng spatial indexing on `hospitals`, `emergency_requests`, and `donors` using MySQL SPATIAL INDEX on the `location` columns.
6. Standardize Express error responses: { error: true, message: "description", code: "ERROR_CODE" } with HTTP status codes. Prefix all Node.js routes with `/api/v1`.
7. Initialize a skeleton Flask app in `backend/ai/app.py` running on Port 5001, with a simple health check route `/api/v1/health` verifying connectivity, and `backend/ai/requirements.txt` containing Flask, Prophet, Pandas, and MySQL connector.

Once completed, show the code and wait for confirmation.
```

---

### 📋 STEP 2: Authentication & RBAC (Strict Guards, No Google OAuth)
**Copy and paste the prompt below:**
```text
Phase 2: Authentication & RBAC (Ensure all Node.js files and modifications are inside the `backend/` directory)

Implement standard JWT email/password authentication in Node.js. All endpoints are prefixed with `/api/v1`. We are explicitly skipping Google OAuth.

Roles: `donor`, `staff`, `admin` (hospital), `district`, `state`, `sysadmin`.

Requirements:
1. Create the Auth endpoints in Node.js:
   - POST /auth/send-otp (Accepts `{ phone }`, dispatches a 6-digit OTP code to the donor phone)
   - POST /auth/verify-otp (Verifies OTP code)
   - POST /auth/register (Accepts donor or hospital admin details. Note: Mobile-only donors are registered using phone verification directly, while email users set a password)
   - POST /auth/login (Accepts `{ email, password }` or `{ phone, otp }`. Verifies credentials and returns `{ token, user, role }` so that the React frontend can redirect based on role)
   - POST /auth/logout
   - GET /auth/validate-invite-token/:token (Validates token for invited staff)
   - POST /auth/set-password (for invited staff setting password)
   - POST /auth/refresh
2. Build the Node.js RBAC middleware. 
   - `requireAuth`: validates JWT.
   - `requireRole(roles)`: restricts endpoint to specific roles.
   - `requireOwnership`: ensures `staff`/`admin` can only access their own `hospital_id`, and `district` officer only their `district_id`.
3. Add input validation using zod/express-validator for all Auth endpoints in Node.js.

Once completed, show the code and wait for confirmation.
```

---

### 📋 STEP 3: Donor Portal & Public Endpoints
**Copy and paste the prompt below:**
```text
Phase 3: Donor Portal APIs (Ensure all Node.js files and modifications are inside the `backend/` directory)

The frontend has a dedicated donor portal. Implement the following endpoints in Node.js specifically for the `donor` role (using the RBAC middleware) and public access:

Endpoints (prefixed with `/api/v1`):
1. **Profile Management**:
   - GET /donor/profile
   - PUT /donor/profile (Update weight, illness, location, etc.)
   - POST /donor/location (Save precise geo-coordinates and update MySQL `location` spatial POINT SRID 4326 column)
2. **Donation Data**:
   - GET /donor/donations (List of past donations)
   - GET /donor/stats (Returns stats. The frontend expects camelCase fields: `{ totalDonations, livesImpacted, nextEligibleDate }`. Code the cooldown calculation: `nextEligibleDate` is exactly 90 days after their `last_donated_date`)
3. **Engagement**:
   - GET /donor/urgent-requests (Geospatial search of `emergency_requests` within 10km radius using MySQL spatial query with `ST_Distance_Sphere` on the spatial location columns. Map results to match frontend names)
   - POST /donor/pledge (Body: emergency_id)
   - GET /donor/camps (List approved `donation_camps` nearby within 10km using `ST_Distance_Sphere`)
4. **Landing Page**:
   - POST /landing/demo-request (Saves email for hospital pilot interest)

Once completed, show the code and wait for confirmation.
```

---

### 📋 STEP 4: Hospital Staff Inventory & Emergency API
**Copy and paste the prompt below:**
```text
Phase 4: Hospital Inventory & Live Emergency Endpoints (Ensure all Node.js files and modifications are inside the `backend/` directory)

Implement the endpoints in Node.js for the Hospital Staff portal. The React frontend expects camelCase data shapes, so you MUST map database snake_case fields to camelCase in your responses.

Endpoints (prefixed with `/api/v1`, protected by `staff` or `admin` role):
1. **Inventory (`/hospital/inventory`)**:
   - GET /hospital/inventory (Paginated list. You must return each record mapped to camelCase: `{ id, bloodGroup, units, reservedUnits, collectionDate, expiryDate, source, remarks, status, daysRemaining }`. Calculate `status`: Expired if daysRemaining<0, Expiring Soon if daysRemaining<=30, Low Stock if units - reservedUnits<=3, else Available. Calculate `daysRemaining` as diff in days between `expiryDate` and today)
   - POST /hospital/inventory (Add blood batch)
   - PUT /hospital/inventory/:id (Update batch details)
   - DELETE /hospital/inventory/:id
   - GET /hospital/expiry-alerts
2. **Surgical Schedules**:
   - GET /hospital/surgical-schedule (List upcoming surgeries. Map to camelCase: `{ id, surgeryDate, surgeryType, bloodGroup, units }`)
   - POST /hospital/surgical-schedule (Log upcoming surgery requirements into the `surgical_schedules` table: surgery_date, surgery_type, blood_group, units)
3. **Donor Search**:
   - GET /hospital/donors/search?bloodGroup=&location= (Searches the `donors` table for matching bloodGroup and location matching city/pincode. Returns list mapped to camelCase: `{ id, name, bloodGroup, location, lastDonated, status }`. status is calculated as 'Eligible' if days since last donation >= 90, else 'Not Eligible')
4. **Emergency Routing (`/hospital/emergencies`)**:
   - GET /hospital/emergencies (List active SOS requests for this hospital. Map database records to camelCase: `{ id, hospitalName, bloodGroup, unitsRequired, distance, status, targetTimestamp, message }`)
   - PATCH /hospital/emergencies/:id/status (Accept/Decline status updates)
   - GET /emergency/search?bloodGroup=&lat=&lng=&radius= (Geospatial search for nearest hospital holding unreserved units of the blood group. Query must use MySQL spatial indices on the `location` column with `ST_Distance_Sphere`, filter where available units `units - reserved_units > 0`, sort by distance closest first, and exclude 0-unit results. Map response to camelCase. *CRITICAL*: Do NOT cache this query.)
5. **Notifications (`/hospital/notifications`)**:
   - GET /hospital/notifications (List notifications. Map response to camelCase: `{ id, title, message, type, read, timestamp }`. Note: database `is_read` must map to `read` boolean)
   - PATCH /hospital/notifications/:id/read
   - PATCH /hospital/notifications/read-all

Once completed, show the code and wait for confirmation.
```

---

### 📋 STEP 5: Transfers, Audit Logging, & AI Gateway Integration
**Copy and paste the prompt below:**
```text
Phase 5: Hospital Transfers & AI Forecast Gateway (Hybrid Integration - Node.js API + Python Flask AI service)

Implement hospital-to-hospital transfers in Node.js, and integrate the Node.js core API with the Python AI microservice for demand forecasting. All API endpoints must map responses to camelCase for the frontend.

Requirements (prefixed with `/api/v1`):
1. **Node.js - Transfers (`/hospital/transfers`)**:
   - GET /hospital/transfers (List transfers. Map response to camelCase: `{ id, hospitalName, bloodGroup, unitsRequired, distance, priority, status, message, date, type }`)
   - POST /hospital/transfers (Create a transfer. Require `Idempotency-Key` header and enforce checking to prevent duplicate transfer submissions during network retries).
   - PATCH /hospital/transfers/:id/status (Approve/Reject. *CRITICAL*: Approving a transfer must atomically increment `reserved_units` in the source hospital's matching inventory batch in the database to prevent double-allocation).
2. **Node.js - AI Forecast Gateway (`/admin/forecast` & `/admin/waste-analytics`)**:
   - GET /admin/forecast (Calls internal Flask service running on http://localhost:5001/api/v1/forecast. Cache response in Node.js via memory or Redis for 24h).
   - GET /admin/waste-analytics (Calls internal Flask service running on http://localhost:5001/api/v1/waste-analytics).
3. **Python Flask AI Microservice (inside `backend/ai/`)**:
   - Create route `/api/v1/forecast` in Flask that reads historical blood inventory records and surgical schedule feeds from the MySQL database, processes it with `pandas` and `numpy`, fits Meta's Facebook `Prophet` time-series forecasting model, and returns a 7-day predicted demand forecast.
   - Create route `/api/v1/waste-analytics` in Flask that calculates blood wastage, usage rates, and expiry metrics.
4. **Node.js - Thresholds (`/admin/thresholds`)**:
   - GET & PUT /admin/thresholds. If stock drops below `min_stock`, trigger donor alerts for eligible donors within a 10km radius of the hospital using the donor notification logic.
5. **Node.js - Audit Middleware**:
   - Write middleware that logs to `audit_logs` automatically whenever `blood_batches` or `transfer_requests` are updated or deleted.

Once completed, show the code and wait for confirmation.
```

---

### 📋 STEP 6: District & State Admin Dashboards
**Copy and paste the prompt below:**
```text
Phase 6: District & State Admin Dashboards (Ensure all Node.js files and modifications are inside the `backend/` directory)

Implement the higher-level management APIs in Node.js. All endpoints are prefixed with `/api/v1`. Do not expose individual donor or staff details here, only aggregated metrics.

Endpoints (Protected by `district` role):
1. **District Level (`/district/*`)**:
   - GET /district/dashboard (KPIs for the district, showing shortage heatmap alert statuses: Red, Yellow, Green calculated based on aggregated stock vs predicted demand)
   - GET /district/hospitals (List of hospitals and aggregate stock)
   - GET /district/alerts (Shortage alerts across the district)
   - PATCH /district/alerts/:id/resolve
   - GET & POST /district/camps (Manage donation camps)
   - PATCH /district/camps/:id/status (Approve/Reject camps)
   - GET /district/map (Geo data for hospital pins with aggregated status indicators)

Endpoints (Protected by `state` role):
2. **State Level (`/state/*`)**:
   - GET /state/dashboard
   - GET /state/transfers (Cross-district transfers overview)
   - PATCH /state/transfers/:id/approve
   - GET /state/policy-alerts

Once completed, show the code and wait for confirmation.
```

---

### 📋 STEP 7: System Admin, Rate Limiting & Polish
**Copy and paste the prompt below:**
```text
Phase 7: System Admin & Final Polish (Ensure all Node.js files and modifications are inside the `backend/` directory)

Wrap up the backend by adding system admin controls and security hardening. All endpoints are prefixed with `/api/v1`. All frontend clients are React Web.

Endpoints (Protected by `sysadmin` role):
1. **System Admin (`/systemadmin/*`)**:
   - GET /systemadmin/dashboard (System health: uptime, dbStatus)
   - GET /systemadmin/pending-approvals (Hospitals and district officers awaiting approval)
   - PATCH /systemadmin/hospitals/:id/approve (or reject)
   - GET & PATCH /systemadmin/users (Change roles or suspend users)
   - GET /systemadmin/audit-logs
   - POST /systemadmin/backup (Trigger DB backup script)

Security & Polish:
2. **Rate Limiting**: Apply global 100 req/min rate limit in Node.js (returns 429).
3. **CORS**: Configure Node.js CORS for React frontend origin.
4. **Testing**: Write Jest unit tests in Node.js for Auth, Emergency Search, and Transfer logic (minimum 15 tests).
5. **Seeder**: Write a Node.js `seed.js` script to populate 3 hospitals, inventory bags, an admin, staff, and donor account.

Once completed, the backend is fully functional and ready for frontend integration!
```
