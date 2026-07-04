# 🩸 RaktSetu — Full-Stack Setup & Run Guide (Windows & macOS)

This report details how to set up, configure, and run the **RaktSetu Blood Supply Management Platform** on both **Windows** and **macOS** environments.

---

## 📌 Table of Contents

1. [System Requirements & Prerequisites](#1-system-requirements--prerequisites)
2. [Environment Configuration (`.env`)](#2-environment-configuration-env)
3. [macOS Step-by-Step Setup & Run Guide](#3-macos-step-by-step-setup--run-guide)
4. [Windows Step-by-Step Setup & Run Guide](#4-windows-step-by-step-setup--run-guide)
5. [Loading Database Schema & Mock Data](#5-loading-database-schema--mock-data)
6. [Testing the Verification & Login Flow (OTP Fallback)](#6-testing-the-verification--login-flow-otp-fallback)
7. [Port & Service Reference](#7-port--service-reference)
8. [Troubleshooting & Platform-Specific Issues](#8-troubleshooting--platform-specific-issues)

---

## 1. System Requirements & Prerequisites

Before setting up the project on either operating system, ensure the following software is installed on your system.

| Component | Required Version | macOS Installation | Windows Installation |
| :--- | :--- | :--- | :--- |
| **Node.js & npm** | Node v18+, npm v9+ | [Node.js Official Installer](https://nodejs.org) or via Homebrew (`brew install node`) | [Node.js Windows Installer (.msi)](https://nodejs.org) |
| **Python** | Python 3.9+ | Built-in or via Homebrew (`brew install python`) | [Python Windows Installer](https://www.python.org/downloads/) (Check **"Add python.exe to PATH"**) |
| **MySQL Database** | MySQL v8.0+ *(GIS required)* | Via Homebrew (`brew install mysql`) | [MySQL Installer for Windows](https://dev.mysql.com/downloads/installer/) (Install MySQL Server & Shell) |

> [!IMPORTANT]
> MySQL 8.0 or newer is strictly required. RaktSetu utilizes **Spatial GIS Indexing** (e.g., `ST_GeomFromText` and `POINT` geometry types) to calculate geographic distances between donors, hospitals, and blood camps. Older versions of MySQL do not support these features and will crash during database schema loading.

---

## 2. Environment Configuration (`.env`)

RaktSetu is a decoupled full-stack application and requires separate configuration files for the root project, core backend, and frontend UI.

### 2.1 Backend Environment Configuration
Create a file named `.env` in the `backend/` directory using `backend/.env.example` as a template:

```env
# Core Server Port
PORT=5000

# MySQL Database Details
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=raktsetu

# JWT Security Credentials (must be 32+ characters each)
JWT_SECRET=your_super_secure_jwt_secret_key_here_32chars
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_32chars
JWT_OTP_SECRET=your_super_secure_otp_secret_key_here_32chars

# Environment Mode
NODE_ENV=development

# Allowed CORS Origins
CORS_ORIGIN=http://localhost:5173

# AI Python Service URL
AI_SERVICE_URL=http://localhost:5001

# Twilio Credentials (SMS OTP - Optional for local dev. Fallbacks print code to logs)
TWILIO_ACCOUNT_SID=ACyour_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# Resend Email Service (Staff Invites - Optional for local dev)
EMAIL_API_KEY=re_your_resend_api_key
EMAIL_FROM_ADDRESS=onboarding@resend.dev
```

### 2.2 Frontend Environment Configuration
Create a file named `.env` in the `frontend/` directory using `frontend/.env.example` as a template:

```env
VITE_API_URL=http://localhost:5000/v1
VITE_API_BASE_URL=http://localhost:5000/v1
VITE_ADMIN_EMAIL=admin@raktsetu.org
VITE_ADMIN_PASSWORD=admin123
```

---

## 3. macOS Step-by-Step Setup & Run Guide

Follow these steps using your default terminal app (zsh/bash).

### Step 1: Clone & Go to Workspace Root
```bash
cd "/Users/chinu/Developer/VS CODE NOT IMP/RaktSetu"
```

### Step 2: Set Up Environment Files
Copy the example configs to active configuration files:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
*Open `backend/.env` and fill in your local MySQL root password.*

### Step 3: Install Project Dependencies
Use the unified npm workspace script from the root folder:
```bash
npm run install:all
```
*This installs dependencies for both `backend/` and `frontend/`.*

### Step 4: Start the MySQL Database
Start MySQL via Homebrew services:
```bash
brew services start mysql
```

### Step 5: Setup the Python AI Microservice Virtual Env
Initialize the Python environment and install the required dependencies:
```bash
cd backend/ai
python3 -m venv .venv
./.venv/bin/pip install -r requirements.txt
cd ../..
```

### Step 6: Start the Development Servers
1. **Terminal Window 1** (Core Stack):
   Run the concurrent Node.js developer script from the root directory:
   ```bash
   npm run dev
   ```
   *(This starts the core Node.js backend on Port `5000` and the React frontend on Port `5173`).*

2. **Terminal Window 2** (Python AI Service):
   Navigate to the AI folder and launch the Python Flask service:
   ```bash
   cd backend/ai
   ./.venv/bin/python app.py
   ```

---

## 4. Windows Step-by-Step Setup & Run Guide

Windows developers can choose between **Command Prompt (CMD)** and **PowerShell**. The setup steps below are split for both.

### Step 1: Open Terminal & Navigate to Project Root
*   **CMD**:
    ```cmd
    cd /d "C:\path\to\your\workspace\RaktSetu"
    ```
*   **PowerShell**:
    ```powershell
    cd "C:\path\to\your\workspace\RaktSetu"
    ```

### Step 2: Set Up Environment Files
Create configuration files from templates:
*   **CMD**:
    ```cmd
    copy .env.example .env
    copy backend\.env.example backend\.env
    copy frontend\.env.example frontend\.env
    ```
*   **PowerShell**:
    ```powershell
    cp .env.example .env
    cp backend/.env.example backend/.env
    cp frontend/.env.example frontend/.env
    ```
*Open `backend/.env` using a text editor (e.g. Notepad, VS Code) and update your `DB_PASSWORD`.*

### Step 3: Install Project Dependencies
Run the install command from the root directory:
```cmd
npm run install:all
```

### Step 4: Verify/Start MySQL Service
If MySQL was installed as a Windows Service (standard setup):
*   **Command Prompt (Run as Administrator)**:
    ```cmd
    net start MySQL80
    ```
*   **PowerShell (Run as Administrator)**:
    ```powershell
    Start-Service -Name MySQL80
    ```
*(If your service is named differently, check your services by typing `services.msc` in Windows Run).*

### Step 5: Setup the Python AI Microservice Virtual Env
Create the virtual environment using Windows-specific path resolution:
*   **CMD / PowerShell**:
    ```cmd
    cd backend\ai
    python -m venv .venv
    ```
Activate the virtual environment and install packages:
*   **CMD**:
    ```cmd
    .\.venv\Scripts\pip install -r requirements.txt
    cd ..\..
    ```
*   **PowerShell**:
    ```powershell
    # Note: If scripts are blocked on your system, enable script execution:
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
    .\.venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    cd ../..
    ```

### Step 6: Start the Development Servers
1. **Terminal Window 1** (Core Stack):
   Launch the Node servers concurrently:
   ```cmd
   npm run dev
   ```
2. **Terminal Window 2** (Python AI Service):
   Run the Python app directly using the virtual environment interpreter:
   ```cmd
   cd backend\ai
   .\.venv\Scripts\python app.py
   ```

---

## 5. Loading Database Schema & Mock Data

Once MySQL is running, load the database schema and sample tables.

### 5.1 Import Database Schema
Run the migration script to configure database schemas and foreign relationships. If you have set a MySQL root password, include the `-p` parameter:

*   **macOS / Linux**:
    ```bash
    mysql -u root -p < backend/models/schema.sql
    ```
*   **Windows (Command Prompt)**:
    ```cmd
    mysql -u root -p < backend\models\schema.sql
    ```
*   **Windows (PowerShell)**:
    ```powershell
    cmd /c "mysql -u root -p < backend\models\schema.sql"
    ```
*(Enter your MySQL password when prompted. If you do not have a password configured, omit `-p`).*

### 5.2 Load Geolocation Mock Test Data
Open a MySQL terminal and run the test commands to verify distance calculations:
```bash
mysql -u root -p
```
Run the following SQL snippet inside the MySQL console:
```sql
USE raktsetu;

-- 1. Setup a Test District
INSERT INTO districts (id, name, state, officer_id, zone) 
VALUES (1, 'Pune', 'Maharashtra', NULL, 'West')
ON DUPLICATE KEY UPDATE name=name;

-- 2. Setup a Test Hospital (Koregaon Park, Pune)
INSERT INTO hospitals (id, name, district_id, type, lat, lng, location, license_no, address, city, state, pincode, contact, verification_status)
VALUES (1, 'Koregaon Park City Life Hospital', 1, 'Private', 18.5362, 73.8940, ST_GeomFromText('POINT(73.8940 18.5362)', 4326), 'LIC-99998', 'Koregaon Park Lane 1', 'Pune', 'Maharashtra', '411001', '+9120223344', 'verified')
ON DUPLICATE KEY UPDATE name=name;

-- 3. Setup an Emergency Blood Request (O+ Blood Group)
INSERT INTO emergency_requests (id, hospital_id, blood_group, units, target_timestamp, status, message, lat, lng, location)
VALUES (1, 1, 'O+', 5, DATE_ADD(NOW(), INTERVAL 2 DAY), 'pending', 'Urgent requirement for surgery', 18.5362, 73.8940, ST_GeomFromText('POINT(73.8940 18.5362)', 4326))
ON DUPLICATE KEY UPDATE blood_group=blood_group;

-- 4. Setup a Blood Donation Camp (~4 km away in Kalyani Nagar)
INSERT INTO donation_camps (id, name, camp_date, address, location, district_id, organizer, capacity, expected_donors, status)
VALUES (1, 'Kalyani Nagar Community Center Camp', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Kalyani Nagar, Pune', ST_GeomFromText('POINT(73.9032 18.5463)', 4326), 1, 'Rotary Club Pune', 100, 50, 'upcoming')
ON DUPLICATE KEY UPDATE name=name;
```
Type `exit` and hit **Enter** to quit the MySQL prompt.

---

## 6. Testing the Verification & Login Flow (OTP Fallback)

To log in or register a new donor without an active Twilio SMS subscription, RaktSetu utilizes a development logs fallback.

1.  **Request OTP Token**: Make a POST request to request verification:
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"phone": "+919876543210", "purpose": "registration"}' http://localhost:5000/v1/auth/send-otp
    ```
2.  **Retrieve Verification Code**: Check the terminal logs of your running Node.js backend. You will see a debug console printout:
    ```text
    ==================================================
    [RaktSetu OTP Verification]
    Phone:   +919876543210
    Purpose: registration
    Code:    123456
    ==================================================
    ```
3.  **Submit Code & Verify**: Submit the code back to the API:
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"phone": "+919876543210", "otp": "123456", "purpose": "registration"}' http://localhost:5000/v1/auth/verify-otp
    ```
    *(This returns a long JWT token under `verification_token`)*
4.  **Register Account**: Register the account using the returned token:
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"role":"donor","phone":"+919876543210","email":"donor@example.com","password":"password123","verificationToken":"YOUR_TOKEN_HERE"}' http://localhost:5000/v1/auth/register
    ```

---

## 7. Port & Service Reference

| Port | Service | Access URL | Default State |
| :--- | :--- | :--- | :--- |
| **5173** | React UI (Vite) | http://localhost:5173 | Accessible via browser |
| **5000** | Node.js Backend API | http://localhost:5000/v1 | Rest Client (or fallback `5002` if port in use) |
| **5001** | Python Flask AI Server | http://localhost:5001 | Internal requests only |
| **3306** | MySQL Database | `localhost:3306` | Backend database layer |

---

## 8. Troubleshooting & Platform-Specific Issues

### ❌ Python Virtual Env Scripts Blocked on Windows (PowerShell)
*   **Error**: `.\.venv\Scripts\Activate.ps1 cannot be loaded because running scripts is disabled on this system.`
*   **Fix**: Windows restricts script execution by default in PowerShell. Enable execution for the current process:
    ```powershell
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
    ```

### ❌ Command `python3` or `mysql` not found in Terminal
*   **Cause**: System environment variable paths were not configured during installer setup.
*   **Fix (Windows)**:
    1. Open the Windows Search bar and search for **"Edit the system environment variables"**.
    2. Click **Environment Variables** at the bottom right.
    3. Select **Path** under "System Variables" and click **Edit**.
    4. Click **New** and add the installation directories for your tools:
       - **MySQL Server bin path**: `C:\Program Files\MySQL\MySQL Server 8.0\bin`
       - **Python executable path**: `C:\Users\<Username>\AppData\Local\Programs\Python\PythonXX`
    5. Restart all open terminals to apply path updates.

### ❌ Port Already In Use Errors (Port 5000, 5001, 5173)
*   **Error**: `Error: listen EADDRINUSE: address already in use :::5000` or Flask server refusing to bind to 5001.
*   **Fix (macOS)**:
    Identify and terminate the process holding the port:
    ```bash
    kill -9 $(lsof -t -i:5001)
    ```
*   **Fix (Windows)**:
    Use the Netstat utility in Command Prompt or PowerShell to find the PID and kill the process:
    ```cmd
    # Find the process ID (last column of output)
    netstat -ano | findstr :5001
    
    # Force close the process using the PID found
    taskkill /F /PID <PID_NUMBER>
    ```

### ❌ `CRITICAL ERROR: JWT_SECRET environment variable is missing`
*   **Cause**: The `.env` file in the `backend/` directory was either not copied, named incorrectly (e.g. `.env.txt`), or holds variables with fewer than 32 characters.
*   **Fix**: Ensure `backend/.env` exists and contains secure secret strings that exceed 32 characters for `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `JWT_OTP_SECRET`.
