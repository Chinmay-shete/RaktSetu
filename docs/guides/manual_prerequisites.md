# RaktSetu Beginner-Friendly Guide: Server Setup & Manual Verification

This document provides a step-by-step, copy-paste guide for setting up and running the RaktSetu backend services and database. It is designed for anyone (including non-IT students) to follow along.

---

## 🛠️ Step 1: Start the MySQL Database & Load Schema

We need to make sure the database is running and the tables are created.

### 1. Start the MySQL Server
Open your terminal application and copy-paste this command to start the database service:
```bash
/opt/homebrew/bin/brew services start mysql
```
*(You should see a message saying: `Successfully started mysql`).*

### 2. Load the Tables (Schema)
Run this command to automatically read the schema file and create all 16 tables:
```bash
/opt/homebrew/bin/mysql -u root < "/Users/chinu/Developer/VS CODE NOT IMP/RaktSetu/backend/models/schema.sql"
```
*(If the command finishes with no errors, your database is set up successfully).*

---

## 🚀 Step 2: Start the Node.js Core Backend Server

The main backend server handles user requests, logins, and registers accounts.

### 1. Open a New Terminal Window

### 2. Navigate to the Backend Folder
Run this command to go into the backend folder:
```bash
cd "/Users/chinu/Developer/VS CODE NOT IMP/RaktSetu/backend"
```

### 3. Install NPM Packages
Run this command to download the packages the code needs:
```bash
npm install
```

### 4. Start the Server
Run this command to launch the server:
```bash
npm run dev
```
Keep this terminal window open! You will see server messages like:
- `Database connection pool established successfully.`
- `RaktSetu API Core Server successfully running on fallback port 5002.`

---

## 🤖 Step 3: Start the Python Flask AI Microservice

The AI service handles forecasting and demand predictions.

### 1. Open a New Terminal Window

### 2. Navigate to the AI Folder
```bash
cd "/Users/chinu/Developer/VS CODE NOT IMP/RaktSetu/backend/ai"
```

### 3. Start the AI Server
Run the python app using the pre-configured virtual environment:
```bash
./.venv/bin/python app.py
```
Keep this terminal window open! You will see:
- `Starting RaktSetu Flask AI service on port 5001...`
- `Running on http://127.0.0.1:5001`

---

## 📊 Step 4: Populate Test Data (Required for Step 3 Geolocation Search)

To test finding nearby blood donation camps and urgent emergency requests, we need to add sample records in the database.

### 1. Open a New Terminal Window

### 2. Connect to MySQL Command Line
Run this command to enter the MySQL interface:
```bash
/opt/homebrew/bin/mysql -u root
```
*(Your terminal prompt will change to `mysql>`).*

### 3. Copy-Paste the Test SQL Commands
Copy the entire block below and paste it into the mysql command line, then press **Enter**:
```sql
USE raktsetu;

-- 1. Insert a District (Pune)
INSERT INTO districts (id, name, state, officer_id, zone) 
VALUES (1, 'Pune', 'Maharashtra', NULL, 'West')
ON DUPLICATE KEY UPDATE name=name;

-- 2. Insert a Hospital in Pune (Koregaon Park)
INSERT INTO hospitals (id, name, district_id, type, lat, lng, location, license_no, address, city, state, pincode, contact, verification_status)
VALUES (1, 'Koregaon Park City Life Hospital', 1, 'Private', 18.5362, 73.8940, ST_GeomFromText('POINT(73.8940 18.5362)', 4326), 'LIC-99998', 'Koregaon Park Lane 1', 'Pune', 'Maharashtra', '411001', '+9120223344', 'verified')
ON DUPLICATE KEY UPDATE name=name;

-- 3. Insert an Emergency Blood Request at that Hospital (O+ Blood Group)
INSERT INTO emergency_requests (id, hospital_id, blood_group, units, target_timestamp, status, message, lat, lng, location)
VALUES (1, 1, 'O+', 5, DATE_ADD(NOW(), INTERVAL 2 DAY), 'pending', 'Urgent requirement for surgery', 18.5362, 73.8940, ST_GeomFromText('POINT(73.8940 18.5362)', 4326))
ON DUPLICATE KEY UPDATE blood_group=blood_group;

-- 4. Insert an Approved Donation Camp nearby (~4 km away in Viman Nagar)
INSERT INTO donation_camps (id, name, camp_date, address, location, district_id, organizer, capacity, expected_donors, status)
VALUES (1, 'Kalyani Nagar Community Center Camp', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Kalyani Nagar, Pune', ST_GeomFromText('POINT(73.9032 18.5463)', 4326), 1, 'Rotary Club Pune', 100, 50, 'upcoming')
ON DUPLICATE KEY UPDATE name=name;
```
Type `exit` and press **Enter** to leave the MySQL CLI.

---

## 🔑 Step 5: How to Register & Log In via OTP (Testing the Auth Flow)

Here is how you manually register a donor using curl commands in the terminal:

### 1. Request an OTP Code
Run this command in the terminal to request an OTP code for a phone number:
```bash
curl -i -X POST -H "Content-Type: application/json" -d '{"phone": "+919876543210", "purpose": "registration"}' http://localhost:5002/api/v1/auth/send-otp
```

### 2. Find the Code in Server Logs
- Go back to the **Node.js Terminal Window** (from Step 2).
- Look at the bottom of the logs. You will see a box like this:
  ```text
  ==================================================
  [RaktSetu OTP Verification]
  Phone:   +919876543210
  Purpose: registration
  Code:    123456
  ==================================================
  ```
- Copy that 6-digit `Code` (for example, `123456`).

### 3. Verify the OTP
Run this command, replacing `YOUR_CODE` with the 6-digit code you found in the logs:
```bash
curl -i -X POST -H "Content-Type: application/json" -d '{"phone": "+919876543210", "otp": "YOUR_CODE", "purpose": "registration"}' http://localhost:5002/api/v1/auth/verify-otp
```
*(This will return a long `verification_token` string. Copy it!)*

### 4. Register the Donor
Run this command to create the donor account. Replace `YOUR_VERIFICATION_TOKEN` with the long token you copied in the previous step:
```bash
curl -i -X POST -H "Content-Type: application/json" -d '{"role":"donor","phone":"+919876543210","email":"donor@example.com","password":"password123","verificationToken":"YOUR_VERIFICATION_TOKEN"}' http://localhost:5002/api/v1/auth/register
```
*(You will receive a response containing your `token` which is your JWT Access Token. Your account is now fully created!).*
