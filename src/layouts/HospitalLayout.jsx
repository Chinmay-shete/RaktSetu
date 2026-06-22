import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { mockApi } from '../services/mockApi';

export const HospitalLayout = () => {
  const { isAuthenticated } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Both hooks called unconditionally before any early return (Rules of Hooks)
  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: mockApi.getInventory,
    refetchInterval: 12000,
    enabled: !!isAuthenticated
  });

  const { data: emergencies = [] } = useQuery({
    queryKey: ['emergencies'],
    queryFn: mockApi.getEmergencyRequests,
    refetchInterval: 10000,
    enabled: !!isAuthenticated
  });

  if (!isAuthenticated) {
    return <Navigate to="/staff/login" replace />;
  }

  const expiryCount = inventory.filter(item => item.status === 'Expiring Soon' || item.status === 'Expired').length;
  const emergencyCount = emergencies.filter(e => e.status === 'Pending').length;

  const badges = {
    expiry: expiryCount,
    emergency: emergencyCount
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1210] flex relative font-sans">
      {/* Noise filter background overlay */}
      <div className="noise-filter" />

      <Sidebar
        badges={badges}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-grow flex flex-col lg:pl-72 min-h-screen w-full overflow-x-hidden relative z-10">
        <Navbar onMenuOpen={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-grow p-6 flex flex-col w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HospitalLayout;
