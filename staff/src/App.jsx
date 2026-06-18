import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { Login } from './pages/hospital/auth/Login';
import { InviteToken } from './pages/hospital/auth/InviteToken';
import { InviteStaff } from './pages/hospital/auth/InviteStaff';
import { SetPassword } from './pages/hospital/auth/SetPassword';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Guest Flows */}
              <Route path="/login" element={<Login />} />
              <Route path="/token/:token" element={<InviteToken />} />
              <Route path="/set-password/:token" element={<SetPassword />} />

              {/* Private Hospital Dashboard Flow */}
              <Route path="/" element={<HospitalLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="inventory" element={<BloodInventory />} />
                <Route path="update-stock" element={<UpdateStock />} />
                <Route path="expiry-alerts" element={<ExpiryAlerts />} />
                <Route path="transfer-request" element={<TransferRequests />} />
                <Route path="invite" element={<InviteStaff />} />
              </Route>

              {/* Fallback to root/login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
