import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useStateAdmin } from '../../context/StateAdminContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingDown,
  Bell,
  FileText,
  Lightbulb,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StateAdminLayout = ({ children }) => {
  const { appState, logoutStateAdmin } = useStateAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (appState.status !== 'logged_in') {
    return <Navigate to="/state/login" replace />;
  }

  const navigation = [
    { name: 'State Overview', path: '/state/dashboard', icon: LayoutDashboard },
    { name: 'Cross-District Transfers', path: '/state/transfers', icon: ArrowLeftRight },
    { name: 'Waste KPIs', path: '/state/waste', icon: TrendingDown },
    { name: 'Policy Alerts', path: '/state/alerts', icon: Bell },
    { name: 'District Reports', path: '/state/reports', icon: FileText },
    { name: 'Funding Recommendations', path: '/state/funding', icon: Lightbulb },
  ];

  const handleLogout = () => {
    logoutStateAdmin();
    navigate('/state/login');
  };

  const officialName = appState.officialDetails?.name || 'Dr. Anita Deshmukh';
  const stateName = appState.officialDetails?.state || 'Maharashtra';

  const activeAlerts = appState.policyAlerts?.filter(a => a.status === 'Active' && a.severity === 'Critical') || [];

  return (
    <div className="state-portal min-h-screen bg-[#fbf9f6] text-[#1b1c1a] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#BE1F2E] selection:text-white">
      <div className="noise-filter" />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 border-b border-[#E0DAD4] backdrop-blur-md px-6 md:px-10 lg:px-16 py-4 flex items-center justify-between" style={{ height: 72 }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-[#5A5A5A] hover:text-[var(--state)] focus:outline-none transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/state/dashboard" className="flex items-center gap-2">
            <span className="font-serif text-[24px] font-bold text-[#BE1F2E] tracking-tight">
              Rakt<span className="italic">Setu</span>
            </span>
            <span className="hidden sm:inline-block badge-state">State Admin</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-[var(--state-light)] text-[#5A5A5A] hover:text-[var(--state)] transition-colors relative"
            >
              <Bell size={20} />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--state)' }} />
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
                      <span>Policy Alerts</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--state)' }}>{activeAlerts.length} Critical</span>
                    </h3>
                    <div className="space-y-3">
                      {activeAlerts.slice(0, 3).map(alert => (
                        <div key={alert.id} className="p-3 rounded-lg bg-[#fbf9f6] border border-[#E0DAD4] text-xs text-[#5A5A5A]">
                          <p className="font-bold text-[#1A1A1A] mb-0.5">{alert.district}: {alert.type}</p>
                          <p className="text-[#9A9A9A] line-clamp-2">{alert.message}</p>
                        </div>
                      ))}
                      {activeAlerts.length === 0 && (
                        <p className="text-[#9A9A9A] text-xs text-center py-2">No critical policy alerts.</p>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Chip */}
          <div className="flex items-center gap-3 bg-white border border-[#E0DAD4] rounded-full pl-3 pr-4 py-1.5 shadow-sm">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: 'var(--state)' }}
            >
              {officialName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline text-xs font-bold text-[#1A1A1A] max-w-[150px] truncate">
              {stateName}
            </span>
          </div>

          {/* Logout (Desktop) */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 text-[#5A5A5A] hover:text-[var(--state)] text-xs font-bold transition-colors uppercase tracking-wider"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex relative min-h-[calc(100vh-72px)]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#fbf9f6] border-r border-[#E0DAD4] p-6 shrink-0">
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`state-nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                  {item.name === 'Policy Alerts' && activeAlerts.length > 0 && (
                    <span
                      className="ml-auto text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                      style={{ backgroundColor: 'var(--state)' }}
                    >
                      {activeAlerts.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="state-nav-link mt-auto w-full border-0 bg-transparent"
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
                  <button onClick={() => setMobileMenuOpen(false)} className="text-[#5A5A5A] hover:text-[var(--state)] transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <nav className="flex-1 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`state-nav-link ${isActive ? 'active' : ''}`}
                      >
                        <Icon size={18} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="state-nav-link mt-auto w-full border-0 bg-transparent"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto w-full relative z-10">
          <div className="state-page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StateAdminLayout;
