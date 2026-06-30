# RaktSetu Backend Fix & Audit Report

This report documents the changes implemented for **Part 1 (Mandatory Fixes)** and the results of **Part 2 (Production Readiness Audit)** on the RaktSetu backend.

---

## Part 1: Mandatory Fixes & File References

| Fix | Description | Target Files & Key Lines | Verification Status |
| :--- | :--- | :--- | :---: |
| **Fix 1** | Spatial Index pre-filter utilizing bounding envelope for `GET /emergency/search` and `GET /donor/urgent-requests`. | - [hospitalController.js:525-546](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/hospitalController.js#L525-L546)<br>- [donorController.js:337-353](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/donorController.js#L337-L353) | ✅ Pass |
| **Fix 2** | Direct staff creation via `POST /hospital/staff` setting `must_change_password` and rejecting spoofed `hospitalId`. Added `POST /auth/change-password` for rotation. | - [schema.sql:75](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/models/schema.sql#L75)<br>- [hospitalController.js:1051-1067](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/hospitalController.js#L1051-L1067)<br>- [authController.js:487-522](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/authController.js#L487-L522)<br>- [authRoutes.js:45](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/routes/authRoutes.js#L45) | ✅ Pass |
| **Fix 3** | Cross-district transfer approval logging to `audit_logs` inside the database transaction context. | - [adminController.js:638-695](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/controllers/adminController.js#L638-L695) | ✅ Pass |
| **Fix 4** | Audited usage of `requireOwnership` middleware in routes. | - [hospitalRoutes.js:42,43,55,66](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/routes/hospitalRoutes.js#L42)<br>- [adminRoutes.js:17-24](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/routes/adminRoutes.js#L17) | ✅ Pass (Already correctly applied) |

---

## Part 2: Production Readiness Audit Findings

1. **Secrets & Env Variables:** 
   - Config is fully environment-driven. No secrets are committed in source files. `.env.example` lists all parameters.
2. **Inter-Service Security:**
   - Enforced inter-service authentication using `X-Internal-Token` headers. The Node.js API Gateway passes the token to the Python/Flask Prophet AI microservice, which validates it via a new `@app.before_request` hook on all endpoints (excluding health checks).
3. **ABHA/ABDM Sandbox Credentials:**
   - Checked all configuration files. No committed ABDM/ABHA sandboxed credentials or certificates exist in git.
4. **Auth Brute-Force Protection:**
   - verified `loginRateLimiter`, `sendOtpRateLimiter`, and `verifyOtpRateLimiter` are applied to auth routes. These limits (e.g. 5 attempts / 15 mins) are appropriately tight and separate from the global API limiter.
5. **In-Memory State Scaling Limitations (Flagged for Production):**
   - **`idempotencyKeys` Map** and **`forecastCache`** in `hospitalController.js` are in-process memory caches.
   - **Production Risk:** These will silently lose data on restarts and be inconsistent across multiple load-balanced core service instances.
   - **Recommendation:** Swap in a Redis or database-backed store before horizontal scaling in production.
6. **Parameterized Queries:**
   - Verified all queries (including new spatial bounding-box checks) use parameterized placeholders (`?`), preventing SQL injection.
7. **Centralized Error Handling:**
   - Centralized Express `errorHandler` handles standard errors and hides internal 500 error details from clients in production.
8. **Logging Hygiene:**
   - Audited logs. No user passwords, OTPs, or session tokens are logged.
9. **Security Headers:**
   - Installed `helmet` package and applied it globally in `server.js`.
10. **Dependency Vulnerability Audits:**
    - **Node:** `npm audit` returned 1 moderate vulnerability (`js-yaml`). Patched.
    - **Flask:** `pip-audit` returned 19 vulnerabilities in 8 dependency packages (mostly `setuptools`, `pillow`, `urllib3`, and `requests`).
    - *Recommendation:* Upgrade these dependencies in virtual environments before deploying to staging/production.
11. **CORS Production Origins:**
    - verified that CORS configuration defaults to safe local ports in dev, but strictly requires `CORS_ORIGIN` variable definition when `NODE_ENV === 'production'`.
12. **Health Endpoints:**
    - Both Node (`/health`) and Flask (`/api/v1/health`) expose standard health check paths suitable for liveness/readiness probes.

---

## Open Questions / Product Decisions for Chinmay

1. **Staff Onboarding Flow Consolidation:**
   - The token invitation onboarding (`validate-invite-token` + `set-password`) and direct staff creation onboarding (`POST /hospital/staff` + `change-password` rotation) overlap. Recommend standardizing on one unified approach before production.

---

## Verification Summary

All 19 Jest integration tests pass cleanly:
```bash
PASS  tests/auth.test.js
PASS  tests/transfers.test.js
PASS  tests/emergency.test.js

Test Suites: 3 passed, 3 total
Tests:       19 passed, 19 total
Snapshots:   0 total
```
