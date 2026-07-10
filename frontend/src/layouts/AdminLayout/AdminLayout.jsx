import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useHospital } from '../../context/HospitalContext';
import { 
  LayoutDashboard, 
  UserPlus, 
  LineChart, 
  Trash2, 
  Sliders, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  Activity, 
  Tent, 
  Settings,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const AdminLayout = ({ children }) => {
  const { appState, logoutAdmin, syncState } = useHospital();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/hospital/notifications');
      setNotifications(response.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    syncState();
  }, [syncState]);

  useEffect(() => {
    if (appState.status === 'logged_in') {
      fetchNotifications();
    }
  }, [appState.status]);

  const clearAllNotifications = async () => {
    try {
      await api.patch('/hospital/notifications/read-all');
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  };

  const navigation = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Staff List', path: '/admin/staff-list', icon: Users },
    { name: 'Camp Creation', path: '/admin/camp-creation', icon: Tent },
    { name: 'Invite Staff', path: '/admin/invite-staff', icon: UserPlus },
    { name: 'AI Demand Forecast', path: '/admin/forecast', icon: LineChart },
    { name: 'Waste Analytics', path: '/admin/waste', icon: Trash2 },
    { name: 'Alert Thresholds', path: '/admin/thresholds', icon: Sliders },
    { name: 'Hospital Settings', path: '/admin/profile', icon: Settings },
  ];

  const handleLogout = () => {
    logoutAdmin();
    navigate('/login');
  };

  const currentHospitalName = appState.hospitalDetails?.hospitalName || "Apex City Hospital";
  
  const unreadNotifications = notifications.filter(n => n.is_read === 0 || !n.isRead);
  const hasUnread = unreadNotifications.length > 0;

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#BE1F2E] selection:text-white">
      {/* Noise filter */}
      <div className="noise-filter" />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 border-b border-[#E0DAD4] backdrop-blur-md px-6 md:px-10 lg:px-16 py-4 flex items-center justify-between" style={{ height: 72 }}>
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <span className="font-serif text-[24px] font-bold text-[#C8102E] tracking-tight">
              Rakt<span className="italic">Setu</span>
            </span>
            <span className="hidden sm:inline-block bg-[rgba(200,16,46,0.06)] border border-[rgba(200,16,46,0.15)] text-[#C8102E] text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Hospital Admin
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button aria-label="Notifications" type="button" 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-[rgba(190,31,46,0.06)] text-[#5A5A5A] hover:text-[#BE1F2E] transition-colors relative"
            >
              <Bell size={20} />
              {hasUnread && <span className="absolute top-1 right-1 w-2 h-2 bg-[#BE1F2E] rounded-full animate-pulse" />}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-[#E0DAD4] rounded-xl shadow-xl p-5 z-20 text-[#1A1A1A]"
                  >
                    <h3 className="font-bold text-sm text-[#1A1A1A] mb-3 flex items-center justify-between border-b border-[#E0DAD4] pb-2">
                      <span>Notifications ({notifications.length})</span>
                      {notifications.length > 0 && (
                        <span 
                          onClick={clearAllNotifications}
                          className="text-xs text-[#BE1F2E] font-semibold cursor-pointer hover:underline"
                        >
                          Clear All
                        </span>
                      )}
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-[#9A9A9A] text-center py-4">No notifications.</p>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="p-3 rounded-lg bg-[#fbf9f6] border border-[#E0DAD4] text-xs text-[#5A5A5A]">
                            <p className="font-bold text-[#1A1A1A] mb-0.5">{n.title}</p>
                            <p className="text-[#9A9A9A]">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile (matching donor dashboard style) */}
          <div 
            className="w-8 h-8 rounded-full overflow-hidden border flex items-center justify-center shrink-0 shadow-sm"
            style={{ borderColor: 'rgba(200,16,46,0.20)', background: '#eae8e5' }}
          >
            <span className="text-[13px] font-bold" style={{ color: '#C8102E' }}>
              {currentHospitalName.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Logout button */}
          <button type="button" 
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[#5A5A5A] hover:text-[#C8102E] text-xs font-bold transition-colors uppercase tracking-wider cursor-pointer"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex relative min-h-[calc(100vh-72px)]">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#fbf9f6] border-r border-[#E0DAD4] p-6 shrink-0">
          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-[#BE1F2E] text-white shadow-md shadow-[#BE1F2E]/20' 
                      : 'text-[#5A5A5A] hover:text-[#BE1F2E] hover:bg-[rgba(190,31,46,0.04)]'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <button type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#5A5A5A] hover:text-[#BE1F2E] hover:bg-[rgba(190,31,46,0.04)] transition-colors w-full mt-auto"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </aside>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
              />
              <motion.aside 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#fbf9f6] border-r border-[#E0DAD4] p-6 flex flex-col lg:hidden"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="font-serif text-lg font-bold text-[#1a1a1a]">Navigation</span>
                  <button aria-label="Close" type="button" onClick={() => setMobileMenuOpen(false)} className="text-[#5A5A5A] hover:text-[#BE1F2E]">
                    <X size={20} />
                  </button>
                </div>
                
                <nav className="flex-1 space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                          isActive 
                            ? 'bg-[#BE1F2E] text-white shadow-md shadow-[#BE1F2E]/20' 
                            : 'text-[#5A5A5A] hover:text-[#BE1F2E] hover:bg-[rgba(190,31,46,0.04)]'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                <button type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#5A5A5A] hover:text-[#BE1F2E] hover:bg-[rgba(190,31,46,0.04)] transition-colors w-full mt-auto"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 pb-24 lg:pb-10 max-w-7xl mx-auto overflow-y-auto w-full relative z-10">
          {children}
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
          navigation[0], // Dashboard
          navigation[1], // Staff List
          navigation[2], // Camp Creation
          navigation[4], // AI Demand Forecast
          navigation[7], // Hospital Settings
        ].map((item) => {
          if (!item) return null;
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
                {item.name === 'Camp Creation' ? 'Camps' : item.name === 'AI Demand Forecast' ? 'Forecast' : item.name === 'Hospital Settings' ? 'Settings' : item.name === 'Staff List' ? 'Staff' : item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AdminLayout;