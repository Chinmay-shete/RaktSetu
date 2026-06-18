import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sparkles, ArrowUpRight, ArrowDownRight, Lightbulb, Activity } from 'lucide-react';

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
  const labelKey = 'day';

  return (
    <div className="space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[48px] italic leading-none mb-2 text-[#1a1a1a] flex items-center gap-2">
            <Sparkles className="text-[#BE1F2E]" size={32} />
            <span>AI Demand Forecast</span>
          </h1>
          <p className="text-[15px] text-[#737373] mt-1">Predictive logistics engine modeling seasonal & emergency usage spikes.</p>
        </div>

        {/* Timeframe selector */}
        <div className="flex bg-[#f5f3f0] p-1.5 rounded-full border border-[rgba(26,18,16,0.09)] self-start sm:self-auto">
          <button
            onClick={() => setTimeframe('7days')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              timeframe === '7days' ? 'bg-[#BE1F2E] text-white shadow-sm' : 'text-[#5A5A5A] hover:text-[#BE1F2E]'
            }`}
          >
            Next 7 Days
          </button>
          <button
            onClick={() => setTimeframe('30days')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              timeframe === '30days' ? 'bg-[#BE1F2E] text-white shadow-sm' : 'text-[#5A5A5A] hover:text-[#BE1F2E]'
            }`}
          >
            Next 30 Days
          </button>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-8 shadow-sm">
        <h2 className="text-[20px] font-[500] text-[#1a1a1a] mb-6 flex items-center gap-2 italic font-serif">
          <Activity className="text-[#BE1F2E]" size={20} />
          <span>Expected Blood Bag Requirements</span>
        </h2>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eae8e5" />
              <XAxis dataKey={labelKey} stroke="#737373" fontSize={11} tickLine={false} />
              <YAxis stroke="#737373" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E0DAD4', borderRadius: '8px' }}
                labelStyle={{ color: '#1a1a1a', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#1a1a1a' }} />
              <Line type="monotone" dataKey="O+" stroke="#BE1F2E" strokeWidth={3} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="A+" stroke="#3b82f6" strokeWidth={2.5} />
              <Line type="monotone" dataKey="O-" stroke="#e07b00" strokeWidth={2.5} />
              <Line type="monotone" dataKey="B+" stroke="#a855f7" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* High Demand Groups */}
        <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-5">High Demand Predictions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[rgba(190,31,46,0.04)] border border-[rgba(190,31,46,0.12)] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#BE1F2E] flex items-center justify-center text-white font-extrabold text-sm">
                    O-
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a1a1a] text-sm">Universal Donor</h4>
                    <p className="text-[#737373] text-xs mt-0.5">Critical O- negative demand forecasted on Wed/Fri.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#BE1F2E] text-sm font-bold bg-[rgba(190,31,46,0.08)] px-2.5 py-1 rounded-lg border border-[rgba(190,31,46,0.15)]">
                  <ArrowUpRight size={14} />
                  <span>+24%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[rgba(190,31,46,0.04)] border border-[rgba(190,31,46,0.12)] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#BE1F2E] flex items-center justify-center text-white font-extrabold text-sm">
                    O+
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a1a1a] text-sm">High General Volume</h4>
                    <p className="text-[#737373] text-xs mt-0.5">Normal volume threshold surges during weekend peak.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#BE1F2E] text-sm font-bold bg-[rgba(190,31,46,0.08)] px-2.5 py-1 rounded-lg border border-[rgba(190,31,46,0.15)]">
                  <ArrowUpRight size={14} />
                  <span>+15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Low Demand Groups */}
        <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-5">Low Demand Predictions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[rgba(34,160,107,0.04)] border border-[rgba(34,160,107,0.12)] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#22A06B] flex items-center justify-center text-white font-extrabold text-sm">
                    AB-
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a1a1a] text-sm">Rare / Low Activity</h4>
                    <p className="text-[#737373] text-xs mt-0.5">No scheduled elective surgeries requiring AB-.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#22A06B] text-sm font-bold bg-[rgba(34,160,107,0.08)] px-2.5 py-1 rounded-lg border border-[rgba(34,160,107,0.15)]">
                  <ArrowDownRight size={14} />
                  <span>-8%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[rgba(34,160,107,0.04)] border border-[rgba(34,160,107,0.12)] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#22A06B] flex items-center justify-center text-white font-extrabold text-sm">
                    B+
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a1a1a] text-sm">Sufficient Reserves</h4>
                    <p className="text-[#737373] text-xs mt-0.5">Existing stocks cover predicted demand comfortably.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#22A06B] text-sm font-bold bg-[rgba(34,160,107,0.08)] px-2.5 py-1 rounded-lg border border-[rgba(34,160,107,0.15)]">
                  <ArrowDownRight size={14} />
                  <span>-3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Card (Editorial Dark Card) */}
      <div className="bg-[#1a1210] p-8 rounded-lg text-white relative overflow-hidden">
        <h3 className="font-serif text-[24px] mb-6 italic text-white flex items-center gap-2">
          <Lightbulb className="text-[#BE1F2E]" size={24} />
          <span>AI Clinical Recommendations</span>
        </h3>
        <ul className="space-y-4 text-[15px] text-white/75">
          <li className="flex gap-2.5 items-start">
            <span className="text-[#BE1F2E] font-extrabold text-lg mt-[-2px]">•</span>
            <span>Initiate an O-negative registry donor outreach campaign by Tuesday to prepare for predicted Friday emergency surges.</span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="text-[#BE1F2E] font-extrabold text-lg mt-[-2px]">•</span>
            <span>Pause active collection drives for AB-negative for the next 7 days to mitigate expiry wastage risk.</span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="text-[#BE1F2E] font-extrabold text-lg mt-[-2px]">•</span>
            <span>Establish a reciprocal stock sharing route with nearby hospitals for B+ blood types to keep stock levels balanced.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AIDemandForecast;
