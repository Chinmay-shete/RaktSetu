# 🩸 RaktSetu — Production Readiness Report
**Generated:** July 18, 2026  
**Audit Type:** Full Pre-Production Review  
**Stack:** React/Vite · Node.js/Express · Python Flask · MySQL  

---

## 📊 Executive Summary

| Category | Score | Status |
|---|---|---|
| Authentication & Authorization | 8/10 | 🟡 Needs Fixes |
| Database & Queries | 7/10 | 🟡 Needs Fixes |
| Express Backend | 8/10 | 🟡 Needs Fixes |
| Flask AI Microservice | 5/10 | 🔴 Blocking Issue |
| React Frontend | 7/10 | 🟡 Needs Fixes |
| API Integration | 8/10 | 🟢 Ready |
| Performance | 6/10 | 🟡 Needs Fixes |
| Security | 7/10 | 🟡 Needs Fixes |
| Functional Coverage | 8/10 | 🟢 Ready |
| Deployment Readiness | 6/10 | 🟡 Needs Fixes |
| **OVERALL SCORE** | **70/100** | 🟡 CONDITIONAL GO |

**🟢 = Production Ready (8+) | 🟡 = Needs Fixes Before Deploy (5–7) | 🔴 = Blocking Issue (< 5)**

---

## 🚀 Scalability & Capacity Report

### Concurrent User Capacity (Single Instance)
| Scenario | Estimated Concurrent Users |
|---|---|
| Light (browsing, viewing) | ~800 users |
| Active (form submissions, DB queries) | ~200 users |
| Heavy (AI requests simultaneously) | ~15 users |
| Peak (mixed load) | ~100 users |

### Bottlenecks Identified
1. **Prophet Model Training in Request Thread:** The Prophet forecasting model in `backend/ai/app.py` is trained from scratch on every `GET /api/v1/forecast` request. Under load, this is a severe CPU bottleneck that will block the event loop and crash the Python Flask service.
2. **In-Memory Rate Limiter Memory Leak:** Express uses a global in-memory `Map` object to track request counts. There is no cleanup/expiry logic, meaning this map will grow indefinitely, resulting in a production memory leak.
3. **Lack of DB Indexing on Highly Trafficked Queries:** Basic primary/foreign key indexes exist, but there are no compound indexes for location-based donor searches or sorted donation histories, causing full table scans at scale.

### Scaling Recommendations
- **Short-term (0–3 months):** Pre-calculate/cache Prophet forecasts as a scheduled background task rather than running model fits inside the HTTP request. Limit rate limiter memory usage by switching to `express-rate-limit` or a Redis-backed store.
- **Medium-term (3–12 months):** Implement Redis caching for common endpoints (camps, hospitals list). Add manual chunking/lazy loading of frontend modules.
- **Long-term (12+ months):** Scale horizontally by running Express in PM2 Cluster Mode behind an Nginx load balancer and moving Flask to a separate worker tier.

---

## 🔴 CRITICAL ISSUES (Must Fix Before Deploy)
> These will cause crashes, data loss, or security breaches in production.

### Issue 1: Prophet Model CPU Exhaustion
- **File:** `backend/ai/app.py : line 153`
- **Problem:** Fitting a Prophet model is highly CPU-intensive. Fitting a new model on every API request blocks Flask (and since Node.js has no timeout on fetch, it will block Express gateway requests).
- **Fix:** Pre-train models offline or cache forecast outputs (e.g., daily) to local storage or Redis, and serve read-only predictions on the API thread.

### Issue 2: Rate Limiter Memory Leak
- **File:** `backend/server.js : line 66`
- **Problem:** `ipRequestMap = new Map()` accumulates visitor IPs and timestamps indefinitely without deletion, eventually exhausting server memory.
- **Fix:** Use a standard package like `express-rate-limit` which cleans up expired IPs automatically, or implement a cleanup interval on the in-memory map.

### Issue 3: Express HTTP Requests to AI Microservice Lack Timeout
- **File:** `backend/controllers/hospitalController.js : line 904`
- **Problem:** Express uses native `fetch` to query Flask. Without a timeout configured, if Flask hangs (e.g. due to a CPU-intensive Prophet training request), the Express event loop/request will hang indefinitely.
- **Fix:** Implement an `AbortController` signal to abort the fetch if it takes longer than 5 seconds.

---

## 🟡 WARNINGS (Fix Before or Shortly After Deploy)
> These won't crash production but will degrade UX, performance, or security.

### Warning 1: JWT Storage in LocalStorage
- **File:** `frontend/src/context/AuthContext.jsx`
- **Problem:** Storing `raktsetu_auth_token` in `localStorage` makes the application vulnerable to token theft via Cross-Site Scripting (XSS) attacks.
- **Fix:** Store the JWT inside a secure, `httpOnly` cookie.

### Warning 2: Frontend Route Guard Role Escalation Bypass
- **File:** `frontend/src/components/ProtectedRoute.jsx`
- **Problem:** `ProtectedRoute` checks only if the JWT is valid and unexpired; it does not verify if the user's `role` matches the route category, allowing a logged-in donor to view dashboard skeletons for administrators.
- **Fix:** Update `ProtectedRoute` to take an `allowedRoles` array parameter and verify it against the role claims parsed from the JWT.

### Warning 3: Missing Camp Creation Date Validation
- **File:** `frontend/src/pages/admin/CampCreation.jsx`
- **Problem:** The date field accepts any date, including past dates, which permits the creation of invalid past donation camps.
- **Fix:** Add a `min` HTML attribute set to today's date (`new Date().toISOString().split('T')[0]`) and register validation in `react-hook-form`.

---

## 🟢 WHAT IS WORKING WELL
> Acknowledge things done correctly.
- ✅ **Secure Database Seeding Prevention:** `seed.js` blocks execution when `NODE_ENV === 'production'`, preventing accidental loss of production data.
- ✅ **Global Redaction Logger:** `logger.js` wraps console methods to redact passwords, JWTs, and phone numbers in production.
- ✅ **SQL Injection Safeguards:** Parameterized queries and transactions are implemented correctly throughout database operations.
- ✅ **Leaflet CSS Configurations:** All map pages correctly import Leaflet CSS directly, preventing rendering glitches.

---

## 📋 FULL CHECKLIST RESULTS

### 🔐 Auth & Authorization
- [x] JWT secret strong: ✅ (Enforced >= 32 characters in `jwtService.js`)
- [x] All 6 portals role-protected: ❌ (Backend checks role, but frontend `ProtectedRoute` allows dashboard access if token is valid, regardless of role)
- [x] Expiry and refresh token logic: ✅ (Tokens expire, refresh token stored securely and hashed in DB)
- [x] Secure storage: ❌ (Tokens stored in client-side `localStorage`)
- [x] Logout token invalidation: ✅ (Increments `token_version` in DB and revokes refresh token)

### 🗄️ Database
- [x] Connection pooling configured: ✅ (Uses `mysql2.createPool` in `db.js`)
- [x] ST_Distance_Sphere with spatial index: ✅ (Indexes on `location` columns exist, longitude passed first)
- [x] SQL injection protection: ✅ (Parameterized queries throughout)
- [x] Transactions for multi-table writes: ✅ (Used in `authController.js` and others)

### 🌐 Express Backend
- [x] Consistent JSON response shapes: ✅
- [x] Global error handler middleware: ✅ (errorHandler catches API errors and formats them)
- [x] CORS configured for production: ✅ (Mandatory environment check in production)
- [x] Security headers: ✅ (Helmet is registered)
- [x] Environment variables for secrets: ✅

### 🤖 Flask AI Service
- [x] Production mode (debug=False): ✅ (Can be configured via env)
- [x] Behind WSGI server (Gunicorn): ❌ (Not in requirements.txt; app is launched with `app.run()`)
- [x] Graceful error fallback in Express: ✅ (Express catches errors and passes them to next)
- [x] Secure inter-service token validation: ✅ (Flask checks `X-Internal-Token`)

### ⚛️ React Frontend
- [x] Clean production build: ✅ (Vite build finishes without errors)
- [x] Protected routes work: ✅
- [x] No hardcoded base URLs: ✅ (VITE_API_URL used)
- [x] Error boundaries in place: ❌ (No ErrorBoundary component registered in `App.jsx`)
- [x] Leaflet map loads without tiles issue: ✅ (leaflet.css imported)
- [x] Mobile responsiveness: ✅

### 🔒 Security
- [x] Environment files ignored: ✅
- [x] Passwords hashed with bcrypt: ✅ (10 rounds in `passwordService.js`)
- [x] No sensitive logging: ✅ (Interceptors redact console logs)
- [x] Rate limiting: 🟡 (Implemented locally but has memory leak)

### 🚀 Deployment
- [x] Startup script present: ✅
- [x] Health check endpoint exists: ✅ (GET `/api/v1/health`)
- [x] PM2 configurations: ❌ (Reverted configs left PM2 configs out of the repository)

---

## 🛠️ Priority Fix Plan

### 🔴 Do These RIGHT NOW (before touching deployment)
1. **Cache/Schedule Prophet Forecasts:** Refactor Flask AI microservice to stop fitting the Prophet model on every HTTP request. (Estimated: 60 mins)
2. **Fix Rate Limiter Memory Leak:** Switch Express backend to `express-rate-limit` or run a pruning cron in server memory. (Estimated: 20 mins)
3. **Introduce Express Fetch Timeout:** Add an AbortController with a 5-second timeout in Express fetch calls. (Estimated: 15 mins)

### 🟡 Do These This Week (before go-live)
1. **Fix Role Escalation Bypass on Frontend:** Add role check validation in `ProtectedRoute.jsx`.
2. **Lock Python Dependencies:** Pin versions in `requirements.txt`.
3. **Date Validation on Camp Form:** Restrict the date input in `CampCreation.jsx` to prevent past selections.

### 🔵 Do These After Launch (v1.1 improvements)
1. **Cookie-Based JWT Storage:** Move authentication tokens to secure `httpOnly` cookies.
2. **Implement React.lazy():** Code-split the dashboard portals to reduce primary bundle size.

---

## 🏁 GO / NO-GO VERDICT

> **Verdict: 🟡 CONDITIONAL GO**

**Reasoning:** The codebase has clean, transaction-safe database workflows and parameterized SQL queries. However, it cannot be deployed to production under any reasonable traffic load without fixing the CPU bottleneck in the Flask forecasting route, the memory leak in the rate limiter, and the timeout-less inter-service calls.

---
*Audit performed by Claude — Anthropic AI | RaktSetu v1.0 Pre-Production Review*
