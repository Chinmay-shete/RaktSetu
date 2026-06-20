import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useDistrict } from '../../context/DistrictContext';
import { 
  LayoutDashboard, 
  MapPin, 
  AlertTriangle, 
  CalendarCheck, 
  FileBarChart2, 
  Building2, 
  LogOut, 
  Bell, 
  Menu, 
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DistrictLayout = ({ children }) => {
  const { appState, logoutOfficer } = useDistrict();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (appState.status !== 'logged_in') {
    return <Navigate to="/district/login" replace />;
  }

  const navigation = [
    { name: 'Dashboard', path: '/district/dashboard', icon: LayoutDashboard },
    { name: 'District Map', path: '/district/map', icon: MapPin },
    { name: 'Shortage Alerts', path: '/district/alerts', icon: AlertTriangle },
    { name: 'Camp Approvals', path: '/district/camps', icon: CalendarCheck },
    { name: 'Reports', path: '/district/reports', icon: FileBarChart2 },
    { name: 'Hospital Registry', path: '/district/hospitals', icon: Building2 },
  ];

  const handleLogout = () => {
    logoutOfficer();
    navigate('/district/login');
  };

  const officerName = appState.officerDetails?.name || 'Rajesh Patil';
  const district = appState.officerDetails?.district || 'Pune';

  const criticalAlerts = appState.alerts?.filter(a => a.severity === 'Critical' && a.status === 'Active') || [];

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#BE1F2E] selection:text-white">
      {/* Noise filter */}
      <div className="noise-filter" />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 border-b border-[#E0DAD4] backdrop-blur-md px-6 md:px-10 lg:px-16 py-4 flex items-center justify-between" style={{ height: 72 }}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-[#5A5A5A] hover:text-[#BE1F2E] focus:outline-none"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <Link to="/district/dashboard" className="flex items-center gap-2">
            <span className="font-serif text-[24px] font-bold text-[#BE1F2E] tracking-tight">
              Rakt<span className="italic">Setu</span>
            </span>
            <span className="hidden sm:inline-block bg-[rgba(190,31,46,0.06)] border border-[rgba(190,31,46,0.15)] text-[#BE1F2E] text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              District Officer
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-[rgba(190,31,46,0.06)] text-[#5A5A5A] hover:text-[#BE1F2E] transition-colors relative"
            >
              <Bell size={20} />
              {criticalAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#BE1F2E] rounded-full" />
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
                      <span>District Alerts</span>
                      <span className="text-xs text-[#BE1F2E] font-semibold">{criticalAlerts.length} Critical</span>
                    </h3>
                    <div className="space-y-3">
                      {criticalAlerts.slice(0, 3).map(alert => (
                        <div key={alert.id} className="p-3 rounded-lg bg-[#fbf9f6] border border-[#E0DAD4] text-xs text-[#5A5A5A]">
                          <p className="font-bold text-[#1A1A1A] mb-0.5">Critical: {alert.bloodGroup} shortage</p>
                          <p className="text-[#9A9A9A]">{alert.hospitalName} — {alert.units} units remaining</p>
                        </div>
                      ))}
                      {criticalAlerts.length === 0 && (
                        <p className="text-[#9A9A9A] text-xs text-center py-2">No critical alerts right now.</p>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 bg-white border border-[#E0DAD4] rounded-full pl-3 pr-4 py-1.5 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-[#BE1F2E] flex items-center justify-center text-white font-bold text-sm">
              {officerName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline text-xs font-bold text-[#1A1A1A] max-w-[150px] truncate">
              {district} District
            </span>
          </div>

          {/* Logout button (Desktop) */}
          <button 
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 text-[#5A5A5A] hover:text-[#BE1F2E] text-xs font-bold transition-colors uppercase tracking-wider"
          >
            <LogOut size={16} />
            <span>Logout</span>
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
                  {item.name === 'Shortage Alerts' && criticalAlerts.length > 0 && (
                    <span className="ml-auto bg-[#BE1F2E] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {criticalAlerts.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          
          <button
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
                  <button onClick={() => setMobileMenuOpen(false)} className="text-[#5A5A5A] hover:text-[#BE1F2E]">
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

                <button
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
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto w-full relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DistrictLayout;
