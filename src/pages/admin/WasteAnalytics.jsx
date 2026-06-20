import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Trash2, TrendingDown, ShieldAlert, Award, Star } from 'lucide-react';

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
    <div className="space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Title */}
      <div>
        <h1 className="font-serif text-[48px] italic leading-none mb-2 text-[#1a1a1a] flex items-center gap-2">
          <Trash2 className="text-[#BE1F2E]" size={32} />
          <span>Waste Analytics</span>
        </h1>
        <p className="text-[15px] text-[#737373]">Audit log of expired, contaminated, or discarded blood resources.</p>
      </div>

      {/* Top Banner Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Efficiency Rating Card */}
        <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="p-3.5 rounded-xl bg-[rgba(34,160,107,0.08)] border border-[rgba(34,160,107,0.15)] text-[#22A06B] shrink-0">
            <Award size={26} />
          </div>
          <div>
            <p className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A]">Efficiency Rating</p>
            <p className="text-2xl font-extrabold text-[#1a1a1a] mt-1">{efficiencyScore}%</p>
            <p className="text-[10px] text-[#22A06B] font-bold mt-0.5 uppercase tracking-wide">Excellent (Grade A+)</p>
          </div>
        </div>

        {/* Expired bags counter */}
        <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="p-3.5 rounded-xl bg-[rgba(190,31,46,0.08)] border border-[rgba(190,31,46,0.15)] text-[#BE1F2E] shrink-0">
            <ShieldAlert size={26} />
          </div>
          <div>
            <p className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A]">Expired This Month</p>
            <p className="text-2xl font-extrabold text-[#1a1a1a] mt-1">5 Units</p>
            <p className="text-[10px] text-[#BE1F2E] font-bold mt-0.5 uppercase tracking-wide">-15% From last month</p>
          </div>
        </div>

        {/* Trend Info */}
        <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="p-3.5 rounded-xl bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.15)] text-blue-500 shrink-0">
            <TrendingDown size={26} />
          </div>
          <div>
            <p className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A]">Rotational Compliance</p>
            <p className="text-2xl font-extrabold text-[#1a1a1a] mt-1">FIFO Compliant</p>
            <p className="text-[10px] text-blue-500 font-bold mt-0.5 uppercase tracking-wide">99% Freshness Index</p>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Bar Chart */}
        <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-8 shadow-sm">
          <h2 className="text-[20px] font-[500] text-[#1a1a1a] mb-6 italic font-serif">Wastage vs Transfusion History</h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wasteTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eae8e5" />
                <XAxis dataKey="month" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis stroke="#737373" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E0DAD4', borderRadius: '8px' }}
                  labelStyle={{ color: '#1a1a1a', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Transfused" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expired" fill="#BE1F2E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Pie Chart */}
        <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-[20px] font-[500] text-[#1a1a1a] mb-6 italic font-serif">Wastage Distribution by Group</h2>
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
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E0DAD4', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends details */}
              <div className="w-full space-y-2">
                {wasteByGroup.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs text-[#5A5A5A] font-bold p-3.5 bg-[#fbf9f6] rounded-xl border border-[rgba(26,18,16,0.09)]">
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

      {/* Actionable recommendations (Editorial Dark Card) */}
      <div className="bg-[#1a1210] p-8 rounded-lg text-white relative overflow-hidden">
        <h3 className="font-serif text-[24px] mb-6 italic text-white flex items-center gap-2">
          <Star className="text-[#BE1F2E]" size={24} />
          <span>Optimization Plan</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-white/75">
          <div className="p-5 rounded-xl bg-[#3D2B2B]/30 border border-white/5 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22A06B]" />
              <span>Rotational Strategy</span>
            </h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Enforce FIFO (First-In, First-Out) strictly on AB+ stockpiles as they currently represent {((6/26)*100).toFixed(0)}% of total ex-date discards.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-[#3D2B2B]/30 border border-white/5 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Cross-Hospital Clearing</span>
            </h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Set automated notifications to transfer blood bags with under 7 days shelf-life to municipal trauma hubs where turnover is higher.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteAnalytics;
