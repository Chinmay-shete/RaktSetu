import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// -- Donor Imports --
import LandingPage from './components/LandingPage';
import DonorRegistration from './components/DonorRegistration';
import ProfileSetup from './components/ProfileSetup';
import LocationPage from './components/LocationPage';
import Dashboard from './components/Dashboard';
import EditProfile from './components/EditProfile';
import FindCamps from './components/FindCamps';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

// -- Staff/Hospital Imports --
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { HospitalLayout } from './layouts/HospitalLayout';
import { Dashboard as HospitalDashboard } from './pages/hospital/Dashboard';
import { BloodInventory } from './pages/hospital/inventory/BloodInventory';
import { UpdateStock } from './pages/hospital/inventory/UpdateStock';
import { ExpiryAlerts } from './pages/hospital/alerts/ExpiryAlerts';
import { TransferRequests } from './pages/hospital/requests/TransferRequests';
import { Analytics } from './pages/hospital/Analytics';
import { Login } from './pages/hospital/auth/Login';
import { InviteToken } from './pages/hospital/auth/InviteToken';
import { InviteStaff as InviteStaffHospital } from './pages/hospital/auth/InviteStaff';
import { SetPassword } from './pages/hospital/auth/SetPassword';

// -- Admin Imports --
import { HospitalProvider } from './context/HospitalContext';
import AdminLayout from './layouts/AdminLayout/AdminLayout';
import HospitalApplication from './pages/admin/HospitalApplication';
import PendingReview from './pages/admin/PendingReview';
import ApprovalEmail from './pages/admin/ApprovalEmail';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import InviteStaffAdmin from './pages/admin/InviteStaff';
import AIDemandForecast from './pages/admin/AIDemandForecast';
import WasteAnalytics from './pages/admin/WasteAnalytics';
import AlertThresholds from './pages/admin/AlertThresholds';

// -- District Officer Imports --
import { DistrictProvider } from './context/DistrictContext';
import DistrictLayout from './layouts/DistrictLayout/DistrictLayout';
import DistrictLogin from './pages/district/DistrictLogin';
import DistrictDashboard from './pages/district/DistrictDashboard';
import DistrictMap from './pages/district/DistrictMap';
import DistrictAlerts from './pages/district/DistrictAlerts';
import CampApprovals from './pages/district/CampApprovals';
import DistrictReports from './pages/district/DistrictReports';
import HospitalRegistry from './pages/district/HospitalRegistry';

// -- System Admin Imports --
import { SystemAdminProvider } from './context/SystemAdminContext';
import SystemAdminLayout from './layouts/SystemAdminLayout/SystemAdminLayout';
import SystemAdminLogin from './pages/systemadmin/SystemAdminLogin';
import { SystemAdminDashboard } from './pages/systemadmin/SystemAdminDashboard';
import { PendingApprovals } from './pages/systemadmin/PendingApprovals';
import { UserManagement } from './pages/systemadmin/UserManagement';
import { AuditLogs } from './pages/systemadmin/AuditLogs';
import { SystemSettings } from './pages/systemadmin/SystemSettings';

import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
            <HospitalProvider>
            <DistrictProvider>
            <SystemAdminProvider>
            <Router>
              <Routes>
                {/* --------------------------- */}
                {/* 1. DONOR / PUBLIC ROUTES    */}
                {/* --------------------------- */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/register-donor" element={<DonorRegistration />} />
                <Route path="/profile-setup" element={<ProfileSetup />} />
                <Route path="/location" element={<LocationPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/find-camps" element={<FindCamps />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />

                {/* --------------------------- */}
                {/* 2. STAFF / HOSPITAL ROUTES  */}
                {/* --------------------------- */}
                <Route path="/staff/login" element={<Login />} />
                <Route path="/staff/token/:token" element={<InviteToken />} />
                <Route path="/staff/set-password/:token" element={<SetPassword />} />

                <Route path="/staff" element={<HospitalLayout />}>
                  <Route index element={<Navigate to="/staff/dashboard" replace />} />
                  <Route path="dashboard" element={<HospitalDashboard />} />
                  <Route path="inventory" element={<BloodInventory />} />
                  <Route path="update-stock" element={<UpdateStock />} />
                  <Route path="expiry-alerts" element={<ExpiryAlerts />} />
                  <Route path="transfer-request" element={<TransferRequests />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="invite" element={<InviteStaffHospital />} />
                </Route>

                {/* --------------------------- */}
                {/* 3. ADMIN ROUTES             */}
                {/* --------------------------- */}
                <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                <Route path="/admin/register" element={<HospitalApplication />} />
                <Route path="/admin/pending" element={<PendingReview />} />
                <Route path="/admin/approved" element={<ApprovalEmail />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                <Route path="/admin/invite-staff" element={<AdminLayout><InviteStaffAdmin /></AdminLayout>} />
                <Route path="/admin/forecast" element={<AdminLayout><AIDemandForecast /></AdminLayout>} />
                <Route path="/admin/waste" element={<AdminLayout><WasteAnalytics /></AdminLayout>} />
                <Route path="/admin/thresholds" element={<AdminLayout><AlertThresholds /></AdminLayout>} />

                {/* --------------------------------- */}
                {/* 4. DISTRICT OFFICER ROUTES        */}
                {/* --------------------------------- */}
                <Route path="/district" element={<Navigate to="/district/login" replace />} />
                <Route path="/district/login" element={<DistrictLogin />} />
                <Route path="/district/dashboard" element={<DistrictLayout><DistrictDashboard /></DistrictLayout>} />
                <Route path="/district/map" element={<DistrictLayout><DistrictMap /></DistrictLayout>} />
                <Route path="/district/alerts" element={<DistrictLayout><DistrictAlerts /></DistrictLayout>} />
                <Route path="/district/camps" element={<DistrictLayout><CampApprovals /></DistrictLayout>} />
                <Route path="/district/reports" element={<DistrictLayout><DistrictReports /></DistrictLayout>} />
                <Route path="/district/hospitals" element={<DistrictLayout><HospitalRegistry /></DistrictLayout>} />

                {/* --------------------------------- */}
                {/* 5. SYSTEM ADMIN ROUTES            */}
                {/* --------------------------------- */}
                <Route path="/systemadmin" element={<Navigate to="/systemadmin/login" replace />} />
                <Route path="/systemadmin/login" element={<SystemAdminLogin />} />
                <Route path="/systemadmin/dashboard" element={<SystemAdminLayout><SystemAdminDashboard /></SystemAdminLayout>} />
                <Route path="/systemadmin/approvals" element={<SystemAdminLayout><PendingApprovals /></SystemAdminLayout>} />
                <Route path="/systemadmin/users" element={<SystemAdminLayout><UserManagement /></SystemAdminLayout>} />
                <Route path="/systemadmin/audit-logs" element={<SystemAdminLayout><AuditLogs /></SystemAdminLayout>} />
                <Route path="/systemadmin/settings" element={<SystemAdminLayout><SystemSettings /></SystemAdminLayout>} />
              </Routes>
            </Router>
            </SystemAdminProvider>
          </DistrictProvider>
          </HospitalProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
