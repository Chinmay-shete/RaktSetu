# Implementation Plan - Phase 1: Project Setup & Database

We are setting up the backend for **RaktSetu** inside the `backend/` folder. This phase establishes a modular folder structure, environment-based configuration, a MySQL connection pool, the complete database schema with spatial indexing, and standardized error response handling.

## User Review Required

> [!IMPORTANT]
> - All backend components will be strictly confined to the `backend/` directory.
> - The database schema uses **MySQL** (recommended version 8.0+) to support spatial types (`POINT`) and geospatial indexing (`SPATIAL INDEX`).
> - The database schema handles circular dependencies (e.g., `districts.officer_id` referencing `users.id` and `users.district_id` referencing `districts.id`) by creating tables first and applying foreign key constraints via `ALTER TABLE` at the end of the script.
> - All routes will be versioned under the `/v1` prefix.

## Proposed Changes

### Project Structure Setup

We will initialize the following modular structure in `backend/`:
```text
backend/
├── config/
│   └── db.js                  # MySQL Connection Pool
├── middleware/
│   └── errorHandler.js        # Standardized Error Handler
├── routes/
│   └── index.js               # Route routing with prefix /v1
├── controllers/
│   └── healthController.js    # Health check for DB & API status
├── models/
│   └── schema.sql             # SQL Script for DB initialization
├── services/
├── .env.example               # Template for environment variables
├── .env                       # Local environment variables
├── package.json               # Node.js project definition
└── server.js                  # App Entry Point
```

---

### Database Schema Design

The `schema.sql` file will define the 13 tables:
1. `districts`
2. `hospitals`
3. `users`
4. `blood_batches`
5. `transfer_requests`
6. `emergency_requests`
7. `notifications`
8. `donors`
9. `donation_camps`
10. `forecasts`
11. `surgical_schedules`
12. `alert_thresholds`
13. `audit_logs`

#### [NEW] [schema.sql](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/models/schema.sql)
Includes columns, foreign keys, check constraints, default values, and indexes:
- Combined index on `hospital_id + blood_group` in `blood_batches` and other inventory-related tables.
- Index on `expiry_date` in `blood_batches`.
- `SPATIAL INDEX` on `location` (type `POINT NOT NULL SRID 4326`) for `hospitals`, `emergency_requests`, and `donors`. (Coordinates lat/lng will also be stored in numeric columns for convenience).

---

### Project Configuration & Connection

#### [NEW] [package.json](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/package.json)
Dependencies: `express`, `mysql2`, `dotenv`, `cors`. Development dependencies: `nodemon`.

#### [NEW] [.env.example](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/.env.example)
Define standard environment variables:
`PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`.

#### [NEW] [db.js](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/config/db.js)
Establish a MySQL connection pool using `mysql2/promise`.

---

### Error Handling & Routing

#### [NEW] [errorHandler.js](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/middleware/errorHandler.js)
Standardize error format:
```json
{
  "error": true,
  "message": "Error message description",
  "code": "ERROR_CODE"
}
```

#### [NEW] [index.js](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/routes/index.js)
Register v1 endpoints.

#### [NEW] [server.js](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/backend/server.js)
Initialize Express, register routes, and bind the global error handling middleware.

## Verification Plan

### Automated Tests
- Syntax validation of SQL schema using a local parser or dry run (if MySQL is running locally).
- Start the server using `npm run dev` and hit the `/v1/health` endpoint to ensure the application starts and successfully establishes a connection pool with the MySQL database.

### Manual Verification
- Verify that SQL executes without constraint errors.
- Confirm spatial index creation on `hospitals`, `emergency_requests`, and `donors`.
