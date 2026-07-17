import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Trash2, TrendingDown, ShieldAlert, Award, Inbox } from 'lucide-react';
import api from '../../services/api';

const WasteAnalytics = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWasteData = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/admin/waste-analytics');
        setData(res.data);
      } catch (err) {
        console.error("Failed to load waste analytics", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWasteData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#BE1F2E]"></div>
      </div>
    );
  }

  // Read data metrics
  const totalExpired = data?.totalExpired || 0;
  const wastageRate = data?.wastageRate || 0;
  const totalCollected = data?.totalCollected || 0;
  const totalAvailable = data?.totalAvailable || 0;
  const totalReserved = data?.totalReserved || 0;
  const expiringSoon = data?.expiringSoon || 0;

  const efficiencyScore = totalCollected > 0 ? (100 - wastageRate).toFixed(1) : 100;
  const isFifoCompliant = wastageRate < 5;

  // Pie chart showing available vs reserved vs expired
  const pieData = [
    { name: 'Available', value: totalAvailable, color: '#3b82f6' },
    { name: 'Reserved', value: totalReserved, color: '#f59e0b' },
    { name: 'Expired', value: totalExpired, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // If there's no data collected yet, show a clean empty state!
  const hasNoData = totalCollected === 0;

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
            <p className="text-[10px] text-[#22A06B] font-bold mt-0.5 uppercase tracking-wide">
              {efficiencyScore >= 95 ? "Excellent (Grade A+)" : efficiencyScore >= 85 ? "Good (Grade B)" : "Action Required"}
            </p>
          </div>
        </div>

        {/* Expired bags counter */}
        <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="p-3.5 rounded-xl bg-[rgba(190,31,46,0.08)] border border-[rgba(190,31,46,0.15)] text-[#BE1F2E] shrink-0">
            <ShieldAlert size={26} />
          </div>
          <div>
            <p className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A]">Expired Total</p>
            <p className="text-2xl font-extrabold text-[#1a1a1a] mt-1">{totalExpired} Units</p>
            <p className="text-[10px] text-[#BE1F2E] font-bold mt-0.5 uppercase tracking-wide">
              {wastageRate}% Wastage Rate
            </p>
          </div>
        </div>

        {/* Trend Info */}
        <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="p-3.5 rounded-xl bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.15)] text-blue-500 shrink-0">
            <TrendingDown size={26} />
          </div>
          <div>
            <p className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A]">Rotational Status</p>
            <p className="text-2xl font-extrabold text-[#1a1a1a] mt-1">
              {isFifoCompliant ? "FIFO Compliant" : "High Wastage"}
            </p>
            <p className="text-[10px] text-blue-500 font-bold mt-0.5 uppercase tracking-wide">
              {expiringSoon} units expiring soon
            </p>
          </div>
        </div>
      </div>

      {/* Main Analysis Block */}
      {hasNoData ? (
        <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-2xl p-16 text-center flex flex-col items-center justify-center max-w-4xl mx-auto shadow-sm">
          <div className="p-4 rounded-full bg-[#FAF8F5] text-[#9A9A9A] mb-4">
            <Inbox size={48} />
          </div>
          <h2 className="font-serif text-[24px] text-[#1A1210] italic mb-2">No Wastage Data Found</h2>
          <p className="text-sm text-[#737373] max-w-md leading-relaxed">
            Since your hospital registry is new, no blood inventory batches have been added yet. Once blood donations and inventory batches are uploaded, the AI service will generate real-time waste analytics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Distribution Chart */}
          <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-8 shadow-sm">
            <h2 className="text-[20px] font-[500] text-[#1a1a1a] mb-6 italic font-serif">Inventory Status Breakdown</h2>
            <div className="h-[280px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data details list */}
          <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-8 shadow-sm flex flex-col justify-center">
            <h2 className="text-[20px] font-[500] text-[#1a1a1a] mb-6 italic font-serif">Detailed Waste Metrics</h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-[#eae8e5] pb-2">
                <span className="text-sm text-[#737373]">Total Units Collected</span>
                <span className="text-sm font-bold text-[#1a1a1a]">{totalCollected} Bags</span>
              </div>
              <div className="flex justify-between border-b border-[#eae8e5] pb-2">
                <span className="text-sm text-[#737373]">Active/Available Stock</span>
                <span className="text-sm font-bold text-blue-500">{totalAvailable} Bags</span>
              </div>
              <div className="flex justify-between border-b border-[#eae8e5] pb-2">
                <span className="text-sm text-[#737373]">Reserved for Surgeries</span>
                <span className="text-sm font-bold text-amber-500">{totalReserved} Bags</span>
              </div>
              <div className="flex justify-between border-b border-[#eae8e5] pb-2">
                <span className="text-sm text-[#737373]">Total Expired Units</span>
                <span className="text-sm font-bold text-red-500">{totalExpired} Bags</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-sm text-[#737373]">Wastage Rate</span>
                <span className="text-sm font-bold text-red-600">{wastageRate}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteAnalytics;
