# 🩸 RaktSetu — Complete User Types Reference Report

> **Source:** Full scan of ALL files — `temp.html`, `temp2.html`, `temp3.html`, `temp4.html`, `RaktSetu_WebOnly_Complete_Guide.html`, `RaktSetu_Complete_Engineering_Guide.html`, `arc/raktsetu_full_user_flow.html`, `arc/donor_data_fields.html`, `arc/user_dashboard.html`
> **Date Generated:** June 13, 2026
> **Purpose:** Definitively answer "how many user types does RaktSetu have?" and clearly explain what each one does.

---

## ❓ ANSWER FIRST: How Many User Types?

**RaktSetu has EXACTLY 6 User Types (Roles).**

Your project documentation mentions different numbers in different files because the project evolved over time:

| File | User Types Mentioned | Count |
|---|---|---|
| `temp.html` (older guide) | Hospital Staff, District Officer, Donor | 3 |
| `arc/raktsetu_full_user_flow.html` (original arc/) | Blood Donor, Hospital Staff, Hospital Admin, District Officer | 4 |
| `temp3.html` + `RaktSetu_WebOnly_Complete_Guide.html` (latest) | Blood Donor, Hospital Staff, Hospital Admin, District Officer, **State Admin**, **System Admin** | **6** ✅ |

> **Use the 6-role model.** The 6-role system is the most recent and complete design. The older files (3 types, 4 types) are earlier versions that were expanded later. `temp3.html` explicitly notes: *"Fixed: added State Admin + System Admin + missing emergency donor action."*

---

## 🎨 The 6 User Types — At a Glance

| # | Role | Color | Access Method | Who Is This? |
|---|---|---|---|---|
| 1 | 🩸 **Blood Donor** | Red | Self-signup via Phone OTP — open to public | Regular citizen willing to donate blood |
| 2 | 🏥 **Hospital Staff** | Blue | Invite link from Hospital Admin (email/SMS) | Blood Bank Technician doing daily operations |
| 3 | 🔧 **Hospital Admin** | Green | Register hospital → 48h manual approval | Blood Bank Manager running a hospital |
| 4 | 📊 **District Officer** | Yellow | `.gov.in` email → manual RaktSetu team verification | Government District Health Officer |
| 5 | 🏛️ **State Admin** | Purple | Government Dept. nomination → Gov ID + central team approval | State Health Department official |
| 6 | ⚙️ **System Admin** | Grey/Slate | Internal superadmin invite only + MFA + device auth | RaktSetu's own platform admin/developer |

---

## 📋 TABLE OF CONTENTS

1. [Role 1: Blood Donor](#role-1-blood-donor)
2. [Role 2: Hospital Staff](#role-2-hospital-staff)
3. [Role 3: Hospital Admin](#role-3-hospital-admin)
4. [Role 4: District Officer](#role-4-district-officer)
5. [Role 5: State Admin](#role-5-state-admin)
6. [Role 6: System Admin](#role-6-system-admin)
7. [How All 6 Roles Interact With Each Other](#how-all-6-roles-interact-with-each-other)
8. [Authentication Methods by Role](#authentication-methods-by-role)
9. [Database Role Field](#database-role-field)
10. [Summary Comparison Table](#summary-comparison-table)

---

---

## Role 1: Blood Donor

### 🩸 Who Is This?
An **ordinary citizen** who registers voluntarily to donate blood. This is the most public-facing user — anyone with a phone can become a donor.

### 📲 How They Access the App
- Opens the RaktSetu website / app
- Selects "I am a Blood Donor"
- Enters their **mobile number (+91)**
- Receives an **OTP via SMS** and verifies
- Completes a **5-screen profile setup wizard**
- Gets direct access to the **Donor Dashboard**
- **Alternative:** Google OAuth (login with Google account)

> **Only user type that needs NO approval, NO invite, NO verification** — they can join immediately after OTP.

### 📝 Data Collected from Donor (All Fields)

| Category | Fields | Required? |
|---|---|---|
| Identity | Mobile number, OTP | ✅ Both required |
| Demographics | Full name, Age (18–65 only), Gender, Blood group | ✅ All required |
| Location | City, Pincode | ✅ Required |
| Location | GPS coordinates | ⬜ Optional |
| Donation History | Donated before (Y/N), Last donation date, Type (whole/platelets/plasma) | Date/Type optional |
| Health Check | Weight ≥45kg, Chronic illness, Medication, Pregnant (females only) | Weight + illness required |
| Notifications | Emergency alert toggle, Camp alert toggle, Channel (WhatsApp/SMS), Available now toggle | Emergency + channel required |

### 🖥️ What the Donor's Dashboard Shows

| Dashboard Card | What is Displayed |
|---|---|
| **Profile Snapshot** | Blood group, Full name, Gender, Age, City, Pincode |
| **Eligibility Status** | Ready/Waiting indicator, countdown to next eligible date, "Book Appointment" button |
| **Impact Stat** | Lives potentially saved (donations × 3) |
| **Urgent Blood Requests** | Nearby hospitals urgently needing their blood group, sorted by urgency + distance |
| **Personal Details** | Full address, family members + their blood groups |
| **Nearby Donation Camps** | Upcoming camps within their area — name, date, location, distance |
| **Donation History** | Full log: hospital, date, blood type, volume, status |

### 🔄 What the Donor Can Do (Features)

| Feature | Description |
|---|---|
| **Check eligibility** | Instantly see if they're eligible to donate (90-day cooldown tracker) |
| **Find donation camps nearby** | Browse upcoming camps organized by Hospital Admins and District Officers |
| **Emergency blood search** | Search for nearest hospital that has a specific blood group in stock (for family emergencies) |
| **Log a completed donation** | Record a donation → auto-updates their eligibility countdown |
| **Toggle availability** | Pause/resume emergency matching without deleting account |
| **Receive push notifications** | Alerts when their blood group is urgently needed nearby |

### ⚕️ Eligibility Health Screening (9 Questions)
Donors self-assess eligibility before each donation via these 9 NBTC-compliant questions:

1. Are you between 18 and 65 years old?
2. Is your weight at least 45 kg?
3. Do you have Diabetes, Heart disease, High blood pressure, or Thyroid problems?
4. Have you ever been diagnosed with HIV, Hepatitis B, or Hepatitis C?
5. Have you taken antibiotics or blood thinners in the last 7 days?
6. Have you donated blood in the last 90 days?
7. Are you pregnant or have you delivered in the last 6 months? *(females only)*
8. Have you had surgery, dental work, or tattoos in the last 3 months?
9. Are you currently feeling well (not sick with cold, fever, or flu)?

---

---

## Role 2: Hospital Staff

### 🏥 Who Is This?
A **Blood Bank Technician** who works day-to-day at a hospital's blood bank. They do operational tasks: logging new blood batches, recording usage, and managing expiry alerts.

### 📲 How They Access the App
- Receives an **invite link via email or SMS** from their Hospital Admin
- Clicks the invite → goes through a **token verification** (security gate)
- Sets a **password** (first time only)
- Logs in with **email + password**
- Gets access to the **Staff Dashboard**

> **Cannot self-register.** The Hospital Admin must invite them. This prevents unauthorized people from gaining access to hospital blood inventory data.

### 🔐 Permissions (What They Can and Cannot Do)

**CAN DO:**
- ✅ Log new blood batch (scan QR code → confirm expiry date → add to inventory)
- ✅ Update blood inventory levels (received units, used units)
- ✅ Mark batches as utilized / expired / spoiled / damaged
- ✅ View expiry alerts (24-hour warning for batches approaching expiry)
- ✅ Search for eligible donors in the area (by blood group + location)
- ✅ View AI demand forecast (7-day blood demand prediction)
- ✅ Accept or decline incoming transfer requests from other hospitals
- ✅ Enter surgical schedules (upcoming operations + blood requirements)

**CANNOT DO:**
- ❌ Invite other staff members (only Hospital Admin can)
- ❌ Approve or reject hospital registrations
- ❌ View other hospitals' inventory
- ❌ Access district or state-level analytics

### 🖥️ Staff Dashboard

| Section | What is Shown |
|---|---|
| **Blood Stock Summary** | Live count of all 8 blood groups available right now |
| **Batch List with Expiry** | Individual batch rows, colour-coded by expiry risk (green/yellow/red) |
| **Expiry Alerts Panel** | Batches expiring in <24 hours — highlighted with action buttons |
| **AI 7-Day Forecast** | Bar chart: predicted units needed per blood group in next 7 days |
| **Transfer Requests Board** | Incoming transfer requests to accept/decline + outgoing requests status |
| **Surgical Schedule View** | Upcoming surgeries + blood units they will likely need |
| **Donor Search** | Search donors by blood group within a radius |

### 🔔 Notifications Received
- WhatsApp/SMS when a batch is expiring in <24 hours
- Alert when a transfer request is created for their hospital

---

---

## Role 3: Hospital Admin

### 🔧 Who Is This?
The **Blood Bank Manager** of a hospital. They manage the entire hospital's blood bank operations, invite staff members, view analytics, and manage cross-hospital transfer requests.

### 📲 How They Access the App
- Submits a **hospital registration form** (includes hospital name, registration number, address, contact details)
- RaktSetu team does a **manual review** (48-hour approval window)
- On approval, receives an **email with credentials**
- Logs in with **email + password**
- Gets access to the **Hospital Admin Panel** (full control)

### 🔐 Permissions (What They Can and Cannot Do)

**CAN DO:**
- ✅ Everything Hospital Staff can do
- ✅ **Invite staff members** via email/SMS invite link
- ✅ **Manage staff accounts** (disable, remove, re-invite)
- ✅ View and act on AI 7-day demand forecast
- ✅ Create inter-hospital transfer requests (both manual and auto-triggered by system)
- ✅ View complete waste analytics ("How much blood did we waste this month?")
- ✅ Manage surgical schedules (enter operation theatre schedule)
- ✅ Set auto-expiry transfer alerts (enable/disable automatic transfer suggestion when blood is near expiry)
- ✅ Organize donation camps (create camp → appears on donors' dashboards in the area)

**CANNOT DO:**
- ❌ View other hospitals' staff lists
- ❌ Access district or state dashboards
- ❌ Approve other hospitals' registrations

### 🖥️ Hospital Admin Panel

| Section | What is Shown |
|---|---|
| **Staff Management** | List of all staff + invite new staff + disable accounts |
| **Full Inventory Dashboard** | All stock counters + batch-level detail |
| **AI Forecast Dashboard** | "We'll run out of O+ in 3 days" style prediction with confidence level |
| **Waste Analytics** | Monthly/weekly charts: units expired, units utilized, waste percentage |
| **Transfer Management** | Full transfer history — outgoing, incoming, accepted, declined |
| **Camp Creation Tool** | Create donation camp → name, date, address → auto-notifies eligible donors nearby |
| **Expiry Auto-Transfer Settings** | Configure automatic transfer alert triggers |

### 🔔 Notifications Received
- When blood is expiring AND a nearby hospital is running low (auto-transfer suggestion)
- When a transfer request is accepted or declined by another hospital
- When the AI forecast predicts upcoming shortage

---

---

## Role 4: District Officer

### 📊 Who Is This?
A **Government District Health Officer** who has oversight of ALL hospitals and blood banks within their district. They do not manage a single hospital — they see the big picture across all hospitals in their jurisdiction.

### 📲 How They Access the App
- Submits an application form using their **`.gov.in` government email** (required — personal emails not accepted)
- RaktSetu team does an **email OTP verification AND a manual phone call** to verify identity
- On approval, receives secure login credentials
- Logs in to the **District Officer Panel**

### 🔐 Permissions (What They Can and Cannot Do)

**CAN DO:**
- ✅ View ALL hospitals in their district — live blood stock for each
- ✅ See the **Shortage Prediction Heatmap** (which blood groups will be critical in which hospitals in 3-7 days)
- ✅ Use the **Camp Planning Tool** (schedule donation camps proactively BEFORE shortage hits)
- ✅ Export district-level reports (PDF/CSV for government records)
- ✅ Send emergency alerts to all hospitals in district during a blood crisis
- ✅ **Escalate to State Admin** when a district-wide shortage cannot be resolved at district level
- ✅ View aggregate donor density maps (how many donors of each blood group per area)

**CANNOT DO:**
- ❌ Log or update any hospital's blood inventory directly
- ❌ Invite hospital staff or admins
- ❌ See another district's data (limited to their own district)
- ❌ Access system-level settings

### 🖥️ District Officer Panel

| Section | What is Shown |
|---|---|
| **District Status Map** | All hospitals as pins on a map — colour-coded by stock level (green/yellow/red) |
| **Shortage Prediction Heatmap** | 3–7 day forecast: which hospitals, which blood groups will hit critical levels |
| **Camp Planning Tool** | Calendar + map to schedule camps in underserved areas |
| **Escalation to State** | One-click escalation report sent to State Admin when situation is critical |
| **Export Reports** | Download district-wide analytics for government reporting |
| **Donor Density Map** | Which pincodes have most/least donors per blood group |

### 🔔 Notifications Received
- When AI predicts a critical shortage in any hospital in the district (3-7 day advance warning)
- When a hospital in their district escalates an emergency

---

---

## Role 5: State Admin

### 🏛️ Who Is This?
A **State Health Department official** who has oversight of ALL districts in a state. This is a high-level government role, above the District Officer. They see state-level analytics, cross-district trends, and make policy-level decisions.

### 📲 How They Access the App
- Nominated by a State Health Department (not self-apply)
- Goes through **Government ID verification + Central RaktSetu team approval**
- Gets highly secured access with RBAC role = `state`
- Logs in to the **State Admin Dashboard**

### 🔐 Permissions (What They Can and Cannot Do)

**CAN DO:**
- ✅ View state-wide analytics (aggregate data across ALL districts)
- ✅ View **Cross-District Transfer Dashboard** (blood moving between districts)
- ✅ Monitor **Waste Reduction KPIs** (state target: reduce blood waste to <5%)
- ✅ Receive **Policy Alerts** when any district exceeds shortage thresholds
- ✅ View **Funding Recommendations** (AI-generated: which districts need more donation camp funding)
- ✅ View all district officers' escalation reports
- ✅ Access full audit logs (read-only)

**CANNOT DO:**
- ❌ Directly modify any hospital's inventory
- ❌ Manage individual users or system settings
- ❌ Access another state's data

### 🖥️ State Admin Dashboard

| Section | What is Shown |
|---|---|
| **State Overview Map** | All districts colour-coded by blood supply health status |
| **Cross-District Transfer View** | Blood moving between districts — approved, pending, completed |
| **Waste Reduction KPI** | Monthly waste % per district vs state target |
| **Policy Alerts** | Automated alerts when shortage exceeds policy threshold in any district |
| **Funding Recommendation** | AI-suggested: "District X needs 3 more donation camps this month" |
| **District Officer Reports** | All escalation reports from district officers |

### 🔔 Notifications Received
- When any district's shortage exceeds the state-defined threshold
- When a district officer escalates an emergency to state level
- Weekly state-level summary report

---

---

## Role 6: System Admin

### ⚙️ Who Is This?
The **RaktSetu platform's own administrator** — a developer or operations person from the RaktSetu team itself. This is NOT a user of the blood management system; this is the person who **runs and maintains the entire platform**.

### 📲 How They Access the App
- **Internal superadmin invite only** — cannot register from the public website
- Requires **MFA (Multi-Factor Authentication)**
- Requires **device authentication** (only pre-approved devices)
- Logs in to the **Admin Console** (a completely separate internal panel)

### 🔐 Permissions (What They Can and Cannot Do)

**CAN DO:**
- ✅ **User & Role Management** — create/disable/modify any user account across all roles
- ✅ Approve or reject Hospital Admin registrations (the 48-hour review step)
- ✅ Approve or reject District Officer applications
- ✅ View **Full Audit Logs** (every action by every user on the platform)
- ✅ **System Health Dashboard** — server uptime, API response times, DB connection status
- ✅ **Database Backups** — trigger manual backups, schedule automatic backups
- ✅ **Feature Flags** — turn on/off features without code deployment (e.g. enable/disable emergency search)
- ✅ View error monitoring (Sentry alerts for crashes and bugs)
- ✅ Manage API keys for Firebase, Twilio, Google Maps, WhatsApp

**CANNOT DO:**
- ❌ (By design) should not casually modify blood inventory data — only for audit/oversight

### 🖥️ Admin Console

| Section | What is Shown |
|---|---|
| **User & Role Management** | All 6 types of users, their status (active/suspended), role assignment |
| **Pending Approvals** | Hospital Admin registrations waiting for review, District Officer applications |
| **Audit Log Viewer** | Full timestamped log of every action on the platform (who did what, when) |
| **System Health** | Uptime %, DB connections, API latency, error rate |
| **Backup Management** | Last backup timestamp, trigger backup, restore from backup |
| **Feature Flags Panel** | Toggle features on/off per environment (dev, staging, production) |
| **Integration Status** | Firebase OK ✅ / Twilio OK ✅ / Google Maps OK ✅ |

---

---

## How All 6 Roles Interact With Each Other

```
PLATFORM HIERARCHY (Top → Bottom)
──────────────────────────────────────────────────────────────────────
[6] System Admin (RaktSetu team)
     ↓ Manages all users, approvals, platform
[5] State Admin (State Health Dept.)
     ↓ Views state-wide, escalation from districts
[4] District Officer (Govt. Health Officer)
     ↓ Plans camps, views shortages, escalates to state
[3] Hospital Admin (Blood Bank Manager)
     ↓ Invites staff, manages hospital, creates camps
[2] Hospital Staff (Blood Bank Technician)
     ↓ Updates daily inventory, logs batches
[1] Blood Donor (General Public)
     ↓ Donates blood when matched/alerted
──────────────────────────────────────────────────────────────────────
```

### Key Interaction Flows

| From | To | Interaction |
|---|---|---|
| **System Admin** → **Hospital Admin** | Approves or rejects the hospital registration request |
| **System Admin** → **District Officer** | Approves the government officer's platform access |
| **Hospital Admin** → **Hospital Staff** | Invites staff members via email/SMS link |
| **Hospital Staff** → **Blood Donor** | Staff creates urgent blood requests → appears on donor dashboard |
| **Hospital Admin** → **Blood Donor** | Admin creates donation camps → camps appear on donor dashboard |
| **District Officer** → **Hospital Admin** | Plans camps in hospital's area → hospital sees increased donors |
| **District Officer** → **State Admin** | Escalates critical shortage situation upward for intervention |
| **State Admin** → **District Officer** | Monitors KPIs and sends policy alerts to districts |
| **AI Engine** → **Blood Donor** | Sends targeted notifications when donor's blood group is needed nearby |
| **AI Engine** → **Hospital Admin** | Generates 7-day demand forecast visible on hospital dashboard |
| **AI Engine** → **District Officer** | Generates shortage heatmap predictions for district oversight |

---

## Authentication Methods by Role

| Role | Login Method | Registration Process | Security Level |
|---|---|---|---|
| **Blood Donor** | Phone OTP (+ Google OAuth) | Self-register, instant access | Low friction |
| **Hospital Staff** | Email + Password | Invited by Hospital Admin, set password on first login | Medium |
| **Hospital Admin** | Email + Password | Submit registration form → 48h manual review by System Admin | High |
| **District Officer** | Email + Password | `.gov.in` email required → email OTP + manual phone call verification | Very High |
| **State Admin** | Email + Password | Government nomination → Gov ID verification + central team approval | Highest |
| **System Admin** | Email + Password + MFA + Device Auth | Internal invite only, no public access | Maximum |

---

## Database Role Field

All non-donor users are stored in the `users` table with a `role` field:

```sql
users {
  id             INT PK
  email          VARCHAR(255) UNIQUE
  password_hash  VARCHAR(255)
  role           ENUM('donor', 'staff', 'admin', 'district', 'state', 'sysadmin')
  hospital_id    INT FK → hospitals.id  (nullable — district/state/sysadmin have NULL here)
  created_at     TIMESTAMP
}
```

The `role` field controls what each user sees in the React frontend via RBAC middleware:
- `donor` → Donor dashboard
- `staff` → Hospital staff dashboard
- `admin` → Hospital admin panel
- `district` → District officer panel
- `state` → State admin dashboard
- `sysadmin` → Internal admin console

> **Note:** Donors have a **separate `donors` table** (phone-based, not email-based). Hospital users, officers, and admins use the `users` table above.

---

## Summary Comparison Table

| Feature | Donor | Hospital Staff | Hospital Admin | District Officer | State Admin | System Admin |
|---|---|---|---|---|---|---|
| **Self-register?** | ✅ Yes | ❌ No (invite) | ❌ No (apply) | ❌ No (apply) | ❌ No (nominate) | ❌ No (internal) |
| **Login method** | Phone OTP | Email + PW | Email + PW | Email + PW | Email + PW | Email + PW + MFA |
| **Can see blood inventory?** | ❌ | ✅ Own hospital | ✅ Own hospital | ✅ All (district) | ✅ All (state) | ✅ Everything |
| **Can update blood inventory?** | ❌ | ✅ Yes | ✅ Yes | ❌ | ❌ | ❌ |
| **Can invite other users?** | ❌ | ❌ | ✅ (Staff only) | ❌ | ❌ | ✅ (All) |
| **Can see AI forecast?** | ❌ | ✅ (own hospital) | ✅ (own hospital) | ✅ (district heatmap) | ✅ (state KPIs) | ✅ |
| **Can create donation camps?** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Can receive urgency alerts?** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Can approve registrations?** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Access to audit logs?** | ❌ | ❌ | ❌ | ❌ | ✅ (read) | ✅ (full) |
| **Platform scope** | Personal | 1 hospital | 1 hospital | 1 district | 1 state | Entire platform |
| **Color code** | 🔴 Red | 🔵 Blue | 🟢 Green | 🟡 Yellow | 🟣 Purple | ⬛ Slate/Grey |

---

## Why 6 Roles (Not More or Less)?

| Why NOT fewer? | Why NOT more? |
|---|---|
| Separating Hospital Staff and Hospital Admin is needed — staff shouldn't control who has access to the system. | Adding a "Patient" role (hospital patient who needs blood) is explicitly not in scope — they use the emergency locator as public users, no login needed. |
| District Officer is genuinely different from Hospital Admin — they see across all hospitals, not just one. | Adding a "Camp Organizer" role is unnecessary — Hospital Admins and District Officers already create camps. |
| State Admin is required for government adoption at scale — district officers cannot access state-level policy. | Adding a "Donor Family Member" role is unnecessary — the Donor profile already allows listing family members + blood groups. |
| System Admin is essential for operations — cannot give hospital managers access to user accounts and backups. | |

---

*Report compiled from: `RaktSetu_WebOnly_Complete_Guide.html`, `temp3.html`, `temp4.html`, `temp.html`, `arc/raktsetu_full_user_flow.html`, `arc/donor_data_fields.html`, `arc/user_dashboard.html`, `RaktSetu_Complete_Engineering_Guide.html`*
