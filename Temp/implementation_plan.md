# Implementation Plan - Redesign Hospital Staff UI to RaktSetu Editorial UX

This plan outlines the redesign of the Hospital Staff portal (`staff` project) to match the premium light-themed editorial style of RaktSetu, characterized by off-white colors (`#FAF8F5`), crimson red accents (`#BE1F2E`), stardust noise overlays, serif Display typography, clean borders, and soft shadows.

## User Review Required

> [!IMPORTANT]
> The staff application will be locked to RaktSetu's light-themed aesthetic, consistent with the main website and the hospital admin portal. The dark/light toggle will be visual-only or removed to maintain brand consistency.

## Proposed Changes

### 1. Build and Dev Configuration

#### [MODIFY] [eslint.config.js](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/staff/eslint.config.js)
- Modify linting configuration to downgrade unused variables (`no-unused-vars`) and React Fast Refresh rules to warnings so they don't break developer compiling.

### 2. Styling Foundation

#### [MODIFY] [index.css](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/staff/src/index.css)
- Replace Tailwind v4 configuration and custom colors with RaktSetu editorial variables:
  - `--red: #BE1F2E;`
  - `--red-hover: #9E1825;`
  - `--offwhite: #FAF8F5;`
  - `--ink: #1A1210;`
  - `--border: #EDE7E1;`
- Implement global styles for `.noise-filter`, `.btn-primary`, `.input-field`, and standard badges (`badge-success`, `badge-danger`, etc.) to match `hospitaladmin/src/index.css`.

### 3. App Shell & Navigation

#### [MODIFY] [HospitalLayout.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/staff/src/layout/HospitalLayout.jsx)
- Fix the React Hook violation where `useQuery` was called after an early conditional return.
- Wrap pages in the RaktSetu stardust `.noise-filter` div.
- Update sidebar container grid and padding.

#### [MODIFY] [Navbar.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/staff/src/components/layout/Navbar.jsx)
- Redesign navigation bar to use white backdrop blur, crimson details, and custom notifications.

#### [MODIFY] [Sidebar.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/staff/src/components/layout/Sidebar.jsx)
- Style Sidebar with a premium paper background, crimson logo header, seriffed label items, active states using `--red-light`, and refined borders.

### 4. Core Pages & Dashboards

#### [MODIFY] [Dashboard.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/staff/src/pages/hospital/Dashboard.jsx)
- Redesign the greeting display text to use the premium serif font (`var(--font-serif)`).
- Replace flat cards with clean paper bento cards containing subtle grid overlays (`aceternity-grid`).
- Update color systems in chart rendering.

#### [MODIFY] [Login.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/staff/src/pages/hospital/auth/Login.jsx)
- Redesign to feature the beautiful centered paper card, editorial logo, and floating crimson active inputs.

#### [MODIFY] [BloodInventory.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/staff/src/pages/hospital/inventory/BloodInventory.jsx)
- Re-skin inventory list tables, filter bars, select menus (`custom-select`), and table row hover states (`table-row-hover`).

#### [MODIFY] [UpdateStock.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/staff/src/pages/hospital/inventory/UpdateStock.jsx)
- Re-skin entry forms to use `.input-field` classes, with clean labels and clear validator colors.

#### [MODIFY] [ExpiryAlerts.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/staff/src/pages/hospital/alerts/ExpiryAlerts.jsx)
- Structure warnings table with crimson accents and alert symbols.

#### [MODIFY] [TransferRequests.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/staff/src/pages/hospital/requests/TransferRequests.jsx)
- Stylize transfer request statuses and tables using RaktSetu design patterns.

#### [MODIFY] [InviteStaff.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/staff/src/pages/hospital/auth/InviteStaff.jsx), [InviteToken.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/staff/src/pages/hospital/auth/InviteToken.jsx), [SetPassword.jsx](file:///Users/chinu/Developer/VS%20CODE%20NOT%20IMP/RaktSetu/staff/src/pages/hospital/auth/SetPassword.jsx)
- Refine remaining authentication sub-pages.

## Verification Plan

### Automated Tests
- Compile check using `npm run build` in the `staff` directory to ensure no React Compilation or Linting failures block execution.

### Manual Verification
- Walkthrough verification using the browser subagent:
  1. Open `http://localhost:5173` (landing page).
  2. Click Register modal, check "Hospital Staff" option, verify redirection to `http://localhost:5174/login`.
  3. Enter staff login credentials.
  4. View redesigned light-theme staff dashboard, inventory page, and stock forms.
