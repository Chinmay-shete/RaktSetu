# 🩸 RaktSetu — Blood Supply Management Platform

RaktSetu is an AI-powered blood supply management and forecasting platform designed as an optimization and coordination layer for hospitals and blood banks in India.

---

## 🏗️ Project Architecture & User Portals

RaktSetu supports a **6-user role hierarchy** to coordinate blood supply across hospitals, districts, and states:

1. **🩸 Blood Donor**: Direct-to-donor portal for tracking personal donation impact, scheduling next eligibility dates, and locating nearby camps.
2. **🏥 Hospital Staff**: Inventory managers who log new blood bags, approve or decline peer-to-peer transfer requests, and resolve emergency SOS demands.
3. **🔧 Hospital Admin**: Executives who manage staff invites, set critical stock alert thresholds, and analyze automated waste metrics.
4. **📊 District Officer**: Government officials who monitor all hospitals in their district, analyze shortage prediction heatmaps, approve/schedule community camps, and escalate issues.
5. **🏛️ State Admin**: Regional directors overseeing cross-district transfers, monitoring state-wide waste percentages, and viewing AI-generated funding recommendations.
6. **⚙️ System Admin**: Platform maintenance portal containing audit logs, user suspension controls, backup execution, and API integration checks.

---

## 📂 Directory Structure

The project has been organized into a clean, standard full-stack layout:

```text
RaktSetu/
├── backend/                  # Node.js + Express + MySQL Backend
│   ├── config/               # Database connection pool configurations
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Auth validation, error handling, rate limiting
│   ├── models/               # SQL database schema and migrations
│   ├── routes/               # Express routing (versioned under /v1)
│   ├── services/             # Third-party integrations (Twilio, Resend)
│   └── server.js             # Main backend application entry point
│
├── frontend/                 # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components & layouts
│   │   ├── context/          # Role-based React contexts (Auth, Hospital, District, etc.)
│   │   ├── pages/            # View pages grouped by user role portal
│   │   ├── services/         # API clients and HTTP helper services
│   │   └── App.jsx           # Main Router definitions
│   └── vite.config.js        # Vite bundler configurations
│
└── docs/                     # Project Documentation & Resources
    ├── architecture/         # System design diagrams, DFDs, ER schemas, and user flows
    ├── design/               # HTML UI mockups and visual guidelines
    ├── ui-assets/            # Screenshot examples and layout stitches
    ├── reports/              # QA test audits, fix reports, and readiness audits
    ├── guides/               # Developer onboarding, OTP setup, and manual prerequisites
    ├── prompts/              # Original prompt specifications and PRD references
    └── planning/             # Historical planning documents
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Before running the application, make sure you have:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) (v9+ recommended)
- [MySQL](https://www.mysql.com/) (v8.0+ required for spatial GIS indexing support)

---

### ⚙️ Environment Variables Setup

Configure the environment files for both components:

1. **Root Reference**: Copy the root environment template:
   ```bash
   cp .env.example .env
   ```
2. **Backend**:
   Navigate to the `backend/` folder, copy `.env.example` as `.env`, and customize your MySQL credentials, Twilio credentials, and Resend email keys:
   ```bash
   cd backend
   cp .env.example .env
   ```
3. **Frontend**:
   Navigate to the `frontend/` folder, copy `.env.example` as `.env`, and update the Vite configurations:
   ```bash
   cd frontend
   cp .env.example .env
   ```

---

### 💻 Running the Application

You can control both servers directly from the project root using our coordinated npm scripts:

#### 1. Install Dependencies for Both Projects
```bash
npm run install:all
```
*This installs dependencies for both `backend/` and `frontend/` in a single command.*

#### 2. Start the Development Servers Concurrently
```bash
npm run dev
```
*This starts the Express backend (defaulting to Port `5000`) and the Vite frontend dev server (defaulting to Port `5173`) concurrently.*

#### 3. Other Utility Commands (from Root)
- Run backend tests: `npm run test:backend`
- Build frontend for production: `npm run build:frontend`
- Lint frontend code: `npm run lint:frontend`

---

## 🛡️ License & Project Reference

For questions, audit findings, or deployment credentials, please refer to the files in the [docs/reports/](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/docs/reports) and [docs/guides/](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/docs/guides) directories.
