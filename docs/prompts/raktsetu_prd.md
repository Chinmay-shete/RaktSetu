# RaktSetu – Product Requirements Document (PRD)

---

## 1. Project Overview
- **Name**: RaktSetu (aka BloodBridge AI / HemaFlow)
- **Purpose**: A next‑generation AI‑enabled blood‑bank management platform for Indian hospitals, districts and donors. It extends existing government portals (eRaktKosh) with real‑time emergency routing, AI demand forecasting, cross‑hospital expiry auto‑transfer, and donor‑centric notifications.
- **Primary Stakeholders**:
  - **Hospital Staff / Admins** – manage inventory, view shortage heatmaps, trigger transfers.
  - **District / State Health Officers** – monitor regional blood‑stock health, plan camps.
  - **Donors** – register, receive eligibility re‑notifications, find nearby camps.
  - **System Admin** – configure RBAC, environment settings, monitor pipelines.
- **Scope**: Front‑end (React web dashboard) + backend (Node/Express + Python AI micro‑services) + data pipeline (BigQuery, MySQL, Prophet/LSTM models).

---

## 2. Goals & Success Metrics
| Goal | Metric |
|------|--------|
| **AI Forecast Accuracy** | Mean Absolute Percentage Error (MAPE) ≤ 10 % on 7‑day blood‑group demand predictions (validated on 3‑month pilot).
| **Cross‑Hospital Transfer Time** | 80 % of expiry‑alert transfers completed within 4 hours.
| **Emergency Routing Latency** | Real‑time nearest‑blood lookup < 2 seconds.
| **User Adoption** | 500 active hospital users & 2 000 donor registrations within 6 months.
| **System Availability** | 99.5 % uptime for API layer.

---

## 3. Personas & Primary Use‑Cases
| Persona | Core Use‑Case |
|---------|--------------|
| **Hospital Staff** | Update stock, view AI forecast, approve/dispatch expiry transfers.
| **District Officer** | View shortage heatmap, schedule donation camps, receive alerts.
| **Donor** | Register, receive eligibility & shortage notifications, locate nearest blood.
| **System Admin** | Manage RBAC, monitor pipelines, roll out new AI models.

---

## 4. User Stories (High‑Level)
1. **As a Hospital Staff member**, I can view a dashboard with current stock, AI forecast for the next 7 days, and pending expiry transfer alerts so I can proactively manage inventory.
2. **As a District Officer**, I can see a heatmap of blood‑group shortages across all hospitals in my district and trigger a mass‑camp notification.
3. **As a Donor**, I receive a push notification when I become eligible again *and* a shortage of my blood group exists within 10 km.
4. **As a System Admin**, I can upload a new Prophet model version and have the API automatically start using it without downtime.
5. **As an Emergency Doctor**, I can query the “nearest‑available blood” endpoint and instantly get contact details for the nearest hospital with live stock.

---

## 5. Functional Requirements
### 5.1 Front‑end (React)
- **Dashboard** – stock tables, AI forecast charts, expiry alerts list, transfer‑dispatch UI.
- **Route Guard** – `ProtectedRoute` component enforcing RBAC (Donor, Hospital Staff, Admin, etc.).
- **Emergency Search** – real‑time lookup form with instant results.
- **Donor Notification Settings** – opt‑in/out, radius configuration.
- **Responsive Design** – mobile‑first, dark‑mode, glassmorphic cards (per design guidelines).

### 5.2 Backend (Node/Express + Python AI)
- **Auth Service** – JWT + role‑based claims, Google OAuth optional (future).
- **Inventory API** – CRUD for blood‑group counts, expiry dates.
- **Forecast API** – `GET /forecast/:hospitalId` returns per‑group 7‑day predictions.
- **Transfer API** – `POST /transfer` creates an expiry‑alert transfer request; auto‑dispatch via Twilio.
- **Emergency API** – `GET /emergency?group=O-&radius=10` returns nearest live‑stock hospital.
- **Donor API** – registration, eligibility check, notification subscription.
- **Analytics API** – district‑level heatmap data aggregation.

### 5.3 Data Pipeline & AI
- **Ingestion** – nightly ETL from MySQL (inventory) & surgical schedule CSV into BigQuery.
- **Model Training** – Prophet/LSTM pipelines scheduled via Cloud Composer (Airflow).
- **Model Serving** – Flask micro‑service exposing `/predict` endpoint, auto‑scaled via Cloud Run.

---

## 6. Non‑Functional Requirements
- **Performance**: API latency ≤ 200 ms for read‑only endpoints, ≤ 500 ms for write.
- **Scalability**: Auto‑scale to support 5 000 concurrent users.
- **Security**: OWASP Top 10 mitigations, data‑at‑rest encryption (AES‑256), GDPR‑style consent for donor data.
- **Compliance**: Indian health‑data regulations (HIPAA‑like), Auditable logs for stock changes.
- **Reliability**: 99.5 % SLA, automated backup of MySQL & BigQuery daily.
- **Maintainability**: CI/CD pipeline (GitHub Actions) with unit, integration, and load tests.

---

## 7. UI/UX Guidelines (Reference Implementation)
- **Design System**: Custom CSS with HSL‑based palette (deep indigo primary, teal accent), smooth gradients, glass‑morphism cards, subtle micro‑animations on hover/row expand.
- **Typography**: Google Font **Inter** – 400/600 weights for body & headings.
- **Accessibility**: WCAG 2.1 AA – keyboard navigation, ARIA labels, contrast ≥ 4.5:1.
- **Responsive Breakpoints**: 320 px – mobile, 768 px – tablet, ≥ 1200 px – desktop.
- **Component Library**: Reusable `DataTable`, `ChartCard`, `Badge`, `ProtectedRoute`, `Modal`.

---

## 8. Data Model Summary (High‑Level)
- **Hospital** (id, name, location, admin_user_id)
- **BloodStock** (hospital_id, blood_group, units_available, expiry_date)
- **TransferRequest** (id, source_hospital_id, target_hospital_id, blood_group, units, status, driver_contact)
- **Forecast** (hospital_id, blood_group, predicted_units, forecast_date)
- **Donor** (id, name, blood_group, last_donation_date, location, notification_opt_in)
- **User** (id, email, role, hospital_id?)
- **SurgicalSchedule** (hospital_id, surgery_id, date, anticipated_units)

(Full schema documented in `RaktSetu_Backend_Readiness_Report.md`.)

---

## 9. API Map (Key Endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hospitals/:id/stock` | Current stock per blood group.
| GET | `/api/hospitals/:id/forecast` | 7‑day AI forecast.
| POST | `/api/transfer` | Create expiry‑alert transfer request.
| GET | `/api/emergency` | Nearest live‑stock hospital (query params: `group`, `radius`).
| POST | `/api/donors` | Register donor.
| GET | `/api/donors/:id/eligibility` | Check eligibility & send notification if needed.
| GET | `/api/district/:id/heatmap` | Shortage heatmap data.
| POST | `/api/auth/login` | JWT login (future Google OAuth).

---

## 10. Acceptance Criteria (MVP)
- **AC‑1**: Hospital staff can view dashboard with live stock and AI forecast.
- **AC‑2**: System automatically generates expiry‑alert transfers and sends SMS via Twilio.
- **AC‑3**: Emergency lookup returns correct nearest hospital within 2 seconds.
- **AC‑4**: Donor receives a push/email notification when eligible *and* a shortage exists within configured radius.
- **AC‑5**: All protected routes reject unauthenticated access (401) and enforce role checks (403).
- **AC‑6**: CI pipeline runs unit, integration, and performance tests; failing test blocks merge.
- **AC‑7**: Documentation includes API spec (OpenAPI), data model ER diagram, and UI mockups (see `raktsetu_complete_project_report.html`).

---

## 11. Milestones & Timeline (15‑Week Roadmap)
| Week | Milestone |
|------|-----------|
| 1‑2 | Set up repo, CI/CD, base React skeleton, auth scaffolding.
| 3‑4 | Implement ProtectedRoute, fix critical frontend bugs (Hooks violation, emergency badge, missing guards).
| 5‑6 | Build core dashboard components, API contracts, mock API layer.
| 7‑8 | Develop AI model training pipeline (Prophet), expose `/forecast` service.
| 9‑10 | Implement transfer‑alert automation + Twilio integration.
| 11‑12 | Emergency nearest‑blood endpoint + performance optimisation.
| 13 | Donor eligibility notification engine + UI.
| 14‑15 | Full end‑to‑end testing, security audit, beta release to pilot hospitals.

---

## 12. Open Questions / Ambiguities
- **Q1**: Which cloud provider for AI model serving (GCP Cloud Run vs AWS Fargate)?
- **Q2**: Do we need multi‑region data replication for high availability?
- **Q3**: Final decision on Google OAuth vs custom email/password login.
- **Q4**: What is the preferred notification channel for donors (push, SMS, email)?


---

*Prepared based on the existing `project_understanding.md`, `raktsetu_complete_project_report.html`, and the raktsetu_specifications.pdf analysis.*
