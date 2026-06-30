# 🩸 RaktSetu — Donor User: Complete Reference Report

> **Source:** Full scan of `/RaktSetu` project — including `arc/`, `Design/`, `RacktSetu/src/`, `temp*.html`, root HTML files, and improvement report.
> **Date Generated:** June 13, 2026
> **Purpose:** Understand exactly what data is collected from the Donor user, what they see on their dashboard, and how they interact with the rest of the RaktSetu ecosystem.

---

## 📋 TABLE OF CONTENTS

1. [Who is the Donor User?](#1-who-is-the-donor-user)
2. [Donor Onboarding — All Data Collected](#2-donor-onboarding--all-data-collected)
3. [Eligibility Health Screening — 9 Questions](#3-eligibility-health-screening--9-questions)
4. [Donor Dashboard — What is Displayed](#4-donor-dashboard--what-is-displayed)
5. [Complete Donor User Flow — Step by Step](#5-complete-donor-user-flow--step-by-step)
6. [Donor Feature Flows (A through F)](#6-donor-feature-flows-a-through-f)
7. [Donor APIs & Database Contract](#7-donor-apis--database-contract)
8. [How the Donor Interacts with Other User Types](#8-how-the-donor-interacts-with-other-user-types)
9. [Data Architecture — Donor Table in Database](#9-data-architecture--donor-table-in-database)
10. [Notification System for Donors](#10-notification-system-for-donors)
11. [Summary Table: Data Collected vs Data Displayed](#11-summary-table-data-collected-vs-data-displayed)

---

## 1. Who is the Donor User?

The **Donor** is a public-facing, self-signup user in the RaktSetu platform. They are ordinary citizens willing to donate blood. There are 4 user types in RaktSetu:

| Role | Color Code | Access Method |
|---|---|---|
| 🔴 **Blood Donor** | Red | Self-signup via phone OTP — open to public |
| 🔵 **Hospital Staff** | Blue | Invite-only (admin-generated link) |
| 🟢 **Hospital Admin** | Green | Apply + 48h manual verification |
| 🟡 **District Officer** | Yellow | `.gov.in` email + manual RaktSetu team verification |

> The Donor is the **only user type that can register themselves** without any invitation or approval. Everyone else needs verification.

---

## 2. Donor Onboarding — All Data Collected

Registration is a **5-screen wizard**. Here is every single field collected, whether it is required or optional, and why it exists.

---

### 📱 Screen 1 — Phone Verification (Identity)

| Field | Type | Required? | Why Collected |
|---|---|---|---|
| **Mobile Number** | 10-digit number, +91 prefix | ✅ Required | Primary identity. Used for OTP login, WhatsApp alerts, SMS notifications. This IS your account identifier. |
| **OTP Code** | 6-digit, auto-expires in 5 min | ✅ Required | Proves the phone number actually belongs to this person. Prevents fake registrations with someone else's number. |

> **Login method:** Donors do NOT use a password. Phone OTP is the only login method.  
> **Alternative:** Google OAuth (via Google account) is also offered on the registration screen.

---

### 👤 Screen 2 — Basic Profile (Demographics)

| Field | Type | Required? | Why Collected |
|---|---|---|---|
| **Full Name** | Text, 2–60 characters | ✅ Required | Shown to hospital when donor responds to an urgent request. Hospital needs to know who is coming. |
| **Age** | Number, 18–65 only | ✅ Required | Legal eligibility. Below 18 or above 65 cannot donate per NBTC India guidelines. Blocked upfront if invalid. |
| **Gender** | Male / Female / Other | ✅ Required | Females have different weight & haemoglobin thresholds vs males. Affects eligibility check logic. Also controls which questions to show (e.g., pregnancy question). |
| **Blood Group** | Dropdown: O+, O−, A+, A−, B+, B−, AB+, AB− | ✅ Required | **Most critical field.** How the system matches the donor to a hospital urgently needing that exact blood group. |

---

### 📍 Screen 2 (continued) — Location (Geography)

| Field | Type | Required? | Why Collected |
|---|---|---|---|
| **City** | Text with autocomplete | ✅ Required | Used to show nearby donation camps and hospitals. Without this, the app cannot show relevant content. |
| **Pincode** | 6-digit number | ✅ Required | More precise than city. Lets the system calculate real distance to nearest hospital needing their blood group. |
| **GPS / Live Location** | Device permission prompt | ⬜ Optional | If allowed — shows exact nearest hospital in real time. If denied — pincode is used as fallback for distance calculation. |

---

### 🏥 Screen 3 — Donation History (Eligibility Calculation)

| Field | Type | Required? | Why Collected |
|---|---|---|---|
| **Have you donated before?** | Yes / No toggle | ✅ Required | First-time donors get different onboarding message. Returning donors need last donation date to calculate eligibility. |
| **Date of last donation** | Date picker | ⬜ Optional (shown only if donated before = Yes) | NBTC rule: must wait 90 days between whole blood donations (56 days platelets). Calculates exactly when they can next donate and shows countdown. |
| **Type of last donation** | Whole Blood / Platelets / Plasma | ⬜ Optional (shown only if donated before = Yes) | Each type has a different waiting period: Whole Blood = 90 days, Platelets = 14 days, Plasma = 28 days. Changes the eligibility countdown. |

---

### 💊 Screen 4 — Health Quick-Check (Medical Screening)

| Field | Type | Required? | Why Collected |
|---|---|---|---|
| **Weight above 45 kg?** | Yes / No | ✅ Required | NBTC minimum weight rule. Below 45 kg = cannot donate. If No — show polite ineligibility message and block. |
| **Any chronic illness?** | Yes / No (if Yes → optional text to name it) | ✅ Required | Diabetes, HIV, Hepatitis B/C, Heart disease = permanent or temporary deferral. System flags and does not match them to urgent requests. |
| **Taken any medication in last 7 days?** | Yes / No | ⬜ Optional | Antibiotics or blood thinners = temporary deferral. Optional to reduce friction since most donors won't have this. |
| **Pregnant or breastfeeding?** | Yes / No | ⬜ Optional (shown only if Gender = Female) | Pregnancy and 6 months post-delivery = cannot donate. Hidden for males to reduce clutter. |

---

### 🔔 Screen 5 — Notification Preferences (Settings)

| Field | Type | Required? | Why Collected |
|---|---|---|---|
| **Notify when blood group needed urgently** | Toggle — default ON | ✅ Required | Core purpose of the app. If OFF, they cannot serve as an emergency donor in the matching system. |
| **Notify about donation camps nearby** | Toggle — default ON | ⬜ Optional | Drives proactive (non-emergency) donations. Can be turned off by those who only want emergency alerts. |
| **Notification channel** | WhatsApp / SMS / Both (radio select) | ✅ Required | Not all donors have WhatsApp. SMS is fallback for rural donors with basic phones. Must offer both options. |
| **Available to donate right now** | Toggle — default ON | ⬜ Optional | Lets donor pause availability when travelling, sick, or busy. System skips them for matching during OFF period without deleting their account. |

> **Final action:** "Complete Registration & Go to Dashboard" button.

---

## 3. Eligibility Health Screening — 9 Questions

After registration, and whenever a donor tries to check eligibility, they go through a 9-question screening (based on NBTC India guidelines). This is a **self-assessment** — not a medical diagnosis.

| Q# | Question | Disqualifying Answer | Reason / Deferral |
|---|---|---|---|
| **Q1** | Are you between 18 and 65 years old? | No | Age out of range — permanent block |
| **Q2** | Is your weight at least 45 kg? | No | Below minimum — permanent block |
| **Q3** | Have you had Diabetes, Heart disease, High blood pressure, or Thyroid problems? | Yes | Chronic illness — temporary or permanent deferral |
| **Q4** | Have you ever been diagnosed with HIV, Hepatitis B, or Hepatitis C? | Yes | Permanent deferral — protects recipients |
| **Q5** | Have you taken any antibiotics or blood-thinning medications in the last 7 days? | Yes | 7-day temporary deferral |
| **Q6** | Have you donated blood in the last 90 days? | Yes | 90-day deferral rule (whole blood) |
| **Q7** | Are you currently pregnant or have you delivered a baby in the last 6 months? | Yes | Maternal safety — deferral (shown only if Female) |
| **Q8** | Have you had any surgery, dental work, or tattoos in the last 3 months? | Yes | Infection risk — 3-6 month deferral |
| **Q9** | Are you currently feeling well (not sick with cold, fever, or flu)? | No | Acute illness — temporary deferral until recovery |

> **Result:** System calculates next eligible date based on deferral and shows it to the donor. A push notification is scheduled to fire on that date to remind them they can donate again.

---

## 4. Donor Dashboard — What is Displayed

The donor dashboard is a **dark-themed glassmorphism bento grid** layout. Here are all the cards/sections shown:

---

### 🏠 Dashboard Header
- **Personalized greeting:** "Welcome back, [Name]"
- **Tagline:** "Your dashboard to save lives."
- **Availability toggle** (top right): "Available for Emergencies" — Green switch (ON/OFF). Toggles the donor in and out of the emergency matching pool without deleting their account.

---

### Card 1 — 👤 Profile Snapshot (Left column, tall card)
Displays all core identity info collected during onboarding:
- **Blood drop icon** with blood group prominently in the center (e.g., "O+")
- **Full Name** (e.g., Rahul Sharma)
- **Gender + Age** (e.g., Male, 28 years)
- **Location badge:** City + Pincode (e.g., Pune, 411014) with a location pin icon

---

### Card 2 — ✅ Eligibility Status (Top right wide card)
Dynamically calculated from donation history:
- **Status icon:** Green checkmark (Ready) or Yellow warning (Waiting)
- **Status title:** "Ready to Donate" or "Not Available"
- **Subtitle text:**
  - If ready: "It's been [X] days since your last donation."
  - If waiting: Shows countdown to next eligible date
- **Action button:** "Book Appointment" (when ready) or disabled state (when in waiting period)
- This card also responds to the **Availability toggle** in the header — if toggled OFF, the card changes to "Not Available" + "You've paused emergency alerts."

---

### Card 3 — 💙 Your Impact (Small stats card)
Gamification / motivation metric:
- **Large number:** Total potential lives saved (formula: donations × 3)
- **Label:** "Potential lives saved"
- **Subtitle:** "Based on [N] successful whole blood donations."

---

### Card 4 — 🚨 Urgent Local Requests (Large scrollable card)
**This is how the Donor interacts with Hospital Staff/Admins.** The system matches urgent blood requests from hospitals to donors with matching blood groups nearby.

Each request item shows:
- **Priority badge:** "High Priority" (red) / "Medium Priority" (yellow)
- **Hospital Name** (e.g., Ruby Hall Clinic)
- **Distance:** "3.2 km away"
- **Urgency:** "Needed within 4 hours" / "Needed by tomorrow" / "Scheduled Surgery"
- **Action button:** "Respond" (high priority) or "View Details" (medium/low)

> Multiple requests are shown, sorted by urgency. The list is scrollable.

---

### Card 5 — 👤 Personal Details (Wide card)
Shows profile data collected during onboarding, with an **Edit Profile** button:
- **Residential Address:** Full address (e.g., A-204, Sapphire Park, Kalyani Nagar, Pune - 411014)
- **Family Members section:** Lists family members with their blood groups (e.g., Anita Sharma — A+, Rohan Sharma — O+)

> Note: Family member blood group data enables the donor to find blood for family emergencies (donor-to-family assistance).

---

### Card 6 — 📅 Nearby Donation Camps (Small card)
Shows camps coming up near the donor's pincode/GPS:
- **Camp name** (e.g., Lions Club Mega Drive)
- **Location** (e.g., Kalyani Nagar, 2 km away)
- **Date** (e.g., Oct 12)
- **Time** (e.g., 9 AM – 2 PM)

> Multiple camps listed. This data comes from Hospital Admins / District Officers who create camps.

---

### Card 7 — 🕒 Recent Donations (Full-width history card)
Shows the donor's complete donation log:
- **Date & time** (e.g., 14 May 2023, 10:30 AM)
- **Status badge:** "Successful" (green) / "Deferred" etc.
- **Hospital/Camp name** (e.g., Apollo Hospital)
- **Organized by:** (e.g., RaktSetu Foundation)
- **Location** (e.g., Bund Garden Road, Pune)
- **Donation type & volume** (e.g., Whole Blood (350ml))
- A "View all history" tile at the end

---

## 5. Complete Donor User Flow — Step by Step

### Registration Flow (First-Time User) — 7 Steps

```
Step 1: Splash screen → Tap "Get started"
Step 2: Phone number input → Type number → Tap "Send OTP"
Step 3: System sends OTP SMS → 6-digit code delivered
Step 4: OTP entry screen → Enter OTP → Tap "Verify"
Step 5: Profile form → Enter Name, Blood Group, DOB → Tap "Next"
Step 6: Location permission dialog → Tap "Allow" (or deny → pincode fallback)
Step 7: POST /auth/register → D1 (donors table) written → Profile saved
       ↓
       Home dashboard shown → Eligibility card visible
```

### Login Flow (Returning User) — 3 Steps

```
Step 1: Phone number input
Step 2: OTP sent + verified
Step 3: JWT token issued → Dashboard loads
```

---

## 6. Donor Feature Flows (A through F)

### Flow A — Onboarding & Registration (described above)

---

### Flow B — Check Eligibility

```
Donor taps "Am I eligible?" card
   ↓
GET /donors/:id → reads last_donated from D1 (donors table)
   ↓
System computes: last_donated + 90 days = eligible_on
   ↓
Decision:
  ✅ If today ≥ eligible_on → Show GREEN "Ready to Donate!" → Find nearby camp
  ❌ If today < eligible_on → Show ORANGE countdown timer with exact eligible date
```

---

### Flow C — Find Donation Camp

```
Donor taps "Camps near me" tab
   ↓
System reads GPS coordinates (or uses pincode as fallback)
   ↓
GET /camps?lat=X&lng=Y&r=50km → D2 (donation_camps) geo-query
   ↓
If camps found: Camp list + map pins shown
If no camps:    "No camps nearby" message shown
   ↓
Donor taps camp → View details (address, time, contact)
```

---

### Flow D — Emergency Blood Search

```
Donor taps "Find blood" (for emergency — e.g., for a family member)
   ↓
Donor selects blood group needed
   ↓
System reads GPS location
   ↓
GET /emergency/search?bloodGroup=O+&lat=X&lng=Y
→ D3 (blood_stock_summary) geo-query
→ System ranks results by distance
   ↓
Top 3 hospitals shown with: name, distance, units available, phone number
   ↓
Donor taps hospital → Call button / Navigate button
```

---

### Flow E — Log a Donation

```
Donor taps "I just donated" button on dashboard
   ↓
Hospital selector → Search & pick hospital where they donated
   ↓
Date picker → Select donation date
   ↓
Confirm screen → Summary shown before saving
   ↓
POST /donors/:id/donation → D1 write: last_donated updated
PUT /donors/:id → D1 update: eligible_on = last_donated + 90 days
   ↓
Background: Schedule FCM push notification for eligible_on date
   ↓
"Thank you!" screen shown + next eligible date displayed
Optional: Share achievement badge
```

---

### Flow F — Receive & Respond to Emergency Notification

```
Donor receives push notification: "You're eligible to donate again!"
   ↓
Tap notification → Deep link → raktsetu://eligibility
   ↓
App opens directly to Eligibility screen
   ↓
"Ready to donate" ✅ green status confirmed
   ↓
Donor taps "Find a camp" → Continues with Flow C
```

---

## 7. Donor APIs & Database Contract

### Databases Touched by Donor Actions

| Data Store | Table Name | What Donor Actions Read/Write |
|---|---|---|
| **D1** | `donors` | Registration, eligibility check, log donation, update profile |
| **D2** | `donation_camps` | Find nearby camps |
| **D3** | `blood_stock_summary` | Emergency blood search |

### API Endpoints — Donor Role

| Method | Endpoint | What It Does | DB Action |
|---|---|---|---|
| `POST` | `/auth/otp/send` | Send OTP to phone | None |
| `POST` | `/auth/otp/verify` | Verify OTP → returns JWT | None |
| `POST` | `/auth/register` | Save new donor profile | D1 **WRITE** |
| `GET` | `/donors/:id` | Get donor profile + eligibility status | D1 **READ** |
| `PUT` | `/donors/:id` | Update profile or availability toggle | D1 **UPDATE** |
| `POST` | `/donors/:id/donation` | Log a completed donation | D1 **WRITE** `last_donated` |
| `GET` | `/camps?lat&lng&r=50km` | Find nearby donation camps | D2 **READ** |
| `GET` | `/emergency/search?bloodGroup&lat&lng` | Find hospitals with matching blood | D3 **READ** |

### Database Fields — `donors` Table

```sql
donors {
  id              INT         PRIMARY KEY
  phone           VARCHAR(15)  -- Primary identifier (no password)
  blood_group     ENUM        -- O+, O-, A+, A-, B+, B-, AB+, AB-
  lat             DECIMAL     -- GPS latitude (from location permission)
  lng             DECIMAL     -- GPS longitude
  last_donated    DATE        -- Updated when donor logs a donation
  eligible_on     DATE        -- Computed: last_donated + 90 days
}
```

> Note: The `donors` table is intentionally lean. Extended fields (name, age, gender, notification preferences) are stored in a profile sub-document or companion table.

---

## 8. How the Donor Interacts with Other User Types

This is the heart of the RaktSetu ecosystem — how the Donor role connects to the other three roles.

---

### 🔴 Donor ↔ 🔵 Hospital Staff

**How it works:**
- Hospital Staff enter blood stock levels into the inventory system.
- The blood stock data is stored in `D3: blood_stock_summary`.
- When a **Donor** does an emergency blood search (Flow D), they are querying the stock data that **Hospital Staff** have entered.
- When a Hospital Staff creates an urgent blood request, it appears on the **Donor dashboard** in the "Urgent Local Requests" card.
- The Donor clicks "Respond" → they agree to come donate → Hospital Staff see the response in their dashboard.

**Data path:**
```
Hospital Staff updates stock → D3: blood_stock_summary
                                        ↓
                   Donor searches → GET /emergency/search reads D3
                                        ↓
                   Donor sees hospital name, distance, units available
                                        ↓
                   Donor calls/navigates to hospital
```

---

### 🔴 Donor ↔ 🟢 Hospital Admin

**How it works:**
- Hospital Admins create and manage **donation camps**.
- Camp data is stored in `D2: donation_camps`.
- When a **Donor** looks for nearby camps (Flow C), they are querying camps created by **Hospital Admins** (and District Officers).
- Hospital Admins also configure urgent blood request alerts — these appear on the Donor's dashboard in the "Urgent Local Requests" card.
- Hospital Admins can see aggregate donor response rates for their hospital.

**Data path:**
```
Hospital Admin creates camp → D2: donation_camps
                                      ↓
              Donor searches → GET /camps reads D2
                                      ↓
              Donor sees camp on dashboard (Nearby Camps card)
                                      ↓
              Donor attends camp → logs donation → D1 updated
```

---

### 🔴 Donor ↔ 🟡 District Officer

**How it works:**
- District Officers see **aggregate data** from all donors across all hospitals in their district.
- They view shortage heatmaps (which blood groups are critically low in which areas).
- This data influences their **camp planning** — they schedule camps in areas where donors are low or blood stock is depleted.
- The camps they create also appear in the Donor's dashboard.
- District Officers can see donor density maps — how many donors of each blood group exist in each pincode zone.

**Data path:**
```
All donor registrations → D1: donors (aggregated)
                                   ↓
     District Officer views shortage heatmap (blood group coverage)
                                   ↓
     District Officer plans camps in pincode areas with low donor coverage
                                   ↓
     Camps appear in D2: donation_camps
                                   ↓
     Donors nearby see camp on their dashboard → attend → donate
```

---

### 🔴 Donor ↔ AI Engine (Python/Flask)

**How it works:**
- The AI forecasting engine (Process P6) reads historical donation data from `D1: donors`.
- It also reads `D6: surgical_schedules` to predict future blood demand.
- When the AI predicts an upcoming shortage for a specific blood group in a specific area, it can **trigger proactive notifications** to eligible donors with that blood group nearby.
- This is the "smart matching" system — donors are not just passive; the AI can pull them in before hospitals run dry.

**Data path:**
```
AI engine reads D1: donors (eligible donors by blood group + location)
AI engine reads D6: surgical_schedules (upcoming demand forecast)
                           ↓
AI detects: "O+ shortage predicted in Pune in 3 days"
                           ↓
P6: Notify donor → FCM/WhatsApp push to eligible O+ donors near Pune
                           ↓
Donor receives: "Blood needed near you — donate this week"
```

---

## 9. Data Architecture — Donor Table in Database

### ER Relationship — Donor Entity

```
donors ─────────────────────────────── (standalone table)
  id
  phone            ← primary key / login identity
  blood_group      ← used for matching to hospital requests
  lat, lng         ← used for geo-proximity calculations
  last_donated     ← used for eligibility timer
  eligible_on      ← computed field: last_donated + 90 days

donors ────→ blood_stock_summary      (donor searches hospital stock)
donors ────→ donation_camps           (donor finds nearby camps)
```

### The 3 Data Stores Donor Touches

| Store | Table | Read or Write | When |
|---|---|---|---|
| **D1** | `donors` | Write | Registration, log donation, update profile |
| **D1** | `donors` | Read | Dashboard load, eligibility check |
| **D2** | `donation_camps` | Read | "Find camps near me" |
| **D3** | `blood_stock_summary` | Read | "Find blood" emergency search |

---

## 10. Notification System for Donors

Donors receive notifications via **FCM (Firebase Cloud Messaging)** push notifications, **WhatsApp**, or **SMS** — based on their notification channel preference.

### Types of Notifications Sent to Donors

| Trigger | Message | Channel | When Sent |
|---|---|---|---|
| **Eligibility restored** | "You're eligible to donate again! [Blood Group] is needed near you." | FCM / WhatsApp / SMS | Automatically on `eligible_on` date (cron job) |
| **Urgent blood request** | "URGENT: [Blood Group] needed at [Hospital Name] — [X km away]. Can you help?" | FCM / WhatsApp / SMS | When hospital creates an urgent request |
| **Nearby camp** | "Blood donation camp near you — [Camp Name] on [Date] at [Location]" | FCM / WhatsApp / SMS | When camp is scheduled in donor's area |
| **OTP login** | "Your RaktSetu OTP is [XXXXXX]. Valid for 5 minutes." | SMS | On login attempt |

### Notification Control (Donor can turn off each type)
- Emergency alerts toggle (default ON)
- Camp alerts toggle (default ON)
- Availability toggle (default ON — pauses ALL matching)

---

## 11. Summary Table: Data Collected vs Data Displayed

### Data Collected FROM Donor (Input)

| Category | Fields Collected | Required? |
|---|---|---|
| **Identity** | Mobile number, OTP code | ✅ Both Required |
| **Demographics** | Full name, Age, Gender, Blood group | ✅ All Required |
| **Location** | City, Pincode | ✅ Both Required |
| **Location** | GPS coordinates | ⬜ Optional |
| **Donation History** | Donated before (Y/N), Last donation date, Type of donation | ✅ Yes/No Required; date/type optional |
| **Health** | Weight ≥45kg, Chronic illness (Y/N), Medication (Y/N), Pregnant (Y/N for females) | Weight + Illness Required; others optional |
| **Notifications** | Emergency alert toggle, Camp alert toggle, Channel (WhatsApp/SMS/Both), Available now toggle | Emergency + Channel Required; others optional |

**Total fields: 18 fields (10 Required + 8 Optional)**

---

### Data Displayed TO Donor (Dashboard Output)

| Dashboard Section | Data Source | What is Shown |
|---|---|---|
| **Header** | Profile + system | Name, availability toggle |
| **Profile Card** | Donor's own data (D1) | Blood group, name, gender, age, city, pincode |
| **Eligibility Card** | Computed from D1 | Ready/waiting status, days since last donation, countdown to eligible date, "Book Appointment" button |
| **Impact Card** | Computed from D1 | Number of lives potentially saved (donations × 3) |
| **Urgent Requests Card** | Hospital requests (D3 + hospital data) | Nearby hospitals needing blood, distance, urgency level, respond button |
| **Personal Details Card** | Donor's own data (D1) | Full address, family members + their blood groups |
| **Nearby Camps Card** | D2 (donation_camps) | Camp name, location, distance, date, time |
| **Donation History Card** | D1 (donation log) | Date, hospital, type, volume, status per donation |

---

## Key Takeaways

1. **The Donor is the most public-facing user** — self-signup, no approval needed, phone OTP only.
2. **Blood group + location** are the two most critical data points — they determine which urgent requests and camps a donor sees.
3. **The eligibility timer** (90-day countdown from last donation) is the core mechanic — it controls whether a donor appears in the hospital matching system.
4. **The Availability toggle** is the "pause" button — donors can temporarily remove themselves from matching without deleting their account.
5. **Donors interact with Hospital Staff** through urgent blood request cards on their dashboard.
6. **Donors interact with Hospital Admins** through donation camp cards on their dashboard.
7. **Donors interact with District Officers** indirectly — officers plan camps based on donor density data.
8. **The AI engine** uses donor data to proactively alert donors before shortages hit, creating a prediction-driven supply chain instead of a reactive one.
9. **Notification channel preference** (WhatsApp/SMS/Both) is critical for rural reach — not all donors have smartphones.
10. **Family member blood groups** on the profile card enable donors to also use the platform to find blood for their own family — making it a dual-purpose tool.

---

*Report compiled from: `arc/donor_data_fields.html`, `arc/user_dashboard.html`, `arc/raktsetu_full_user_flow.html`, `arc/raktsetu_donor_diagrams.html`, `arc/raktsetu_er_dfd.html`, `arc/onboarding_screens_prompt.md`, `RacktSetu/src/components/DonorRegistration.jsx`, `raktsetu_eligibility_screening.html`, and `raktsetu_improvement_report.md`.*
