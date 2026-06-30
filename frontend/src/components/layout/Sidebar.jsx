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
  X,
  BarChart3,
  Calendar,
  Search
} from 'lucide-react';

export const sidebarItems = [
  { path: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/staff/inventory', label: 'Blood Inventory', icon: Database },
  { path: '/staff/update-stock', label: 'Update Stock', icon: PlusCircle },
  { path: '/staff/expiry-alerts', label: 'Expiry Alerts', icon: AlertTriangle, badgeKey: 'expiry' },
  { path: '/staff/transfer-request', label: 'Transfer Requests', icon: ArrowLeftRight },
  { path: '/staff/surgical-schedule', label: 'Surgical Schedule', icon: Calendar },
  { path: '/staff/donor-search', label: 'Donor Search', icon: Search },
  { path: '/staff/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/staff/invite', label: 'Invite Staff', icon: UserPlus }
];

export const Sidebar = ({ badges = {}, isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  const content = (
    <div className="flex flex-col h-full bg-[#FFFFFF]/90 border-r border-[#EDE7E1] backdrop-blur-xl p-6 select-none">
      <div className="mb-8 px-2">
        <span className="font-serif text-[24px] font-bold text-[#BE1F2E] tracking-tight shrink-0 block" style={{ fontFeatureSettings: '"liga" 0' }}>
          RaktSetu
        </span>
        <span className="block text-[10px] text-[#7A5F5F] uppercase font-bold tracking-wider mt-1">
          Hospital Staff
        </span>
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
                relative flex items-center justify-between px-4 py-3 rounded-2xl font-[500] text-[14px] transition-all group cursor-pointer
                ${isActive 
                  ? 'bg-[rgba(190,31,46,0.06)] text-[#BE1F2E] font-[600]' 
                  : 'text-[#5A5A5A] hover:bg-[#F0EBE5] hover:text-[#1A1210]'}
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
                        ? 'bg-[#BE1F2E] text-white border-[#BE1F2E]' 
                        : 'bg-[rgba(224,123,0,0.1)] text-[#E07B00] border-[#E07B00]/10'}
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

      <div className="border-t border-[#EDE7E1] pt-4 mt-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 px-2">
          {user?.logo && (
            <img
              src={user.logo}
              alt={user.name}
              className="w-10 h-10 rounded-2xl object-cover border border-[#EDE7E1] shadow-sm"
            />
          )}
          <div className="overflow-hidden">
            <span className="block text-xs font-bold text-[#1A1210] truncate">
              {user?.name}
            </span>
            <span className="block text-[10px] text-[#7A5F5F] truncate">
              ID: {user?.bloodBankId}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl font-semibold text-sm text-[#7A5F5F] hover:text-[#BE1F2E] hover:bg-red-50/50 transition-all cursor-pointer"
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
          className="lg:hidden fixed inset-0 z-40 bg-[#1A1210]/40 backdrop-blur-xs transition-opacity"
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
          className="absolute top-5 right-[-45px] p-2 rounded-xl bg-white border border-[#EDE7E1] shadow-md text-[#5A5A5A] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.aside>
    </>
  );
};
