import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Sliders, Check, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AlertThresholds = () => {
  const { appState, updateAlertThresholds } = useHospital();
  
  const [formData, setFormData] = useState({
    minStock: appState.alertThresholds.minStock,
    maxStock: appState.alertThresholds.maxStock,
    criticalUnits: appState.alertThresholds.criticalUnits,
    expiryDays: appState.alertThresholds.expiryDays,
    emergencyAlerts: appState.alertThresholds.emergencyAlerts
  });

  const [showToast, setShowToast] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateAlertThresholds(formData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 right-6 bg-emerald-500 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 z-50 border border-emerald-400/20"
          >
            <Check size={18} />
            <span className="font-semibold text-sm">Configurations Saved Successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Sliders className="text-red-500" size={26} />
          <span>Alert Thresholds</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Configure stock triggers and emergency notifications criteria.</p>
      </div>

      <div className="max-w-3xl bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-10 shadow-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Minimum Stock */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>Minimum Stock Level</span>
                <HelpCircle size={12} className="text-slate-500 cursor-help" title="Trigger alerts when bags fall below this number" />
              </label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Maximum Stock */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>Maximum Stock Capacity</span>
                <HelpCircle size={12} className="text-slate-500 cursor-help" title="Limit blood supply intake beyond this threshold" />
              </label>
              <input
                type="number"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Critical Units */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>Critical Red Line Threshold</span>
                <HelpCircle size={12} className="text-slate-500 cursor-help" title="Absolute emergency warning for low stocks" />
              </label>
              <input
                type="number"
                value={formData.criticalUnits}
                onChange={(e) => setFormData({ ...formData, criticalUnits: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Expiry Warning days */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>Expiry Warning Buffer (Days)</span>
                <HelpCircle size={12} className="text-slate-500 cursor-help" title="Mark bags as expiring soon when shelf life hits these remaining days" />
              </label>
              <input
                type="number"
                value={formData.expiryDays}
                onChange={(e) => setFormData({ ...formData, expiryDays: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>
          </div>

          {/* Emergency Alert Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/80 border border-white/5 mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-600/10 border border-red-500/20 text-red-500">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Emergency SIREN Broadcasting</h4>
                <p className="text-slate-400 text-xs mt-0.5">Push automated SMS alerts to local red-crescent registered donors when a critical shortage triggers.</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emergencyAlerts}
                onChange={(e) => setFormData({ ...formData, emergencyAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 peer-checked:after:bg-white" />
            </label>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/10 transition-all text-sm flex items-center justify-center gap-2 self-end"
          >
            <ShieldCheck size={16} />
            <span>Save Threshold Configuration</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AlertThresholds;
