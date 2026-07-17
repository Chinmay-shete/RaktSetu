import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { hospitalApi } from '../services/api';
import { 
  LayoutDashboard, 
  Database, 
  PlusCircle, 
  AlertTriangle, 
  ArrowLeftRight 
} from 'lucide-react';

export const HospitalLayout = () => {
  const { isAuthenticated } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Hook must be called unconditionally before early return
  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: hospitalApi.getInventory,
    refetchInterval: 12000,
    enabled: !!isAuthenticated
  });

  const { data: emergencies = [] } = useQuery({
    queryKey: ['emergencies'],
    queryFn: hospitalApi.getEmergencyRequests,
    refetchInterval: 10000,
    enabled: !!isAuthenticated
  });

  const expiryCount = (Array.isArray(inventory) ? inventory : []).filter(item => item.status === 'Expiring Soon' || item.status === 'Expired').length;

  const emergencyCount = (Array.isArray(emergencies) ? emergencies : []).filter(req => req.status === 'Pending').length;

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
        <main className="flex-grow p-6 pb-24 lg:pb-10 flex flex-col w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          MOBILE STICKY BOTTOM BAR (matching landing page styling)
      ───────────────────────────────────────────────────────────────────── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-2 py-2 flex items-center justify-around"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(26,18,16,0.09)',
          boxShadow: '0 -4px 24px rgba(26,18,16,0.08)',
        }}
      >
        {[
          { name: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
          { name: 'Inventory', path: '/staff/inventory', icon: Database },
          { name: 'Update', path: '/staff/update-stock', icon: PlusCircle },
          { name: 'Alerts', path: '/staff/expiry-alerts', icon: AlertTriangle },
          { name: 'Transfers', path: '/staff/transfer-request', icon: ArrowLeftRight },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl flex-1 transition-all"
              style={{
                color: isActive ? '#C8102E' : '#5C403F',
                background: isActive ? 'rgba(200,16,46,0.06)' : 'transparent',
              }}
            >
              <Icon size={20} style={{ strokeWidth: isActive ? 2.5 : 2 }} />
              <span className="text-[9px] font-[700] uppercase tracking-wider text-center" style={{ fontSize: '9px' }}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default HospitalLayout;
