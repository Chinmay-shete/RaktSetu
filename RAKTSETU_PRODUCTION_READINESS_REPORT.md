# RaktSetu Production Readiness Report

**Overall verdict:** Not Ready for production.

**If you only fix 3 things before going live, fix these:**
1. Remove hardcoded/auth fallback secrets and rotate JWT secrets that may have been exposed in git history.
2. Add dedicated login/OTP brute-force controls, OTP attempt tracking, and stop logging OTP codes.
3. Replace frontend mock/localStorage-only auth flows and mock dashboards with real API-backed, token-validated behavior across all portals.

## Summary Checklist

| Category | Requirement Check | Status | Risk if shipped as-is | Key References |
|---|---|---:|---|---|
| Authentication & Session Security | 1. JWT secret strength and git history | ❌ | High | `backend/services/jwtService.js:5`; `backend/.env.example:7`; `git log -S super_secret_raktsetu_key_2026` -> `549460f` |
| Authentication & Session Security | 2. Token lifetime and expiry behavior across portals | ⚠️ | Medium | `backend/services/jwtService.js:43`; `Rakta Setu - React/src/services/api.js:27`; `Rakta Setu - React/src/components/ProtectedRoute.jsx:4`; `Rakta Setu - React/src/components/Login.jsx:166` |
| Authentication & Session Security | 3. Password storage, including admin-created staff temp password | ⚠️ | Medium | `backend/services/passwordService.js:4`; `backend/controllers/authController.js:141`; `backend/controllers/authController.js:195`; `backend/controllers/authController.js:398`; `backend/controllers/hospitalController.js:1053` |
| Authentication & Session Security | 4. Login brute-force and OTP attempt/expiry controls | ❌ | High | `backend/server.js:29`; `backend/routes/authRoutes.js:17`; `backend/routes/authRoutes.js:26`; `backend/services/otpService.js:18`; `backend/services/otpService.js:66` |
| Authentication & Session Security | 5. RBAC completeness across every route | ⚠️ | High | `backend/routes/authRoutes.js:17`; `backend/routes/donorRoutes.js:15`; `backend/routes/hospitalRoutes.js:23`; `backend/routes/adminRoutes.js:17`; `backend/routes/systemAdminRoutes.js:9` |
| Authentication & Session Security | 6. Logout/session invalidation | ⚠️ | Medium | `backend/controllers/authController.js:64`; `backend/controllers/authController.js:309`; `backend/controllers/authController.js:437`; `backend/middleware/auth.js:38` |
| General Security | 7. SQL injection and unsafe query construction | ⚠️ | High | `backend/controllers/hospitalController.js:387`; `backend/controllers/donorController.js:174`; `backend/controllers/systemAdminController.js:297`; `backend/controllers/systemAdminController.js:311`; `backend/ai/app.py:187` |
| General Security | 8. XSS / dangerous render bypass | ✅ | Low | `rg dangerouslySetInnerHTML` returned no matches; React rendering in `Rakta Setu - React/src/pages/district/HospitalRegistry.jsx:134` |
| General Security | 9. Server-side input validation | ⚠️ | Medium | `backend/middleware/validation.js:7`; `backend/routes/hospitalRoutes.js:46`; `backend/routes/systemAdminRoutes.js:14`; `backend/routes/systemAdminRoutes.js:18` |
| General Security | 10. File upload safety for hospital license document | ❌ | Medium | `Rakta Setu - React/src/pages/admin/HospitalApplication.jsx:23`; `Rakta Setu - React/src/pages/admin/HospitalApplication.jsx:74`; `Rakta Setu - React/src/pages/admin/HospitalApplication.jsx:320`; no backend upload route found |
| General Security | 11. CORS allowed origin configuration | ⚠️ | Medium | `backend/server.js:13`; `backend/server.js:21`; `backend/server.js:26`; `backend/.env.example:1` |
| General Security | 12. Secrets in repo and git history | ❌ | High | `Rakta Setu - React/.env.example:7`; `Rakta Setu - React/.env.example:18`; `backend/services/jwtService.js:5`; `git ls-files backend/ai/.venv` |
| General Security | 13. Dependency vulnerabilities | ⚠️ | High | `npm audit` backend: 0 high/critical; frontend: Vite high advisory; Python audit tool unavailable for `backend/ai/requirements.txt:1` |
| General Security | 14. HTTPS readiness / hardcoded HTTP URLs | ⚠️ | Medium | `Rakta Setu - React/src/services/api.js:4`; `backend/controllers/hospitalController.js:874`; `backend/controllers/hospitalController.js:896`; `backend/server.js:15` |
| General Security | 15. Production 500 error leakage | ❌ | Medium | `backend/middleware/errorHandler.js:25`; `backend/middleware/errorHandler.js:34`; `backend/controllers/healthController.js:25`; `backend/ai/app.py:169` |
| Production Readiness | 16. Complete env examples and no real secret values | ⚠️ | Medium | `backend/.env.example:1`; `backend/.env.example:8`; `Rakta Setu - React/.env.example:7`; `Rakta Setu - React/.env.example:18` |
| Production Readiness | 17. Build cleanliness and production start | ⚠️ | Medium | `Rakta Setu - React/package.json:8`; `backend/package.json:7`; build succeeded with >500 kB chunk warning; `rg console.log` still finds backend logs |
| Production Readiness | 18. Structured logging / PII-safe logs | ❌ | Medium | `backend/services/otpService.js:46`; `backend/services/otpService.js:48`; `backend/services/otpService.js:50`; `backend/server.js:67`; `backend/middleware/audit.js:39` |
| Production Readiness | 19. Schema/migration safety | ❌ | High | `backend/models/schema.sql:7`; `backend/models/schema.sql:9`; `backend/seed.js:12`; `backend/seed.js:22` |
| Production Readiness | 20. Health checks for Node and Flask AI | ⚠️ | Low | `backend/controllers/healthController.js:3`; `backend/ai/app.py:24`; `backend/controllers/healthController.js:27`; `backend/ai/app.py:55` |
| Production Readiness | 21. Graceful degradation when AI service is down | ❌ | Medium | `backend/controllers/hospitalController.js:874`; `backend/controllers/hospitalController.js:876`; `Rakta Setu - React/src/pages/admin/AIDemandForecast.jsx:8`; `Rakta Setu - React/src/pages/admin/AIDemandForecast.jsx:29` |
| Regression Recheck | 22. Mock API, Google Maps, unified login, invite-token routes | ❌ | High | `Rakta Setu - React/src/services/mockApi.js:1`; `Rakta Setu - React/src/services/api.js:38`; `Rakta Setu - React/src/App.jsx:106`; `backend/routes/authRoutes.js:32` |

## Detailed Audit Findings

### SECTION 1: AUTHENTICATION & SESSION SECURITY

#### CHECK 1 - JWT Secret Strength

**Status:** ❌ Fail.

`JWT_SECRET` is read from the environment, but it falls back to a hardcoded guessable string (`backend/services/jwtService.js:5`). That exact secret was introduced in git history (`549460f feat: implement user authentication system with OTP verification, JWT management, and database schema updates`), so it must be considered exposed. There is no separate refresh-token signing secret; access, refresh, and OTP verification JWTs use the same secret (`backend/services/jwtService.js:5`, `backend/services/jwtService.js:81`).

Required before production: remove fallback secrets, require startup failure when `JWT_SECRET` is absent/weak, rotate all tokens/secrets, and use a distinct refresh/OTP secret or key separation.

#### CHECK 2 - Token Lifetime and Expiry Behavior

**Status:** ⚠️ Partial.

Access tokens default to 60 minutes (`backend/services/jwtService.js:43`) and refresh tokens default to 7 days (`backend/services/jwtService.js:60`). The frontend Axios interceptor clears `raktsetu_auth_token` and redirects to `/login` on any 401 (`Rakta Setu - React/src/services/api.js:27`), so API-backed pages will eventually fail closed after expiry.

However, portal guards are localStorage-flag based, not token-validity based (`Rakta Setu - React/src/components/ProtectedRoute.jsx:4`). Donor mobile OTP login also never calls the backend OTP login route and sets local auth directly (`Rakta Setu - React/src/components/Login.jsx:166`). That means token expiry is not consistently traced across all six portals: donor, staff, hospital admin, district, state, and system admin.

#### CHECK 3 - Password Storage

**Status:** ⚠️ Partial.

Password hashing uses bcryptjs with generated salt cost 10 (`backend/services/passwordService.js:4`). Donor optional passwords, hospital admin passwords, invite-based staff passwords, and admin-created staff temp passwords all pass through `hashPassword` (`backend/controllers/authController.js:141`, `backend/controllers/authController.js:195`, `backend/controllers/authController.js:398`, `backend/controllers/hospitalController.js:1055`).

Risk remains because admin-created staff flow returns an 8-character temporary plaintext password in the JSON response (`backend/controllers/hospitalController.js:1053`, `backend/controllers/hospitalController.js:1062`). That is not plaintext storage, but it is a secret exposure and lifecycle problem.

#### CHECK 4 - Login Brute Force and OTP Attempts

**Status:** ❌ Fail.

Only a global in-memory 100 requests/minute IP limiter is present (`backend/server.js:29`). There is no tighter `/auth/login` limiter per IP/account and no account lockout/backoff. OTPs expire after 5 minutes by default (`backend/services/otpService.js:18`) and are one-time-use, but `otp_codes` has no attempt counter and `verifyOtp` does not increment failed attempts (`backend/services/otpService.js:66`). OTP codes are also printed to stdout (`backend/services/otpService.js:46`).

#### CHECK 5 - RBAC Completeness and Route Guard Table

**Status:** ⚠️ Partial.

Most non-auth API routes are guarded by `requireRole`, and selected resource-changing routes add `requireOwnership`. The gaps are public auth/invite endpoints, missing validation on some write routes, and frontend guards that trust localStorage flags. Full backend route table:

| Route | Guards Present | Notes |
|---|---|---|
| `GET /api/v1/health` | Public | Intended public monitor endpoint. |
| `POST /api/v1/auth/send-otp` | `validateRequest(sendOtpSchema)` | No route-specific rate limit. |
| `POST /api/v1/auth/verify-otp` | `validateRequest(verifyOtpSchema)` | No attempt limit. |
| `POST /api/v1/auth/register` | `validateRequest(registerSchema)` | Public registration. |
| `POST /api/v1/auth/login` | `validateRequest(loginSchema)` | No login-specific rate limit. |
| `POST /api/v1/auth/logout` | `validateRequest(logoutSchema)` | No `requireAuth`; only refresh-token validation. |
| `GET /api/v1/auth/validate-invite-token/:token` | Public | Invite-token route reachable. |
| `POST /api/v1/auth/set-password` | `validateRequest(setPasswordSchema)` | Public token-based staff activation. |
| `POST /api/v1/auth/refresh` | `validateRequest(refreshSchema)` | Uses refresh-token DB lookup. |
| `GET /api/v1/donor/profile` | `requireRole('donor')` | OK. |
| `POST /api/v1/donor/profile` | `requireRole('donor')`, `validateRequest(createProfileSchema)` | OK. |
| `POST /api/v1/donor/profile-setup` | `requireRole('donor')`, `validateRequest(createProfileSchema)` | OK. |
| `PUT /api/v1/donor/profile` | `requireRole('donor')`, `validateRequest(updateProfileSchema)` | OK. |
| `POST /api/v1/donor/location` | `requireRole('donor')`, `validateRequest(saveLocationSchema)` | OK. |
| `GET /api/v1/donor/donations` | `requireRole('donor')` | OK. |
| `GET /api/v1/donor/stats` | `requireRole('donor')` | OK. |
| `GET /api/v1/donor/urgent-requests` | `requireRole('donor')` | OK. |
| `POST /api/v1/donor/pledge` | `requireRole('donor')`, `validateRequest(pledgeSchema)` | OK. |
| `GET /api/v1/donor/camps` | `requireRole('donor')` | Query params not schema-validated. |
| `POST /api/v1/hospital/staff` | `requireRole('admin')`, `validateRequest(createStaffSchema)` | OK, but returns temp password. |
| `GET /api/v1/hospital/inventory` | `requireRole(['staff','admin'])` | Controller scopes to user hospital. |
| `POST /api/v1/hospital/inventory` | `requireRole(['staff','admin'])`, `validateRequest(addBatchSchema)` | OK. |
| `PUT /api/v1/hospital/inventory/:id` | `requireRole`, `requireOwnership(blood_batches)`, audit, validation | OK. |
| `DELETE /api/v1/hospital/inventory/:id` | `requireRole`, `requireOwnership(blood_batches)`, audit | OK. |
| `GET /api/v1/hospital/expiry-alerts` | `requireRole(['staff','admin'])` | OK. |
| `GET /api/v1/hospital/surgical-schedule` | `requireRole(['staff','admin'])` | OK. |
| `POST /api/v1/hospital/surgical-schedule` | `requireRole`, `validateRequest(surgicalScheduleSchema)` | OK. |
| `GET /api/v1/hospital/donors/search` | `requireRole(['staff','admin'])` | Query params not schema-validated. |
| `GET /api/v1/hospital/emergencies` | `requireRole(['staff','admin'])` | OK. |
| `PATCH /api/v1/hospital/emergencies/:id/status` | `requireRole`, `requireOwnership(emergency_requests)`, validation | OK. |
| `GET /api/v1/emergency/search` | `requireRole(['staff','admin'])` | Query params manually checked, not Zod-validated. |
| `GET /api/v1/hospital/notifications` | `requireRole(['staff','admin'])` | OK. |
| `PATCH /api/v1/hospital/notifications/:id/read` | `requireRole(['staff','admin'])` | Controller checks notification ownership. |
| `PATCH /api/v1/hospital/notifications/read-all` | `requireRole(['staff','admin'])` | Controller scopes update. |
| `GET /api/v1/hospital/transfers` | `requireRole(['staff','admin'])` | OK. |
| `POST /api/v1/hospital/transfers` | `requireRole`, `validateRequest(createTransferSchema)` | OK. |
| `PATCH /api/v1/hospital/transfers/:id/status` | `requireRole`, `requireOwnership(transfer_requests)`, audit, validation | OK. |
| `GET /api/v1/admin/forecast` | `requireRole(['staff','admin'])` | AI gateway. |
| `GET /api/v1/admin/waste-analytics` | `requireRole(['staff','admin'])` | AI gateway. |
| `GET /api/v1/admin/thresholds` | `requireRole(['staff','admin'])` | OK. |
| `PUT /api/v1/admin/thresholds` | `requireRole(['staff','admin'])`, validation | OK. |
| `GET /api/v1/district/dashboard` | `requireRole('district')`, `requireOwnership()` | OK. |
| `GET /api/v1/district/hospitals` | `requireRole('district')`, `requireOwnership()` | OK. |
| `GET /api/v1/district/alerts` | `requireRole('district')`, `requireOwnership()` | OK. |
| `PATCH /api/v1/district/alerts/:id/resolve` | `requireRole('district')`, `requireOwnership()` | Controller verifies district. |
| `GET /api/v1/district/camps` | `requireRole('district')`, `requireOwnership()` | OK. |
| `POST /api/v1/district/camps` | `requireRole('district')`, `requireOwnership()`, validation | OK. |
| `PATCH /api/v1/district/camps/:id/status` | `requireRole('district')`, `requireOwnership(donation_camps)`, validation | OK. |
| `GET /api/v1/district/map` | `requireRole('district')`, `requireOwnership()` | OK. |
| `GET /api/v1/state/dashboard` | `requireRole('state')` | State scope resolved in controller. |
| `GET /api/v1/state/transfers` | `requireRole('state')` | State scope resolved in controller. |
| `PATCH /api/v1/state/transfers/:id/approve` | `requireRole('state')` | Controller enforces state boundary. |
| `GET /api/v1/state/policy-alerts` | `requireRole('state')` | State scope resolved in controller. |
| `GET /api/v1/systemadmin/dashboard` | Router-level `requireRole('sysadmin')` | OK. |
| `GET /api/v1/systemadmin/pending-approvals` | Router-level `requireRole('sysadmin')` | OK. |
| `PATCH /api/v1/systemadmin/hospitals/:id/approve` | Router-level `requireRole('sysadmin')` | Body manually validated, no route schema. |
| `GET /api/v1/systemadmin/users` | Router-level `requireRole('sysadmin')` | OK. |
| `PATCH /api/v1/systemadmin/users/:id` | Router-level `requireRole('sysadmin')` | Body manually validated, no route schema. |
| `GET /api/v1/systemadmin/audit-logs` | Router-level `requireRole('sysadmin')` | OK. |
| `POST /api/v1/systemadmin/backup` | Router-level `requireRole('sysadmin')` | Shell command injection risk. |

#### CHECK 6 - Logout and Session Invalidation

**Status:** ⚠️ Partial.

Refresh tokens are hashed, stored in DB, and revoked on logout (`backend/controllers/authController.js:64`, `backend/controllers/authController.js:309`). Refresh rejects missing/revoked/expired refresh tokens (`backend/controllers/authController.js:437`).

Access tokens are not invalidated server-side. `requireAuth` only verifies the JWT signature/type and active user status (`backend/middleware/auth.js:38`); there is no access-token blocklist or token version check. After logout, an existing access token remains valid until its expiry window elapses.

### SECTION 2: GENERAL SECURITY (OWASP-STYLE)

#### CHECK 7 - SQL Injection

**Status:** ⚠️ Partial.

Most runtime user data is passed through MySQL placeholders. Dynamic update statements are built from server-side field whitelists, for example donor profile and hospital inventory update paths. The strongest issue is `triggerBackup`, which builds a shell command string from environment values and sends it to `exec` (`backend/controllers/systemAdminController.js:292`, `backend/controllers/systemAdminController.js:297`). If DB env values are compromised or malformed, this can become command injection.

The JSON backup fallback loops over a hardcoded table allowlist (`backend/controllers/systemAdminController.js:303`) and uses dynamic table names (`backend/controllers/systemAdminController.js:311`), which is acceptable only because the table list is static. The Flask AI service uses `%s` placeholders for user-supplied `hospitalId` (`backend/ai/app.py:70`, `backend/ai/app.py:187`).

#### CHECK 8 - XSS

**Status:** ✅ Pass.

No `dangerouslySetInnerHTML` usage was found. User-facing strings such as hospital names/license numbers are rendered through normal JSX text interpolation, so React escaping applies by default. Continue avoiding HTML injection APIs and sanitize any future rich text fields.

#### CHECK 9 - Server-Side Input Validation

**Status:** ⚠️ Partial.

Zod validation is present for many POST/PUT/PATCH bodies (`backend/middleware/validation.js:7`) with enums for blood groups and roles (`backend/middleware/validation.js:115`, `backend/middleware/validation.js:158`, `backend/middleware/validation.js:196`). Gaps remain: system-admin writes manually validate instead of using schemas (`backend/routes/systemAdminRoutes.js:14`, `backend/routes/systemAdminRoutes.js:18`), several GET query parameters are parsed manually, and string length caps are missing for fields like remarks/message/source.

#### CHECK 10 - File Upload Safety

**Status:** ❌ Fail.

Hospital application UI has a license file input and a client-side 5 MB check (`Rakta Setu - React/src/pages/admin/HospitalApplication.jsx:23`, `Rakta Setu - React/src/pages/admin/HospitalApplication.jsx:74`, `Rakta Setu - React/src/pages/admin/HospitalApplication.jsx:320`). No backend upload route, MIME sniffing, server-side size limit, malware scanning, private storage, or non-guessable serving policy was found. The current form simulates submission and stores only `fileName` in frontend state.

#### CHECK 11 - CORS

**Status:** ⚠️ Partial.

CORS is configurable via `CORS_ORIGIN`, but defaults to local dev origins (`backend/server.js:13`). The implementation also explicitly allows `*` if present in the configured list while using credentials (`backend/server.js:21`, `backend/server.js:26`). `.env.example` does not list `CORS_ORIGIN` (`backend/.env.example:1`).

#### CHECK 12 - Secrets in Repo and History

**Status:** ❌ Fail.

Hardcoded/demo credentials exist in env examples (`Rakta Setu - React/.env.example:7`, `Rakta Setu - React/.env.example:18`, `Rakta Setu - React/.env.example:22`, `Rakta Setu - React/.env.example:26`, `Rakta Setu - React/.env.example:30`). The JWT fallback secret is in source and history (`backend/services/jwtService.js:5`). A targeted history scan found commits touching secret/password/default credential strings. A broad history scan was made noisy by tracked `backend/ai/.venv` files, and `git ls-files backend/ai/.venv` confirms the virtualenv is tracked.

`backend/.env` exists in the working tree but is not tracked by `git ls-files`; do not commit it.

#### CHECK 13 - Dependency Vulnerabilities

**Status:** ⚠️ Partial.

Backend `npm audit --audit-level=high --json` completed with 0 high/critical vulnerabilities; it reported 18 moderate dev dependency issues through Jest/js-yaml. Frontend `npm audit --audit-level=high --json` reported one high issue in Vite (`vite: server.fs.deny bypass on Windows alternate paths`) and one low Babel issue. Python auditing could not be completed because neither `pip-audit` nor `safety` was installed under system Python; `backend/ai/requirements.txt` therefore still needs an audited lockfile/tool run.

#### CHECK 14 - HTTPS Readiness

**Status:** ⚠️ Partial.

Frontend API base URL falls back to plaintext localhost (`Rakta Setu - React/src/services/api.js:4`). Node-to-AI calls are hardcoded to `http://localhost:${AI_PORT}` instead of using the existing `AI_SERVICE_URL` example (`backend/controllers/hospitalController.js:874`, `backend/controllers/hospitalController.js:896`, `backend/.env.example:8`). This is acceptable for a private loopback dev path but not sufficient for production multi-service deployment.

Tokens are stored in `localStorage` (`Rakta Setu - React/src/services/api.js:14`), which exposes them to XSS if any future injection lands.

#### CHECK 15 - Error Response Leakage

**Status:** ❌ Fail.

The Express handler suppresses stack traces in production logs but still returns `err.message` to clients for all errors (`backend/middleware/errorHandler.js:25`, `backend/middleware/errorHandler.js:34`). Health checks include raw DB error text (`backend/controllers/healthController.js:25`). Flask AI endpoints return raw exception strings on 500 (`backend/ai/app.py:169`). Production should return generic client messages while logging details server-side.

### SECTION 3: PRODUCTION READINESS

#### CHECK 16 - Environment Config

**Status:** ⚠️ Partial.

Env examples exist for backend and frontend. Backend example is incomplete: code uses `CORS_ORIGIN`, `JWT_ACCESS_EXPIRES_MINUTES`, `JWT_REFRESH_EXPIRES_DAYS`, `OTP_EXPIRES_MINUTES`, `AI_PORT`, `FLASK_ENV`, `FLASK_DEBUG`, and `DB_POOL_SIZE`, but not all are listed (`backend/.env.example:1`). Frontend example contains demo credentials that should not be production env examples (`Rakta Setu - React/.env.example:7`).

#### CHECK 17 - Build Cleanliness

**Status:** ⚠️ Partial.

`npm run build` in `Rakta Setu - React` succeeded. Vite emitted a warning that the generated JS chunk is larger than 500 kB. Backend has distinct `start` and `dev` commands (`backend/package.json:7`, `backend/package.json:8`). Remaining production cleanliness concerns are Vite high audit finding and leftover console/logging of secrets/PII.

#### CHECK 18 - Structured Logging

**Status:** ❌ Fail.

Server logging is scattered `console.log`/`console.error`, not structured JSON/request logs. OTP logging prints phone number and code (`backend/services/otpService.js:46`, `backend/services/otpService.js:48`, `backend/services/otpService.js:50`). Request logging exists only outside production (`backend/server.js:65`) and audit logging only covers selected actions (`backend/middleware/audit.js:5`).

#### CHECK 19 - Schema/Migration Safety

**Status:** ❌ Fail.

`schema.sql` begins by disabling FK checks and dropping all tables (`backend/models/schema.sql:7`, `backend/models/schema.sql:9`). `seed.js` disables FK checks and truncates tables (`backend/seed.js:12`, `backend/seed.js:22`). There is no migration runner or non-destructive migration path for live MySQL 8 data.

#### CHECK 20 - Health Checks

**Status:** ⚠️ Partial.

Node exposes `/api/v1/health` with a DB check (`backend/controllers/healthController.js:3`). Flask exposes `/api/v1/health` with DB status (`backend/ai/app.py:24`). Both can leak raw DB errors in responses (`backend/controllers/healthController.js:27`, `backend/ai/app.py:55`) and should be hardened before public monitoring.

#### CHECK 21 - Graceful Degradation

**Status:** ❌ Fail.

Node AI gateway endpoints throw 502 if Flask is unavailable (`backend/controllers/hospitalController.js:874`, `backend/controllers/hospitalController.js:876`, `backend/controllers/hospitalController.js:896`). The admin forecast UI is currently static mock data and does not consume the gateway (`Rakta Setu - React/src/pages/admin/AIDemandForecast.jsx:8`), so the real degradation path is not implemented. Dashboards may continue because they are mock/local state, but that is not valid production degradation.

### SECTION 4: REGRESSION RECHECK

#### CHECK 22 - Regression Items

**Status:** ❌ Fail.

Mock API references remain in both `Rakta Setu - React/src/services/mockApi.js` and `Rakta Setu - React/src/services/api.js:38`, and hospital pages import/use `mockApi`. No active Google Maps API reference was found; remaining `googleusercontent.com` image URLs are static image assets, not Maps. Unified `/auth/login` is still used by the main login flow (`Rakta Setu - React/src/components/Login.jsx:125`), but mobile OTP login remains mock/local (`Rakta Setu - React/src/components/Login.jsx:166`). Invite-token backend route remains reachable (`backend/routes/authRoutes.js:32`) and frontend staff invite-token pages remain routed/imported (`Rakta Setu - React/src/App.jsx:33`).

## Verification Commands Run

- `rg --files`
- `rg -n "dangerouslySetInnerHTML|innerHTML|document\.write|eval\(|new Function|localStorage|sessionStorage|http://|Google|google|mockApi|invite-token|validate-invite-token|console\.log|debugger" "Rakta Setu - React/src" backend`
- `rg -n "query\(|execute\(" backend/controllers backend/services backend/middleware backend/ai`
- `git log --all -S'super_secret_raktsetu_key_2026' --oneline -- backend/services/jwtService.js`
- `git log --all -G'(JWT_SECRET|DB_PASSWORD|VITE_ADMIN_PASSWORD|admin123|system123|state2026|district123|super_secret)' --oneline -- . ':!backend/ai/.venv' ':!backend_backup' ':!**/package-lock.json'`
- `npm audit --audit-level=high --json` in `backend`
- `npm audit --audit-level=high --json` in `Rakta Setu - React`
- `npm run build` in `Rakta Setu - React`
- `python3 -m pip_audit -r backend/ai/requirements.txt --format json` (failed: module not installed)
- `python3 -m safety check -r backend/ai/requirements.txt --json` (failed: module not installed)
