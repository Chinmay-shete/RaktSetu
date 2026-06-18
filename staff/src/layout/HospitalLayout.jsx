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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: mockApi.getInventory,
    refetchInterval: 12000
  });

  const expiryCount = inventory.filter(item => item.status === 'Expiring Soon' || item.status === 'Expired').length;

  const badges = {
    expiry: expiryCount,
    emergency: 0
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <Sidebar
        badges={badges}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-grow flex flex-col lg:pl-72 min-h-screen w-full overflow-x-hidden">
        <Navbar onMenuOpen={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-grow p-6 flex flex-col w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HospitalLayout;
