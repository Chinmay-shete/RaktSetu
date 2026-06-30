# RaktSetu Backend QA Review Report

This report documents the systematic QA review conducted on the **RaktSetu Backend** (Node.js/Express, Python/Flask AI Service, and MySQL 8.0+). 

---

## Summary Checklist

| Category | Requirement Check | Status | Key References / Findings |
| :--- | :--- | :---: | :--- |
| **CHECK 1** | Schema & Database Table Coverage | ✅ Pass | All 13 core tables + 6 helper tables exist. [schema.sql](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/models/schema.sql) |
| **CHECK 1** | Spatial Points, SRID 4326 & Indexes | ✅ Pass | Location columns use `POINT SRID 4326` with `SPATIAL INDEX`; compound and expiry indexes exist. [schema.sql:280-291](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/models/schema.sql#L280-L291) |
| **CHECK 1** | Single Users Table + Role ENUM | ✅ Pass | Single `users` table handles roles via `role ENUM(...)`. [schema.sql:59-72](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/models/schema.sql#L59-L72) |
| **CHECK 2** | Unified Login Route & Payload Shapes | ✅ Pass | Single `POST /auth/login` supports Email/Password & Phone/OTP logins; returns camelCase user metadata. [authController.js:225](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/authController.js#L225) |
| **CHECK 2** | Staff Account Creation Flow | ❌ Fail | Missing `POST /api/v1/hospital/staff` (admin-only endpoint) to create staff with temp passwords. Uses tokens. |
| **CHECK 2** | Route Authorization Middleware Application | ⚠️ Partial | `requireAuth` and `requireRole` are applied across 10+ routes, but `requireOwnership` is never used. |
| **CHECK 2** | JWT Token Payload Structure | ✅ Pass | Payload contains exactly `{ sub, role, hospital_id, district_id, iat, exp }`. [jwtService.js:42](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/services/jwtService.js#L42) |
| **CHECK 3** | Response Shape camelCase Mapping | ✅ Pass | Response bodies mapped to camelCase. [hospitalController.js:42](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/hospitalController.js#L42), [donorController.js:21](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/donorController.js#L21) |
| **CHECK 3** | Server-Side Inventory Status Logic | ✅ Pass | Status and daysRemaining calculated dynamically on the server. [hospitalController.js:14-37](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/hospitalController.js#L14-L37) |
| **CHECK 3** | Atomic Allocation & Race Conditions (Transfers) | ✅ Pass | Uses `FOR UPDATE` transaction locks to prevent double allocation. [hospitalController.js:780](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/hospitalController.js#L780) |
| **CHECK 3** | Transfer Request Idempotency Enforcements | ✅ Pass | Enforces `Idempotency-Key` header with in-memory caching. [hospitalController.js:708](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/hospitalController.js#L708) |
| **CHECK 3** | Emergency Search Spatial Performance & Cache | ❌ Fail | EXPLAIN shows Table Scan on `hospitals` table; MySQL does not use SPATIAL INDEX with `ST_Distance_Sphere` in WHERE. [hospitalController.js:529](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/hospitalController.js#L529) |
| **CHECK 3** | Exclusion of Google Maps References | ✅ Pass | Geolocation and distance metrics are fully computed via SQL spatial queries. |
| **CHECK 4** | AI Microservice Health & Prophet Integration | ✅ Pass | Flask AI service fits Prophet on real data; cached for 24h in Node. [app.py:100](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/ai/app.py#L100), [hospitalController.js:863](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/hospitalController.js#L863) |
| **CHECK 5** | Rate Limiting & CORS Configuration | ✅ Pass | Active 100 req/min rate limiter and CORS configuration restricted to frontend origins. [server.js:13-58](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/server.js#L13-L58) |
| **CHECK 5** | Audit Logging Coverage | ❌ Fail | `PATCH /state/transfers/:id/approve` updates transfer and inventory tables but lacks audit logging. [adminController.js:578](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/adminController.js#L578) |
| **CHECK 5** | Jest Test Suite Coverage | ✅ Pass | 17 integration tests exist and all pass cleanly when database is seeded. |
| **CHECK 5** | Database Seeding and Credentials | ✅ Pass | Seeding is fully functional. Output test credentials provided in report details. [seed.js](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/seed.js) |

---

## Detailed Audit Findings

### CHECK 1 — Schema & DB
*   **✅ Table Presence:** All requested tables exist with appropriate columns, data types, primary keys, and foreign keys. Foreign keys are added via `ALTER TABLE` constraints at the end of [schema.sql](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/models/schema.sql#L303-L360) to resolve circular references.
*   **✅ Spatial Data & Indexes:** Spatial POINT columns with SRID 4326 exist for `hospitals.location`, `emergency_requests.location`, `donors.location`, and `donation_camps.location`. The matching SPATIAL INDEX definitions are defined at lines 288-291 of [schema.sql](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/models/schema.sql#L288-L291).
*   **✅ Index Constraints:** Compound indexes exist on `(hospital_id, blood_group)` for `blood_batches`, `forecasts`, and `surgical_schedules` (lines 280-282), and a standard index exists on `(expiry_date)` in `blood_batches` (line 285).
*   **✅ One Users Table:** System enforces unified user management inside `users` with ENUM-defined roles. No separate tables per role exist.

---

### CHECK 2 — Auth & RBAC
*   **✅ Unified Login Endpoint:** `POST /api/v1/auth/login` accepts `{ email, password }` or `{ phone, otp }`. Phone OTP login verifies using the OTP service and is restricted to the `donor` role (line 262). Response details return the `token` and serialized `user` mapped to camelCase.
*   **❌ Missing Staff Creation Route:** Staff registration flow is currently built using a token validation and setup system: `GET /auth/validate-invite-token/:token` and `POST /auth/set-password` ([authRoutes.js:32-35](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/routes/authRoutes.js#L32-L35)). There is **no administrative endpoint** (like `POST /api/v1/hospital/staff`) to invite/create a staff member directly using a hashed, system-generated temp password.
*   **⚠️ Missing Ownership Enforcement:** The `requireOwnership` middleware is defined in [auth.js:82-116](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/middleware/auth.js#L82-L116) but is **never imported or applied** in any route file. While controllers do verify ownership implicitly inside SQL queries (e.g. querying with `hospital_id` attached to user session), the middleware is unused code.
*   **✅ JWT Payload:** Decoded access token structure includes the fields: `{ sub, role, hospital_id, district_id, type, exp, iat }` (lines 44-52 in [jwtService.js](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/services/jwtService.js#L44-L52)).

---

### CHECK 3 — Endpoint-by-endpoint functional test
*   **✅ camelCase Conversions:** Checked all controllers. Response structures consistently serialize to camelCase (e.g., `bloodGroup`, `unitsRequired`, `distanceKm`, `availableUnits`, etc.).
*   **✅ Inventory Days & Status Logic:** Handled on server-side during serialization:
    *   `daysRemaining` is computed in [hospitalController.js:14-21](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/hospitalController.js#L14-L21).
    *   `status` is evaluated based on `units - reservedUnits <= 3` (Low Stock), `daysRemaining <= 30` (Expiring Soon), and `daysRemaining < 0` (Expired) in [hospitalController.js:26-37](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/hospitalController.js#L26-L37).
*   **✅ Atomic Transfers:** `PATCH /hospital/transfers/:id/status` uses `connection.beginTransaction()` and `FOR UPDATE` lock on the transfer request and the matching inventory batch to atomically increment `reserved_units` and prevent race conditions or double approval.
*   **✅ Idempotency-Key Header:** Enforced on `POST /hospital/transfers` via an in-memory `idempotencyKeys` Map. Retrying the same key returns the cached response, preventing duplicate entry creation.
*   **❌ Spatial Indexing Table Scan in Emergency Search:** In `GET /emergency/search` (and `GET /donor/urgent-requests`), the MySQL query utilizes:
    ```sql
    ST_Distance_Sphere(ST_GeomFromText(?, 4326), h.location) <= ?
    ```
    Running `EXPLAIN` confirms that MySQL performs a **Table scan** instead of using the spatial index `idx_hospitals_location`. This is because `ST_Distance_Sphere` is not an indexed relation in MySQL. 
    *   *Correction Plan:* To make use of the spatial index, the query should filter coordinates within a bounding box (envelope) using `ST_Within(location, ...)` or `MBRContains(...)` before running `ST_Distance_Sphere`.
*   **✅ No Google Maps Dependency:** No Google Maps APIs are loaded or queried in the backend. All distance calculations are handled inside MySQL database queries.

---

### CHECK 4 — AI Microservice
*   **✅ Service Status:** Flask AI service is active on port `5001`. The health check endpoint `GET /api/v1/health` responds with JSON database health details.
*   **✅ Prophet Forecasting Model:** `GET /api/v1/forecast` performs model fitting. It reads real historical records from `surgical_schedules` and `blood_batches` and fits a real `Prophet` forecasting model (lines 131-137 in [app.py](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/ai/app.py#L131-L137)) to predict demand over the next 7 days.
*   **✅ Gateway Caching:** Node.js gateway caches forecast results in `forecastCache` for 24h before hitting the Flask AI microservice again ([hospitalController.js:863-885](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/hospitalController.js#L863-L885)).

---

### CHECK 5 — Security & Ops
*   **✅ Rate Limiting:** Global Express rate limiter limits requests to 100 req/min, returning a 429 status code with a JSON payload when exceeded.
*   **✅ CORS Origin Checks:** Enabled to restrict access to trusted browser clients, defaulting to local React ports.
*   **❌ Missing Audit Logs on Cross-District Transfers:** The `auditLog` middleware is configured for inventory updates, deletions, and local transfer updates. However, it is **missing** on the cross-district transfer approval endpoint `PATCH /state/transfers/:id/approve` inside [adminRoutes.js](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/routes/adminRoutes.js). The controller method [adminController.js:578](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/adminController.js#L578) updates the `transfer_requests` status to `'accepted'` and modifies the `blood_batches` `reserved_units` but does not write to the `audit_logs` table.
*   **✅ Jest Tests:** All 17 Jest integration tests pass cleanly once the database is populated.
*   **✅ Seeding Credentials:** Seeding script successfully populates clean mock records. Test login credentials (password is **`password123`** for all):
    *   **Sysadmin:** `sysadmin@example.com`
    *   **State Admin (Maharashtra):** `state_admin@example.com`
    *   **District Officer (Pune):** `district_admin@example.com`
    *   **Hospital Admin (Pune Life Care):** `hospital_admin@example.com`
    *   **Hospital Staff (Pune Life Care):** `hospital_staff@example.com`
    *   **Hospital Admin (Koregaon Park):** `hospital_admin1@example.com`
    *   **Donor:** `donor@example.com`
