# 🩸 RaktSetu — AI-Driven Predictive Blood Logistics & Coordination Platform

**RaktSetu** is a next-generation, intelligent blood logistics coordination layer designed to eliminate supply shortages and inventory wastage. By combining machine learning time-series forecasting, spatial GIS routing, and a secure multi-portal architecture, RaktSetu optimizes the blood supply chain across donors, hospitals, districts, and state administrations.

---

## 🧠 Core Technical & AI Pillars

### 📈 1. Predictive Demand Forecasting (Prophet ML Engine)
RaktSetu integrates a Python forecasting microservice powered by **Facebook Prophet** to analyze historical collection and consumption data.
* **Proactive Inventory Rebalancing**: Predicts monthly blood category demand (A+, O-, etc.) at the hospital and district levels.
* **Waste Prevention**: Alerts administrators of upcoming surplus or seasonal deficits before inventory expires (FEFO: First Expired, First Out).

### 📍 2. Spatial GIS Emergency SOS Routing
Utilizing MySQL spatial indexing and **Leaflet.js + OpenStreetMap**, the platform implements real-time proximity coordination:
* **`ST_Distance_Sphere` Querying**: Automatically identifies and ranks the nearest eligible donors and peer hospitals during emergency SOS requests.
* **Zero-Budget Mapping**: Interactive visual camp-finders and transfer trackers operating without expensive proprietary map APIs.

### 🛡️ 3. Safe Peer-to-Peer Logistics & Idempotency
Cross-hospital transfers are secured against duplicate submissions and race conditions:
* **Idempotency-Key Validation**: Redis-backed transactional validation protects peer-to-peer blood requests against network retries.
* **Double-Entry Ledger Routing**: Automates stock reservation upon transfer approval and updates both supplier and receiver inventories atomically.

### 🔒 4. Granular Multi-Portal Architecture
Secured by JWT-based state-aware middleware, the platform segments coordination workflows into 6 role-based portals:
1. **🩸 Donor Portal**: Self-scheduling, donation eligibility countdowns, and real-time donation camp locators.
2. **🏥 Hospital Staff**: Real-time blood bag inventory logging, transfer validations, and emergency SOS dispatch.
3. **⚙️ Hospital Admin**: Dynamic stock threshold controls, staff user provisioning, and waste analytics.
4. **📊 District Officer**: District-wide shortage heatmaps, community camp scheduling, and hospital performance oversight.
5. **🏛️ State Coordinator**: Cross-district transfer authorization, state-wide waste percentages, and AI-generated resource allocation insights.
6. **🔧 System Administrator**: Real-time system health checks, secure backup execution, audit logs, and API gateway health monitoring.

---

## 📂 Repository Structure

The workspace follows a clean, decoupled monorepo structure:

```text
RaktSetu/
├── backend/                  # Core REST API (Node.js + Express + MySQL)
│   ├── config/               # Database pool, Redis client & SSL/TLS settings
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # JWT verification, validation schemas & error handlers
│   ├── models/               # SQL schemas and seeder scripts
│   ├── routes/               # Express routing (versioned under /api/v1)
│   ├── services/             # Twilio SMS & Resend email notification pipelines
│   └── server.js             # API entry point
│
├── frontend/                 # Client UI SPA (React + Vite + Vanilla CSS)
│   ├── src/
│   │   ├── components/       # Reusable layouts, Leaflet maps & UI elements
│   │   ├── context/          # React Auth and Portal global state providers
│   │   ├── pages/            # View pages segmented by user role portal
│   │   └── App.jsx           # Client-side router configuration
│   └── vite.config.js        # Vite bundler configurations
│
└── nginx/                    # Production reverse-proxy configuration templates
```

---

## 🚀 Quick Start (Local Development)

### 📋 Prerequisites
* **Node.js** (v18+ recommended)
* **MySQL** (v8.0+ required for spatial GIS indexing support)
* **Redis** (Required for caching and idempotency layers)
* **Python** (v3.10+ required for running the AI service)

### ⚙️ Environment Configuration
1. Copy the root environment template into your local directories:
   ```bash
   cp .env.example backend/.env
   cp .env.example frontend/.env
   ```
2. Open `backend/.env` and update your MySQL, Redis, and API key credentials.

### ⚙️ Database Seeding (For Tests & Development)
Initialize your local database tables and load the mock test scenarios:
```bash
cd backend
npm run migrate    # Creates tables using models/migrations/001_initial_schema.sql
node seed.js       # Seeds default districts, hospitals, and test users
```

### 💻 Running the Application
Install dependencies and run both servers concurrently:
```bash
# Install root, backend, and frontend dependencies
npm install

# Run backend API and Vite dev servers concurrently
npm run dev
```

### 🧪 Running Tests
Verify that all 19 Jest integration test cases pass:
```bash
cd backend
npm test
```

---

## 🛡️ Security & Production Hardening
* **Database TLS**: SSL configuration is enabled via `DB_SSL=true` using secure CA certificates.
* **Cache Security**: Redis TLS is enforced for all cloud redis configurations.
* **Audit Logging**: System-critical operations (like cross-district approvals and user status changes) are tracked in the database `audit_logs` table.
