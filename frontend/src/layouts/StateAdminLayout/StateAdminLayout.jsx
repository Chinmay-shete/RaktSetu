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
import { ChangePasswordModal } from '../../components/ui/ChangePasswordModal';

const StateAdminLayout = ({ children }) => {
  const { appState, logoutStateAdmin, syncState } = useStateAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  React.useEffect(() => {
    syncState();
  }, [syncState]);

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
    navigate('/login');
  };

  const officialName = appState.user?.name || appState.officialDetails?.name || 'Dr. Anita Deshmukh';
  const stateName = appState.user?.state || appState.officialDetails?.state || 'Maharashtra';
  const designationName = appState.user?.designation || appState.officialDetails?.designation || 'Principal Secretary, Health';

  const activeAlerts = appState.policyAlerts?.filter(a => a.status === 'Active' && a.severity === 'Critical') || [];

  return (
    <div className="state-portal min-h-screen bg-[#fbf9f6] text-[#1b1c1a] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#BE1F2E] selection:text-white">
      <div className="noise-filter" />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 border-b border-[#E0DAD4] backdrop-blur-md px-6 md:px-10 lg:px-16 py-4 flex items-center justify-between" style={{ height: 72 }}>
        <div className="flex items-center gap-3">
          <Link to="/state/dashboard" className="flex items-center gap-2">
            <span className="font-serif text-[24px] font-bold text-[#C8102E] tracking-tight">
              Rakt<span className="italic">Setu</span>
            </span>
            <span className="hidden sm:inline-block badge-state">State Admin</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications Bell */}
          <div className="relative">
            <button aria-label="Notifications" type="button"
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

          {/* User Profile dropdown */}
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => setShowProfileMenu(prev => !prev)}
              className="w-8 h-8 rounded-full overflow-hidden border flex items-center justify-center shrink-0 shadow-sm cursor-pointer hover:border-[#C8102E] transition-colors"
              style={{ borderColor: 'rgba(200,16,46,0.20)', background: '#eae8e5' }}
            >
              <span className="text-[13px] font-bold text-[#C8102E]">
                {officialName.charAt(0).toUpperCase()}
              </span>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-[#EDE7E1] rounded-2xl shadow-xl p-2 z-50 text-xs text-[#5A5A5A]"
                    style={{ top: '100%' }}
                  >
                    <div className="px-3 py-2 border-b border-[rgba(26,18,16,0.06)] mb-1">
                      <div className="font-bold text-[#1A1A1A]">{officialName}</div>
                      <div className="text-[10px] text-[#9A9A9A]">{designationName}</div>
                      <div className="text-[10px] text-[#9A9A9A]">{stateName} Jurisdiction</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowChangePasswordModal(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAF8F5] hover:text-[#C8102E] transition-all flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <span className="material-symbols-outlined text-[16px]">key</span>
                      Change Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAF8F5] hover:text-[#C8102E] transition-all flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
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

          <button type="button"
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
                  <button aria-label="Close" type="button" onClick={() => setMobileMenuOpen(false)} className="text-[#5A5A5A] hover:text-[var(--state)] transition-colors">
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

                <button type="button"
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
        <main className="flex-1 p-6 md:p-10 pb-24 lg:pb-10 max-w-7xl mx-auto overflow-y-auto w-full relative z-10">
          <div className="state-page-enter">
            {children}
          </div>
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
                {item.name === 'State Overview' ? 'Overview' : item.name === 'Cross-District Transfers' ? 'Transfers' : item.name === 'Waste KPIs' ? 'Waste' : item.name === 'Policy Alerts' ? 'Alerts' : item.name === 'District Reports' ? 'Reports' : item.name === 'Funding Recommendations' ? 'Funding' : item.name}
              </span>
            </Link>
          );
        })}
      </div>

      <ChangePasswordModal 
        isOpen={showChangePasswordModal} 
        onClose={() => setShowChangePasswordModal(false)} 
      />
    </div>
  );
};

export default StateAdminLayout;
