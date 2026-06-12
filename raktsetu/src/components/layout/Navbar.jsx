import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../hooks/useToast';
import { mockApi } from '../../services/mockApi';
import {
  Bell,
  Search,
  Sun,
  Moon,
  Menu,
  RefreshCw,
  AlertTriangle,
  Flame,
  ArrowLeftRight,
  PlusCircle,
  Check,
  CheckCheck
} from 'lucide-react';

export const Navbar = ({ onMenuOpen }) => {
  const { user } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { pathname } = useLocation();
  const toast = useToast();
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
      const data = await mockApi.getNotifications();
      setNotifications(data);
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
      await mockApi.markAllNotificationsRead();
      await fetchNotifs();
      toast.success("All notifications marked as read");
    } catch (e) {
      toast.error("Failed to update notifications");
    }
  };

  const markRead = async (id, e) => {
    e.stopPropagation();
    try {
      await mockApi.markNotificationRead(id);
      await fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'Expiry': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'Emergency': return <Flame className="h-4 w-4 text-rose-500 animate-pulse" />;
      case 'Transfer': return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
      case 'Stock Low': return <PlusCircle className="h-4 w-4 text-rose-500" />;
      default: return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-200/40 dark:border-slate-800/30 backdrop-blur-md flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuOpen}
          className="lg:hidden p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm text-slate-500 dark:text-slate-400 cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 select-none">
          <Link to="/hospital/dashboard" className="hover:text-slate-600 dark:hover:text-slate-300">
            RaktSetu
          </Link>
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={bc.path}>
              <span className="text-slate-300 dark:text-slate-700 font-normal">/</span>
              <span className={idx === breadcrumbs.length - 1 ? "text-slate-700 dark:text-slate-200 font-bold" : "hover:text-slate-600 dark:hover:text-slate-300"}>
                {bc.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 shadow-inner w-48 focus-within:w-56 transition-all duration-300">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search portal..."
            className="bg-transparent border-none outline-none text-xs w-full text-slate-750 dark:text-slate-250 placeholder-slate-400"
          />
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer transition-all active:scale-95"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin text-rose-500" : ""}`} />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer transition-all active:scale-95"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer transition-all relative active:scale-95"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border border-white dark:border-slate-900 rounded-full animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 glass-panel rounded-3xl shadow-2xl overflow-hidden z-50 border border-slate-200/60 dark:border-slate-800/40"
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-800/40">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-outfit">
                    Notifications ({unreadCount})
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xxs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="h-3 w-3" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications active
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex gap-3 p-3.5 text-xs transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/20 ${!notif.read ? 'bg-slate-100/30 dark:bg-slate-800/10' : ''}`}
                      >
                        <div className="flex-shrink-0 mt-0.5">{getNotifIcon(notif.type)}</div>
                        <div className="flex-grow">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{notif.title}</p>
                          <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
                        </div>
                        {!notif.read && (
                          <button
                            onClick={(e) => markRead(notif.id, e)}
                            className="flex-shrink-0 text-slate-450 hover:text-slate-700 dark:hover:text-slate-300 self-center cursor-pointer p-1"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/40 text-center bg-slate-50/50 dark:bg-slate-900/30">
                  <Link
                    to="/hospital/expiry-alerts"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xxs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                  >
                    View System Alerts
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link to="/hospital/profile" className="flex items-center gap-2 cursor-pointer select-none">
          <img
            src={user.logo}
            alt={user.name}
            className="w-9 h-9 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 hover:scale-105 transition-all shadow-sm"
          />
        </Link>
      </div>
    </header>
  );
};
