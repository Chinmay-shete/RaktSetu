import React, { createContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let icon = <Info className="h-5 w-5 text-blue-500" />;
            let bgClass = "bg-white/80 dark:bg-slate-900/80 border border-blue-500/20";
            
            if (toast.type === 'success') {
              icon = <CheckCircle className="h-5 w-5 text-emerald-500" />;
              bgClass = "bg-white/80 dark:bg-slate-900/80 border border-emerald-500/20";
            } else if (toast.type === 'error') {
              icon = <XCircle className="h-5 w-5 text-rose-500" />;
              bgClass = "bg-white/80 dark:bg-slate-900/80 border border-rose-500/20";
            } else if (toast.type === 'warning') {
              icon = <AlertTriangle className="h-5 w-5 text-amber-500" />;
              bgClass = "bg-white/80 dark:bg-slate-900/80 border border-amber-500/20";
            }

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl shadow-xl backdrop-blur-xl ${bgClass}`}
              >
                <div className="flex-shrink-0">{icon}</div>
                <div className="flex-grow text-sm font-medium text-slate-800 dark:text-slate-200">
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
