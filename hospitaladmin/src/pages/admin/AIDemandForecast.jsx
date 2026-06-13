import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Sparkles, ArrowUpRight, ArrowDownRight, Lightbulb, HelpCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const AIDemandForecast = () => {
  const [timeframe, setTimeframe] = useState('7days');

  // Mock Forecast Data
  const forecastData7Days = [
    { day: 'Mon', 'O+': 42, 'A+': 28, 'O-': 15, 'B+': 32 },
    { day: 'Tue', 'O+': 45, 'A+': 32, 'O-': 18, 'B+': 30 },
    { day: 'Wed', 'O+': 55, 'A+': 40, 'O-': 22, 'B+': 35 },
    { day: 'Thu', 'O+': 48, 'A+': 36, 'O-': 14, 'B+': 38 },
    { day: 'Fri', 'O+': 62, 'A+': 45, 'O-': 29, 'B+': 42 },
    { day: 'Sat', 'O+': 70, 'A+': 52, 'O-': 35, 'B+': 48 },
    { day: 'Sun', 'O+': 68, 'A+': 49, 'O-': 30, 'B+': 44 },
  ];

  const forecastData30Days = [
    { day: 'W1', 'O+': 180, 'A+': 130, 'O-': 85, 'B+': 150 },
    { day: 'W2', 'O+': 210, 'A+': 145, 'O-': 98, 'B+': 162 },
    { day: 'W3', 'O+': 240, 'A+': 170, 'O-': 110, 'B+': 185 },
    { day: 'W4', 'O+': 205, 'A+': 138, 'O-': 79, 'B+': 148 },
  ];

  const activeData = timeframe === '7days' ? forecastData7Days : forecastData30Days;
  const labelKey = timeframe === '7days' ? 'day' : 'day';

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="text-red-500 fill-red-500/10" size={26} />
            <span>AI Demand Forecast</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Predictive logistics engine modeling seasonal & emergency usage spikes.</p>
        </div>

        {/* Timeframe selector */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
          <button
            onClick={() => setTimeframe('7days')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              timeframe === '7days' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Next 7 Days
          </button>
          <button
            onClick={() => setTimeframe('30days')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              timeframe === '30days' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Next 30 Days
          </button>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="text-red-500" size={18} />
          <span>Expected Blood Bag Requirements</span>
        </h2>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey={labelKey} stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="O+" stroke="#ef4444" strokeWidth={3} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="A+" stroke="#3b82f6" strokeWidth={2.5} />
              <Line type="monotone" dataKey="O-" stroke="#f59e0b" strokeWidth={2.5} />
              <Line type="monotone" dataKey="B+" stroke="#a855f7" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* High Demand Groups */}
        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">High Demand Predictions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-red-500/5 border border-red-500/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-600/10 flex items-center justify-center text-red-500 font-extrabold text-sm border border-red-500/20">
                    O-
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Universal Donor</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Critical O- negative demand forecasted on Wed/Fri.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-red-400 text-sm font-bold bg-red-500/10 px-2.5 py-1 rounded-lg">
                  <ArrowUpRight size={14} />
                  <span>+24%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-red-500/5 border border-red-500/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-600/10 flex items-center justify-center text-red-500 font-extrabold text-sm border border-red-500/20">
                    O+
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">High General Volume</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Normal volume threshold surges during weekend peak.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-red-400 text-sm font-bold bg-red-500/10 px-2.5 py-1 rounded-lg">
                  <ArrowUpRight size={14} />
                  <span>+15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Low Demand Groups */}
        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Low Demand Predictions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-500 font-extrabold text-sm border border-emerald-500/20">
                    AB-
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Rare / Low Activity</h4>
                    <p className="text-slate-400 text-xs mt-0.5">No scheduled elective surgeries requiring AB-.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                  <ArrowDownRight size={14} />
                  <span>-8%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-500 font-extrabold text-sm border border-emerald-500/20">
                    B+
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Sufficient Reserves</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Existing stocks cover predicted demand comfortably.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                  <ArrowDownRight size={14} />
                  <span>-3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Card */}
      <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="text-amber-500" size={20} />
          <span>AI Clinical Recommendations</span>
        </h3>
        <ul className="space-y-3.5 text-sm text-slate-300">
          <li className="flex gap-2.5 items-start">
            <span className="text-amber-500 font-extrabold text-base mt-[-2px]">•</span>
            <span>Initiate an O-negative registry donor outreach campaign by Tuesday to prepare for predicted Friday emergency surges.</span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="text-amber-500 font-extrabold text-base mt-[-2px]">•</span>
            <span>Pause active collection drives for AB-negative for the next 7 days to mitigate expiry wastage risk.</span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="text-amber-500 font-extrabold text-base mt-[-2px]">•</span>
            <span>Establish a reciprocal stock sharing route with nearby hospitals for B+ blood types to keep stock levels balanced.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AIDemandForecast;
