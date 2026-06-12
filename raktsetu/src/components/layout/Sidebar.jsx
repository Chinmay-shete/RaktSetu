import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Database,
  PlusCircle,
  ArrowLeftRight,
  AlertTriangle,
  UserPlus,
  Heart,
  LogOut,
  X
} from 'lucide-react';

export const sidebarItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/inventory', label: 'Blood Inventory', icon: Database },
  { path: '/update-stock', label: 'Update Stock', icon: PlusCircle },
  { path: '/expiry-alerts', label: 'Expiry Alerts', icon: AlertTriangle, badgeKey: 'expiry' },
  { path: '/transfer-request', label: 'Transfer Requests', icon: ArrowLeftRight },
  { path: '/invite', label: 'Invite Staff', icon: UserPlus }
];

export const Sidebar = ({ badges = {}, isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-50/80 dark:bg-slate-900/80 border-r border-slate-200/50 dark:border-slate-800/40 backdrop-blur-xl p-6 select-none">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="bg-rose-600 p-2.5 rounded-2xl text-white shadow-lg shadow-rose-600/30">
          <Heart className="h-6 w-6 fill-current animate-pulse" />
        </div>
        <div>
          <span className="text-xl font-black text-slate-800 dark:text-slate-100 font-outfit tracking-tight">
            Rakt<span className="text-rose-600">Setu</span>
          </span>
          <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
            Hospital Portal
          </span>
        </div>
      </div>

      <nav className="flex-grow flex flex-col gap-1.5 overflow-y-auto pr-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                relative flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-all group cursor-pointer
                ${isActive 
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-slate-100'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>

                  {badgeCount > 0 && (
                    <span className={`
                      text-[10px] font-extrabold px-2 py-0.5 rounded-full border transition-colors
                      ${isActive 
                        ? 'bg-white text-rose-600 border-white' 
                        : 'bg-amber-500 text-white border-amber-600/10'}
                    `}>
                      {badgeCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/50 dark:border-slate-800/40 pt-4 mt-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 px-2">
          <img
            src={user.logo}
            alt={user.name}
            className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
          />
          <div className="overflow-hidden">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {user.name}
            </span>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 truncate">
              ID: {user.bloodBankId}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl font-semibold text-sm text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 dark:hover:bg-rose-500/5 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Logout Account
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-72 h-screen fixed left-0 top-0 z-30">
        {content}
      </aside>

      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity"
        />
      )}

      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="lg:hidden fixed left-0 top-0 h-screen w-72 z-50 shadow-2xl"
      >
        {content}
        <button
          onClick={onClose}
          className="absolute top-5 right-[-45px] p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md text-slate-500 dark:text-slate-400 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.aside>
    </>
  );
};
