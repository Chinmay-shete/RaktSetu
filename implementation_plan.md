# Merge Staff and Hospital Admin into RaktSetu Main Application

This plan outlines the steps to merge the `staff` and `hospitaladmin` React applications into the main `RacktSetu` application. The goal is to maintain all existing UI/UX and functionalities while organizing the codebase into a proper, unified folder structure within the `RacktSetu` directory.

## User Review Required

> [!IMPORTANT]
> Merging these three separate applications means combining their routing logic, contexts, and dependencies into a single React application. Please review the proposed folder structure and dependency additions before I proceed with the execution.

## Open Questions

> [!WARNING]
> Currently, the staff routes in `staff/src/App.jsx` use the root path (`/`) for their dashboard layout and `/login` for login. The main `RacktSetu` app also uses the root path (`/`) for the LandingPage. To avoid route conflicts, should we place the staff dashboard and related routes under a `/staff` or `/hospital` prefix (e.g., `/staff/login`, `/staff/dashboard`)? The admin app already uses the `/admin` prefix nicely.

## Proposed Changes

### 1. Update Dependencies in `RacktSetu`
We will merge the dependencies from `staff` and `hospitaladmin` into `RacktSetu/package.json`.

**New Dependencies to add:**
- `framer-motion`
- `lucide-react`
- `recharts`
- `@tanstack/react-query`
- `axios`
- `chart.js`
- `react-chartjs-2`
- `react-hook-form`

### 2. Unified Folder Structure in `RacktSetu/src`
We will structure the `src` directory by feature area to prevent collisions between the three domains (donor, hospital admin, hospital staff).

**Proposed Structure:**
```
RacktSetu/src/
├── assets/
├── components/          # Shared components or Donor specific (existing RacktSetu components)
├── context/             # Merged contexts (AuthContext, ThemeContext, HospitalContext, ToastContext)
├── hooks/               # Custom hooks from staff app
├── layouts/             # AdminLayout, HospitalLayout
├── pages/
│   ├── admin/           # Pages from hospitaladmin/src/pages/admin
│   ├── hospital/        # Pages from staff/src/pages/hospital
│   └── donor/           # (Optional) we can leave donor pages in components or move them here
├── services/            # Services from staff app
├── utils/               # Utils from staff app
├── App.jsx              # Merged routing for all three apps
├── main.jsx
└── index.css            # Merged global styles
```

### 3. File Migrations

#### [NEW] `RacktSetu/src/context/`
- Copy contexts from `staff/src/context` and `hospitaladmin/src/context`.

#### [NEW] `RacktSetu/src/layouts/`
- Copy `AdminLayout` from `hospitaladmin/src/layouts/AdminLayout` (or `layouts` dir).
- Copy `HospitalLayout` from `staff/src/layout/HospitalLayout`.

#### [NEW] `RacktSetu/src/pages/`
- Copy `admin` pages from `hospitaladmin/src/pages/admin`.
- Copy `hospital` pages from `staff/src/pages/hospital` and `auth` folder.

#### [NEW] `RacktSetu/src/hooks/`, `services/`, `utils/`
- Copy these folders directly from `staff/src`.

### 4. Merging Logic

#### [MODIFY] `RacktSetu/src/App.jsx`
We will combine the routes from all three `App.jsx` files.
- Donor routes (current `RacktSetu/src/App.jsx`)
- Admin routes (`/admin/*` from `hospitaladmin`)
- Staff routes (`/staff/*` from `staff`). *Note: Assuming we prefix staff routes with `/staff` to avoid root collision with Donor Landing Page.*

#### [MODIFY] `RacktSetu/src/index.css` & `App.css`
Merge any specific global styles or Tailwind directives from all three apps.

## Verification Plan

### Automated Tests
- Run `npm install` in `RacktSetu`.
- Run `npm run lint` or `npm run build` to verify there are no compilation or import errors.

### Manual Verification
- We will ask the user to start the development server in the `RacktSetu` directory (`npm run dev`) and verify that routes for Donor, Admin, and Staff all render properly with the exact same UI/UX as before.
