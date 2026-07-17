# Phase 2 Pre-Deployment Verification

This document provides a pre-deployment inventory and settings checklist for **RaktSetu** prior to deleting the old environments.

---

## 1. Environment Variable Specifications

Below are the exact environment variables that must be configured in each deployment provider dashboard:

### 🟢 Render — Node.js Backend (Web Service)
| Variable | Suggested Value | Description |
|---|---|---|
| `PORT` | `5000` | Port the server listens on |
| `NODE_ENV` | `production` | Enables production logging and optimizations |
| `DB_HOST` | `<aiven-mysql-hostname>` | Hostname from Aiven MySQL console |
| `DB_PORT` | `<aiven-mysql-port>` | Port from Aiven MySQL console (e.g. `24683`) |
| `DB_USER` | `<aiven-mysql-user>` | MySQL user (default `avnadmin`) |
| `DB_PASSWORD` | `<aiven-mysql-password>` | MySQL password |
| `DB_NAME` | `raktsetu` | Database name |
| `DB_SSL` | `true` | Required for Aiven SSL connections |
| `DB_SSL_REJECT_UNAUTHORIZED` | `false` | Bypasses self-signed / custom CA verification |
| `DB_POOL_SIZE` | `30` | MySQL connection limit for primary pool |
| `DB_READ_POOL_SIZE` | `30` | MySQL connection limit for read pool |
| `REDIS_URL` | `<aiven-redis-url>` | Redis URL for caching (optional; system falls back to mock if blank) |
| `JWT_SECRET` | `<secure-32-char-random-string>` | Secret key for access token signing |
| `JWT_REFRESH_SECRET` | `<secure-32-char-random-string>` | Secret key for refresh token signing |
| `JWT_OTP_SECRET` | `<secure-32-char-random-string>` | Secret key for OTP token signing |
| `CORS_ORIGIN` | `https://<yourdomain>.online,https://www.<yourdomain>.online` | Your custom Vercel / Hostinger domain |
| `AI_SERVICE_URL` | `https://<python-service>.onrender.com` | Live Render URL of your Python AI service |
| `INTERNAL_API_SECRET` | `<secure-inter-service-token>` | Secret token for AI service authentication |
| `EMAIL_API_KEY` | `<resend-api-key>` | API key from Resend dashboard |
| `EMAIL_FROM_ADDRESS` | `[email protected]` | Your Resend sending address (requires domain verification) |
| `ALLOW_PRODUCTION_SEED` | `true` | Allows automated DB seed to restore core accounts |

### 🐍 Render — Python AI Service (Web Service)
| Variable | Suggested Value | Description |
|---|---|---|
| `PORT` | `10000` | Render-assigned Web Service port |
| `FLASK_ENV` | `production` | Disables Flask debug mode |
| `DB_HOST` | `<aiven-mysql-hostname>` | Hostname from Aiven MySQL console |
| `DB_PORT` | `<aiven-mysql-port>` | Port from Aiven MySQL console (e.g. `24683`) |
| `DB_USER` | `<aiven-mysql-user>` | MySQL user |
| `DB_PASSWORD` | `<aiven-mysql-password>` | MySQL password |
| `DB_NAME` | `raktsetu` | Database name |
| `DB_SSL` | `true` | Required for Aiven SSL connections |
| `DB_SSL_REJECT_UNAUTHORIZED` | `false` | Bypasses SSL cert verification |
| `INTERNAL_API_SECRET` | `<secure-inter-service-token>` | Shared secret (must match Node backend) |
| `REDIS_URL` | `<aiven-redis-url>` | Redis URL for Celery task queuing (optional) |

### 🌐 Vercel — React Frontend
| Variable | Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://<node-backend-service>.onrender.com/api/v1` | Live Render backend endpoint |
| `VITE_API_BASE_URL` | `https://<node-backend-service>.onrender.com/api/v1` | Redundant base URL endpoint |
| `VITE_FIREBASE_API_KEY` | `<firebase-api-key>` | Web key for SMS authentication |
| `VITE_FIREBASE_AUTH_DOMAIN` | `<project>.firebaseapp.com` | Firebase domain |
| `VITE_FIREBASE_PROJECT_ID` | `<project-id>` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `<project>.appspot.com` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`| `<sender-id>` | Firebase Sender ID |
| `VITE_FIREBASE_APP_ID` | `<app-id>` | Firebase App ID |

---

## 2. `.gitignore` Status Confirmation
*   **Confirmed:** The root `.gitignore` file contains rules blocking `.env`, `.env.local`, `.env.production`, and custom configuration directories (such as `backend/secrets/` and `secrets/`) from being staged or pushed.
*   **Git Status:** The active repository has no secrets or environment files in the index or working tree.

---

## 3. Health-Check Endpoints Verification
*   **Node.js Backend:** The `/health` endpoint is fully functional and returns checking parameters for Database status, Redis status, Flask AI service status, system uptime, and heap memory usage.
*   **Python AI Service:** The `/api/v1/health` endpoint is fully functional, checks the MySQL database connection, and returns status reports.

---

## 4. Build & Start Commands

### Render — Node.js Backend
*   **Base Directory:** `backend`
*   **Build Command:** `npm install`
*   **Start Command:** `node server.js`

### Render — Python AI Service
*   **Base Directory:** `backend/ai`
*   **Build Command:** `pip install -r requirements.txt`
*   **Start Command:** `gunicorn -c gunicorn.conf.py app:app`

### Vercel — React Frontend
*   **Root Directory:** `frontend`
*   **Framework Preset:** `Vite`
*   **Build Command:** `npm run build`
*   **Output Directory:** `dist`

---

## 5. SSL Database Configuration
*   Aiven MySQL requires SSL. 
*   **Node.js connection:** Verified to support SSL when `DB_SSL=true` and `DB_SSL_REJECT_UNAUTHORIZED=false` are set.
*   **Python connection:** Verified (via our SSL update) to pass corresponding `ssl_disabled` and `ssl_verify_cert` parameters to the `mysql.connector` client.

---

## 6. Pre-Deployment Final Checklist

Before deleting any old resources, verify that:
- [x] All 19 unit/integration test suites are passing locally.
- [x] Full registration → login → profile save → location save flow has been validated end-to-end.
- [x] All code fixes have been pushed to the remote GitHub `main` branch.
- [x] You have copy-pasted your current environment secrets (Aiven credentials, Resend API key, Firebase configs) to a secure local notepad so you do not lose them when deleting the old services.

---

### **Phase 2 is complete.** Please confirm when you are ready to proceed with Phase 3 (Delete Old Deployments).
