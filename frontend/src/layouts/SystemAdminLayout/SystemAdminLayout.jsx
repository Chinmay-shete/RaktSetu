import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSystemAdmin } from '../../context/SystemAdminContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  ShieldAlert, 
  Settings, 
  LogOut, 
  Bell, 
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SystemAdminLayout = ({ children }) => {
  const { adminState, logoutAdmin, syncState } = useSystemAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  React.useEffect(() => {
    syncState();
  }, [syncState]);



  const navigation = [
    { name: 'Dashboard', path: '/systemadmin/dashboard', icon: LayoutDashboard },
    { name: 'Approvals', path: '/systemadmin/approvals', icon: CheckSquare },
    { name: 'User Management', path: '/systemadmin/users', icon: Users },
    { name: 'Audit Logs', path: '/systemadmin/audit-logs', icon: ShieldAlert },
    { name: 'System Settings', path: '/systemadmin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logoutAdmin();
    navigate('/login');
  };

  const adminName = adminState.adminDetails?.name || 'Vikram Malhotra';
  
  // Critical warnings or notifications from audit logs (e.g. Sentry/Warnings)
  const warningLogs = adminState.auditLogs?.filter(log => log.severity === 'Warning') || [];

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#BE1F2E] selection:text-white">
      {/* Noise filter */}
      <div className="noise-filter" />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 border-b border-[#E0DAD4] backdrop-blur-md px-6 md:px-10 lg:px-16 py-4 flex items-center justify-between" style={{ height: 72 }}>
        <div className="flex items-center gap-3">
          <Link to="/systemadmin/dashboard" className="flex items-center gap-2">
            <span className="font-serif text-[24px] font-bold text-[#C8102E] tracking-tight">
              Rakt<span className="italic">Setu</span>
            </span>
            <span className="hidden sm:inline-block bg-[rgba(200,16,46,0.06)] border border-[rgba(200,16,46,0.15)] text-[#C8102E] text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              System Admin
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
              {warningLogs.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#E07B00] rounded-full" />
              )}
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
                      <span>System Alerts</span>
                      <span className="text-xs text-[#E07B00] font-semibold">{warningLogs.length} Warns</span>
                    </h3>
                    <div className="space-y-3">
                      {warningLogs.slice(0, 3).map(log => (
                        <div key={log.id} className="p-3 rounded-lg bg-[#fbf9f6] border border-[#E0DAD4] text-xs text-[#5A5A5A]">
                          <p className="font-bold text-[#1A1A1A] mb-0.5">{log.action}</p>
                          <p className="text-[#9A9A9A]">{log.timestamp}</p>
                        </div>
                      ))}
                      {warningLogs.length === 0 && (
                        <p className="text-[#9A9A9A] text-xs text-center py-2">No warning alerts right now.</p>
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
              {adminName.charAt(0).toUpperCase()}
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
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
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
        {navigation.map((item) => {
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
                {item.name === 'User Management' ? 'Users' : item.name === 'System Settings' ? 'Settings' : item.name === 'Audit Logs' ? 'Logs' : item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SystemAdminLayout;
