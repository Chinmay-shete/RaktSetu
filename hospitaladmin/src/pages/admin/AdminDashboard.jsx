import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospital } from '../../context/HospitalContext';
import { 
  UserPlus, 
  LineChart, 
  Trash2, 
  Sliders, 
  Activity, 
  TrendingUp, 
  Users, 
  AlertTriangle 
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { appState } = useHospital();

  const modules = [
    {
      title: 'Invite Staff',
      desc: 'Send cryptographic secure email invitation links and monitor onboarded medical employees.',
      path: '/admin/invite-staff',
      icon: UserPlus,
      color: 'from-blue-600 to-blue-500',
      shadowColor: 'rgba(59, 130, 246, 0.2)'
    },
    {
      title: 'AI Demand Forecast',
      desc: 'Predict blood requirement spikes for the next 7-30 days utilizing ML trend regressions.',
      path: '/admin/forecast',
      icon: LineChart,
      color: 'from-purple-600 to-purple-500',
      shadowColor: 'rgba(124, 58, 237, 0.2)'
    },
    {
      title: 'Waste Analytics',
      desc: 'Analyze weekly and monthly expiry trends, discarding records, and audit efficiency metrics.',
      path: '/admin/waste',
      icon: Trash2,
      color: 'from-red-600 to-red-500',
      shadowColor: 'rgba(239, 68, 68, 0.2)'
    },
    {
      title: 'Alert Thresholds',
      desc: 'Adjust critical minimum/maximum limits for each group and toggle emergency sirens.',
      path: '/admin/thresholds',
      icon: Sliders,
      color: 'from-amber-600 to-amber-500',
      shadowColor: 'rgba(245, 158, 11, 0.2)'
    }
  ];

  // Mock statistics
  const stats = [
    { label: "Active Staff", value: appState.invitedStaff.filter(s => s.status === 'Accepted').length + 1, icon: Users, color: "text-blue-400 bg-blue-500/10 border border-blue-500/20" },
    { label: "AI Forecast confidence", value: "94.2%", icon: TrendingUp, color: "text-purple-400 bg-purple-500/10 border border-purple-500/20" },
    { label: "Efficiency Rating", value: "A+", icon: Activity, color: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" },
    { label: "Active Threshold Alerts", value: "3 Critical", icon: AlertTriangle, color: "text-amber-400 bg-amber-500/10 border border-amber-500/20" }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time status of your hospital blood bank registry.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl ${stat.color} shrink-0`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg font-bold text-white mt-0.5">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((mod, i) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate(mod.path)}
              className="bg-slate-900/60 border border-white/10 hover:border-white/20 backdrop-blur-md rounded-2xl p-8 cursor-pointer flex flex-col justify-between h-[220px] transition-all group"
              style={{ boxShadow: `0 10px 30px -15px ${mod.shadowColor}` }}
            >
              <div className="flex items-start justify-between">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${mod.color} text-white shadow-lg shadow-black/20`}>
                  <Icon size={24} />
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors flex items-center gap-2">
                  {mod.title}
                </h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  {mod.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
