# RaktSetu — Frontend Project Understanding

> **Generated:** 2026-06-23 | Based on full scan of `Rakta Setu - React/src/`  
> **Purpose:** Backend readiness blueprint — every page, data shape, API call, and auth gate catalogued so backend responses match the frontend exactly.

---

## Table of Contents
1. [Frontend Pages & Routes](#1-frontend-pages--routes)
2. [Data Shapes Needed Per Page](#2-data-shapes-needed-per-page)
3. [Required API Endpoints (Inferred from UI)](#3-required-api-endpoints-inferred-from-ui)
4. [Auth Requirements Per Page](#4-auth-requirements-per-page)
5. [Open Questions / Ambiguities](#5-open-questions--ambiguities)

---

## 1. Frontend Pages & Routes

There are **6 user portals**, each with its own route namespace. All routes are defined in `App.jsx`.

### 1A. Donor / Public Portal

| Route | Component | Purpose |
|---|---|---|
| `/` | `LandingPage` | Marketing page — hero, features, how-it-works, pilot form |
| `/login` | `Login` (UnifiedLogin) | Login via email+password OR mobile OTP; role-based redirect |
| `/register-donor` | `DonorRegistration` | 3-step flow: contact → OTP verify → set password |
| `/profile-setup` | `ProfileSetup` | Step 2 of onboarding — basic medical profile |
| `/location` | `LocationPage` | Step 3 — city/pincode/geo selection |
| `/dashboard` | `Dashboard` (Donor) | Donor impact dashboard — stats, donations, urgent requests |
| `/edit-profile` | `EditProfile` | Full profile editor — identity, geography, medical |
| `/find-camps` | `FindCamps` | Locate nearby donation camps |
| `/privacy` | `PrivacyPolicy` | Static content |
| `/terms` | `TermsOfService` | Static content |

### 1B. Hospital Staff Portal

| Route | Component | Purpose |
|---|---|---|
| `/staff/login` | `Login` (Hospital) | Staff-only login with email+password |
| `/staff/token/:token` | `InviteToken` | Validate invite token → redirect to set-password |
| `/staff/set-password/:token` | `SetPassword` | First-time password setup via invite token |
| `/staff/dashboard` | `HospitalDashboard` | Core metrics + emergency SOS + module shortcuts |
| `/staff/inventory` | `BloodInventory` | Full inventory table with search/filter/pagination |
| `/staff/update-stock` | `UpdateStock` | Add/edit blood bag entries |
| `/staff/expiry-alerts` | `ExpiryAlerts` | List of bags expiring within threshold |
| `/staff/transfer-request` | `TransferRequests` | Approve/reject incoming and outgoing transfers |
| `/staff/analytics` | `Analytics` | Charts — monthly usage, demand by group, expiry trend |
| `/staff/invite` | `InviteStaff` (Hospital) | Send staff invite emails |

### 1C. Hospital Admin Portal (Blood Bank Admin)

| Route | Component | Purpose |
|---|---|---|
| `/admin/login` | `AdminLogin` | Hospital-admin login |
| `/admin/register` | `HospitalApplication` | Hospital registration/onboarding form |
| `/admin/pending` | `PendingReview` | Show status of submitted application |
| `/admin/approved` | `ApprovalEmail` | Confirmation screen after approval |
| `/admin/dashboard` | `AdminDashboard` | Admin overview — KPIs, recent activity |
| `/admin/invite-staff` | `InviteStaff` (Admin) | Invite + manage staff members |
| `/admin/forecast` | `AIDemandForecast` | AI demand forecast charts per blood group |
| `/admin/waste` | `WasteAnalytics` | Waste percentage analytics, trend charts |
| `/admin/thresholds` | `AlertThresholds` | Set min/max stock thresholds & expiry alert settings |

### 1D. District Officer Portal

| Route | Component | Purpose |
|---|---|---|
| `/district/login` | `DistrictLogin` | District officer login |
| `/district/dashboard` | `DistrictDashboard` | Multi-hospital overview map + KPIs |
| `/district/map` | `DistrictMap` | Geographic map of hospital blood levels |
| `/district/alerts` | `DistrictAlerts` | Shortage alerts from hospitals |
| `/district/camps` | `CampApprovals` | Approve / reject blood donation camp applications |
| `/district/reports` | `DistrictReports` | Export & view reports for the district |
| `/district/hospitals` | `HospitalRegistry` | Searchable list of all hospitals in district |

### 1E. State Admin Portal

| Route | Component | Purpose |
|---|---|---|
| `/state/login` | `StateAdminLogin` | State admin login |
| `/state/dashboard` | `StateAdminDashboard` | Cross-district KPIs — 15 districts in mock |
| `/state/transfers` | `CrossDistrictTransfers` | Approve/view inter-district blood transfer requests |
| `/state/waste` | `WasteKPIs` | State-wide waste percentage analytics |
| `/state/alerts` | `PolicyAlerts` | Policy threshold breach alerts per district |
| `/state/reports` | `DistrictOfficerReports` | Escalation reports submitted by district officers |
| `/state/funding` | `FundingRecommendations` | AI-generated funding recommendations per district |

### 1F. System Admin Portal

| Route | Component | Purpose |
|---|---|---|
| `/systemadmin/login` | `SystemAdminLogin` | Platform sysadmin login |
| `/systemadmin/dashboard` | `SystemAdminDashboard` | System health, uptime, DB status, integration pings |
| `/systemadmin/approvals` | `PendingApprovals` | Approve hospitals AND district officers |
| `/systemadmin/users` | `UserManagement` | View all users, suspend/activate, change roles |
| `/systemadmin/audit-logs` | `AuditLogs` | Full platform audit trail |
| `/systemadmin/settings` | `SystemSettings` | Feature flags toggle + trigger manual backup |

---

## 2. Data Shapes Needed Per Page

> All shapes are extracted from `mockApi.js`, context files, and component prop usage.  
> Field names must match **exactly** — the frontend destructures these directly.

---

### 2A. Blood Inventory Item (`mockApi.getInventory`)
Used by: `HospitalDashboard`, `BloodInventory`, `UpdateStock`, `ExpiryAlerts`

```json
{
  "id": "bag-1",
  "bloodGroup": "O-",
  "units": 12,
  "reservedUnits": 2,
  "collectionDate": "2026-05-18",
  "expiryDate": "2026-06-22",
  "source": "Voluntary Donation",
  "remarks": "Rh negative, high demand.",
  // Computed by backend (or frontend can compute):
  "status": "Available | Expiring Soon | Expired | Low Stock",
  "daysRemaining": 10
}
```

**Status logic** (frontend computes from `daysRemaining` and `units - reservedUnits`):
- `daysRemaining < 0` → `"Expired"`
- `daysRemaining <= 30` → `"Expiring Soon"`
- `units - reservedUnits <= 3` → `"Low Stock"`
- otherwise → `"Available"`

**Sources enum:** `"Voluntary Donation"`, `"Replacement Donation"`, `"Apex Lab Transfer"`

---

### 2B. Transfer Request (`mockApi.getTransferRequests`)
Used by: `HospitalDashboard`, `TransferRequests`

```json
{
  "id": "tr-1",
  "hospitalName": "Red Cross Blood Bank, East",
  "bloodGroup": "O-",
  "unitsRequired": 6,
  "distance": 4.2,
  "priority": "Critical | High | Medium | Low",
  "status": "Pending | Approved | Rejected",
  "message": "Multiple trauma cases in ER.",
  "date": "2026-06-12",
  "type": "Incoming | Outgoing"
}
```

---

### 2C. Emergency SOS Request (`mockApi.getEmergencyRequests`)
Used by: `HospitalDashboard` (live countdown timer)

```json
{
  "id": "er-1",
  "hospitalName": "Holy Family Emergency Center",
  "bloodGroup": "O-",
  "unitsRequired": 8,
  "distance": 1.8,
  "status": "Pending | Accepted | Declined",
  "targetTimestamp": 1718196300000,
  "message": "Major highway accident..."
}
```

> ⚠️ `targetTimestamp` is an **epoch milliseconds** value. The dashboard computes countdown from `Date.now()`.

---

### 2D. Notification (`mockApi.getNotifications`)
Used by: `HospitalLayout` Navbar notification bell

```json
{
  "id": "notif-1",
  "title": "Critical Expiry Warning",
  "message": "AB+ Stock (bag-4) is expiring in 2 days!",
  "type": "Expiry | Emergency | Transfer | Stock Low",
  "read": false,
  "timestamp": 1718195700000
}
```

---

### 2E. Analytics Data (`mockApi.getAnalytics`)
Used by: `Analytics` page

```json
{
  "monthlyUsage": [
    { "month": "Jan", "usage": 140, "collections": 155 }
  ],
  "bloodDemandByGroup": {
    "labels": ["O+", "A+", "B+", "O-", "A-", "B-", "AB+", "AB-"],
    "demand": [65, 45, 55, 75, 25, 20, 15, 12],
    "supply": [60, 48, 50, 40, 18, 15, 16, 5]
  },
  "expiryTrend": {
    "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
    "expired": [2, 1, 4, 2],
    "wasted": [1, 0, 2, 1]
  },
  "transferSuccessTrend": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "successRate": [92, 94, 88, 95, 96, 98]
  }
}
```

---

### 2F. Hospital Auth Profile (`AuthContext`)
Used by: All hospital staff pages

```json
{
  "name": "City Life Blood Bank & Hospital",
  "email": "contact@citylifehospital.org",
  "bloodBankId": "BB-90812-CL",
  "licenseNumber": "LIC-7729-2026",
  "address": "452 Healthcare Boulevard, Sector 4, New Delhi, 110001",
  "contact": "+91 98765 43210",
  "logo": "https://..."
}
```

---

### 2G. Hospital Admin State (`HospitalContext`)
Used by: Admin portal pages

```json
{
  "status": "idle | pending | approved | logged_in",
  "hospitalDetails": {
    "hospitalName": "...",
    "type": "Government | Private | NGO",
    "licenseNo": "...",
    "address": "...",
    "contact": "...",
    "email": "...",
    "directorName": "...",
    "directorEmail": "..."
  },
  "invitedStaff": [
    {
      "id": 1,
      "name": "Dr. Ramesh Kumar",
      "email": "ramesh@hospital.com",
      "role": "Medical Officer | Head Nurse | Lab Technician",
      "status": "Pending | Accepted | Expired",
      "date": "2026-06-10"
    }
  ],
  "alertThresholds": {
    "minStock": 20,
    "maxStock": 200,
    "criticalUnits": 10,
    "expiryDays": 5,
    "emergencyAlerts": true
  }
}
```

---

### 2H. Hospital / District Registry (DistrictContext)
Used by: `DistrictDashboard`, `HospitalRegistry`, `DistrictMap`, `DistrictAlerts`

```json
{
  "id": 1,
  "name": "Sassoon General Hospital",
  "type": "Government | Private",
  "area": "Pune Camp",
  "contact": "+91 20 2612 7777",
  "licenseNo": "BB-PNQ-001",
  "status": "Active | Inactive | Suspended",
  "lastUpdated": "2 mins ago",
  "stock": {
    "O+": 42, "O-": 6, "A+": 35, "A-": 18,
    "B+": 28, "B-": 9, "AB+": 22, "AB-": 4
  }
}
```

---

### 2I. District Alert (DistrictContext)
Used by: `DistrictAlerts`

```json
{
  "id": 1,
  "hospitalId": 3,
  "hospitalName": "KEM Hospital",
  "bloodGroup": "O-",
  "units": 3,
  "severity": "Critical | Warning | Watch | Resolved",
  "predictedDepleted": "Tomorrow",
  "status": "Active | Resolved",
  "time": "10 mins ago"
}
```

---

### 2J. Blood Donation Camp (DistrictContext)
Used by: `CampApprovals`

```json
{
  "id": 1,
  "name": "Kothrud Community Camp",
  "location": "Kothrud Community Hall, Pune",
  "date": "2026-06-25",
  "organizer": "Deenanath Mangeshkar",
  "capacity": 200,
  "status": "Pending | Approved | Rejected",
  "bloodGroups": ["O-", "AB-"],
  "expectedDonors": 150
}
```

---

### 2K. District Summary (StateAdminContext)
Used by: `StateAdminDashboard`, `CrossDistrictTransfers`, `WasteKPIs`

```json
{
  "id": 1,
  "name": "Pune",
  "officerName": "Rajesh Patil",
  "zone": "Western",
  "hospitals": 8,
  "totalBags": 384,
  "wastePercent": 4.2,
  "status": "Healthy | Watch | Critical",
  "stock": {
    "O+": 92, "O-": 31, "A+": 78, "A-": 29,
    "B+": 68, "B-": 24, "AB+": 42, "AB-": 20
  },
  "lastUpdated": "2 mins ago",
  "escalations": 1
}
```

---

### 2L. Cross-District Transfer (StateAdminContext)
Used by: `CrossDistrictTransfers`

```json
{
  "id": 1,
  "from": "Pune",
  "to": "Aurangabad",
  "bloodGroup": "O-",
  "units": 20,
  "status": "Pending Approval | In Transit | Completed",
  "initiatedBy": "System AI | District Officer | State Admin",
  "date": "2026-06-20",
  "reason": "Critical shortage alert"
}
```

---

### 2M. Policy Alert (StateAdminContext)
Used by: `PolicyAlerts`

```json
{
  "id": 1,
  "districtId": 7,
  "district": "Solapur",
  "severity": "Critical | Warning | Resolved",
  "type": "Shortage Threshold Breach | Waste KPI Breach | Multiple Escalations | Donor Density Low",
  "message": "O- stock dropped below state policy minimum...",
  "date": "2026-06-20T08:15:00",
  "status": "Active | Resolved"
}
```

---

### 2N. Escalation Report (StateAdminContext)
Used by: `DistrictOfficerReports`

```json
{
  "id": 1,
  "districtId": 7,
  "district": "Solapur",
  "officerName": "Rajan Desai",
  "severity": "Critical | Warning",
  "title": "O- Critical Depletion — 3 Hospitals",
  "summary": "...",
  "date": "2026-06-20T08:00:00",
  "status": "Pending Response | In Review | Action Taken",
  "requestedAction": "Inter-district transfer from Mumbai or Pune"
}
```

---

### 2O. System Admin — User Account (SystemAdminContext)
Used by: `UserManagement`

```json
{
  "id": 1,
  "name": "Vikram Malhotra",
  "email": "admin@raktsetu.com",
  "role": "sysadmin | district | admin | staff | donor",
  "status": "Active | Suspended",
  "designation": "Lead Systems Architect",
  "lastActive": "Just now | 5 mins ago | Yesterday"
}
```

---

### 2P. Audit Log Entry (SystemAdminContext)
Used by: `AuditLogs`, `SystemAdminDashboard`

```json
{
  "id": 1,
  "timestamp": "2026-06-20 11:00:25",
  "actor": "System | System Admin (admin@raktsetu.com) | Rajesh Patil (District Officer)",
  "action": "Daily database backup auto-completed",
  "severity": "Info | Warning | Error",
  "ipAddress": "127.0.0.1"
}
```

---

### 2Q. System Health (SystemAdminContext)
Used by: `SystemAdminDashboard`

```json
{
  "uptime": "99.98%",
  "dbStatus": "Connected | Disconnected",
  "latency": "84ms",
  "sentryErrors": 2,
  "integrations": {
    "firebase": "Connected | Testing... | Error",
    "twilio": "Connected | Testing... | Error",
    "maps": "Connected | Testing... | Error"
  }
}
```

---

### 2R. Donor Profile (localStorage → `raktsetu_donor_profile`)
Used by: `Dashboard`, `EditProfile`

```json
{
  "fullName": "Arjun Malhotra",
  "age": "29",
  "gender": "Male | Female | Non-binary | Prefer not to say",
  "city": "New Delhi",
  "pincode": "110001",
  "bloodGroup": "O-Positive | A+ | ...",
  "weight": "78",
  "chronicIllness": false
}
```

---

### 2S. Pending Approvals (SystemAdminContext)
Used by: `PendingApprovals`

**Pending Hospital:**
```json
{
  "id": 1,
  "name": "Apex Blood Center",
  "type": "Private | Government",
  "area": "Kothrud",
  "contact": "+91 20 2543 1111",
  "licenseNo": "BB-PNQ-901",
  "appliedAt": "2 hrs ago"
}
```

**Pending Officer:**
```json
{
  "id": 1,
  "name": "Mahesh Joshi",
  "district": "Satara",
  "email": "officer@satara.gov.in",
  "designation": "District Health Officer",
  "appliedAt": "3 hrs ago"
}
```

---

## 3. Required API Endpoints (Inferred from UI)

> Listed by portal. Grouped as `[METHOD] /path — triggered by <action>`.

---

### 3A. Auth — All Portals

| Method | Path | Triggered By | Notes |
|---|---|---|---|
| `POST` | `/auth/send-otp` | Donor registration Step 1, Login (mobile) | Body: `{ contact: string }` — email or phone |
| `POST` | `/auth/verify-otp` | Donor registration Step 2, Login (mobile) | Body: `{ contact, otp }` |
| `POST` | `/auth/register` | Donor registration Step 3 (set password) | Body: `{ contact, password, role }` |
| `POST` | `/auth/login` | All login pages (email + password) | Body: `{ email, password }` → returns `{ token, user, role }` |
| `POST` | `/auth/logout` | Logout button (all portals) | Invalidate server session/token |
| `GET` | `/auth/validate-invite-token/:token` | `InviteToken` page on mount | Returns `{ hospitalName }` or error |
| `POST` | `/auth/set-password` | `SetPassword` page on submit | Body: `{ token, password }` |
| `POST` | `/auth/refresh` | Background (token refresh) | Returns new access token |

---

### 3B. Donor Portal

| Method | Path | Triggered By |
|---|---|---|
| `POST` | `/donor/profile` | Profile Setup form submit |
| `PUT` | `/donor/profile` | Edit Profile "Save Changes" button |
| `GET` | `/donor/profile` | Dashboard, EditProfile on mount |
| `GET` | `/donor/donations` | Donor Dashboard — recent donations table |
| `GET` | `/donor/stats` | Donor Dashboard — totalDonations, livesImpacted, nextEligibleDate |
| `GET` | `/donor/urgent-requests` | Donor Dashboard — urgent requests sidebar |
| `POST` | `/donor/pledge` | "Pledge to Donate" button on urgent request card |
| `GET` | `/donor/camps` | `FindCamps` — list nearby camps |
| `POST` | `/donor/location` | `LocationPage` — save geo location |
| `POST` | `/landing/demo-request` | Landing page pilot form — `formEmail` submit |

---

### 3C. Hospital Staff Portal

| Method | Path | Triggered By |
|---|---|---|
| `GET` | `/hospital/inventory` | `HospitalDashboard`, `BloodInventory` on mount |
| `POST` | `/hospital/inventory` | `UpdateStock` — "Add Blood Bag" form submit |
| `PUT` | `/hospital/inventory/:id` | `UpdateStock` — edit existing bag |
| `DELETE` | `/hospital/inventory/:id` | `BloodInventory` — delete confirmation modal |
| `GET` | `/hospital/transfers` | `HospitalDashboard`, `TransferRequests` on mount |
| `PATCH` | `/hospital/transfers/:id/status` | `TransferRequests` — Approve / Reject buttons; Body: `{ status: "Approved"|"Rejected" }` |
| `GET` | `/hospital/emergencies` | `HospitalDashboard` — polled every 10 seconds |
| `PATCH` | `/hospital/emergencies/:id/status` | `HospitalDashboard` — "Dispatch Now" / "Decline" buttons; Body: `{ status: "Accepted"|"Declined" }` |
| `GET` | `/hospital/notifications` | Navbar notification bell on mount + polling |
| `PATCH` | `/hospital/notifications/:id/read` | Clicking a notification |
| `PATCH` | `/hospital/notifications/read-all` | "Mark all read" button |
| `GET` | `/hospital/analytics` | `Analytics` page on mount |
| `GET` | `/hospital/expiry-alerts` | `ExpiryAlerts` page on mount |
| `GET` | `/hospital/profile` | Sidebar / Navbar — hospital name, logo |
| `PUT` | `/hospital/profile` | (implied by AuthContext `updateProfile`) |
| `POST` | `/hospital/staff/invite` | `InviteStaff` — "Send Invite" button; Body: `{ name, email, role }` |
| `GET` | `/hospital/staff` | `InviteStaff` — list of invited staff |

---

### 3D. Hospital Admin Portal

| Method | Path | Triggered By |
|---|---|---|
| `POST` | `/admin/register` | `HospitalApplication` — full registration form |
| `GET` | `/admin/application-status` | `PendingReview` on mount |
| `GET` | `/admin/dashboard` | `AdminDashboard` on mount — summary KPIs |
| `GET` | `/admin/staff` | `InviteStaff` (Admin) — staff list |
| `POST` | `/admin/staff/invite` | `InviteStaff` (Admin) — send invite |
| `DELETE` | `/admin/staff/:id` | `InviteStaff` — remove staff member |
| `GET` | `/admin/forecast` | `AIDemandForecast` — AI demand chart data |
| `GET` | `/admin/waste-analytics` | `WasteAnalytics` — waste analytics data |
| `GET` | `/admin/thresholds` | `AlertThresholds` on mount |
| `PUT` | `/admin/thresholds` | `AlertThresholds` — "Save Thresholds" button |

---

### 3E. District Officer Portal

| Method | Path | Triggered By |
|---|---|---|
| `POST` | `/district/auth/login` | `DistrictLogin` — login form submit |
| `GET` | `/district/dashboard` | `DistrictDashboard` on mount — KPIs |
| `GET` | `/district/hospitals` | `HospitalRegistry`, `DistrictDashboard`, `DistrictMap` |
| `GET` | `/district/alerts` | `DistrictAlerts` on mount |
| `PATCH` | `/district/alerts/:id/resolve` | `DistrictAlerts` — "Resolve" button |
| `GET` | `/district/camps` | `CampApprovals` on mount |
| `PATCH` | `/district/camps/:id/status` | `CampApprovals` — Approve/Reject buttons; Body: `{ status: "Approved"|"Rejected" }` |
| `POST` | `/district/camps` | `CampApprovals` — "Add New Camp" form submit |
| `GET` | `/district/reports` | `DistrictReports` on mount |
| `GET` | `/district/reports/export` | `DistrictReports` — "Export CSV" button |
| `GET` | `/district/map` | `DistrictMap` — geo data for hospital pins |

---

### 3F. State Admin Portal

| Method | Path | Triggered By |
|---|---|---|
| `POST` | `/state/auth/login` | `StateAdminLogin` — login form submit |
| `GET` | `/state/dashboard` | `StateAdminDashboard` on mount — all districts KPIs |
| `GET` | `/state/districts` | All state admin pages |
| `GET` | `/state/transfers` | `CrossDistrictTransfers` on mount |
| `PATCH` | `/state/transfers/:id/approve` | `CrossDistrictTransfers` — "Approve" button |
| `GET` | `/state/waste-kpis` | `WasteKPIs` on mount — per-district waste data |
| `GET` | `/state/policy-alerts` | `PolicyAlerts` on mount |
| `PATCH` | `/state/policy-alerts/:id/resolve` | `PolicyAlerts` — "Resolve" button |
| `GET` | `/state/escalation-reports` | `DistrictOfficerReports` on mount |
| `PATCH` | `/state/escalation-reports/:id/status` | `DistrictOfficerReports` — update status dropdown; Body: `{ status: string }` |
| `GET` | `/state/funding-recommendations` | `FundingRecommendations` on mount |

---

### 3G. System Admin Portal

| Method | Path | Triggered By |
|---|---|---|
| `POST` | `/systemadmin/auth/login` | `SystemAdminLogin` — login form submit |
| `GET` | `/systemadmin/dashboard` | `SystemAdminDashboard` on mount — system health |
| `GET` | `/systemadmin/pending-approvals` | `PendingApprovals` on mount — hospitals + officers |
| `PATCH` | `/systemadmin/hospitals/:id/approve` | `PendingApprovals` — "Approve" button |
| `PATCH` | `/systemadmin/hospitals/:id/reject` | `PendingApprovals` — "Reject" button |
| `PATCH` | `/systemadmin/officers/:id/approve` | `PendingApprovals` — "Approve" button |
| `PATCH` | `/systemadmin/officers/:id/reject` | `PendingApprovals` — "Reject" button |
| `GET` | `/systemadmin/users` | `UserManagement` on mount |
| `PATCH` | `/systemadmin/users/:id/status` | `UserManagement` — toggle Suspend/Activate |
| `PATCH` | `/systemadmin/users/:id/role` | `UserManagement` — change role dropdown; Body: `{ role: string }` |
| `GET` | `/systemadmin/audit-logs` | `AuditLogs` on mount |
| `GET` | `/systemadmin/settings` | `SystemSettings` on mount — feature flags + health |
| `PUT` | `/systemadmin/settings/feature-flags` | `SystemSettings` — toggle feature flag |
| `POST` | `/systemadmin/backup` | `SystemSettings` — "Trigger Backup" button |
| `POST` | `/systemadmin/integrations/:key/test` | `SystemSettings` — "Test Connection" button |

---

## 4. Auth Requirements Per Page

### Summary Table

| Route | Auth Required | Role(s) Allowed | Guard Method |
|---|---|---|---|
| `/` | No | Public | None |
| `/login` | No | Public | None |
| `/register-donor` | No | Public | None |
| `/privacy`, `/terms` | No | Public | None |
| `/profile-setup` | Soft (`raktsetu_otp_verified`) | Donor (post-OTP) | localStorage check → redirect `/` |
| `/location` | Soft (`raktsetu_otp_verified`) | Donor | localStorage check → redirect `/` |
| `/dashboard` | Yes | Donor | `raktsetu_donor_profile` in localStorage → redirect `/` |
| `/edit-profile` | Yes | Donor | `raktsetu_donor_profile` in localStorage → redirect `/` |
| `/find-camps` | No | Public | None (no guard in code) |
| `/staff/login` | No | Public | None |
| `/staff/token/:token` | No | Public | None (token validates on mount) |
| `/staff/set-password/:token` | No | Public | None |
| `/staff/dashboard` | Yes | Hospital Staff | `raktsetu_hospital_authenticated = 'true'` in localStorage |
| `/staff/inventory` | Yes | Hospital Staff | Same as above (via `HospitalLayout`) |
| `/staff/update-stock` | Yes | Hospital Staff | Same |
| `/staff/expiry-alerts` | Yes | Hospital Staff | Same |
| `/staff/transfer-request` | Yes | Hospital Staff | Same |
| `/staff/analytics` | Yes | Hospital Staff | Same |
| `/staff/invite` | Yes | Hospital Staff | Same |
| `/admin/login` | No | Public | None |
| `/admin/register` | No | Public | Anyone can apply |
| `/admin/pending` | Soft | Hospital Admin (applied) | `appState.status === 'pending'` via Context |
| `/admin/approved` | Soft | Hospital Admin (approved) | `appState.status === 'approved'` via Context |
| `/admin/dashboard` | Yes | Hospital Admin | `appState.status === 'logged_in'` via `HospitalContext` |
| `/admin/invite-staff` | Yes | Hospital Admin | Same |
| `/admin/forecast` | Yes | Hospital Admin | Same |
| `/admin/waste` | Yes | Hospital Admin | Same |
| `/admin/thresholds` | Yes | Hospital Admin | Same |
| `/district/login` | No | Public | None |
| `/district/dashboard` | Yes | District Officer | `appState.status === 'logged_in'` via `DistrictContext` |
| `/district/*` | Yes | District Officer | Same |
| `/state/login` | No | Public | None |
| `/state/dashboard` | Yes | State Admin | `appState.status === 'logged_in'` via `StateAdminContext` |
| `/state/*` | Yes | State Admin | Same |
| `/systemadmin/login` | No | Public | None |
| `/systemadmin/dashboard` | Yes | System Admin | `adminState.status === 'logged_in'` via `SystemAdminContext` |
| `/systemadmin/*` | Yes | System Admin | Same |

### Current Auth Implementation Notes

- **All auth is currently mock** — stored in `localStorage`, no real JWT or session tokens.
- **Role detection in unified login** (`/login`) uses email domain heuristic:
  - `@staff.` → hospital staff
  - `@admin.` → hospital admin
  - `@district.` → district officer
  - `@state.` → state admin
  - `@systemadmin.` / `@sysadmin.` → system admin
  - everything else → donor
- **No route guards** implemented yet in React Router — all protection is via `useEffect` + `localStorage` checks inside components. No `<PrivateRoute>` wrapper exists.
- **Hospital staff auth** uses `useAuth()` context; all other portals use their own Context.
- The backend must issue a **JWT** (or session cookie) with a `role` field matching: `donor | staff | admin | district | state | sysadmin`.

---

## 5. Open Questions / Ambiguities

### 5A. Auth Architecture
1. **Single unified login vs. separate endpoints?** — The frontend has `/login` (unified donor login) AND separate `/staff/login`, `/admin/login`, `/district/login`, `/state/login`, `/systemadmin/login` pages. Should the backend have one `/auth/login` endpoint that returns role-based tokens, or one per role?
2. **JWT vs. session cookies?** — Not decided. All current auth is localStorage-only.
3. **Token refresh strategy?** — No refresh token logic exists in the frontend yet.
4. **OTP provider?** — The frontend sends OTP to both email and mobile. Which provider will handle SMS (Twilio? AWS SNS?) and email OTP?

### 5B. Donor Profile
5. **`bloodGroup` format consistency** — `ProfileSetup` stores `"A+"`, `"O−"` (with Unicode minus), but `EditProfile` displays `"O-Positive"`. Backend needs to decide and document a canonical format. Recommend: `"A+"`, `"A-"`, `"B+"`, `"B-"`, `"O+"`, `"O-"`, `"AB+"`, `"AB-"`.
6. **Donor ID** — `EditProfile` shows a hardcoded `RS-2024-8892`. Backend needs to generate and persist unique donor IDs.
7. **`nextEligibleDate`** — Dashboard shows a hardcoded `"Oct 24, 2024"`. This should be calculated from last donation date + 90-day cooldown. Does backend own this logic or frontend?
8. **Donation history** — Dashboard shows a hardcoded 3-row donation table (date, location, type, status). The backend must have a `donations` table and return this as an array.

### 5C. Hospital Inventory
9. **`status` field** — Currently computed on the frontend from `daysRemaining` and `units`. Should the backend also compute and return `status`, or leave it to the frontend? Recommend: **backend returns `status` and `daysRemaining`** to avoid drift.
10. **`reservedUnits` side-effects** — When a transfer is `Approved`, `reservedUnits` is incremented on the matching inventory batch. When an emergency is `Accepted`, `units` is **immediately decremented**. The backend must replicate this logic atomically.
11. **Inventory `id` format** — Mock uses `"bag-1"`, `"bag-2"` etc. Real backend should use UUIDs.

### 5D. Transfer & Emergency Requests
12. **Transfer direction** — `type: "Incoming" | "Outgoing"` is used for display. Does one hospital create the transfer and the other receives it, or is there a neutral "transfer request" entity? The UI shows both types in the same list.
13. **Emergency SOS source** — Who creates emergency requests? Is it another hospital, a district officer, or an external system? The frontend only shows the response side (Dispatch/Decline).
14. **`targetTimestamp` for emergencies** — Is this set by the requesting hospital or computed by backend? Frontend counts down from it live.

### 5E. Notifications
15. **Push vs. polling** — The frontend polls `/hospital/notifications` on an interval. Should the backend support **WebSocket** or **SSE** for live push notifications (emergencies especially)?
16. **Notification fanout** — Who receives which notification type? E.g., does a district officer also get notified when a hospital hits critical stock?

### 5F. District & State
17. **Camp organizer linkage** — `CampApprovals` shows camps with an `organizer` field (a hospital name). Is a camp created by a hospital or independently? Is there a Camp entity in the DB separate from the blood bank?
18. **`lastUpdated` on hospitals** — DistrictContext shows `"2 mins ago"`. Is this computed relative to a `lastReportedAt` timestamp on the hospital record, or a live WebSocket heartbeat?
19. **`FundingRecommendations`** — This page exists but no mock data was found in any context for it. Is this AI-generated? What shape does the recommendation object have?

### 5G. System Admin
20. **Feature flags persistence** — `SystemSettings` toggles flags stored in React context (in-memory + localStorage). Backend needs a persistent feature flags store (DB table or config service). What flags exist?
   - `emergencyRouting`
   - `aiDemandForecasting`
   - `crossHospitalExpiryAutoTransfer`
21. **Backup endpoint** — Currently downloads a JSON of frontend state. The real backup should be a server-side DB dump. Does the frontend just trigger it and poll for completion, or is it fire-and-forget?
22. **Audit log actor format** — Mock uses freeform strings like `"System Admin (admin@raktsetu.com)"`. Backend should normalize: `{ actorId, actorName, actorRole, actorEmail }`.

### 5H. Routing & Guards
23. **No `<PrivateRoute>` wrapper** — All protected pages currently do their own localStorage check in `useEffect`. When real auth is introduced, the frontend will need a central `<PrivateRoute>` HOC. Backend team should coordinate with frontend on this before integration.
24. **`/find-camps`** — No auth guard in code. Is this intentionally public, or should it require donor login?
25. **Multi-role login** — The unified `/login` page currently infers role from email domain. With a real backend, the server should return the role in the login response and the frontend should redirect accordingly — not use domain heuristics.

---

*End of PROJECT_UNDERSTANDING.md*
