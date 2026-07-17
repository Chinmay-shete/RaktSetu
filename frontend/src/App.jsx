import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// -- Provider Contexts --
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { HospitalProvider } from './context/HospitalContext';
import { DistrictProvider } from './context/DistrictContext';
import { StateAdminProvider } from './context/StateAdminContext';
import { SystemAdminProvider } from './context/SystemAdminContext';

// -- Public / Core Layout & Wrapper Components --
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import UnifiedLogin from './components/Login';
import DonorRegistration from './components/DonorRegistration';
import ProfileSetup from './components/ProfileSetup';
import LocationPage from './components/LocationPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import NotFound from './components/NotFound';
import Unauthorized from './components/Unauthorized';
import DonorGuidelines from './components/DonorGuidelines';
import ContactMedicalTeam from './components/ContactMedicalTeam';
import { PortalServices } from './components/PortalServices';
import { HospitalLayout } from './layouts/HospitalLayout';
import AdminLayout from './layouts/AdminLayout/AdminLayout';
import DistrictLayout from './layouts/DistrictLayout/DistrictLayout';
import StateAdminLayout from './layouts/StateAdminLayout/StateAdminLayout';
import SystemAdminLayout from './layouts/SystemAdminLayout/SystemAdminLayout';

// -- Lazy-loaded Dashboard & Heavy Portal Components --
const Dashboard = lazy(() => import('./components/Dashboard'));
const EditProfile = lazy(() => import('./components/EditProfile'));
const FindCamps = lazy(() => import('./components/FindCamps'));

// -- Staff/Hospital Lazy Components --
const HospitalDashboard = lazy(() => import('./pages/hospital/Dashboard').then(m => ({ default: m.Dashboard })));
const BloodInventory = lazy(() => import('./pages/hospital/inventory/BloodInventory').then(m => ({ default: m.BloodInventory })));
const UpdateStock = lazy(() => import('./pages/hospital/inventory/UpdateStock').then(m => ({ default: m.UpdateStock })));
const ExpiryAlerts = lazy(() => import('./pages/hospital/alerts/ExpiryAlerts'));
const TransferRequest = lazy(() => import('./pages/hospital/requests/TransferRequests').then(m => ({ default: m.TransferRequests })));
const Analytics = lazy(() => import('./pages/hospital/Analytics').then(m => ({ default: m.Analytics })));
const SurgicalSchedule = lazy(() => import('./pages/hospital/SurgicalSchedule').then(m => ({ default: m.SurgicalSchedule })));
const DonorSearch = lazy(() => import('./pages/hospital/DonorSearch').then(m => ({ default: m.DonorSearch })));
const Profile = lazy(() => import('./pages/hospital/Profile').then(m => ({ default: m.Profile })));
const Login = lazy(() => import('./pages/hospital/auth/Login').then(m => ({ default: m.Login })));
const InviteStaffHospital = lazy(() => import('./pages/hospital/auth/InviteStaff').then(m => ({ default: m.InviteStaff })));

// -- Admin Lazy Components --
const HospitalApplication = lazy(() => import('./pages/admin/HospitalApplication'));
const PendingReview = lazy(() => import('./pages/admin/PendingReview'));
const ApprovalEmail = lazy(() => import('./pages/admin/ApprovalEmail'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const StaffList = lazy(() => import('./pages/admin/StaffList').then(m => ({ default: m.StaffList })));
const InviteStaffAdmin = lazy(() => import('./pages/admin/InviteStaff'));
const AIDemandForecast = lazy(() => import('./pages/admin/AIDemandForecast'));
const WasteAnalytics = lazy(() => import('./pages/admin/WasteAnalytics'));
const AlertThresholds = lazy(() => import('./pages/admin/AlertThresholds'));
const CampCreation = lazy(() => import('./pages/admin/CampCreation'));
const HospitalProfile = lazy(() => import('./pages/admin/HospitalProfile'));

// -- District Lazy Components --
const DistrictLogin = lazy(() => import('./pages/district/DistrictLogin'));
const OfficerRegistration = lazy(() => import('./pages/district/OfficerRegistration'));
const DistrictDashboard = lazy(() => import('./pages/district/DistrictDashboard'));
const DistrictMap = lazy(() => import('./pages/district/DistrictMap'));
const DistrictAlerts = lazy(() => import('./pages/district/DistrictAlerts'));
const CampApprovals = lazy(() => import('./pages/district/CampApprovals'));
const DistrictReports = lazy(() => import('./pages/district/DistrictReports'));
const HospitalRegistry = lazy(() => import('./pages/district/HospitalRegistry'));

// -- State Lazy Components --
const StateAdminLogin = lazy(() => import('./pages/state/StateAdminLogin'));
const StateAdminDashboard = lazy(() => import('./pages/state/StateAdminDashboard'));
const CrossDistrictTransfers = lazy(() => import('./pages/state/CrossDistrictTransfers'));
const WasteKPIs = lazy(() => import('./pages/state/WasteKPIs'));
const PolicyAlerts = lazy(() => import('./pages/state/PolicyAlerts'));
const DistrictOfficerReports = lazy(() => import('./pages/state/DistrictOfficerReports'));
const FundingRecommendations = lazy(() => import('./pages/state/FundingRecommendations'));

// -- System Admin Lazy Components --
const SystemAdminLogin = lazy(() => import('./pages/systemadmin/SystemAdminLogin'));
const SystemAdminDashboard = lazy(() => import('./pages/systemadmin/SystemAdminDashboard').then(m => ({ default: m.SystemAdminDashboard })));
const PendingApprovals = lazy(() => import('./pages/systemadmin/PendingApprovals').then(m => ({ default: m.PendingApprovals })));
const UserManagement = lazy(() => import('./pages/systemadmin/UserManagement').then(m => ({ default: m.UserManagement })));
const AuditLogs = lazy(() => import('./pages/systemadmin/AuditLogs').then(m => ({ default: m.AuditLogs })));
const SystemSettings = lazy(() => import('./pages/systemadmin/SystemSettings').then(m => ({ default: m.SystemSettings })));

import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const LoadingScreen = () => (
  <div className="portal-loading-screen" style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'system-ui, sans-serif',
    background: '#fdfbfa',
    color: '#333'
  }}>
    <div style={{
      border: '4px solid #ede7e1',
      borderTop: '4px solid #BE1F2E',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite',
      marginBottom: '16px'
    }} />
    <span style={{ fontSize: '15px', fontWeight: '500', color: '#666' }}>Loading Portal...</span>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

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
                      <Suspense fallback={<LoadingScreen />}>
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
                              <ErrorBoundary>
                                <Dashboard />
                              </ErrorBoundary>
                            </ProtectedRoute>
                          } />
                          <Route path="/edit-profile" element={
                            <ProtectedRoute storageKey="raktsetu_donor_authenticated" redirectPath="/login">
                              <ErrorBoundary>
                                <EditProfile />
                              </ErrorBoundary>
                            </ProtectedRoute>
                          } />
                          <Route path="/find-camps" element={<FindCamps />} />
                          <Route path="/privacy" element={<PrivacyPolicy />} />
                          <Route path="/terms" element={<TermsOfService />} />
                          <Route path="/donor-guidelines" element={<DonorGuidelines />} />
                          <Route path="/contact" element={<ContactMedicalTeam />} />
                          <Route path="/services" element={<PortalServices />} />

                          {/* --------------------------- */}
                          {/* 2. STAFF / HOSPITAL ROUTES  */}
                          {/* --------------------------- */}
                          <Route path="/staff/login" element={<Login />} />

                          <Route path="/staff" element={
                            <ProtectedRoute storageKey="raktsetu_hospital_authenticated" redirectPath="/staff/login">
                              <ErrorBoundary>
                                <HospitalLayout />
                              </ErrorBoundary>
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
                            <Route path="profile" element={<Profile />} />
                          </Route>

                          {/* --------------------------- */}
                          {/* 3. ADMIN ROUTES             */}
                          {/* --------------------------- */}
                          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                          <Route path="/admin/register" element={<HospitalApplication />} />
                          <Route path="/admin/pending" element={<PendingReview />} />
                          <Route path="/admin/approved" element={<ApprovalEmail />} />
                          <Route path="/admin/login" element={<AdminLogin />} />

                          <Route path="/admin/dashboard" element={<ProtectedRoute storageKey="raktsetu_admin_app_state" redirectPath="/admin/login"><ErrorBoundary><AdminLayout><AdminDashboard /></AdminLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/admin/staff-list" element={<ProtectedRoute storageKey="raktsetu_admin_app_state" redirectPath="/admin/login"><ErrorBoundary><AdminLayout><StaffList /></AdminLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/admin/invite-staff" element={<ProtectedRoute storageKey="raktsetu_admin_app_state" redirectPath="/admin/login"><ErrorBoundary><AdminLayout><InviteStaffAdmin /></AdminLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/admin/forecast" element={<ProtectedRoute storageKey="raktsetu_admin_app_state" redirectPath="/admin/login"><ErrorBoundary><AdminLayout><AIDemandForecast /></AdminLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/admin/waste" element={<ProtectedRoute storageKey="raktsetu_admin_app_state" redirectPath="/admin/login"><ErrorBoundary><AdminLayout><WasteAnalytics /></AdminLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/admin/thresholds" element={<ProtectedRoute storageKey="raktsetu_admin_app_state" redirectPath="/admin/login"><ErrorBoundary><AdminLayout><AlertThresholds /></AdminLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/admin/camp-creation" element={<ProtectedRoute storageKey="raktsetu_admin_app_state" redirectPath="/admin/login"><ErrorBoundary><AdminLayout><CampCreation /></AdminLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/admin/profile" element={<ProtectedRoute storageKey="raktsetu_admin_app_state" redirectPath="/admin/login"><ErrorBoundary><AdminLayout><HospitalProfile /></AdminLayout></ErrorBoundary></ProtectedRoute>} />

                          {/* --------------------------------- */}
                          {/* 4. DISTRICT OFFICER ROUTES        */}
                          {/* --------------------------------- */}
                          <Route path="/district" element={<Navigate to="/district/login" replace />} />
                          <Route path="/district/login" element={<DistrictLogin />} />
                          <Route path="/district/register" element={<OfficerRegistration />} />
                          <Route path="/district/dashboard" element={<ProtectedRoute storageKey="raktsetu_district_state" redirectPath="/district/login"><ErrorBoundary><DistrictLayout><DistrictDashboard /></DistrictLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/district/map" element={<ProtectedRoute storageKey="raktsetu_district_state" redirectPath="/district/login"><ErrorBoundary><DistrictLayout><DistrictMap /></DistrictLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/district/alerts" element={<ProtectedRoute storageKey="raktsetu_district_state" redirectPath="/district/login"><ErrorBoundary><DistrictLayout><DistrictAlerts /></DistrictLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/district/camps" element={<ProtectedRoute storageKey="raktsetu_district_state" redirectPath="/district/login"><ErrorBoundary><DistrictLayout><CampApprovals /></DistrictLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/district/reports" element={<ProtectedRoute storageKey="raktsetu_district_state" redirectPath="/district/login"><ErrorBoundary><DistrictLayout><DistrictReports /></DistrictLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/district/hospitals" element={<ProtectedRoute storageKey="raktsetu_district_state" redirectPath="/district/login"><ErrorBoundary><DistrictLayout><HospitalRegistry /></DistrictLayout></ErrorBoundary></ProtectedRoute>} />

                          {/* --------------------------------- */}
                          {/* 5. STATE ADMIN ROUTES             */}
                          {/* --------------------------------- */}
                          <Route path="/state" element={<Navigate to="/state/login" replace />} />
                          <Route path="/state/login" element={<StateAdminLogin />} />
                          <Route path="/state/dashboard" element={<ProtectedRoute storageKey="raktsetu_state_admin" redirectPath="/state/login"><ErrorBoundary><StateAdminLayout><StateAdminDashboard /></StateAdminLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/state/transfers" element={<ProtectedRoute storageKey="raktsetu_state_admin" redirectPath="/state/login"><ErrorBoundary><StateAdminLayout><CrossDistrictTransfers /></StateAdminLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/state/waste" element={<ProtectedRoute storageKey="raktsetu_state_admin" redirectPath="/state/login"><ErrorBoundary><StateAdminLayout><WasteKPIs /></StateAdminLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/state/alerts" element={<ProtectedRoute storageKey="raktsetu_state_admin" redirectPath="/state/login"><ErrorBoundary><StateAdminLayout><PolicyAlerts /></StateAdminLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/state/reports" element={<ProtectedRoute storageKey="raktsetu_state_admin" redirectPath="/state/login"><ErrorBoundary><StateAdminLayout><DistrictOfficerReports /></StateAdminLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/state/funding" element={<ProtectedRoute storageKey="raktsetu_state_admin" redirectPath="/state/login"><ErrorBoundary><StateAdminLayout><FundingRecommendations /></StateAdminLayout></ErrorBoundary></ProtectedRoute>} />

                          {/* --------------------------------- */}
                          {/* 6. SYSTEM ADMIN ROUTES            */}
                          {/* --------------------------------- */}
                          <Route path="/systemadmin" element={<Navigate to="/systemadmin/login" replace />} />
                          <Route path="/systemadmin/login" element={<SystemAdminLogin />} />
                          <Route path="/systemadmin/dashboard" element={<ProtectedRoute storageKey="raktsetu_sysadmin_state" redirectPath="/systemadmin/login"><ErrorBoundary><SystemAdminLayout><SystemAdminDashboard /></SystemAdminLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/systemadmin/approvals" element={<ProtectedRoute storageKey="raktsetu_sysadmin_state" redirectPath="/systemadmin/login"><ErrorBoundary><SystemAdminLayout><PendingApprovals /></SystemAdminLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/systemadmin/users" element={<ProtectedRoute storageKey="raktsetu_sysadmin_state" redirectPath="/systemadmin/login"><ErrorBoundary><SystemAdminLayout><UserManagement /></SystemAdminLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/systemadmin/audit-logs" element={<ProtectedRoute storageKey="raktsetu_sysadmin_state" redirectPath="/systemadmin/login"><ErrorBoundary><SystemAdminLayout><AuditLogs /></SystemAdminLayout></ErrorBoundary></ProtectedRoute>} />
                          <Route path="/systemadmin/settings" element={<ProtectedRoute storageKey="raktsetu_sysadmin_state" redirectPath="/systemadmin/login"><ErrorBoundary><SystemAdminLayout><SystemSettings /></SystemAdminLayout></ErrorBoundary></ProtectedRoute>} />

                          {/* --------------------------------- */}
                          {/* 7. FALLBACK ROUTES                */}
                          {/* --------------------------------- */}
                          <Route path="/unauthorized" element={<Unauthorized />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
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
