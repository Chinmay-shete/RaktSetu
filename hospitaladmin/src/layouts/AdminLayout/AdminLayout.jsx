import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = ({ children }) => {
  const { appState, logoutAdmin } = useHospital();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Invite Staff', path: '/admin/invite-staff', icon: UserPlus },
    { name: 'AI Demand Forecast', path: '/admin/forecast', icon: LineChart },
    { name: 'Waste Analytics', path: '/admin/waste', icon: Trash2 },
    { name: 'Alert Thresholds', path: '/admin/thresholds', icon: Sliders },
  ];

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const currentHospitalName = appState.hospitalDetails?.hospitalName || "Apex City Hospital";

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 border-b border-white/10 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-slate-300 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <Activity className="text-red-500 w-8 h-8" />
            <span className="font-extrabold text-xl tracking-tight text-white">
              Rakt<span className="text-red-500">Setu</span>
            </span>
            <span className="hidden sm:inline-block bg-slate-800 text-xs px-2.5 py-0.5 rounded-full border border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
              Hospital Admin
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors relative"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-4 z-20"
                  >
                    <h3 className="font-bold text-sm text-white mb-3 flex items-center justify-between">
                      <span>Notifications</span>
                      <span className="text-xs text-red-500 font-medium">Clear All</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="p-2.5 rounded-lg bg-slate-800/60 border border-white/5 text-xs text-slate-300">
                        <p className="font-semibold text-white mb-0.5">Critical Alert: O- negative low</p>
                        <p className="text-slate-400">Stock is below the minimum threshold.</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-800/60 border border-white/5 text-xs text-slate-300">
                        <p className="font-semibold text-white mb-0.5">Staff Accepted Invitation</p>
                        <p className="text-slate-400">Dr. Ramesh Kumar joined the portal.</p>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 bg-slate-800/50 border border-white/10 rounded-full pl-3 pr-4 py-1.5">
            <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm">
              {currentHospitalName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline text-sm font-semibold text-slate-200 max-w-[150px] truncate">
              {currentHospitalName}
            </span>
          </div>

          {/* Logout button (Desktop) */}
          <button 
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm font-semibold transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 bg-slate-950/80 border-r border-white/10 p-4 shrink-0">
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    isActive 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/10' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors w-full mt-auto"
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
                className="fixed inset-0 z-30 bg-black lg:hidden"
              />
              <motion.aside 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950 border-r border-white/10 p-5 flex flex-col lg:hidden"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="font-extrabold text-lg text-white">Navigation</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
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
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                          isActive 
                            ? 'bg-red-600 text-white' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors w-full mt-auto"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;