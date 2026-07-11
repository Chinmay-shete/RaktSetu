# 🩸 RaktSetu — Authentication & User Registration Guide

This guide details the **Login** and **Registration/Setup** processes for all 6 user roles in the **RaktSetu** platform.

---

## 📌 Quick Portal Directory

| Portal Type | Public URL Path | Supported Roles | Authentication Method |
| :--- | :--- | :--- | :--- |
| **Unified Portal** | `/login` | Donors, Hospital Staff, Sysadmins | OTP (Donors) \| Email & Password (Staff/Sysadmins) |
| **Hospital Admin Portal** | `/admin/login` | Hospital Admins | Email & Password |
| **Hospital Staff Portal** | `/staff/login` | Hospital Staff | Email & Password |
| **District Officer Portal** | `/district/login` | District Officers | Email & Password |
| **State Admin Portal** | `/state/login` | State Coordinators | Email & Password |
| **System Admin Portal** | `/systemadmin/login` | Root System Admins | Email & Password + 2FA (MFA) |

---

## 👥 User Roles: Step-by-Step Flow

### 1. ⚙️ System Admin (Root)
Root administrator overseeing system configurations, hospital approvals, officer approvals, audit logs, and settings.
* **How to Register**: 
  - There is no public registration form for security.
  - Pre-seeded directly into the database (e.g., via `npm run seed`).
* **How to Log In**:
  1. Visit `/systemadmin/login`.
  2. Enter Email: `system@raktsetu.gov` and Password: `password123`.
  3. Enter 2FA (TOTP) verification code: **`123456`** (mock code configured for local testing).

---

### 2. 🏛️ State Coordinator (State Admin)
Oversees cross-district transfer requests, state-wide supply/waste KPIs, and funding recommendations.
* **How to Register**:
  - Registered manually by a System Admin, or pre-seeded.
* **How to Log In**:
  1. Visit `/state/login`.
  2. Enter your email and password.

---

### 3. 🛡️ District Officer
Monitors regional hospital registries, organizes blood donation camps, and manages emergency district alerts.
* **How to Register**:
  1. Visit `/district/register`.
  2. Fill in your name, designation, government email, phone number, and jurisdiction (State & District).
  3. Set a custom password.
  4. **System Admin Approval Required**: The account is placed in `Pending` state. The System Admin must log in to `/systemadmin/approvals` and click **Approve User** next to your name to activate the account.
* **How to Log In**:
  1. Visit `/district/login`.
  2. Enter your email and password once approved.

---

### 4. 🏥 Hospital Admin (Director / Manager)
Manages hospital credentials, staff invitations, AI demand forecasts, stock threshold configurations, and analytics.
* **How to Register**:
  1. Visit `/admin/register` (Hospital Application form).
  2. Fill in the Hospital Name, Type (Govt/Private), License Numbers, City/State/Pincode, and Authorized Email.
  3. Upload the registration license document.
  4. **System Admin Approval Required**: The application goes into `Pending`. The System Admin must approve the hospital via `/systemadmin/approvals`.
  5. **Mailing the Temporary Password**: Once approved, a temporary password is automatically generated and sent to the hospital's email.
* **How to Log In**:
  1. Visit `/admin/login`.
  2. Enter the authorized email and the temporary password.
  3. You will be prompted to set a permanent custom password upon your first successful login.

---

### 5. 🩺 Hospital Staff (Technician / Receptionist)
Logs daily collections, updates blood inventory groups, schedules surgeries, and requests blood bag transfers.
* **How to Register**:
  - A Hospital Admin goes to their dashboard -> **Invite Staff** and enters the staff member's Name and Email.
  - The system generates an Invitation Token and emails a registration link to the staff member.
  - The staff member clicks the link, enters their email, and sets a custom password to complete setup.
* **How to Log In**:
  1. Visit `/staff/login` (or `/login`).
  2. Enter your email and password.

---

### 6. 🩸 Blood Donor (Public User)
Searches for local donation camps, schedules appointments, logs health metrics, and views eligibility status.
* **How to Register**:
  1. Visit `/register-donor` (or click "Register" on `/login`).
  2. Enter your Email or 10-digit Mobile Number.
  3. Receive and verify the 6-digit SMS OTP code.
  4. Fill in your profile details: Name, Age, Gender, Weight, City, Blood Group, and last donation date to complete setup.
* **How to Log In**:
  1. Visit `/login`.
  2. Enter your registered Email or Mobile Number.
  3. Verify the 6-digit OTP code sent to your phone/email to establish your session.
