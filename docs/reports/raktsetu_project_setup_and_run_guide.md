# 🩸 RaktSetu — Project Setup & Run Guide

> **Version**: 1.0.0 | **Date**: July 2026 | **Platform**: macOS / Linux

---

## 📌 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [User Role Hierarchy](#3-user-role-hierarchy)
4. [System Architecture](#4-system-architecture)
5. [Prerequisites (Required Before Running)](#5-prerequisites-required-before-running)
6. [Environment Variables Setup](#6-environment-variables-setup)
7. [Step-by-Step: Running the Full Project](#7-step-by-step-running-the-full-project)
8. [Port Reference](#8-port-reference)
9. [Troubleshooting Common Errors](#9-troubleshooting-common-errors)

---

## 1. Project Overview

**RaktSetu** is an AI-powered blood supply management and forecasting platform designed as an optimization and coordination layer for hospitals, blood banks, government district officers, and state-level administrators across India.

It provides:
- Real-time blood inventory tracking across hospitals
- OTP-based secure authentication for multiple user roles
- AI-driven shortage prediction and demand forecasting
- Emergency blood request handling and peer-to-peer hospital transfers
- Geolocation-based nearby camp and emergency request search
- Donation camp scheduling and district-level management

---

## 2. Technology Stack

| Layer              | Technology                        | Purpose                                        |
|--------------------|-----------------------------------|------------------------------------------------|
| **Frontend**       | React 18 + Vite                   | UI framework and dev/build toolchain           |
| **Frontend CSS**   | Tailwind CSS                      | Utility-first styling                          |
| **Frontend State** | React Context API                 | Role-based state management (Auth, Hospital, etc.) |
| **Core Backend**   | Node.js + Express.js              | REST API server (versioned under `/api/v1/`)   |
| **AI Microservice**| Python 3 + Flask                  | Forecasting, shortage prediction, demand analytics |
| **Database**       | MySQL 8.0+                        | Relational database with Spatial GIS support   |
| **Auth**           | JWT (jsonwebtoken)                | Secure access, refresh, and OTP tokens         |
| **SMS OTP**        | Twilio                            | Donor phone number OTP verification            |
| **Email**          | Resend                            | Staff invite emails and notifications          |

---

## 3. User Role Hierarchy

RaktSetu supports **6 user roles**, each with a dedicated portal:

| Role | Description |
|------|-------------|
| 🩸 **Blood Donor** | Track personal donation history, eligibility, and nearby camps |
| 🏥 **Hospital Staff** | Log blood bags, approve/decline transfer requests, resolve SOS |
| 🔧 **Hospital Admin** | Manage staff invites, configure alert thresholds, view waste metrics |
| 📊 **District Officer** | Monitor all hospitals in a district, manage camps, escalate issues |
| 🏛️ **State Admin** | Oversee cross-district transfers, view AI funding recommendations |
| ⚙️ **System Admin** | Audit logs, user suspension, backup execution, API health checks |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Port 5173)                       │
│              React + Vite Frontend (Tailwind CSS)            │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP API Calls
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Node.js Express Backend (Port 5000/5002)        │
│   - REST API: /api/v1/auth, /api/v1/donor, etc.             │
│   - JWT Auth Middleware                                      │
│   - Role-Based Access Control (RBAC)                        │
│   - OTP Service (Twilio SMS + Resend Email)                 │
└──────────────┬──────────────────────────┬───────────────────┘
               │ SQL Queries              │ HTTP to AI Service
               ▼                          ▼
┌──────────────────────┐    ┌─────────────────────────────────┐
│  MySQL 8.0+ Database │    │  Python Flask AI Service (5001)  │
│  - 16+ Tables        │    │  - Shortage prediction           │
│  - Spatial GIS Index │    │  - Demand forecasting            │
│  - Geolocation data  │    │  - Analytics engine              │
└──────────────────────┘    └─────────────────────────────────┘
```

---

## 5. Prerequisites (Required Before Running)

> **IMPORTANT**: All of the following must be installed and configured on your machine **before** you attempt to run the project. Skipping any of these will cause errors.

### ✅ 5.1 Node.js & npm

- **Required Version**: Node.js **v18 or higher**, npm **v9 or higher**
- **Install**: Download from https://nodejs.org/
- **Verify Installation**:
  ```bash
  node --version   # Should print: v18.x.x or higher
  npm --version    # Should print: 9.x.x or higher
  ```

### ✅ 5.2 Python 3 & pip

- **Required Version**: Python **3.9 or higher**
- **Install**: Download from https://www.python.org/
- **Verify Installation**:
  ```bash
  python3 --version   # Should print: Python 3.9.x or higher
  pip3 --version
  ```

### ✅ 5.3 MySQL Server (v8.0+)

> **WARNING**: MySQL **v8.0+** is strictly required for Spatial GIS support (`ST_GeomFromText`, geolocation indexing). Earlier versions will not work.

- **Install via Homebrew (macOS)**:
  ```bash
  brew install mysql
  ```
- **Verify Installation**:
  ```bash
  mysql --version   # Should print: mysql  Ver 8.x.x
  ```

### ✅ 5.4 Third-Party API Keys

These are required for full functionality (OTP, email invites):

| Service  | Purpose                              | Sign Up               |
|----------|--------------------------------------|-----------------------|
| **Twilio** | SMS OTP for donor phone verification | https://twilio.com  |
| **Resend** | Email notifications and staff invites | https://resend.com  |

> **NOTE**: If you are running in **development/demo mode only**, OTP codes are printed directly to the backend terminal logs, so Twilio/Resend are optional for local testing.

### ✅ 5.5 Python Virtual Environment (AI Service)

The AI microservice uses a pre-configured virtual environment. It should already exist at:
```
backend/ai/.venv/
```

If it doesn't exist, create it:
```bash
cd "/Users/chinu/Developer/VS CODE NOT IMP/RaktSetu/backend/ai"
python3 -m venv .venv
./.venv/bin/pip install -r requirements.txt
```

---

## 6. Environment Variables Setup

> **IMPORTANT**: You must create `.env` files for **both** the backend and frontend before starting. The app will crash on startup without them.

### 6.1 Backend `.env`

Navigate to the backend folder and create the `.env` file:
```bash
cd "/Users/chinu/Developer/VS CODE NOT IMP/RaktSetu/backend"
cp .env.example .env
```

Then open `backend/.env` and fill in your values:

```env
# Server Port
PORT=5000

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=raktsetu

# JWT Secrets (must be at least 32 characters each)
JWT_SECRET=your_super_secure_jwt_secret_key_here_32chars
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_32chars
JWT_OTP_SECRET=your_super_secure_otp_secret_key_here_32chars

# Node Environment
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# AI Service URL
AI_SERVICE_URL=http://localhost:5001

# Twilio (optional for local dev - OTP printed to logs)
TWILIO_ACCOUNT_SID=ACyour_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# Resend Email (optional for local dev)
EMAIL_API_KEY=re_your_resend_api_key
EMAIL_FROM_ADDRESS=onboarding@resend.dev
```

### 6.2 Frontend `.env`

Navigate to the frontend folder and create the `.env` file:
```bash
cd "/Users/chinu/Developer/VS CODE NOT IMP/RaktSetu/frontend"
cp .env.example .env
```

The default frontend `.env` values work as-is for local development:
```env
VITE_API_URL=http://localhost:5000/v1
VITE_API_BASE_URL=http://localhost:5000/v1
VITE_ADMIN_EMAIL=admin@raktsetu.org
VITE_ADMIN_PASSWORD=admin123
```

---

## 7. Step-by-Step: Running the Full Project

Follow these steps **in order**. Each step requires a separate terminal window.

---

### 🔵 Step 1 — Start MySQL Database

Open **Terminal 1** and run:
```bash
brew services start mysql
```

Expected output:
```
Successfully started mysql (label: homebrew.mxcl.mysql)
```

---

### 🔵 Step 2 — Load the Database Schema (First Time Only)

Still in **Terminal 1**, run this command once to create all 16 database tables:
```bash
mysql -u root < "/Users/chinu/Developer/VS CODE NOT IMP/RaktSetu/backend/models/schema.sql"
```

If the command completes without any errors, your database is set up.

> **TIP**: You only need to run this once. On subsequent runs, skip this step unless you have deleted the database or made schema changes.

---

### 🔵 Step 3 — Install All Dependencies (First Time Only)

Open **Terminal 2** at the project root and run:
```bash
cd "/Users/chinu/Developer/VS CODE NOT IMP/RaktSetu"
npm run install:all
```

This installs npm packages for both the `backend/` and `frontend/` in a single command.

---

### 🔵 Step 4 — Start Backend + Frontend Servers

In **Terminal 2** (from the project root), run:
```bash
npm run dev
```

This starts **both** servers concurrently:
- ✅ **Express Backend** → http://localhost:5000 (or 5002 as fallback)
- ✅ **Vite React Frontend** → http://localhost:5173

You should see output similar to:
```
[backend]  Database connection pool established successfully.
[backend]  RaktSetu API Core Server running on port 5000.
[frontend] VITE v5.x.x  ready in 500ms
[frontend] ➜  Local: http://localhost:5173/
```

---

### 🔵 Step 5 — Start the Python Flask AI Microservice

Open a **new Terminal 3** and run:

```bash
cd "/Users/chinu/Developer/VS CODE NOT IMP/RaktSetu/backend/ai"
./.venv/bin/python app.py
```

Expected output:
```
Starting RaktSetu Flask AI service on port 5001...
 * Serving Flask app 'app'
 * Running on http://127.0.0.1:5001
```

> **WARNING**: If you see **"Port 5001 is already in use"**, a previous instance is still running. Kill it first:
> ```bash
> kill -9 $(lsof -t -i:5001)
> ```
> Then re-run the Python command above.

---

### 🔵 Step 6 — Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

All 6 role portals are accessible from this URL based on your login credentials.

---

### 🔵 Step 7 (Optional) — Load Test Data for Geolocation Features

To test finding nearby blood donation camps and emergency requests, load sample records.

Connect to MySQL:
```bash
mysql -u root
```

Then paste and run this SQL:
```sql
USE raktsetu;

-- Insert a District
INSERT INTO districts (id, name, state, officer_id, zone)
VALUES (1, 'Pune', 'Maharashtra', NULL, 'West')
ON DUPLICATE KEY UPDATE name=name;

-- Insert a Hospital
INSERT INTO hospitals (id, name, district_id, type, lat, lng, location, license_no, address, city, state, pincode, contact, verification_status)
VALUES (1, 'Koregaon Park City Life Hospital', 1, 'Private', 18.5362, 73.8940, ST_GeomFromText('POINT(73.8940 18.5362)', 4326), 'LIC-99998', 'Koregaon Park Lane 1', 'Pune', 'Maharashtra', '411001', '+9120223344', 'verified')
ON DUPLICATE KEY UPDATE name=name;

-- Insert an Emergency Blood Request
INSERT INTO emergency_requests (id, hospital_id, blood_group, units, target_timestamp, status, message, lat, lng, location)
VALUES (1, 1, 'O+', 5, DATE_ADD(NOW(), INTERVAL 2 DAY), 'pending', 'Urgent requirement for surgery', 18.5362, 73.8940, ST_GeomFromText('POINT(73.8940 18.5362)', 4326))
ON DUPLICATE KEY UPDATE blood_group=blood_group;

-- Insert a Donation Camp
INSERT INTO donation_camps (id, name, camp_date, address, location, district_id, organizer, capacity, expected_donors, status)
VALUES (1, 'Kalyani Nagar Community Center Camp', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Kalyani Nagar, Pune', ST_GeomFromText('POINT(73.9032 18.5463)', 4326), 1, 'Rotary Club Pune', 100, 50, 'upcoming')
ON DUPLICATE KEY UPDATE name=name;
```

Type `exit` and press **Enter** to leave the MySQL CLI.

---

## 8. Port Reference

| Service                    | Port   | URL                              |
|----------------------------|--------|----------------------------------|
| React Frontend (Vite)      | `5173` | http://localhost:5173            |
| Express Backend             | `5000` (fallback: `5002`) | http://localhost:5000/api/v1 |
| Flask AI Microservice       | `5001` | http://localhost:5001            |
| MySQL Database              | `3306` | localhost:3306                   |

---

## 9. Troubleshooting Common Errors

### ❌ `SyntaxError: Unexpected token '}'` in jwtService.js
**Cause**: Duplicate orphaned code block was present at the end of `verifyOtpVerificationToken`.
**Fix**: Remove the duplicate code block (lines 142–146 in the original file). This has already been fixed in the current codebase.

---

### ❌ `Port 5001 is already in use`
**Cause**: Previous Flask AI process is still running in the background.
**Fix**:
```bash
kill -9 $(lsof -t -i:5001)
```

---

### ❌ `Database connection pool failed` or `ECONNREFUSED 127.0.0.1:3306`
**Cause**: MySQL is not running, or `DB_PASSWORD` in `backend/.env` is incorrect.
**Fix**:
```bash
brew services start mysql
```
Then verify your credentials in `backend/.env`.

---

### ❌ `CRITICAL ERROR: JWT_SECRET environment variable is missing`
**Cause**: `backend/.env` file is missing or a JWT secret is less than 32 characters.
**Fix**: Ensure `backend/.env` exists and all three JWT secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_OTP_SECRET`) are at least 32 characters each.

---

### ❌ `Module not found` or `Cannot find module` errors
**Cause**: npm dependencies not installed.
**Fix**:
```bash
cd "/Users/chinu/Developer/VS CODE NOT IMP/RaktSetu"
npm run install:all
```

---

### ❌ Flask warning: `Importing plotly failed`
**Cause**: `plotly` is not installed in the Python virtual environment.
**Status**: This is a **warning only** and does NOT prevent the AI service from starting.
**Fix** (optional — only needed for interactive plots):
```bash
cd backend/ai
./.venv/bin/pip install plotly
```

---

*For further documentation, refer to the guides in `docs/guides/` and other reports in `docs/reports/`.*
