import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { hospitalApi } from '../../services/api';
import {
  Bell,
  Search,
  Menu,
  RefreshCw,
  AlertTriangle,
  Flame,
  ArrowLeftRight,
  PlusCircle,
  Check,
  CheckCheck,
  LogOut
} from 'lucide-react';

export const Navbar = ({ onMenuOpen }) => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const toast = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const notifRef = useRef(null);

  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, index) => {
      const path = '/' + parts.slice(0, index + 1).join('/');
      const label = part.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      return { path, label };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  const fetchNotifs = async () => {
    try {
      const data = await hospitalApi.getNotifications();
      // Filter out any notification of type Emergency since it's removed
      const filtered = data.filter(n => n.type !== 'Emergency');
      setNotifications(filtered);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await fetchNotifs();
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Database synchronized successfully!");
    }, 800);
  };

  const markAllRead = async () => {
    try {
      await hospitalApi.markAllNotificationsRead();
      await fetchNotifs();
      toast.success("All notifications marked as read");
    } catch (e) {
      toast.error("Failed to update notifications");
    }
  };

  const markRead = async (id, e) => {
    e.stopPropagation();
    try {
      await hospitalApi.markNotificationRead(id);
      await fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'Expiry': return <AlertTriangle className="h-4 w-4 text-[#E07B00]" />;
      case 'Transfer': return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
      case 'Stock Low': return <PlusCircle className="h-4 w-4 text-[#BE1F2E]" />;
      default: return <Bell className="h-4 w-4 text-[#7A5F5F]" />;
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-lg border-b border-[#E0DAD4] flex-shrink-0 transition-all duration-300" style={{ height: 72 }}>
      <div className="flex items-center gap-4">
        <Link to="/staff/dashboard" className="font-serif text-[24px] font-bold text-[#C8102E] tracking-tight shrink-0" style={{ fontFeatureSettings: '"liga" 0' }}>
          Rakt<span className="italic">Setu</span>
        </Link>
        <span className="hidden sm:inline-block bg-[rgba(200,16,46,0.06)] border border-[rgba(200,16,46,0.15)] text-[#C8102E] text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Hospital Staff
        </span>

        <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-[#7A5F5F] select-none">
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={bc.path}>
              <span className="text-[#EDE7E1] font-normal">/</span>
              <span className={idx === breadcrumbs.length - 1 ? "text-[#1A1210] font-bold" : "hover:text-[#C8102E] transition-colors"}>
                {bc.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#FFFFFF] border border-[#EDE7E1] shadow-inner w-48 focus-within:w-56 transition-all duration-300">
          <Search className="h-4 w-4 text-[#7A5F5F]" />
          <input
            type="text"
            placeholder="Search portal..."
            className="bg-transparent border-none outline-none text-xs w-full text-[#1A1210] placeholder-[#A8A0A0]"
          />
        </div>

        <button aria-label="Refresh" type="button"
          onClick={handleSync}
          disabled={isSyncing}
          className="p-2.5 rounded-2xl bg-white border border-[#EDE7E1] shadow-sm text-[#5A5A5A] hover:text-[#BE1F2E] cursor-pointer transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin text-[#BE1F2E]" : ""}`} />
        </button>

        <div className="static sm:relative" ref={notifRef}>
          <button aria-label="Notifications" type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2.5 rounded-2xl bg-white border border-[#EDE7E1] shadow-sm text-[#5A5A5A] hover:text-[#BE1F2E] cursor-pointer transition-all relative active:scale-95"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#BE1F2E] border border-white rounded-full animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-6 sm:right-0 mt-3 w-[calc(100vw-48px)] sm:w-80 bg-[#FFFFFF] rounded-3xl shadow-2xl overflow-hidden z-50 border border-[#EDE7E1]"
              >
                <div className="flex items-center justify-between p-4 border-b border-[#EDE7E1]">
                  <span className="text-sm font-bold text-[#1A1210]">
                    Notifications ({unreadCount})
                  </span>
                  {unreadCount > 0 && (
                    <button type="button"
                      onClick={markAllRead}
                      className="text-xxs text-[#BE1F2E] hover:text-[#9E1825] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="h-3 w-3" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#EDE7E1]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#7A5F5F]">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`flex gap-3 p-3.5 text-xs transition-colors hover:bg-red-50/20 ${notif.read ? 'bg-red-50/10' : ''}`}
                      >
                        <div className="flex-shrink-0 mt-0.5">{getNotifIcon(notif.type)}</div>
                        <div className="flex-grow">
                          <p className="font-bold text-[#1A1210]">{notif.title}</p>
                          <p className="text-[#5A5A5A] mt-0.5 leading-relaxed">{notif.message}</p>
                        </div>
                        {!notif.read && (
                          <button aria-label="Close notification" type="button"
                            onClick={(e) => markRead(notif.id, e)}
                            className="flex-shrink-0 text-[#7A5F5F] hover:text-[#BE1F2E] self-center cursor-pointer p-1"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-3 border-t border-[#EDE7E1] text-center bg-[#FAF8F5]">
                  <Link
                    to="/staff/expiry-alerts"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xxs font-bold text-[#7A5F5F] hover:text-[#BE1F2E] transition-colors"
                  >
                    View System Alerts
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile (matching donor dashboard style) */}
        <div 
          className="w-8 h-8 rounded-full overflow-hidden border flex items-center justify-center shrink-0 shadow-sm cursor-pointer"
          style={{ borderColor: 'rgba(200,16,46,0.20)', background: '#eae8e5' }}
          onClick={() => navigate('/staff/profile')}
        >
          {user?.logo ? (
            <img
              src={user.logo}
              alt={user?.name || 'Staff'}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[13px] font-bold" style={{ color: '#C8102E' }}>
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'ST'}
            </span>
          )}
        </div>

        {/* Logout button */}
        <button type="button" 
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex items-center gap-1.5 text-[#5A5A5A] hover:text-[#C8102E] text-xs font-bold transition-colors uppercase tracking-wider cursor-pointer"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
