import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HospitalProvider } from './context/HospitalContext';

// Layout
import AdminLayout from './layouts/AdminLayout/AdminLayout';

// Pages
import LandingPage from './pages/admin/LandingPage';
import HospitalApplication from './pages/admin/HospitalApplication';
import PendingReview from './pages/admin/PendingReview';
import ApprovalEmail from './pages/admin/ApprovalEmail';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import InviteStaff from './pages/admin/InviteStaff';
import AIDemandForecast from './pages/admin/AIDemandForecast';
import WasteAnalytics from './pages/admin/WasteAnalytics';
import AlertThresholds from './pages/admin/AlertThresholds';

function App() {
  return (
    <HospitalProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Hospital Admin Onboarding Routes */}
          <Route path="/admin" element={<LandingPage />} />
          <Route path="/admin/register" element={<HospitalApplication />} />
          <Route path="/admin/pending" element={<PendingReview />} />
          <Route path="/admin/approved" element={<ApprovalEmail />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected/Dashboard Hospital Admin Routes (wrapped in AdminLayout) */}
          <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/invite-staff" element={<AdminLayout><InviteStaff /></AdminLayout>} />
          <Route path="/admin/forecast" element={<AdminLayout><AIDemandForecast /></AdminLayout>} />
          <Route path="/admin/waste" element={<AdminLayout><WasteAnalytics /></AdminLayout>} />
          <Route path="/admin/thresholds" element={<AdminLayout><AlertThresholds /></AdminLayout>} />

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </HospitalProvider>
  );
}

export default App;
