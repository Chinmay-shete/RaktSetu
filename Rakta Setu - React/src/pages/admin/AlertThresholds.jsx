import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Sliders, Check, AlertTriangle, ShieldCheck, HelpCircle, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AlertThresholds = () => {
  const { appState, updateAlertThresholds } = useHospital();
  
  const [formData, setFormData] = useState({
    minStock: appState.alertThresholds.minStock,
    maxStock: appState.alertThresholds.maxStock,
    criticalUnits: appState.alertThresholds.criticalUnits,
    expiryDays: appState.alertThresholds.expiryDays,
    emergencyAlerts: appState.alertThresholds.emergencyAlerts,
    autoTransfer: appState.alertThresholds.autoTransfer || false
  });

  const [showToast, setShowToast] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateAlertThresholds(formData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 right-6 bg-[#22A06B] text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 z-50"
          >
            <Check size={18} />
            <span className="font-semibold text-sm">Configurations Saved Successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="font-serif text-[48px] italic leading-none mb-2 text-[#1a1a1a] flex items-center gap-2">
          <Sliders className="text-[#BE1F2E]" size={32} />
          <span>Alert Thresholds</span>
        </h1>
        <p className="text-[15px] text-[#737373]">Configure stock triggers and emergency notifications criteria.</p>
      </div>

      {/* Configuration Card */}
      <div className="max-w-3xl bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-8 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Minimum Stock */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 flex items-center gap-1.5">
                <span>Minimum Stock Level</span>
                <HelpCircle size={12} className="text-[#9A9A9A] cursor-help" title="Trigger alerts when bags fall below this number" />
              </label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>

            {/* Maximum Stock */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 flex items-center gap-1.5">
                <span>Maximum Stock Capacity</span>
                <HelpCircle size={12} className="text-[#9A9A9A] cursor-help" title="Limit blood supply intake beyond this threshold" />
              </label>
              <input
                type="number"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>

            {/* Critical Units */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 flex items-center gap-1.5">
                <span>Critical Red Line Threshold</span>
                <HelpCircle size={12} className="text-[#9A9A9A] cursor-help" title="Absolute emergency warning for low stocks" />
              </label>
              <input
                type="number"
                value={formData.criticalUnits}
                onChange={(e) => setFormData({ ...formData, criticalUnits: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>

            {/* Expiry Warning days */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 flex items-center gap-1.5">
                <span>Expiry Warning Buffer (Days)</span>
                <HelpCircle size={12} className="text-[#9A9A9A] cursor-help" title="Mark bags as expiring soon when shelf life hits these remaining days" />
              </label>
              <input
                type="number"
                value={formData.expiryDays}
                onChange={(e) => setFormData({ ...formData, expiryDays: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
          </div>

          {/* Emergency Alert Toggle */}
          <div className="flex items-center justify-between p-5 rounded-xl bg-[#fbf9f6] border border-[rgba(26,18,16,0.09)] mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[rgba(190,31,46,0.08)] border border-[rgba(190,31,46,0.15)] text-[#BE1F2E]">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h4 className="font-bold text-[#1a1a1a] text-sm">Emergency SIREN Broadcasting</h4>
                <p className="text-[#737373] text-xs mt-0.5">Push automated SMS alerts to local red-crescent registered donors when a critical shortage triggers.</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emergencyAlerts}
                onChange={(e) => setFormData({ ...formData, emergencyAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#D8D0CA] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BE1F2E]" />
            </label>
          </div>

          {/* Auto-Transfer Toggle */}
          <div className="flex items-center justify-between p-5 rounded-xl bg-[#fbf9f6] border border-[rgba(26,18,16,0.09)] mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[rgba(190,31,46,0.08)] border border-[rgba(190,31,46,0.15)] text-[#BE1F2E]">
                <ArrowRightLeft size={18} />
              </div>
              <div>
                <h4 className="font-bold text-[#1a1a1a] text-sm">Auto-transfer on Expiry Warning</h4>
                <p className="text-[#737373] text-xs mt-0.5">Automatically trigger transfer requests to Apex Labs when units hit the expiry buffer.</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoTransfer}
                onChange={(e) => setFormData({ ...formData, autoTransfer: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#D8D0CA] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BE1F2E]" />
            </label>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="btn-primary flex items-center justify-center gap-2 self-end"
            style={{ minHeight: 52 }}
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
