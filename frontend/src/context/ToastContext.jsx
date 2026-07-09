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
      
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        <AnimatePresence>
          {toasts.map((toast) => {
            let icon = <Info className="h-5 w-5 text-[#7A5F5F]" />;
            let bgClass = "bg-[#FAF8F5] border border-[#EDE7E1]";
            
            if (toast.type === 'success') {
              icon = <CheckCircle className="h-5 w-5 text-[#22A06B]" />;
              bgClass = "bg-[#FAF8F5] border border-[#22A06B]/25";
            } else if (toast.type === 'error') {
              icon = <XCircle className="h-5 w-5 text-[#BE1F2E]" />;
              bgClass = "bg-[#FAF8F5] border border-[#BE1F2E]/25";
            } else if (toast.type === 'warning') {
              icon = <AlertTriangle className="h-5 w-5 text-[#E07B00]" />;
              bgClass = "bg-[#FAF8F5] border border-[#E07B00]/25";
            }

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl shadow-[0_4px_20px_rgba(26,18,16,0.06)] backdrop-blur-md ${bgClass}`}
              >
                <div className="flex-shrink-0">{icon}</div>
                <div className="flex-grow text-xs font-bold text-[#1A1210]">
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 text-[#7A5F5F] hover:text-[#1A1210] transition-colors cursor-pointer"
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
