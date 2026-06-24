# RaktSetu Backend Agent Prompts (Enriched Context)

Here are the step-by-step prompts you can copy and paste to your AI agent one by one. These prompts are deeply enriched with the exact frontend data shapes, routing paths, and database schema requirements extracted from your project documentation (PRD and UI understanding). Google OAuth 2.0 has been excluded as requested.

***

### Prompt 1: Project Setup, Architecture & Extended Database Schema
**Copy the text below:**
```text
We are building the backend for RaktSetu — an AI layer on top of India's eRaktKosh system to reduce blood wastage. The tech stack is Node.js + Express, REST architecture, and MySQL with geospatial indexing.

CRITICAL REQUIREMENT:
All backend initialization, directories, and code files MUST be created inside the `backend/` folder at the root of the workspace. Do not initialize the project or create any files in the root directory.

Phase 1: Project Setup & Database (Ensure all operations and files are inside the `backend/` directory)
1. Initialize a modular folder structure (routes/, controllers/, middleware/, models/, services/, config/).
2. Set up environment-based config (.env) for DB credentials.
3. Implement the MySQL connection pool.
4. Create the complete database schema. Ensure proper foreign keys, indexes, and constraints.
- `districts` (id, name, state, officer_id FK, zone)
- `hospitals` (id, name, district_id FK, type, lat, lng, license_no, address, contact, verification_status)
- `users` (id, email, phone, password_hash, role ENUM['donor','staff','admin','district','state','sysadmin'], hospital_id FK, district_id FK, created_at, last_login)
- `blood_batches` (id, hospital_id FK, blood_group, units, reserved_units, collection_date, expiry_date, source, remarks) — frontend computes status based on expiry_date.
- `transfer_requests` (id, from_hospital FK, to_hospital FK, blood_group, units, status, priority, message, created_at)
- `emergency_requests` (id, hospital_id FK, blood_group, units, target_timestamp, status, message, lat, lng)
- `notifications` (id, user_id/hospital_id FK, title, message, type, is_read, timestamp)
- `donors` (id, user_id FK, full_name, age, gender, city, pincode, blood_group, weight, chronic_illness, last_donated_date)
- `donation_camps` (id, name, camp_date, location, district_id FK, organizer, capacity, expected_donors, status)
- `forecasts` (id, hospital_id FK, blood_group, predicted_units, forecast_date)
- `surgical_schedules` (id, hospital_id FK, surgery_date, surgery_type, blood_group, units, created_at)
- `alert_thresholds` (hospital_id FK, min_stock, max_stock, critical_units, expiry_days)
- `audit_logs` (id, actor_id, action, severity, ip_address, timestamp)

5. Add indexes on: hospital_id+blood_group, expiry_date, lat/lng spatial indexing on `hospitals`, `emergency_requests`, and `donors`.
6. Standardize error responses: { error, message, code } with HTTP status codes. Prefix all routes with `/v1`.

Once completed, show the code and wait for confirmation.
```

***

### Prompt 2: Authentication & RBAC (Strict Guards, No Google OAuth)
**Copy the text below:**
```text
Phase 2: Authentication & RBAC (Ensure all files and modifications are inside the `backend/` directory)

Implement standard JWT email/password authentication. We are explicitly skipping Google OAuth.

Roles: `donor`, `staff`, `admin` (hospital), `district`, `state`, `sysadmin`.

Requirements:
1. Create the Auth endpoints:
   - POST /auth/send-otp (for donor mobile)
   - POST /auth/verify-otp
   - POST /auth/register (donors & hospitals)
   - POST /auth/login (Returns `{ token, user, role }`)
   - POST /auth/logout
   - GET /auth/validate-invite-token/:token
   - POST /auth/set-password (for invited staff)
   - POST /auth/refresh
2. Build the RBAC middleware. 
   - `requireAuth`: validates JWT.
   - `requireRole(roles)`: restricts endpoint to specific roles.
   - `requireOwnership`: ensures `staff`/`admin` can only access their own `hospital_id`, and `district` officer only their `district_id`.
3. Add input validation using zod/express-validator for all Auth endpoints.

Once completed, show the code and wait for confirmation.
```

***

### Prompt 3: Donor Portal & Public Endpoints
**Copy the text below:**
```text
Phase 3: Donor Portal APIs (Ensure all files and modifications are inside the `backend/` directory)

The frontend has a dedicated donor portal. Implement the following endpoints specifically for the `donor` role (using the RBAC middleware) and public access:

Endpoints:
1. **Profile Management**:
   - GET /donor/profile
   - PUT /donor/profile (Update weight, illness, location, etc.)
   - POST /donor/location (Save precise geo-coordinates)
2. **Donation Data**:
   - GET /donor/donations (List of past donations)
   - GET /donor/stats (totalDonations, livesImpacted, nextEligibleDate logic: 90 days from last donation)
3. **Engagement**:
   - GET /donor/urgent-requests (Geospatial search of `emergency_requests` within 10km radius)
   - POST /donor/pledge (Body: emergency_id)
   - GET /donor/camps (List approved `donation_camps` nearby)
4. **Landing Page**:
   - POST /landing/demo-request (Saves email for hospital pilot interest)

Once completed, show the code and wait for confirmation.
```

***

### Prompt 4: Hospital Staff Inventory & Emergency API
**Copy the text below:**
```text
Phase 4: Hospital Inventory & Live Emergency Endpoints (Ensure all files and modifications are inside the `backend/` directory)

Implement the endpoints for the Hospital Staff portal. The frontend strictly expects specific data shapes.

Endpoints (Protected by `staff` or `admin` role):
1. **Inventory (`/hospital/inventory`)**:
   - GET /hospital/inventory (Paginated. Calculate and return `status`: Expired if daysRemaining<0, Expiring Soon if <=30, Low Stock if units-reservedUnits<=3, else Available)
   - POST /hospital/inventory (Add blood batch)
   - PUT /hospital/inventory/:id
   - DELETE /hospital/inventory/:id
   - GET /hospital/expiry-alerts
   - POST /hospital/surgical-schedule (Log upcoming surgery requirements)
2. **Emergency Routing (`/hospital/emergencies`)**:
   - GET /hospital/emergencies (List active SOS requests for this hospital)
   - PATCH /hospital/emergencies/:id/status (Accept/Decline)
   - GET /emergency/search?bloodGroup=&lat=&lng=&radius= (Geospatial search for nearest hospital with `units - reservedUnits > 0`. DO NOT cache this.)
3. **Notifications (`/hospital/notifications`)**:
   - GET /hospital/notifications
   - PATCH /hospital/notifications/:id/read
   - PATCH /hospital/notifications/read-all

Once completed, show the code and wait for confirmation.
```

***

### Prompt 5: Transfers, Audit Logging, & AI Gateway
**Copy the text below:**
```text
Phase 5: Hospital Transfers & AI Forecast Gateway (Ensure all files and modifications are inside the `backend/` directory)

Implement hospital-to-hospital transfers and the gateway for the Python AI microservice.

Endpoints:
1. **Transfers (`/hospital/transfers`)**:
   - GET /hospital/transfers
   - POST /hospital/transfers (Create a transfer. Require `Idempotency-Key` header to prevent dupes)
   - PATCH /hospital/transfers/:id/status (Approve/Reject. *CRITICAL*: Approving increments `reserved_units` in the source batch).
2. **AI Forecast Gateway (`/admin/forecast`)**:
   - GET /admin/forecast (Calls internal Flask service for 7-day prediction. Cache via memory/Redis for 24h).
   - GET /admin/waste-analytics (Calculates expiry vs usage).
3. **Thresholds (`/admin/thresholds`)**:
   - GET & PUT /admin/thresholds
4. **Audit Middleware**:
   - Write middleware that logs to `audit_logs` automatically whenever `blood_batches` or `transfer_requests` are updated or deleted.

Once completed, show the code and wait for confirmation.
```

***

### Prompt 6: District & State Admin Dashboards
**Copy the text below:**
```text
Phase 6: District & State Admin APIs (Ensure all files and modifications are inside the `backend/` directory)

Implement the higher-level management APIs. Do not expose individual donor or staff details here, only aggregated metrics.

Endpoints (Protected by `district` role):
1. **District Level (`/district/*`)**:
   - GET /district/dashboard (KPIs for the district)
   - GET /district/hospitals (List of hospitals and aggregate stock)
   - GET /district/alerts (Shortage alerts across the district)
   - PATCH /district/alerts/:id/resolve
   - GET & POST /district/camps (Manage donation camps)
   - PATCH /district/camps/:id/status (Approve/Reject camps)
   - GET /district/map (Geo data for hospital pins)

Endpoints (Protected by `state` role):
2. **State Level (`/state/*`)**:
   - GET /state/dashboard
   - GET /state/transfers (Cross-district transfers overview)
   - PATCH /state/transfers/:id/approve
   - GET /state/policy-alerts

Once completed, show the code and wait for confirmation.
```

***

### Prompt 7: System Admin, Rate Limiting & Polish
**Copy the text below:**
```text
Phase 7: System Admin & Final Polish (Ensure all files and modifications are inside the `backend/` directory)

Wrap up the backend by adding system admin controls and security hardening.

Endpoints (Protected by `sysadmin` role):
1. **System Admin (`/systemadmin/*`)**:
   - GET /systemadmin/dashboard (System health: uptime, dbStatus)
   - GET /systemadmin/pending-approvals (Hospitals and district officers awaiting approval)
   - PATCH /systemadmin/hospitals/:id/approve (or reject)
   - GET & PATCH /systemadmin/users (Change roles or suspend users)
   - GET /systemadmin/audit-logs
   - POST /systemadmin/backup (Trigger DB backup script)

Security & Polish:
2. **Rate Limiting**: Apply global 100 req/min rate limit (returns 429).
3. **CORS**: Configure CORS for frontend origin.
4. **Testing**: Write Jest unit tests for Auth, Emergency Search, and Transfer logic (minimum 15 tests).
5. **Seeder**: Write a `seed.js` script to populate 3 hospitals, inventory bags, an admin, staff, and donor account.

Once completed, the backend is fully functional and ready for frontend integration!
```
