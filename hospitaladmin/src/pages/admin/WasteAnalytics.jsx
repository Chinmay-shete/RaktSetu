import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Trash2, AlertCircle, TrendingDown, ShieldAlert, Award, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const WasteAnalytics = () => {
  // Mock Wastage Data
  const wasteByGroup = [
    { name: 'O+', value: 8, color: '#ef4444' },
    { name: 'A+', value: 5, color: '#3b82f6' },
    { name: 'B+', value: 4, color: '#a855f7' },
    { name: 'AB+', value: 6, color: '#10b981' },
    { name: 'Others', value: 3, color: '#f59e0b' },
  ];

  const wasteTrendData = [
    { month: 'Jan', Expired: 12, Transfused: 120 },
    { month: 'Feb', Expired: 9, Transfused: 140 },
    { month: 'Mar', Expired: 14, Transfused: 130 },
    { month: 'Apr', Expired: 6, Transfused: 165 },
    { month: 'May', Expired: 4, Transfused: 180 },
    { month: 'Jun', Expired: 5, Transfused: 195 },
  ];

  const efficiencyScore = 97.4; // Grade A+

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Trash2 className="text-red-500" size={26} />
          <span>Waste Analytics</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Audit log of expired, contaminated, or discarded blood resources.</p>
      </div>

      {/* Top Banner Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Efficiency Rating Card */}
        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <Award size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Efficiency Rating</p>
            <p className="text-2xl font-extrabold text-white mt-1">{efficiencyScore}%</p>
            <p className="text-[10px] text-emerald-400 font-semibold mt-0.5 uppercase tracking-wide">Excellent (Grade A+)</p>
          </div>
        </div>

        {/* Expired bags counter */}
        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 shrink-0">
            <ShieldAlert size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expired This Month</p>
            <p className="text-2xl font-extrabold text-white mt-1">5 Units</p>
            <p className="text-[10px] text-red-400 font-semibold mt-0.5 uppercase tracking-wide">-15% From last month</p>
          </div>
        </div>

        {/* Trend Info */}
        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
            <TrendingDown size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rotational Compliance</p>
            <p className="text-2xl font-extrabold text-white mt-1">FIFO Compliant</p>
            <p className="text-[10px] text-blue-400 font-semibold mt-0.5 uppercase tracking-wide">99% Freshness Index</p>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Bar Chart */}
        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-6">Wastage vs Transfusion History</h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wasteTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Transfused" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expired" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Pie Chart */}
        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-6">Wastage Distribution by Group</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-[200px] w-[200px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wasteByGroup}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {wasteByGroup.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends details */}
              <div className="w-full space-y-2">
                {wasteByGroup.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs text-slate-300 font-semibold p-2 bg-slate-950/40 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span>{entry.name} Group</span>
                    </div>
                    <span>{entry.value} Bags Expired</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable recommendations */}
      <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Star className="text-amber-500 fill-amber-500/10" size={20} />
          <span>Optimization Plan</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Rotational Strategy</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enforce FIFO (First-In, First-Out) strictly on AB+ stockpiles as they currently represent {((6/26)*100).toFixed(0)}% of total ex-date discards.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Cross-Hospital Clearing</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Set automated notifications to transfer blood bags with under 7 days shelf-life to municipal trauma hubs where turnover is higher.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteAnalytics;
