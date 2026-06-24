# RaktSetu Frontend QA Review Report

This report documents the systematic QA review conducted on the **RaktSetu React Frontend** (Vite + React 19).

---

## Summary Checklist

| Category | Requirement Check | Status | Key References / Findings |
| :--- | :--- | :---: | :--- |
| **CHECK 1** | HospitalLayout Rules of Hooks | ✅ Pass | No conditional returns before hooks. [HospitalLayout.jsx:14-26](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/layouts/HospitalLayout.jsx#L14-L26) |
| **CHECK 1** | Live Emergency Badge Count | ✅ Pass | Badge count uses dynamic filtered array length. [HospitalLayout.jsx:30](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/layouts/HospitalLayout.jsx#L30) |
| **CHECK 1** | Protected Route Wrapping (App.jsx) | ❌ Fail | Donor `/dashboard` and `/edit-profile` are not protected. [App.jsx:110-111](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/App.jsx#L110-L111) |
| **CHECK 1** | Linter Cleanliness (ESLint) | ✅ Pass | Linter runs cleanly with zero warnings or errors. |
| **CHECK 1** | useWatch Usage in Forms | ✅ Pass | Both forms successfully utilize `useWatch` instead of `watch()`. [UpdateStock.jsx:51](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/pages/hospital/inventory/UpdateStock.jsx#L51), [SetPassword.jsx:49](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/pages/hospital/auth/SetPassword.jsx#L49) |
| **CHECK 1** | Math.random Elimination & Distance | ❌ Fail | 3 instances of `Math.random()` remain. [TransferRequests.jsx:67](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/pages/hospital/requests/TransferRequests.jsx#L67) uses hardcoded distance. |
| **CHECK 1** | package.json Structure & Tailind | ✅ Pass | Name is correct, no `@tailwindcss/postcss` duplicates. [package.json](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/package.json) |
| **CHECK 1** | API Service wiring (api.js) | ❌ Fail | [api.js](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/services/api.js) exists but is unused; components rely on `mockApi.js`. |
| **CHECK 1** | Clean Git History & Folders | ✅ Pass | No nested directories, no `node_modules` committed. |
| **CHECK 2** | Unified Login endpoint | ❌ Fail | Logins are completely mock, using domain email heuristics. |
| **CHECK 2** | Remove Staff Invite Tokens & Routes | ❌ Fail | Token routes still in router. Admin Invite Staff does not hit a direct account creation endpoint. |
| **CHECK 2** | Logout Cleanup & 401 Bounces | ❌ Fail | Logout does not clear full localStorage. 401 handler redirect is commented out. |
| **CHECK 3** | Zero Mock API References | ❌ Fail | 26 active references to `mockApi` found across components. |
| **CHECK 3** | API-Driven Data & Hardcoded Mocks | ❌ Fail | Display values (Donor ID, eligibility, history) are fully hardcoded. [Dashboard.jsx:141](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/components/Dashboard.jsx#L141) |
| **CHECK 4** | Zero Google Maps References | ✅ Pass | Confirmed zero script tags or Google Maps packages. |
| **CHECK 4** | React Leaflet + OpenStreetMap Map UI | ❌ Fail | Map uses a static Google Maps sandbox error placeholder screen. [DistrictMap.jsx:183](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/pages/district/DistrictMap.jsx#L183) |
| **CHECK 5** | loading/error States per portal | ❌ Fail | Only Hospital portal has loader/error. Others load mock contexts synchronously. |
| **CHECK 5** | Responsive Breakpoints | ⚠️ Partial | Layouts are responsive but untried with real backend variable data. |
| **CHECK 5** | Surface Backend Validation Errors | ❌ Fail | Form inputs only perform client-side mock validation. |

---

## Detailed Audit Findings

### CHECK 1 — Known Issue Verification
*   **✅ Rules of Hooks:** In [HospitalLayout.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/layouts/HospitalLayout.jsx), the `useQuery` calls are invoked unconditionally at the top of the function. No early conditional returns are present.
*   **✅ Live Badge Counts:** The layout successfully calculates unread emergency counts dynamically using array filters: `emergencies.filter(req => req.status === 'Pending').length`.
*   **❌ Protected Routes Missing:** The donor dashboard routes `/dashboard` and `/edit-profile` are not protected by `<ProtectedRoute>` in [App.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/App.jsx#L110-L111). Manually typing `/dashboard` allows logged-out users to enter a blank/broken screen.
*   **✅ ESLint:** Running `npm run lint` completes with zero output (no errors or warnings).
*   **✅ react-hook-form useWatch:** Form inputs in [UpdateStock.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/pages/hospital/inventory/UpdateStock.jsx#L51) and [SetPassword.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/pages/hospital/auth/SetPassword.jsx#L49) successfully utilize `useWatch` to track date/password inputs efficiently.
*   **❌ Math.random Usages:** 3 usages of `Math.random()` remain in:
    *   [InviteStaff.jsx (admin)](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/pages/admin/InviteStaff.jsx#L42)
    *   [InviteStaff.jsx (hospital)](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/pages/hospital/auth/InviteStaff.jsx#L22)
    *   [ToastContext.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/context/ToastContext.jsx#L15)
*   **❌ Mock Distance in Transfers:** In [TransferRequests.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/pages/hospital/requests/TransferRequests.jsx#L67), distance is hardcoded to `5.0` km when inserting a transfer. Display metrics rely on mock objects.
*   **❌ api.js Integration:** The central Axios service [api.js](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/services/api.js) exists but is **completely bypassed**. Every fetching component imports and uses `mockApi.js`.

---

### CHECK 2 — Auth Flow (Unified vs Multi-Role)
*   **❌ Mock Login:** The 6 portal login screens (Unified Login, Hospital Staff, Hospital Admin, District, State, System Admin) are completely mock. They perform client-side checks against hardcoded strings or use email domain heuristics (e.g. `val.includes('staff')`) to determine access, bypassing `POST /api/v1/auth/login` entirely.
*   **❌ Invite Token Flow:**
    *   `/staff/token/:token` and `/staff/set-password/:token` routes remain in the router.
    *   The Invite Staff forms in [InviteStaff.jsx (admin)](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/pages/admin/InviteStaff.jsx) do not hit a backend direct user-creation endpoint; instead they save mock listings locally.
*   **❌ LocalStorage Clearance & 401 Redirects:**
    *   Logouts only clear specific authenticated keys (e.g. `raktsetu_hospital_authenticated`) leaving other cached states behind.
    *   The `api.js` 401 interceptor lacks redirection logic: `window.location.href` is commented out.

---

### CHECK 3 — Mock Data Elimination
*   **❌ mockApi.js Usages:** There are **26 active references** to `mockApi` across layouts and page views.
*   **❌ Hardcoded Views:** Donor dashboard elements are fully static:
    *   Donor ID `RS-2024-8892` is hardcoded in [EditProfile.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/components/EditProfile.jsx#L208).
    *   Next Eligible Date `Oct 24, 2024`, Total Donations `12`, and Lives Impacted `36` are hardcoded in [Dashboard.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/components/Dashboard.jsx#L123-L141).
    *   The Recent Donations table shows 3 static mock rows rather than fetching real database records.

---

### CHECK 4 — Maps
*   **❌ Missing OSM/Leaflet Integration:** The district map in [DistrictMap.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/Rakta%20Setu%20-%20React/src/pages/district/DistrictMap.jsx#L173-L188) is a static overlay container with a message stating "Google Maps integration is currently in sandbox mode". There is no Leaflet or OpenStreetMap tile initialization, nor are there Leaflet dependencies configured in `package.json`.

---

### CHECK 5 — UX Correctness
*   **❌ No Loaders/Errors:** Portals other than Hospital Staff (District, State, Sysadmin, Donor, Admin) load static collections immediately from Context states. They lack loaders, error boundaries, or network error states.
*   **❌ Inline Backend Errors:** Forms perform client-side regex check, but have no way to catch and surface inline validation failures or database constraints (e.g., unique email warnings) returned from the backend.
