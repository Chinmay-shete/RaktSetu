import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Layout & Pages
import { HospitalLayout } from './layout/HospitalLayout';
import { Dashboard } from './pages/hospital/Dashboard';
import { BloodInventory } from './pages/hospital/inventory/BloodInventory';
import { UpdateStock } from './pages/hospital/inventory/UpdateStock';
import { ExpiryAlerts } from './pages/hospital/alerts/ExpiryAlerts';
import { TransferRequests } from './pages/hospital/requests/TransferRequests';
import { EmergencyRequests } from './pages/hospital/requests/EmergencyRequests';
import { Analytics } from './pages/hospital/analytics/Analytics';
import { HospitalProfile } from './pages/hospital/profile/HospitalProfile';
import { Settings } from './pages/hospital/profile/Settings';

import { Heart, ShieldCheck, Building2, User } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-6 relative overflow-hidden select-none">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-rose-600/10 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-3xl -z-10" />

      <div className="max-w-md w-full text-center flex flex-col gap-8 animate-fade-in">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-rose-600 p-4 rounded-3xl text-white shadow-xl shadow-rose-600/35">
            <Heart className="h-10 w-10 fill-current animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold font-outfit tracking-tight mt-2">
            Rakt<span className="text-rose-600">Setu</span>
          </h1>
          <p className="text-xs text-slate-450 font-semibold uppercase tracking-widest">
            Blood Management System
          </p>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">
          Connecting donors, hospitals, and blood banks to ensure a secure, stateful, and automated supply network across departments.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            to="/hospital/dashboard"
            className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-rose-500/30 hover:bg-white/10 transition-all text-left shadow-lg cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-rose-600/20 p-3 rounded-2xl text-rose-550 group-hover:bg-rose-650 group-hover:text-white transition-colors">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-sm font-bold text-white">Hospital Portal</span>
                <span className="block text-xxs text-slate-400 mt-0.5">Manage stock, accept SOS requests, track transfers</span>
              </div>
            </div>
            <span className="text-xs text-rose-500 font-bold group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <Link
            to="/user-dashboard"
            className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all text-left shadow-lg cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-600/20 p-3 rounded-2xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <User className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-sm font-bold text-white">User Portal (Unmodified)</span>
                <span className="block text-xxs text-slate-400 mt-0.5">Mock page for standard donor dashboard view</span>
              </div>
            </div>
            <span className="text-xs text-blue-500 font-bold group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 text-xxs text-slate-500 font-bold tracking-wide mt-4">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          REGULATORY MEDICAL NETWORK ENCRYPTED
        </div>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-6 text-center">
      <div className="max-w-md flex flex-col gap-6 items-center">
        <div className="bg-blue-600/10 p-4 rounded-full text-blue-500 border border-blue-500/20">
          <User className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold font-outfit">User & Donor Dashboard</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          This dashboard contains the primary user donation history, registration profiles, and appointment bookings. It has been kept separate and unmodified per the architecture design principles.
        </p>
        <Link to="/" className="text-xs text-rose-500 font-bold hover:underline">
          ← Back to Hub
        </Link>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />

              <Route path="/hospital" element={<HospitalLayout />}>
                <Route index element={<Navigate to="/hospital/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="inventory" element={<BloodInventory />} />
                <Route path="update-stock" element={<UpdateStock />} />
                <Route path="transfers" element={<TransferRequests />} />
                <Route path="expiry-alerts" element={<ExpiryAlerts />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="emergency" element={<EmergencyRequests />} />
                <Route path="profile" element={<HospitalProfile />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
