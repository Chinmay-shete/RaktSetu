# 🩸 RaktSetu — Backend Readiness & Project Analysis Report
> **Generated:** June 21, 2026  
> **Author:** Antigravity AI (Code Assistant)  
> **Purpose:** Full audit of the frontend before backend development begins — bugs, architecture gaps, recommendations, and a structured roadmap.

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [What the Frontend Has (Completed)](#2-what-the-frontend-has-completed)
3. [Bugs & Code Mistakes Found in the Frontend](#3-bugs--code-mistakes-found-in-the-frontend)
4. [Architecture Gaps (Things Missing Before Backend)](#4-architecture-gaps-things-missing-before-backend)
5. [Backend Architecture Recommendations](#5-backend-architecture-recommendations)
6. [Database Schema Design](#6-database-schema-design)
7. [API Endpoint Map (All 6 Roles)](#7-api-endpoint-map-all-6-roles)
8. [Authentication Strategy](#8-authentication-strategy)
9. [Frontend → Backend Integration Checklist](#9-frontend--backend-integration-checklist)
10. [Phased Backend Roadmap](#10-phased-backend-roadmap)
11. [Summary](#11-summary)

---

## 1. Project Overview

**RaktSetu** ("Blood Bridge") is an AI-powered blood supply management platform for India. It sits between `eRaktKosh` (government stock search) and hospitals, adding:
- Predictive AI demand forecasting
- Cross-hospital expiry transfer alerts
- Real-time emergency blood routing
- District-level shortage heatmaps

### The 6-Role System

| # | Role | Color | Access Method | Frontend Status |
|---|---|---|---|---|
| 1 | 🩸 Blood Donor | Red | Phone OTP / Google OAuth | ✅ Built |
| 2 | 🏥 Hospital Staff | Blue | Invite link from Hospital Admin | ✅ Built |
| 3 | 🔧 Hospital Admin | Green | Register → 48h approval | ✅ Built |
| 4 | 📊 District Officer | Yellow | `.gov.in` email + call | ✅ Built |
| 5 | 🏛️ State Admin | Purple | Government nomination | ✅ Built |
| 6 | ⚙️ System Admin | Grey | Internal invite + MFA | ✅ Built |

### Tech Stack (Frontend — Current)

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | React Router DOM v7 |
| Styling | TailwindCSS v4 + Custom CSS |
| Animations | Framer Motion |
| Charts | Recharts + Chart.js |
| Icons | Lucide React |
| Forms | React Hook Form |
| State | React Context (per role) |
| Data Fetching | TanStack React Query v5 |
| API (Mock) | localStorage-based `mockApi.js` |
| HTTP Client | Axios (installed, not yet used for real APIs) |

---

## 2. What the Frontend Has (Completed)

### ✅ Public / Donor Routes
| Route | Component | Status |
|---|---|---|
| `/` | LandingPage | ✅ Done |
| `/register-donor` | DonorRegistration | ✅ Done (OTP mock with `123456`) |
| `/profile-setup` | ProfileSetup | ✅ Done |
| `/location` | LocationPage | ✅ Done |
| `/dashboard` | Donor Dashboard | ✅ Done |
| `/edit-profile` | EditProfile | ✅ Done |
| `/find-camps` | FindCamps | ✅ Done |
| `/privacy` | PrivacyPolicy | ✅ Done |
| `/terms` | TermsOfService | ✅ Done |

### ✅ Hospital Staff Routes
| Route | Component | Status |
|---|---|---|
| `/staff/login` | Login | ✅ Done |
| `/staff/token/:token` | InviteToken | ✅ Done |
| `/staff/set-password/:token` | SetPassword | ✅ Done |
| `/staff/dashboard` | HospitalDashboard | ✅ Done |
| `/staff/inventory` | BloodInventory | ✅ Done |
| `/staff/update-stock` | UpdateStock | ✅ Done |
| `/staff/expiry-alerts` | ExpiryAlerts | ✅ Done |
| `/staff/transfer-request` | TransferRequests | ✅ Done |
| `/staff/analytics` | Analytics | ✅ Done |
| `/staff/invite` | InviteStaff | ✅ Done |

### ✅ Hospital Admin Routes
| Route | Component | Status |
|---|---|---|
| `/admin/login` | AdminLogin | ✅ Done |
| `/admin/register` | HospitalApplication | ✅ Done |
| `/admin/dashboard` | AdminDashboard | ✅ Done |
| `/admin/invite-staff` | InviteStaffAdmin | ✅ Done |
| `/admin/forecast` | AIDemandForecast | ✅ Done |
| `/admin/waste` | WasteAnalytics | ✅ Done |
| `/admin/thresholds` | AlertThresholds | ✅ Done |

### ✅ District Officer Routes
| Route | Component | Status |
|---|---|---|
| `/district/login` | DistrictLogin | ✅ Done |
| `/district/dashboard` | DistrictDashboard | ✅ Done |
| `/district/map` | DistrictMap | ✅ Done |
| `/district/alerts` | DistrictAlerts | ✅ Done |
| `/district/camps` | CampApprovals | ✅ Done |
| `/district/reports` | DistrictReports | ✅ Done |
| `/district/hospitals` | HospitalRegistry | ✅ Done |

### ✅ State Admin Routes
| Route | Component | Status |
|---|---|---|
| `/state/login` | StateAdminLogin | ✅ Done |
| `/state/dashboard` | StateAdminDashboard | ✅ Done |
| `/state/transfers` | CrossDistrictTransfers | ✅ Done |
| `/state/waste` | WasteKPIs | ✅ Done |
| `/state/alerts` | PolicyAlerts | ✅ Done |
| `/state/reports` | DistrictOfficerReports | ✅ Done |
| `/state/funding` | FundingRecommendations | ✅ Done |

### ✅ System Admin Routes
| Route | Component | Status |
|---|---|---|
| `/systemadmin/login` | SystemAdminLogin | ✅ Done |
| `/systemadmin/dashboard` | SystemAdminDashboard | ✅ Done |
| `/systemadmin/approvals` | PendingApprovals | ✅ Done |
| `/systemadmin/users` | UserManagement | ✅ Done |
| `/systemadmin/audit-logs` | AuditLogs | ✅ Done |
| `/systemadmin/settings` | SystemSettings | ✅ Done |

> **Verdict: The frontend is 100% structurally complete.** All 6 roles, all pages, and all routes are built. The data is mock-only (localStorage). Backend integration is the next step.

---

## 3. Bugs & Code Mistakes Found in the Frontend

> [!CAUTION]
> Fix these BEFORE wiring the real backend. They will cause runtime crashes in production.

### 🔴 BUG #1 — React Rules of Hooks Violation (`HospitalLayout.jsx`)

**Severity:** Critical — Causes runtime crash  
**File:** `src/layouts/HospitalLayout.jsx`

**Problem:** A `useQuery` hook is called *after* an early return (conditional render). React requires hooks to be called in the same order on every render. If `isAuthenticated` is false, the hook is skipped, corrupting React's internal hook chain.

```jsx
// ❌ WRONG — Current Code
if (!isAuthenticated) {
  return <Navigate to="/staff/login" replace />;
}
const { data: inventory } = useQuery({ ... }); // Hook called conditionally!
```

```jsx
// ✅ CORRECT — Fix
const { data: inventory } = useQuery({
  queryKey: ['inventory'],
  queryFn: mockApi.getInventory,
  enabled: isAuthenticated, // Only fetches when authenticated
});

if (!isAuthenticated) {
  return <Navigate to="/staff/login" replace />;
}
```

---

### 🔴 BUG #2 — Emergency Badge Hardcoded to Zero (`HospitalLayout.jsx`)

**Severity:** High — Shows wrong data to users  
**Impact:** Staff will never see emergency alert count badges

```jsx
// ❌ WRONG — Hardcoded
const badges = { expiry: expiryCount, emergency: 0 };

// ✅ CORRECT
const { data: emergencies = [] } = useQuery({
  queryKey: ['emergencies'],
  queryFn: mockApi.getEmergencyRequests,
  enabled: isAuthenticated
});
const emergencyCount = emergencies.filter(e => e.status === 'Pending').length;
const badges = { expiry: expiryCount, emergency: emergencyCount };
```

---

### 🟡 BUG #3 — 51 ESLint Errors (Unused Imports + Variables)

**Severity:** Medium — Causes build warnings, increases bundle size  
**Files Affected:**

| File | Unused Imports |
|---|---|
| `Dashboard.jsx` | `React`, `Flame`, `Settings` |
| `ExpiryAlerts.jsx` | `React`, `AlertTriangle`, `Clock` |
| `InviteToken.jsx` | `Link`, `Loader2`, `error` variable |
| `SetPassword.jsx` | `Link`, `error` variable (×2) |
| `BloodInventory.jsx` | `Filter` |
| `UpdateStock.jsx` | `HeartHandshake` |
| `TransferRequests.jsx` | `AlertCircle`, `errors` |

**Fix:** Run `npm run lint` and remove all flagged unused imports one by one.

---

### 🟡 BUG #4 — React Compiler Memoization Warnings (`SetPassword.jsx`, `UpdateStock.jsx`)

**Severity:** Medium — Performance degradation on form pages  

`watch()` from React Hook Form forces a re-render on every keystroke, blocking React 19's compiler optimizations.

```jsx
// ❌ Causes re-render on every keystroke
const password = watch("password");

// ✅ Better — useWatch targets only one field
import { useWatch } from 'react-hook-form';
const password = useWatch({ control, name: "password" });
```

---

### 🟡 BUG #5 — `package.json` Name Typo

**Severity:** Low — Cosmetic but unprofessional  
**File:** `package.json` (line 2)

```json
// ❌ Wrong
"name": "racktsetu",

// ✅ Correct
"name": "raktsetu",
```

---

### 🟡 BUG #6 — `@tailwindcss/postcss` Listed in Both `dependencies` and `devDependencies`

**Severity:** Low — Causes npm warnings  
**File:** `package.json`

`@tailwindcss/postcss` and `autoprefixer` and `postcss` appear in BOTH `dependencies` and `devDependencies`. These are build tools and should only be in `devDependencies`.

---

### 🟡 BUG #7 — Random Distance Simulation in Transfer Requests

**Severity:** Medium — Incorrect logic in production scenario  
**File:** `src/pages/hospital/requests/TransferRequests.jsx`

```jsx
// ❌ Distance is random, not calculated
distance: parseFloat((Math.random() * 8 + 2).toFixed(1))
```

When connected to a real backend, distances must be calculated using the GPS coordinates of registered hospitals via PostGIS or Google Maps Distance Matrix API.

---

### 🟡 BUG #8 — All Auth is Mock (localStorage-only, No Real JWT Verification)

**Severity:** High (for production) — Currently acceptable for demo  
**Files:** `AuthContext.jsx`, `DistrictContext.jsx`, `SystemAdminContext.jsx`, etc.

All login logic uses hardcoded credentials (e.g., `admin123`, `district123`) stored in localStorage. There is no real JWT validation, no token expiry, and no refresh token mechanism. This must be replaced entirely by the real backend auth system.

---

## 4. Architecture Gaps (Things Missing Before Backend)

### ❌ GAP #1 — No Route Guards (Protected Routes)

Currently any user can navigate to `/admin/dashboard` or `/systemadmin/dashboard` directly in the browser without logging in. There are no real route guards.

**Fix Required:** Create a `<ProtectedRoute>` component that checks a verified JWT token (from the real backend) before allowing access.

```jsx
// Needed: ProtectedRoute.jsx
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;
  return children;
};
```

---

### ❌ GAP #2 — No 404 / Unauthorized Page

There is no catch-all `*` route and no `/unauthorized` page. Any invalid URL crashes the app silently.

**Fix Required:** Add `<Route path="*" element={<NotFound />} />` and a `/unauthorized` page.

---

### ❌ GAP #3 — No Global Error Boundary

If any component throws an error, the entire app crashes. There is no React Error Boundary.

**Fix Required:** Wrap the app in an `ErrorBoundary` component.

---

### ❌ GAP #4 — Axios Not Configured (Installed But Unused)

`axios` is installed but the codebase uses localStorage mock functions. No Axios instance with base URL, interceptors, or auth headers is configured.

**Fix Required Before Backend:**

```js
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('raktsetu_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // Logout and redirect to login
    }
    return Promise.reject(err);
  }
);

export default api;
```

---

### ❌ GAP #5 — No Environment Variables File

The frontend has no `.env` file. All API base URLs, Firebase keys, and Google Maps keys must go in environment variables before backend integration.

**Fix Required:** Create `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_GOOGLE_MAPS_KEY=your_maps_key
```

---

### ❌ GAP #6 — No Centralized Toast / Notification System for API Errors

Toast notifications exist but are only wired for mock actions. When real API calls fail (network error, 500, 401), there is no global handler to show the user a meaningful message.

---

### ❌ GAP #7 — `RacktSetu/` Nested Folder (Git Cleanup Needed)

The repo has a triple-nested structure (`RaktSetu/RacktSetu/RacktSetu/`). The `node_modules` was accidentally committed. This creates a messy GitHub history and confuses collaborators.

**Fix Required (Before first backend commit):**
```bash
git rm -r --cached RacktSetu/
git rm -r --cached node_modules/
echo "RacktSetu/" >> .gitignore
echo "node_modules/" >> .gitignore
git commit -m "chore: remove nested folder and node_modules from git tracking"
```

---

## 5. Backend Architecture Recommendations

### Recommended Stack

| Layer | Technology | Why |
|---|---|---|
| **Runtime** | Node.js v20+ | JavaScript ecosystem matches the React frontend |
| **Framework** | Express.js (or Fastify) | Lightweight, well-documented, large community |
| **Database** | PostgreSQL (with PostGIS) | Handles geospatial queries for emergency blood search |
| **ORM** | Prisma | Type-safe, auto-generates DB client, easy migrations |
| **Auth** | Firebase Auth (Phone OTP for donors) + JWT (all other roles) | Free OTP tier (10K/month), industry standard |
| **SMS** | Twilio / MSG91 | WhatsApp API + SMS for India |
| **File Storage** | AWS S3 / Cloudinary | Hospital registration documents |
| **Caching** | Redis | Cache blood stock summaries, rate limiting |
| **Search/Geo** | PostGIS (PostgreSQL extension) | `ST_DWithin` for radius search |
| **AI/ML** | Python Flask (separate microservice) | Prophet forecasting model |
| **Email** | Nodemailer + SendGrid | Approval emails, invite links |
| **Deployment** | Railway / Render (MVP) → AWS EC2 (production) | Simple, free tier available |
| **Monitoring** | Sentry (errors) + Uptime Robot (availability) | Free tier available |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     REACT FRONTEND (Vite)                    │
│        6 Role Portals — All pages built, mock data           │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS (REST API)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              NODE.JS + EXPRESS API SERVER                    │
│  Routes: /api/v1/auth | /donors | /hospitals | /inventory   │
│           /transfers | /camps | /district | /state           │
│  Middleware: JWT Auth, RBAC, Rate Limiting, CORS             │
└────────────┬────────────────────────────┬────────────────────┘
             │                            │
    ┌────────▼────────┐       ┌───────────▼──────────┐
    │   PostgreSQL     │       │   Redis Cache         │
    │   + PostGIS      │       │   (Stock summaries,   │
    │   (Primary DB)   │       │    Rate limits)       │
    └────────┬────────┘       └──────────────────────┘
             │
    ┌────────▼────────┐       ┌──────────────────────┐
    │  Python/Flask   │       │   Firebase Auth       │
    │  AI Microservice│       │   (Donor OTP/OAuth)   │
    │  (Prophet)      │       └──────────────────────┘
    └─────────────────┘
```

---

## 6. Database Schema Design

### `donors` Table

```sql
CREATE TABLE donors (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone          VARCHAR(15) UNIQUE NOT NULL,         -- Primary login identity
  firebase_uid   VARCHAR(128) UNIQUE,                  -- Firebase Auth UID
  full_name      VARCHAR(100) NOT NULL,
  age            SMALLINT NOT NULL CHECK (age BETWEEN 18 AND 65),
  gender         VARCHAR(10) NOT NULL,                 -- Male, Female, Other
  blood_group    VARCHAR(5) NOT NULL,                  -- O+, O-, A+, A-, B+, B-, AB+, AB-
  city           VARCHAR(100),
  pincode        VARCHAR(6),
  lat            DECIMAL(9,6),
  lng            DECIMAL(9,6),
  location       GEOGRAPHY(POINT, 4326),               -- PostGIS column
  weight_ok      BOOLEAN NOT NULL DEFAULT TRUE,
  chronic_illness BOOLEAN NOT NULL DEFAULT FALSE,
  last_donated   DATE,
  eligible_on    DATE,                                 -- Computed: last_donated + 90 days
  available      BOOLEAN NOT NULL DEFAULT TRUE,        -- Availability toggle
  notify_emergency BOOLEAN DEFAULT TRUE,
  notify_camp    BOOLEAN DEFAULT TRUE,
  notify_channel VARCHAR(10) DEFAULT 'both',           -- whatsapp, sms, both
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_donors_blood_group ON donors(blood_group);
CREATE INDEX idx_donors_location ON donors USING GIST(location);
```

### `users` Table (Hospital Staff, Admin, District, State, System Admin)

```sql
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  full_name      VARCHAR(100) NOT NULL,
  role           VARCHAR(20) NOT NULL CHECK (role IN ('staff','admin','district','state','sysadmin')),
  hospital_id    UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  district       VARCHAR(100),
  state          VARCHAR(100),
  is_active      BOOLEAN DEFAULT TRUE,
  mfa_enabled    BOOLEAN DEFAULT FALSE,
  last_login     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_hospital ON users(hospital_id);
```

### `hospitals` Table

```sql
CREATE TABLE hospitals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(200) NOT NULL,
  registration_no  VARCHAR(100) UNIQUE NOT NULL,
  type             VARCHAR(20) DEFAULT 'private',    -- govt, private, trust
  address          TEXT NOT NULL,
  city             VARCHAR(100),
  district         VARCHAR(100),
  state            VARCHAR(100),
  pincode          VARCHAR(6),
  lat              DECIMAL(9,6),
  lng              DECIMAL(9,6),
  location         GEOGRAPHY(POINT, 4326),
  contact_phone    VARCHAR(15),
  contact_email    VARCHAR(255),
  license_number   VARCHAR(100),
  blood_bank_id    VARCHAR(100),
  status           VARCHAR(20) DEFAULT 'pending',   -- pending, approved, rejected, suspended
  admin_id         UUID REFERENCES users(id),
  approved_at      TIMESTAMPTZ,
  approved_by      UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_hospitals_status ON hospitals(status);
CREATE INDEX idx_hospitals_location ON hospitals USING GIST(location);
CREATE INDEX idx_hospitals_district ON hospitals(district);
```

### `blood_inventory` Table

```sql
CREATE TABLE blood_inventory (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id      UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  blood_group      VARCHAR(5) NOT NULL,
  units            INTEGER NOT NULL CHECK (units >= 0),
  reserved_units   INTEGER NOT NULL DEFAULT 0,
  collection_date  DATE NOT NULL,
  expiry_date      DATE NOT NULL,
  source           VARCHAR(50),                     -- Voluntary, Replacement, Transfer
  status           VARCHAR(20) DEFAULT 'available', -- available, reserved, expiring_soon, expired
  batch_code       VARCHAR(100) UNIQUE,
  remarks          TEXT,
  added_by         UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_inventory_hospital ON blood_inventory(hospital_id);
CREATE INDEX idx_inventory_blood_group ON blood_inventory(blood_group);
CREATE INDEX idx_inventory_expiry ON blood_inventory(expiry_date);
CREATE INDEX idx_inventory_status ON blood_inventory(status);
```

### `blood_stock_summary` Table (Materialized View / Cached Aggregate)

```sql
CREATE TABLE blood_stock_summary (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id  UUID NOT NULL REFERENCES hospitals(id),
  blood_group  VARCHAR(5) NOT NULL,
  total_units  INTEGER NOT NULL DEFAULT 0,
  reserved     INTEGER NOT NULL DEFAULT 0,
  available    INTEGER GENERATED ALWAYS AS (total_units - reserved) STORED,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hospital_id, blood_group)
);
```

### `transfer_requests` Table

```sql
CREATE TABLE transfer_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_hospital_id  UUID NOT NULL REFERENCES hospitals(id),
  to_hospital_id    UUID NOT NULL REFERENCES hospitals(id),
  blood_group       VARCHAR(5) NOT NULL,
  units_requested   INTEGER NOT NULL,
  units_dispatched  INTEGER,
  priority          VARCHAR(20) DEFAULT 'medium',   -- low, medium, high, critical
  status            VARCHAR(20) DEFAULT 'pending',  -- pending, accepted, rejected, completed, cancelled
  message           TEXT,
  idempotency_key   VARCHAR(200) UNIQUE,             -- Prevents duplicate transfers
  requested_by      UUID REFERENCES users(id),
  responded_by      UUID REFERENCES users(id),
  responded_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_transfers_status ON transfer_requests(status, created_at);
CREATE INDEX idx_transfers_from ON transfer_requests(from_hospital_id);
CREATE INDEX idx_transfers_to ON transfer_requests(to_hospital_id);
```

### `donation_camps` Table

```sql
CREATE TABLE donation_camps (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(200) NOT NULL,
  organizer_id   UUID NOT NULL REFERENCES users(id),
  hospital_id    UUID REFERENCES hospitals(id),
  district       VARCHAR(100),
  address        TEXT NOT NULL,
  lat            DECIMAL(9,6),
  lng            DECIMAL(9,6),
  location       GEOGRAPHY(POINT, 4326),
  date           DATE NOT NULL,
  start_time     TIME NOT NULL,
  end_time       TIME,
  capacity       INTEGER,
  status         VARCHAR(20) DEFAULT 'upcoming',   -- upcoming, active, completed, cancelled
  approved_by    UUID REFERENCES users(id),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_camps_location ON donation_camps USING GIST(location);
CREATE INDEX idx_camps_date ON donation_camps(date);
```

### `audit_log` Table

```sql
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name  VARCHAR(50) NOT NULL,
  record_id   UUID,
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(10) NOT NULL,               -- INSERT, UPDATE, DELETE
  old_value   JSONB,
  new_value   JSONB,
  ip_address  INET,
  user_agent  TEXT,
  changed_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_changed_at ON audit_log(changed_at DESC);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_table ON audit_log(table_name);
```

---

## 7. API Endpoint Map (All 6 Roles)

### Auth Endpoints

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/v1/auth/otp/send` | Donor | Send OTP to phone number |
| POST | `/api/v1/auth/otp/verify` | Donor | Verify OTP, return JWT |
| POST | `/api/v1/auth/register/donor` | Donor | Save full donor profile |
| POST | `/api/v1/auth/login` | All staff roles | Email + Password login |
| POST | `/api/v1/auth/logout` | All | Invalidate token |
| POST | `/api/v1/auth/refresh` | All | Refresh JWT token |
| POST | `/api/v1/auth/invite/validate` | Staff | Validate invite token |
| POST | `/api/v1/auth/invite/set-password` | Staff | Set password for new staff |

### Donor Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/donors/:id` | Get donor profile + eligibility |
| PUT | `/api/v1/donors/:id` | Update profile / availability |
| POST | `/api/v1/donors/:id/donation` | Log a completed donation |
| GET | `/api/v1/donors/:id/history` | Get full donation history |
| GET | `/api/v1/camps?lat&lng&radius` | Find nearby donation camps |
| GET | `/api/v1/emergency/search?bloodGroup&lat&lng` | Emergency blood search |

### Hospital Staff / Admin Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/hospitals/:id/inventory` | Get blood inventory |
| POST | `/api/v1/hospitals/:id/inventory` | Add blood batch |
| PUT | `/api/v1/hospitals/:id/inventory/:batchId` | Update batch |
| DELETE | `/api/v1/hospitals/:id/inventory/:batchId` | Remove batch (with audit log) |
| GET | `/api/v1/hospitals/:id/stock-summary` | Get stock summary by blood group |
| GET | `/api/v1/hospitals/:id/transfers` | Get transfer requests |
| POST | `/api/v1/hospitals/:id/transfers` | Create transfer request |
| PUT | `/api/v1/transfers/:id/status` | Accept / Reject transfer |
| GET | `/api/v1/hospitals/:id/alerts` | Get expiry + emergency alerts |
| GET | `/api/v1/hospitals/:id/analytics` | Get usage analytics |
| POST | `/api/v1/hospitals/:id/camps` | Create donation camp |
| POST | `/api/v1/hospitals/:id/staff/invite` | Invite new staff member |
| GET | `/api/v1/hospitals/:id/staff` | List all staff |
| PUT | `/api/v1/hospitals/:id/staff/:userId` | Enable/disable staff |
| GET | `/api/v1/hospitals/:id/forecast` | Get 7-day AI demand forecast |

### Hospital Registration (Admin Portal)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/hospitals/register` | Submit hospital registration |
| GET | `/api/v1/hospitals/pending` | List pending hospitals (System Admin) |
| PUT | `/api/v1/hospitals/:id/approve` | Approve hospital (System Admin) |
| PUT | `/api/v1/hospitals/:id/reject` | Reject hospital (System Admin) |

### District Officer Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/district/:district/hospitals` | Get all hospitals in district |
| GET | `/api/v1/district/:district/stock-summary` | Aggregate stock by blood group |
| GET | `/api/v1/district/:district/alerts` | Active shortage alerts |
| GET | `/api/v1/district/:district/heatmap` | Shortage prediction data |
| GET | `/api/v1/district/:district/camps` | All camps in district |
| PUT | `/api/v1/district/:district/camps/:id` | Approve / reject camp |
| POST | `/api/v1/district/:district/escalate` | Escalate alert to state |
| GET | `/api/v1/district/:district/reports` | Generate / export reports |
| GET | `/api/v1/district/:district/donor-density` | Donor count by pincode |

### State Admin Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/state/:state/overview` | State-wide overview stats |
| GET | `/api/v1/state/:state/transfers` | Cross-district transfer data |
| GET | `/api/v1/state/:state/waste-kpis` | Waste KPIs by district |
| GET | `/api/v1/state/:state/alerts` | Policy alerts across state |
| GET | `/api/v1/state/:state/funding` | AI funding recommendations |
| GET | `/api/v1/state/:state/escalations` | District escalation reports |

### System Admin Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/sysadmin/users` | All users across all roles |
| POST | `/api/v1/sysadmin/users` | Create any user type |
| PUT | `/api/v1/sysadmin/users/:id` | Update/disable any user |
| GET | `/api/v1/sysadmin/audit-logs` | Full audit log viewer |
| GET | `/api/v1/sysadmin/system-health` | DB status, API latency, errors |
| GET | `/api/v1/sysadmin/approvals` | Pending hospital + officer approvals |
| PUT | `/api/v1/sysadmin/settings` | Feature flags, system config |

---

## 8. Authentication Strategy

### Per-Role Authentication Flow

```
Role: Blood Donor
  → Phone number entered
  → Firebase sends OTP SMS (10K free/month)
  → OTP verified by Firebase
  → Firebase returns UID + ID token
  → Backend exchanges Firebase token for app JWT
  → JWT stored in localStorage ('raktsetu_donor_token')
  → JWT sent in Authorization header on all API calls

Role: Hospital Staff
  → Admin sends invite email (link: /staff/token/TOKEN)
  → Staff clicks link → validates token (GET /auth/invite/validate)
  → Staff sets password (POST /auth/invite/set-password)
  → Staff logs in with email + password (POST /auth/login)
  → Backend returns JWT with role='staff' + hospital_id
  
Role: Hospital Admin
  → Submits registration form
  → System Admin reviews and approves (48h window)
  → On approval: email sent with temporary password link
  → Admin sets password → logs in
  → JWT with role='admin' + hospital_id

Role: District Officer
  → Submits .gov.in email application
  → System Admin verifies + approves
  → Credentials sent by email
  → Logs in with email + password
  → JWT with role='district' + district field

Role: State Admin
  → Government nomination → System Admin creates account
  → JWT with role='state' + state field

Role: System Admin  
  → Internal invite only
  → Email + Password + TOTP MFA required
  → JWT with role='sysadmin' + short expiry (4h)
  → Refresh token required on expiry
```

### JWT Payload Structure

```json
{
  "sub": "user-uuid",
  "role": "admin",
  "hospital_id": "hospital-uuid",
  "district": "Pune",
  "state": "Maharashtra",
  "iat": 1750000000,
  "exp": 1750086400
}
```

### RBAC Middleware (Backend)

```js
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

// Usage:
router.get('/hospitals/:id/inventory', requireRole('staff', 'admin'), getInventory);
router.get('/district/:d/hospitals', requireRole('district', 'sysadmin'), getDistrictHospitals);
```

---

## 9. Frontend → Backend Integration Checklist

When the backend is ready, replace mock services with real API calls in this order:

| Priority | Task | File to Modify |
|---|---|---|
| 🔴 1 | Create `src/services/api.js` (Axios instance with interceptors) | NEW FILE |
| 🔴 2 | Add `.env.local` with `VITE_API_BASE_URL` | NEW FILE |
| 🔴 3 | Replace mock OTP in `DonorRegistration.jsx` with Firebase Auth | `DonorRegistration.jsx` |
| 🔴 4 | Replace mock login in `AuthContext.jsx` with real POST `/auth/login` | `AuthContext.jsx` |
| 🔴 5 | Replace mockApi inventory with real API calls | `BloodInventory.jsx`, `UpdateStock.jsx` |
| 🔴 6 | Replace mock transfers with real API | `TransferRequests.jsx` |
| 🟡 7 | Wire `HospitalApplication.jsx` to POST `/hospitals/register` | `HospitalApplication.jsx` |
| 🟡 8 | Wire System Admin approvals to PUT `/hospitals/:id/approve` | `PendingApprovals.jsx` |
| 🟡 9 | Replace district mock data with real district API | `DistrictContext.jsx` |
| 🟡 10 | Wire emergency search to GET `/emergency/search?bloodGroup&lat&lng` | `Dashboard.jsx` (Donor) |
| 🟢 11 | Wire AI forecast endpoint to `AIDemandForecast.jsx` | `AIDemandForecast.jsx` |
| 🟢 12 | Wire notifications to backend event system (WebSocket or polling) | `HospitalLayout.jsx` |

---

## 10. Phased Backend Roadmap

### Phase 1 — Foundation (Weeks 1-3)
**Goal:** Working auth + hospital inventory API

- [ ] Set up Node.js + Express project structure
- [ ] Connect PostgreSQL + PostGIS (Railway or Supabase for MVP)
- [ ] Set up Prisma ORM with schema migrations
- [ ] Implement JWT auth (login, register, token refresh)
- [ ] Firebase Phone Auth integration for donors
- [ ] CRUD endpoints for `/hospitals/:id/inventory`
- [ ] CRUD endpoints for `/donors`
- [ ] Basic RBAC middleware
- [ ] Seed DB with test hospitals and users

**Frontend tasks (parallel):**
- Fix all 3 critical bugs (Hooks violation, emergency badge, hardcoded auth)
- Create `api.js` Axios service
- Create `.env.local`

---

### Phase 2 — Core Features (Weeks 4-6)
**Goal:** Transfer requests + emergency search + camps

- [ ] Transfer request endpoints (create, accept, reject)
- [ ] Emergency blood search (`/emergency/search` with PostGIS `ST_DWithin`)
- [ ] Hospital registration + approval workflow (email notification on approval)
- [ ] Staff invite system (token generation + email + set-password)
- [ ] Donation camp endpoints
- [ ] Expiry cron job (daily check → flag batches expiring in <7 days)
- [ ] Audit log (trigger on every inventory update)
- [ ] Rate limiting (100 req/min per IP using Redis)

---

### Phase 3 — District + State Dashboards (Weeks 7-9)
**Goal:** Government portals connected to real data

- [ ] District-level aggregate endpoints (all hospitals, stock totals, alerts)
- [ ] District heatmap data (shortage prediction based on stock levels)
- [ ] Camp approval workflow for District Officers
- [ ] State-level aggregate endpoints (cross-district transfers, waste KPIs)
- [ ] PDF/CSV report generation (using `pdfkit` or `json2csv`)
- [ ] System Admin user management panel endpoints

---

### Phase 4 — AI + Notifications (Weeks 10-14)
**Goal:** Predictive forecasting + real SMS/WhatsApp notifications

- [ ] Python/Flask microservice with Prophet model (receives hospital stock history)
- [ ] 7-day demand forecast endpoint (`/hospitals/:id/forecast`)
- [ ] Twilio/MSG91 integration for WhatsApp + SMS alerts
- [ ] FCM push notifications for donor eligibility re-notifications
- [ ] Scheduled cron jobs: expiry alerts, donor eligibility reminders, state weekly reports
- [ ] eRaktKosh API integration (if available)

---

### Phase 5 — Security + Production Hardening
**Goal:** Ready for pilot hospital deployment

- [ ] MFA (TOTP) for System Admin role
- [ ] Security audit: SQL injection, XSS, CSRF, JWT forgery
- [ ] HTTPS enforcement (Let's Encrypt / Cloudflare)
- [ ] Input validation on all endpoints (Zod/Joi)
- [ ] API versioning (`/api/v1/`)
- [ ] Idempotency keys on transfer requests
- [ ] Database backup strategy (daily S3 dump + point-in-time recovery)
- [ ] Sentry error monitoring + Uptime Robot
- [ ] Load test (k6): 100 concurrent emergency search requests

---

## 11. Summary

### What You Have Right Now

✅ **A fully structured, beautiful frontend** with all 6 user roles, 40+ pages, and all routes implemented. The UI is production-quality, responsive, and uses a consistent design system.

✅ **Complete project documentation** — user types, data flows, ER diagrams, OTP strategy, API design, and improvement reports are all well-documented in the `data/` and `arc/` folders.

✅ **A solid mock API** (`mockApi.js`) that simulates all data operations, making it easy to swap for real backend calls.

### What Needs to Be Fixed (Before Backend)

| # | Issue | Severity |
|---|---|---|
| 1 | React Hooks violation in HospitalLayout | 🔴 Critical |
| 2 | Emergency badge hardcoded to 0 | 🔴 High |
| 3 | 51 ESLint errors (unused imports) | 🟡 Medium |
| 4 | `watch()` memoization warnings | 🟡 Medium |
| 5 | `package.json` name typo + duplicate deps | 🟡 Low |
| 6 | No route guards (`ProtectedRoute` component) | 🔴 High |
| 7 | No Axios `api.js` service configured | 🔴 High |
| 8 | No `.env.local` file | 🔴 High |
| 9 | `RacktSetu/` nested folder in Git | 🟡 Medium |

### What the Backend Needs to Deliver

| Deliverable | Phase |
|---|---|
| JWT auth + Firebase OTP for donors | Phase 1 |
| PostgreSQL + PostGIS DB with full schema | Phase 1 |
| Blood inventory CRUD | Phase 1 |
| Transfer requests + emergency search | Phase 2 |
| Staff invite system | Phase 2 |
| Hospital registration + approval emails | Phase 2 |
| District + State aggregate APIs | Phase 3 |
| AI demand forecast (Python Flask) | Phase 4 |
| Twilio SMS/WhatsApp notifications | Phase 4 |
| Security audit + load testing | Phase 5 |

### Estimated Timeline

| Phase | Duration | Milestone |
|---|---|---|
| Phase 1 | 3 weeks | First real login works end-to-end |
| Phase 2 | 3 weeks | Hospital portal fully functional with real data |
| Phase 3 | 3 weeks | Government portals (District/State) work |
| Phase 4 | 4 weeks | AI + Notifications live |
| Phase 5 | 2 weeks | Production-ready for pilot hospital |
| **Total** | **~15 weeks** | **Ready for pilot deployment** |

> [!IMPORTANT]
> **Start by fixing the 3 critical frontend bugs before writing a single line of backend code.** The Hooks violation will cause runtime crashes the moment you add real async data loading.

> [!TIP]
> **Use Railway.app or Supabase for the MVP backend database.** They have free tiers, support PostgreSQL + PostGIS, and deploy in minutes. Don't waste time on AWS setup for an MVP.

> [!NOTE]
> **The `mockApi.js` is your backend spec.** Every function in it (`getInventory`, `addInventory`, `updateTransferStatus`, etc.) maps 1:1 to a real API endpoint. The backend is essentially building the real version of what mockApi simulates.

---

*Report compiled from: `src/App.jsx`, `src/services/mockApi.js`, `src/context/AuthContext.jsx`, `package.json`, `data/RaktSetu_All_User_Types_Report.md`, `data/RaktSetu_Improvement_Report.md`, `data/RaktSetu_Donor_Complete_Report.md`, `data/RaktSetu_OTP_Verification_Guide.md`, `data/raktsetu_scan_and_audit_report.md`, `RaktSetu_Folder_and_Git_Report.md`, `arc/implementation_plan.md`*
