# District Officer Portal — RaktSetu Implementation Plan

## Background & Purpose (from index.pdf + Architecture Docs)

RaktSetu is an **AI-powered blood supply management platform** positioned as India's missing layer between eRaktKosh (government stock search) and hospitals. The core differentiators (from the competitor analysis PDF) are:

| Unique Feature | What It Does |
|---|---|
| 🆕 AI Demand Forecasting | ML predicts how much blood each hospital needs in 7 days |
| 🆕 Cross-Hospital Expiry Alert | Auto-triggers transfer when blood is expiring at A but needed at B |
| 🆕 Emergency Real-Time Routing | Fastest path to blood in a crisis, not just a static map |
| 🆕 **Shortage Prediction Heatmap (District Level)** ★ | District officer sees which hospitals/groups go critical in 3–7 days |
| 🆕 Surgical Schedule → Demand Feed | OT schedule feeds AI forecasting |
| 🆕 Donor Eligibility Re-notification | Personalised re-alert when 90-day cooldown ends |

The **District Officer dashboard (Shortage Prediction Heatmap)** is explicitly listed as one of the 6 unique features **nobody has built for India**. This is why it is a priority user type.

---

## The Full 6-User Architecture (from RaktSetu_All_User_Types_Report.md)

The project has **6 planned roles** (not 3 or 4 as in older files). We are currently building Role #4:

| # | Role | Status |
|---|---|---|
| 1 | 🩸 Blood Donor | ✅ Built |
| 2 | 🏥 Hospital Staff | ✅ Built |
| 3 | 🔧 Hospital Admin | ✅ Built |
| **4** | **📊 District Officer** | **🔨 Building Now** |
| 5 | 🏛️ State Admin | 🔲 Future |
| 6 | ⚙️ System Admin | 🔲 Future |

---

## What the District Officer Does (Exact Spec)

From `RaktSetu_All_User_Types_Report.md`, Role 4:

**CAN DO:**
- ✅ View ALL hospitals in their district — live blood stock for each
- ✅ See the **Shortage Prediction Heatmap** (which blood groups will be critical in which hospitals in 3-7 days)
- ✅ Use the **Camp Planning Tool** (schedule donation camps BEFORE shortage hits)
- ✅ Export district-level reports (PDF/CSV for government records)
- ✅ Send emergency alerts to all hospitals in district during a blood crisis
- ✅ **Escalate to State Admin** when a district-wide shortage cannot be resolved
- ✅ View aggregate donor density maps (donors per blood group per area)

**CANNOT DO:**
- ❌ Log or update any hospital's blood inventory directly
- ❌ Invite hospital staff or admins
- ❌ See another district's data
- ❌ Access system-level settings

**Login:** `.gov.in` email required → email OTP + manual phone call verification (mocked for web demo)

---

## Proposed Changes

### 1. Context — District Officer State

#### [NEW] `src/context/DistrictContext.jsx`

Mirrors `HospitalContext.jsx` pattern exactly.

```
State shape:
{
  status: 'idle' | 'logged_in',
  officerDetails: { name, district, email, designation },
  districtHospitals: [...8 mock hospitals with live blood stock],
  alerts: [...critical shortage alerts],
  camps: [...pending camp approval requests]
}
localStorage key: 'raktsetu_district_state'
```

Methods: `loginOfficer()`, `logoutOfficer()`, `approvecamp()`, `escalateAlert()`

---

### 2. Layout — District Officer Shell

#### [NEW] `src/layouts/DistrictLayout/DistrictLayout.jsx`

Mirrors `AdminLayout.jsx` exactly in structure. Differences:
- Badge label: **"District Officer"** (not "Hospital Admin")
- Accent color for badge: `#1D6A38` (government green — distinct from red, signals government authority)
- Nav items:

| Icon | Label | Path |
|------|-------|------|
| LayoutDashboard | Overview | `/district/dashboard` |
| MapPin | District Map | `/district/map` |
| AlertTriangle | Shortage Alerts | `/district/alerts` |
| CalendarCheck | Camp Approvals | `/district/camps` |
| FileBarChart | Reports | `/district/reports` |
| Building2 | Hospital Registry | `/district/hospitals` |

Same: sticky navbar, mobile drawer with `AnimatePresence`, notification bell, profile chip, logout

---

### 3. Pages

#### [NEW] `src/pages/district/` folder (7 files)

All pages use **the same design language** as `AdminDashboard.jsx` and `AIDemandForecast.jsx`:
- Large serif italic headings `font-serif text-[48–80px] italic`
- White bento cards `border border-[rgba(26,18,16,0.09)]`
- Dark `bg-[#1a1210]` editorial insight cards
- Recharts for data visualization
- `DM Sans` body font
- Brand red `#BE1F2E` primary accent

---

#### `DistrictLogin.jsx`
Login page for District Officer.
- Same card layout as `AdminLogin.jsx`
- Badge: `"District Portal"` 
- Heading: `"Sign in as District Officer"`
- Subtext: `"Government access for district blood supply oversight"`
- Mock credentials: `officer@pune.gov.in` / `district123`
- Unique: shows `.gov.in` requirement note

---

#### `DistrictDashboard.jsx` (Main Overview)
The hero page. Editorial large heading:  
> *"District Pune. Blood at a glance."*

**Stat bento row (3 cards):**
- Total bags across all district hospitals (count-up animation)
- Hospitals with critical shortages (count-up)  
- Active emergency alerts (live pulse dot)

**Main chart:** Bar chart — aggregate blood stock by group across ALL district hospitals (Recharts, same style as AdminDashboard)

**Shortage Heatmap table:** All 8 hospitals × 8 blood groups → colour-coded cells:
- 🟢 Green = >30 units (safe)
- 🟡 Yellow = 10–30 units (watch)
- 🔴 Red = <10 units (critical)
- Animated pulse on critical cells

**Sidebar:**
- Top 3 critical alerts (hospital name + blood group + severity)
- AI Insight card (dark `#1a1210` panel): "O- will hit 0 in District Hospital 3 by Thursday — schedule camp in Kothrud by Tuesday"
- Quick escalate button → "Escalate to State Admin"

---

#### `DistrictMap.jsx` (Hospital Network)
A full card-grid view of all district hospitals. Each hospital card shows:
- Hospital name + address
- 8 blood group mini-badges (coloured by stock level)
- Last updated timestamp
- "Contact Blood Bank" button (tel: link)
- Emergency status chip (Open / Closed)

Search/filter bar at top: filter by blood group shortage, by area, by status.

---

#### `DistrictAlerts.jsx` (Shortage Alerts Feed)
Two sections:

**Active Alerts** (urgent, pulsing red border cards):
- Hospital name, blood group, units remaining, predicted depletion date
- "Broadcast Camp Alert" button per alert
- "Escalate" button for critical cases

**Resolved Alerts** (past 30 days, muted style):
- Same info, greyed out, with resolution timestamp

Filter by: blood group, severity, hospital

---

#### `CampApprovals.jsx` (Camp Planning Tool)
Two tabs: **Upcoming Camps** | **Plan New Camp**

**Upcoming Camps tab:**
- Table of planned donation camps (name, location, date, organiser, expected donors)
- Status badge: Approved / Pending Review / Cancelled
- Approve/Reject buttons for pending camps
- Clicking a camp shows detail drawer

**Plan New Camp tab:**
- Form: Camp name, Location (area/pincode), Date & time, Blood groups needed, Estimated capacity
- Target hospital selector (which hospital benefits from this camp)
- AI Suggestion panel: "Recommend Kothrud — O- donor density is 3x city average"
- Submit button → adds to pending list

---

#### `DistrictReports.jsx` (Export Reports)
Report cards in a grid — each card represents a downloadable report:

| Report | Description | Format |
|---|---|---|
| Monthly Blood Health Summary | Total bags, waste %, critical events | PDF |
| Shortage Prediction Report | Next 7-day forecast for all hospitals | PDF |
| Donor Density Map | Blood group donor distribution per pincode | CSV |
| Camp Activity Log | Camps held, units collected, areas covered | CSV |
| Hospital Compliance Report | Which hospitals updated stock regularly | PDF |

Each card: title, description, last generated date, "Generate Report" button (triggers mock download toast)

**Quick stats row at top:** This month's numbers — total district bags, waste %, camps held, donors activated

---

#### `HospitalRegistry.jsx` (Hospital Directory)
Full directory of all hospitals registered in the district.

**Header stats:** Total hospitals, Active / Inactive count, Pending approval count

**Sortable table:**
- Hospital name | Type (Govt/Private) | Area | Contact | Registration status | Blood bank license | Last active

**Actions per row:** View full profile, Send notification, Flag for review

**Filter bar:** by hospital type, area, status, blood bank license status

---

### 4. Routing Update

#### [MODIFY] `src/App.jsx`

Add new import group and route group:

```jsx
// -- District Officer Imports --
import { DistrictProvider } from './context/DistrictContext';
import DistrictLayout from './layouts/DistrictLayout/DistrictLayout';
import DistrictLogin from './pages/district/DistrictLogin';
import DistrictDashboard from './pages/district/DistrictDashboard';
import DistrictMap from './pages/district/DistrictMap';
import DistrictAlerts from './pages/district/DistrictAlerts';
import CampApprovals from './pages/district/CampApprovals';
import DistrictReports from './pages/district/DistrictReports';
import HospitalRegistry from './pages/district/HospitalRegistry';
```

Routes added under `/* 4. DISTRICT OFFICER ROUTES */`:
```
/district                  → redirect to /district/login
/district/login            → <DistrictLogin />
/district/dashboard        → <DistrictLayout><DistrictDashboard /></DistrictLayout>
/district/map              → <DistrictLayout><DistrictMap /></DistrictLayout>
/district/alerts           → <DistrictLayout><DistrictAlerts /></DistrictLayout>
/district/camps            → <DistrictLayout><CampApprovals /></DistrictLayout>
/district/reports          → <DistrictLayout><DistrictReports /></DistrictLayout>
/district/hospitals        → <DistrictLayout><HospitalRegistry /></DistrictLayout>
```

`DistrictProvider` wraps inside existing providers (alongside `HospitalProvider`).

---

### 5. CSS

#### [MODIFY] `src/index.css`
Add `@import "./district.css";` (line 4, after staff.css and admin.css)

#### [NEW] `src/district.css`
Minimal additions only — shares global design system. Adds:
```css
/* District Officer — Government Green Badge Accent */
:root {
  --district: #1D6A38;
  --district-light: rgba(29, 106, 56, 0.08);
}
.badge-district {
  /* govt green badge for sidebar */
  background: var(--district-light);
  color: var(--district);
  border: 1px solid rgba(29,106,56,0.2);
  ...
}
```

---

### 6. Landing Page Update

#### [MODIFY] `src/components/LandingPage.jsx`

Add 4th portal entry card in the user-type section alongside Donor, Hospital Admin, and Hospital Staff cards. The District Officer card:
- Icon: government/map pin icon  
- Title: "District Officer"
- Description: "Government oversight — monitor all district hospitals, predict shortages, plan camps."
- Button: "District Portal →" → links to `/district/login`

---

## Mock Data Plan

The District Officer portal uses realistic mocked data (same approach as AdminDashboard):

**8 Mock Hospitals in Pune District:**
- Sassoon General Hospital, Ruby Hall Clinic, KEM Hospital, Jehangir Hospital, Deenanath Mangeshkar, Poona Hospital, Noble Hospital, Symbiosis Hospital

Each hospital has:
- 8 blood group stock levels (varied, some critical)
- Last updated timestamp
- Contact number
- Area/zone

**6 Mock Shortage Alerts:**
- 3 critical (O-, AB-, B-), 3 moderate (O+, A-)

**4 Mock Pending Camp Requests:**
- From different hospital admins across Pune zones

---

## Verification Plan

### Manual Steps
1. `/` landing page → 4th card "District Officer" visible → click "District Portal →"
2. `/district/login` → Badge "District Portal", credentials `officer@pune.gov.in` / `district123`
3. Login → lands on `/district/dashboard` with animated stats, heatmap, AI insight panel
4. Sidebar nav → all 6 pages load correctly
5. Dashboard → Shortage heatmap renders with colour-coded cells
6. Alerts page → Active alerts with Escalate button functional
7. Camps page → Approve/Reject buttons work, form submission adds camp to list
8. Reports → "Generate Report" button shows toast notification
9. Hospital Registry → search/filter works
10. Logout → returns to `/district/login`
11. Mobile → sidebar drawer opens/closes with animation

> [!IMPORTANT]
> **Design must match**: The visual design should be indistinguishable from the Admin portal — same editorial serif headings, same bento cards, same dark insight panels, same table styles. The only new visual element is the `#1D6A38` government green in the navbar badge.

> [!NOTE]
> **Login credentials**: Using `officer@pune.gov.in` / `district123`. The `.gov.in` email restriction is shown as a visual note on the login form (not technically enforced, since it's a frontend mock).
