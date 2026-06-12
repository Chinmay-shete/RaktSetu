import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useToast } from '../../../hooks/useToast';
import {
  Moon,
  Sun,
  Mail,
  MessageSquare,
  Clock,
  RefreshCw,
  Save,
  ShieldAlert
} from 'lucide-react';

export const Settings = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const toast = useToast();

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('raktsetu_hospital_settings');
    if (saved) return JSON.parse(saved);
    return {
      emailAlerts: true,
      smsAlerts: false,
      autoExpiryThreshold: 30, // 30 days
      autoRefreshInterval: '30s'
    };
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    localStorage.setItem('raktsetu_hospital_settings', JSON.stringify(settings));
    toast.success("System preferences saved successfully.");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 font-outfit">
          Portal Configuration Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure security settings, automated alarm integrations, and sync refresh loops.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-3xl shadow-lg flex flex-col gap-6">
        {/* Category: Display */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Display & Aesthetics</h3>
          
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-slate-800/40 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 text-blue-600 dark:text-blue-450 p-2 rounded-xl">
                {isDark ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Light / Dark Theme</span>
                <span className="block text-[10px] text-slate-450">Switch display mode instantly</span>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xxs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
            >
              Toggle Mode: {theme === 'dark' ? 'Dark' : 'Light'}
            </button>
          </div>
        </div>

        {/* Category: Notifications */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Notification Alarms</h3>

          <div className="flex flex-col gap-3">
            {/* Email Toggles */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 p-2 rounded-xl">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Automated Email Reports</span>
                  <span className="block text-[10px] text-slate-450">Send weekly inventory backups to contact@citylifehospital.org</span>
                </div>
              </div>

              {/* Custom Switch Toggle */}
              <button
                onClick={() => handleToggle('emailAlerts')}
                className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer focus:outline-none ${
                  settings.emailAlerts ? 'bg-rose-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <div className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  settings.emailAlerts ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* SMS Toggles */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 p-2 rounded-xl">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">SMS Hotline Dispatch Alerts</span>
                  <span className="block text-[10px] text-slate-450">Ping emergency dispatch notifications to registered phones</span>
                </div>
              </div>

              <button
                onClick={() => handleToggle('smsAlerts')}
                className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer focus:outline-none ${
                  settings.smsAlerts ? 'bg-rose-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <div className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  settings.smsAlerts ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Threshold limits */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/10 text-amber-600 dark:text-amber-450 p-2 rounded-xl">
                  <ShieldAlert className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Expiry Alert Threshold</span>
                  <span className="block text-[10px] text-slate-455">Mark stock bags as Expiring Soon in dashboard</span>
                </div>
              </div>

              <select
                value={settings.autoExpiryThreshold}
                onChange={(e) => handleSelectChange('autoExpiryThreshold', parseInt(e.target.value, 10))}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value={15}>15 Days before</option>
                <option value={30}>30 Days before (Default)</option>
                <option value={45}>45 Days before</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category: System loops */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Pipeline Loops</h3>

          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-slate-500/10 text-slate-600 dark:text-slate-400 p-2 rounded-xl">
                <RefreshCw className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Database Auto Sync</span>
                <span className="block text-[10px] text-slate-455">Refresh regional SOS requests and transfer changes</span>
              </div>
            </div>

            <select
              value={settings.autoRefreshInterval}
              onChange={(e) => handleSelectChange('autoRefreshInterval', e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="None">Disabled (Manual Only)</option>
              <option value="15s">Every 15 Seconds</option>
              <option value="30s">Every 30 Seconds</option>
              <option value="60s">Every 60 Seconds</option>
            </select>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/10 cursor-pointer active:scale-98 mt-2"
        >
          <Save className="h-4 w-4" /> Save Configuration
        </button>
      </div>
    </div>
  );
};
export default Settings;
