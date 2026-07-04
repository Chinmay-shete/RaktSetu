# 🍎 RaktSetu — macOS Setup & Run Guide

This quick-start guide details how to install, configure, and run the **RaktSetu Blood Supply Management Platform** on **macOS**.

---

## 🚀 Quick Run (TL;DR)

If you already have Node.js, Python 3, and MySQL installed and running:

```bash
# 1. Setup environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Install all dependencies
npm run install:all

# 3. Create database & import schema
mysql -u root < backend/models/schema.sql

# 4. Setup Python virtual environment
cd backend/ai && python3 -m venv .venv && ./.venv/bin/pip install -r requirements.txt && cd ../..

# 5. Start Core Stack (Frontend & Backend)
npm run dev

# 6. Start AI Service (In a new terminal window)
cd backend/ai && ./.venv/bin/python app.py
```

---

## 🛠️ Detailed Setup Instructions

### 1. macOS Prerequisites

Ensure you have [Homebrew](https://brew.sh/) installed. Then run:

```bash
# Install Node.js (v18+) and MySQL (v8.0+)
brew install node mysql

# Verify Python 3 is installed
python3 --version
```

---

### 2. Start MySQL & Set Up Database

#### A. Start MySQL Service
Launch the database server as a background service via Homebrew:
```bash
brew services start mysql
```

#### B. Import the SQL Schema
Run the schema script to automatically create the `raktsetu` database and its 20 tables:
```bash
# If your root user has a password:
mysql -u root -p < backend/models/schema.sql

# If your root user has NO password:
mysql -u root < backend/models/schema.sql
```

---

### 3. Initialize Python Environment (AI Service)

Navigate to the AI directory, create a virtual environment, and install dependencies:
```bash
cd backend/ai
python3 -m venv .venv
./.venv/bin/pip install -r requirements.txt
cd ../..
```

---

### 4. Running the Development Servers

#### A. Start the React Frontend & Express Backend
In your main terminal at the project root, run:
```bash
npm run dev
```
*   **Vite Frontend UI**: http://localhost:5173
*   **Node.js Backend API**: http://localhost:5000

#### B. Start the Python Flask AI Service
Open a **new terminal window**, navigate to the AI microservice folder, and run:
```bash
cd "/Users/chinu/Developer/VS CODE NOT IMP/RaktSetu/backend/ai"
./.venv/bin/python app.py
```
*   **Flask AI Server**: http://localhost:5001

---

## 📊 Verification & Health Checks

Verify that everything is operating correctly by sending a request to the backend health endpoint:
```bash
curl -i http://localhost:5000/api/v1/health
```
**Expected Response**:
```json
{
  "status": "OK",
  "services": {
    "database": { "status": "healthy" },
    "api": { "status": "healthy" }
  }
}
```

---

## 🛑 Stopping Services

*   **Stop Dev Servers**: Press `Ctrl + C` in the running terminal windows.
*   **Stop MySQL Service**:
    ```bash
    brew services stop mysql
    ```
*   **Force Kill Leftover Port Processes**:
    If a service didn't shutdown correctly and a port is blocked, run:
    ```bash
    kill -9 $(lsof -t -i:5000 -i:5001 -i:5173)
    ```
