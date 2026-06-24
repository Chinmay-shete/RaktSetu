import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// -- Donor Imports --
import LandingPage from './components/LandingPage';
import UnifiedLogin from './components/Login';
import DonorRegistration from './components/DonorRegistration';
import ProfileSetup from './components/ProfileSetup';
import LocationPage from './components/LocationPage';
import Dashboard from './components/Dashboard';
import EditProfile from './components/EditProfile';
import FindCamps from './components/FindCamps';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import NotFound from './components/NotFound';
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';

// -- Staff/Hospital Imports --
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { HospitalLayout } from './layouts/HospitalLayout';
import { Dashboard as HospitalDashboard } from './pages/hospital/Dashboard';
import { BloodInventory } from './pages/hospital/inventory/BloodInventory';
import { UpdateStock } from './pages/hospital/inventory/UpdateStock';
import ExpiryAlerts from './pages/hospital/alerts/ExpiryAlerts';
import { TransferRequests as TransferRequest } from './pages/hospital/requests/TransferRequests';
import { Analytics } from './pages/hospital/Analytics';
import { SurgicalSchedule } from './pages/hospital/SurgicalSchedule';
import { DonorSearch } from './pages/hospital/DonorSearch';
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
import CampCreation from './pages/admin/CampCreation';
import HospitalProfile from './pages/admin/HospitalProfile';

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

// -- State Admin Imports --
import { StateAdminProvider } from './context/StateAdminContext';
import StateAdminLayout from './layouts/StateAdminLayout/StateAdminLayout';
import StateAdminLogin from './pages/state/StateAdminLogin';
import StateAdminDashboard from './pages/state/StateAdminDashboard';
import CrossDistrictTransfers from './pages/state/CrossDistrictTransfers';
import WasteKPIs from './pages/state/WasteKPIs';
import PolicyAlerts from './pages/state/PolicyAlerts';
import DistrictOfficerReports from './pages/state/DistrictOfficerReports';
import FundingRecommendations from './pages/state/FundingRecommendations';

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
            <StateAdminProvider>
            <SystemAdminProvider>
            <Router>
              <Routes>
                {/* --------------------------- */}
                {/* 1. DONOR / PUBLIC ROUTES    */}
                {/* --------------------------- */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<UnifiedLogin />} />
                <Route path="/register-donor" element={<DonorRegistration />} />
                <Route path="/profile-setup" element={<ProfileSetup />} />
                <Route path="/location" element={<LocationPage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute storageKey="raktsetu_donor_authenticated" redirectPath="/login">
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/edit-profile" element={
                  <ProtectedRoute storageKey="raktsetu_donor_authenticated" redirectPath="/login">
                    <EditProfile />
                  </ProtectedRoute>
                } />
                <Route path="/find-camps" element={<FindCamps />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />

                {/* --------------------------- */}
                {/* 2. STAFF / HOSPITAL ROUTES  */}
                {/* --------------------------- */}
                <Route path="/staff/login" element={<Login />} />

                <Route path="/staff" element={
                  <ProtectedRoute storageKey="raktsetu_hospital_authenticated" redirectPath="/staff/login">
                    <HospitalLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/staff/dashboard" replace />} />
                  <Route path="dashboard" element={<HospitalDashboard />} />
                  <Route path="inventory" element={<BloodInventory />} />
                  <Route path="update-stock" element={<UpdateStock />} />
                  <Route path="expiry-alerts" element={<ExpiryAlerts />} />
                  <Route path="transfer-request" element={<TransferRequest />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="invite" element={<InviteStaffHospital />} />
                  <Route path="surgical-schedule" element={<SurgicalSchedule />} />
                  <Route path="donor-search" element={<DonorSearch />} />
                </Route>

                {/* --------------------------- */}
                {/* 3. ADMIN ROUTES             */}
                {/* --------------------------- */}
                <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                <Route path="/admin/register" element={<HospitalApplication />} />
                <Route path="/admin/pending" element={<PendingReview />} />
                <Route path="/admin/approved" element={<ApprovalEmail />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                <Route path="/admin/dashboard" element={<ProtectedRoute storageKey="raktsetu_admin_app_state" redirectPath="/admin/login"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/invite-staff" element={<ProtectedRoute storageKey="raktsetu_admin_app_state" redirectPath="/admin/login"><AdminLayout><InviteStaffAdmin /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/forecast" element={<ProtectedRoute storageKey="raktsetu_admin_app_state" redirectPath="/admin/login"><AdminLayout><AIDemandForecast /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/waste" element={<ProtectedRoute storageKey="raktsetu_admin_app_state" redirectPath="/admin/login"><AdminLayout><WasteAnalytics /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/thresholds" element={<ProtectedRoute storageKey="raktsetu_admin_app_state" redirectPath="/admin/login"><AdminLayout><AlertThresholds /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/camp-creation" element={<ProtectedRoute storageKey="raktsetu_admin_app_state" redirectPath="/admin/login"><AdminLayout><CampCreation /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/profile" element={<ProtectedRoute storageKey="raktsetu_admin_app_state" redirectPath="/admin/login"><AdminLayout><HospitalProfile /></AdminLayout></ProtectedRoute>} />

                {/* --------------------------------- */}
                {/* 4. DISTRICT OFFICER ROUTES        */}
                {/* --------------------------------- */}
                <Route path="/district" element={<Navigate to="/district/login" replace />} />
                <Route path="/district/login" element={<DistrictLogin />} />
                <Route path="/district/dashboard" element={<ProtectedRoute storageKey="raktsetu_district_state" redirectPath="/district/login"><DistrictLayout><DistrictDashboard /></DistrictLayout></ProtectedRoute>} />
                <Route path="/district/map" element={<ProtectedRoute storageKey="raktsetu_district_state" redirectPath="/district/login"><DistrictLayout><DistrictMap /></DistrictLayout></ProtectedRoute>} />
                <Route path="/district/alerts" element={<ProtectedRoute storageKey="raktsetu_district_state" redirectPath="/district/login"><DistrictLayout><DistrictAlerts /></DistrictLayout></ProtectedRoute>} />
                <Route path="/district/camps" element={<ProtectedRoute storageKey="raktsetu_district_state" redirectPath="/district/login"><DistrictLayout><CampApprovals /></DistrictLayout></ProtectedRoute>} />
                <Route path="/district/reports" element={<ProtectedRoute storageKey="raktsetu_district_state" redirectPath="/district/login"><DistrictLayout><DistrictReports /></DistrictLayout></ProtectedRoute>} />
                <Route path="/district/hospitals" element={<ProtectedRoute storageKey="raktsetu_district_state" redirectPath="/district/login"><DistrictLayout><HospitalRegistry /></DistrictLayout></ProtectedRoute>} />

                {/* --------------------------------- */}
                {/* 5. STATE ADMIN ROUTES             */}
                {/* --------------------------------- */}
                <Route path="/state" element={<Navigate to="/state/login" replace />} />
                <Route path="/state/login" element={<StateAdminLogin />} />
                <Route path="/state/dashboard" element={<ProtectedRoute storageKey="raktsetu_state_admin" redirectPath="/state/login"><StateAdminLayout><StateAdminDashboard /></StateAdminLayout></ProtectedRoute>} />
                <Route path="/state/transfers" element={<ProtectedRoute storageKey="raktsetu_state_admin" redirectPath="/state/login"><StateAdminLayout><CrossDistrictTransfers /></StateAdminLayout></ProtectedRoute>} />
                <Route path="/state/waste" element={<ProtectedRoute storageKey="raktsetu_state_admin" redirectPath="/state/login"><StateAdminLayout><WasteKPIs /></StateAdminLayout></ProtectedRoute>} />
                <Route path="/state/alerts" element={<ProtectedRoute storageKey="raktsetu_state_admin" redirectPath="/state/login"><StateAdminLayout><PolicyAlerts /></StateAdminLayout></ProtectedRoute>} />
                <Route path="/state/reports" element={<ProtectedRoute storageKey="raktsetu_state_admin" redirectPath="/state/login"><StateAdminLayout><DistrictOfficerReports /></StateAdminLayout></ProtectedRoute>} />
                <Route path="/state/funding" element={<ProtectedRoute storageKey="raktsetu_state_admin" redirectPath="/state/login"><StateAdminLayout><FundingRecommendations /></StateAdminLayout></ProtectedRoute>} />

                {/* --------------------------------- */}
                {/* 6. SYSTEM ADMIN ROUTES            */}
                {/* --------------------------------- */}
                <Route path="/systemadmin" element={<Navigate to="/systemadmin/login" replace />} />
                <Route path="/systemadmin/login" element={<SystemAdminLogin />} />
                <Route path="/systemadmin/dashboard" element={<ProtectedRoute storageKey="raktsetu_sysadmin_state" redirectPath="/systemadmin/login"><SystemAdminLayout><SystemAdminDashboard /></SystemAdminLayout></ProtectedRoute>} />
                <Route path="/systemadmin/approvals" element={<ProtectedRoute storageKey="raktsetu_sysadmin_state" redirectPath="/systemadmin/login"><SystemAdminLayout><PendingApprovals /></SystemAdminLayout></ProtectedRoute>} />
                <Route path="/systemadmin/users" element={<ProtectedRoute storageKey="raktsetu_sysadmin_state" redirectPath="/systemadmin/login"><SystemAdminLayout><UserManagement /></SystemAdminLayout></ProtectedRoute>} />
                <Route path="/systemadmin/audit-logs" element={<ProtectedRoute storageKey="raktsetu_sysadmin_state" redirectPath="/systemadmin/login"><SystemAdminLayout><AuditLogs /></SystemAdminLayout></ProtectedRoute>} />
                <Route path="/systemadmin/settings" element={<ProtectedRoute storageKey="raktsetu_sysadmin_state" redirectPath="/systemadmin/login"><SystemAdminLayout><SystemSettings /></SystemAdminLayout></ProtectedRoute>} />

                {/* --------------------------------- */}
                {/* 7. FALLBACK ROUTES                */}
                {/* --------------------------------- */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            </SystemAdminProvider>
            </StateAdminProvider>
          </DistrictProvider>
          </HospitalProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
