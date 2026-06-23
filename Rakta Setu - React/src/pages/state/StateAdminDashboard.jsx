import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateAdmin } from '../../context/StateAdminContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const StateAdminDashboard = () => {
  const navigate = useNavigate();
  const { appState } = useStateAdmin();
  const districts = appState.districts || [];
  const policyAlerts = appState.policyAlerts || [];
  const escalations = appState.escalationReports || [];

  const totalBags = districts.reduce((s, d) => s + d.totalBags, 0);
  const criticalDistricts = districts.filter(d => d.status === 'Critical').length;
  const watchDistricts = districts.filter(d => d.status === 'Watch').length;
  const activeAlerts = policyAlerts.filter(a => a.status === 'Active').length;
  const pendingEscalations = escalations.filter(r => r.status === 'Pending Response').length;

  const totalBagsCount = useCountUp(totalBags);
  const criticalCount = useCountUp(criticalDistricts);
  const watchCount = useCountUp(watchDistricts);
  const transferCount = useCountUp(appState.transfers?.length || 0);

  const stateStock = BLOOD_GROUPS.map(g => ({
    group: g,
    units: districts.reduce((s, d) => s + (d.stock?.[g] || 0), 0),
  }));

  const monthlyTrend = [
    { month: 'Jan', bags: 2180, waste: 6.1 },
    { month: 'Feb', bags: 2310, waste: 5.8 },
    { month: 'Mar', bags: 2540, waste: 5.4 },
    { month: 'Apr', bags: 2290, waste: 5.2 },
    { month: 'May', bags: 2680, waste: 4.9 },
    { month: 'Jun', bags: 2804, waste: 5.6 },
  ];

  const criticalAlerts = policyAlerts.filter(a => a.severity === 'Critical' && a.status === 'Active');

  return (
    <div className="space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* Editorial Heading */}
      <section className="mb-10">
        <div className="inline-block badge-state mb-4">Maharashtra State Health</div>
        <h1 className="font-serif text-[58px] md:text-[76px] italic leading-none mb-4 tracking-[-0.04em] text-[#1a1a1a]">
          State <span style={{ color: 'var(--state)' }}>Oversight.</span>
        </h1>
        <p className="text-[18px] text-[#737373] max-w-2xl leading-[28px]">
          State-wide blood supply intelligence across all {districts.length} Maharashtra districts. Monitor shortages, enforce policy KPIs, and coordinate cross-district interventions.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">

          {/* Stats Bento */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total State Bags', value: totalBagsCount, sub: `${districts.length} districts`, num: '01', accent: false },
              { label: 'Critical Districts', value: criticalCount, sub: 'Need intervention', num: '02', accent: 'red' },
              { label: 'Watch Districts', value: watchCount, sub: 'Elevated risk', num: '03', accent: false },
              { label: 'Active Transfers', value: transferCount, sub: 'Cross-district', num: '04', accent: false },
            ].map((stat) => (
              <div key={stat.num} className="bg-white p-6 rounded-lg border border-[rgba(26,18,16,0.09)] relative overflow-hidden group">
                <span className="absolute -bottom-3 -right-1 font-serif text-[80px] leading-none opacity-[0.04] select-none transition-transform group-hover:scale-110"
                  style={{ color: 'var(--state)' }}>
                  {stat.num}
                </span>
                <p className="text-[10px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-3">{stat.label}</p>
                <h2 className="font-serif text-[44px] leading-[40px]"
                  style={{ color: stat.accent === 'red' ? '#BE1F2E' : '#1A0A0A' }}>
                  {stat.value}
                </h2>
                <p className={`text-[11px] mt-2 ${stat.accent === 'red' ? 'text-[#BE1F2E] font-semibold' : 'text-[#737373]'}`}>
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>

          {/* State Overview Map (Color-Coded) */}
          <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-[22px] font-[500] italic">State Overview Map</h3>
                <p className="text-[13px] text-[#737373] mt-0.5">Live health status of districts across Maharashtra.</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-[600] text-[#5a5a5a]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#22A06B]" />
                  <span>Healthy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#D97706]" />
                  <span>Watch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#BE1F2E]" />
                  <span>Critical</span>
                </div>
              </div>
            </div>
            
            <div className="h-[300px] w-full bg-[#fbf9f6] rounded-xl border border-[#EDE7E1] flex items-center justify-center flex-col relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#1A1210 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
              <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-[#22A06B]/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-[#BE1F2E]/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white border border-[#EDE7E1] flex items-center justify-center mb-4 text-[#BE1F2E]">
                  <span className="material-symbols-outlined text-3xl">map</span>
                </div>
                <h3 className="font-serif italic text-2xl text-[#1A1210] mb-2">Interactive GIS Map Disabled</h3>
                <p className="text-[#5A5A5A] max-w-md text-sm">
                  The geographic overview requires valid API keys. Once configured, this will display a color-coded choropleth map of Maharashtra districts based on their critical status.
                </p>
              </div>
            </div>
          </div>

          {/* State Aggregate Blood Stock Chart */}
          <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-[22px] font-[500] italic">State Blood Stock</h3>
                <p className="text-[13px] text-[#737373] mt-0.5">Total units across all {districts.length} Maharashtra districts.</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-[600] text-[#5a5a5a]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#1A0A0A]" />
                  <span>Sufficient</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#BE1F2E]" />
                  <span>Low (&lt;100)</span>
                </div>
              </div>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateStock} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eae8e5" />
                  <XAxis dataKey="group" stroke="#737373" fontSize={11} tickLine={false} />
                  <YAxis stroke="#737373" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#E0DAD4', borderRadius: '8px' }}
                    labelStyle={{ color: '#1a1a1a', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="units" radius={[4, 4, 0, 0]}>
                    {stateStock.map((entry, i) => (
                      <Cell key={i} fill={entry.units < 100 ? '#BE1F2E' : '#1A0A0A'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* District Health Table */}
          <div className="bg-white rounded-lg border border-[rgba(26,18,16,0.09)] overflow-hidden">
            <div className="p-6 border-b border-[rgba(26,18,16,0.09)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-[22px] font-[500] italic">District Health Status</h3>
                <p className="text-[13px] text-[#737373] mt-0.5">Live status across all {districts.length} Maharashtra districts.</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-[600] flex-wrap">
                <span className="badge-danger text-[10px]">Critical</span>
                <span className="badge-warning text-[10px]">Watch</span>
                <span className="badge-success text-[10px]">Healthy</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#f5f3f0]">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-[600] tracking-[0.05em] text-[#737373] uppercase">District</th>
                    <th className="px-4 py-3 text-[11px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Hospitals</th>
                    <th className="px-4 py-3 text-[11px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Total Bags</th>
                    <th className="px-4 py-3 text-[11px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Waste %</th>
                    <th className="px-4 py-3 text-[11px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Escalations</th>
                    <th className="px-4 py-3 text-[11px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(26,18,16,0.06)]">
                  {districts.map(d => (
                    <tr key={d.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-[600] text-[#1A1A1A]">{d.name}</div>
                        <div className="text-[11px] text-[#9A9A9A]">{d.zone} Zone</div>
                      </td>
                      <td className="px-4 py-3 text-[#5A5A5A]">{d.hospitals}</td>
                      <td className="px-4 py-3 font-[600] text-[#1A1A1A]">{d.totalBags}</td>
                      <td className="px-4 py-3">
                        <span className={`font-[600] ${d.wastePercent > 7 ? 'text-[#BE1F2E]' : d.wastePercent > 5 ? 'text-[#D97706]' : 'text-[#22A06B]'}`}>
                          {d.wastePercent}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {d.escalations > 0 ? (
                          <span className="badge-danger text-[10px]">{d.escalations}</span>
                        ) : (
                          <span className="text-[#9A9A9A]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          d.status === 'Critical' ? 'bg-[rgba(190,31,46,0.08)] text-[#BE1F2E]'
                            : d.status === 'Watch' ? 'bg-[#FEF3C7] text-[#92400E]'
                            : 'bg-[rgba(34,160,107,0.1)] text-[#22A06B]'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)]">
            <h3 className="text-[22px] font-[500] italic mb-1">State Monthly Trend</h3>
            <p className="text-[13px] text-[#737373] mb-6">Total blood bags and waste % across Maharashtra — past 6 months.</p>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 5, right: 20, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eae8e5" />
                  <XAxis dataKey="month" stroke="#737373" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#737373" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#737373" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#E0DAD4', borderRadius: '8px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="bags" stroke="#1A0A0A" strokeWidth={2.5} dot={{ fill: '#1A0A0A', r: 4 }} name="Total Bags" />
                  <Line yAxisId="right" type="monotone" dataKey="waste" stroke="#BE1F2E" strokeWidth={2} strokeDasharray="4 2" dot={{ fill: '#BE1F2E', r: 3 }} name="Waste %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-4 text-[12px] font-[600] text-[#5A5A5A]">
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-0.5 rounded" style={{ backgroundColor: '#1A0A0A' }} />
                <span>Total Bags</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-0.5 rounded bg-[#BE1F2E]" />
                <span>Waste % (right axis)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">

          {/* Critical Policy Alerts */}
          <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-lg p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6" style={{ color: '#BE1F2E' }}>
              <AlertTriangle size={22} />
              <h3 className="text-[20px] font-[500] italic">Policy Alerts</h3>
            </div>
            <div className="space-y-4">
              {criticalAlerts.length === 0 && (
                <p className="text-[13px] text-[#9A9A9A] text-center py-4">No critical alerts right now.</p>
              )}
              {criticalAlerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="p-4 bg-[#f5f3f0] rounded-lg border border-[rgba(26,18,16,0.09)]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="badge-danger text-[9px]">{alert.severity}</span>
                    <span className="text-[10px] text-[#9A9A9A]">{alert.district}</span>
                  </div>
                  <p className="text-[13px] font-[600] text-[#1A1A1A] mb-1">{alert.type}</p>
                  <p className="text-[11px] text-[#737373] leading-relaxed line-clamp-2">{alert.message}</p>
                </div>
              ))}
              <button
                onClick={() => navigate('/state/alerts')}
                className="btn-state w-full text-[13px]"
                style={{ minHeight: 40, padding: '10px 20px' }}
              >
                View All Alerts
              </button>
            </div>
          </div>

          {/* AI State Insights — dark card */}
          <div className="bg-[#1a1210] p-8 rounded-lg text-white relative overflow-hidden">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-[30px] mb-4 block" style={{ color: '#fca5a5' }}>insights</span>
              <h4 className="text-[20px] font-[500] mb-4 italic">AI State Insights</h4>
              <div className="space-y-4 text-white/70 text-[14px] leading-relaxed mb-6">
                <p>• <strong className="text-white">Solapur critical depletion</strong> — O- at 3 hospitals below minimum. Emergency transfer from Pune recommended.</p>
                <p>• <strong className="text-white">Aurangabad waste KPI breach</strong> — 8.1% for 2nd month. Audit + system upgrade needed.</p>
                <p>• <strong className="text-white">Vidarbha donor density low</strong> — 3 districts below minimum. Authorize ₹6L camp budget.</p>
              </div>
              <button
                onClick={() => navigate('/state/funding')}
                className="inline-flex items-center gap-2 text-[14px] font-[500] group cursor-pointer hover:underline animate-pulse"
                style={{ color: '#fca5a5' }}
              >
                View Funding Recommendations
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Pending Escalations Banner */}
          <div
            className="relative rounded-lg overflow-hidden h-44 flex items-center"
            style={{ backgroundColor: '#BE1F2E' }}
          >
            <div className="relative z-10 p-8 w-full flex flex-col justify-between h-full">
              <div>
                <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-1">Unresolved</p>
                <h3 className="font-serif text-[26px] text-white italic leading-tight">
                  {pendingEscalations} Escalation{pendingEscalations !== 1 ? 's' : ''} Pending
                </h3>
              </div>
              <button
                onClick={() => navigate('/state/reports')}
                className="bg-white px-6 py-2.5 rounded-full text-[13px] font-[600] hover:scale-105 active:scale-95 transition-transform w-fit"
                style={{ color: 'var(--state)' }}
              >
                Review District Reports
              </button>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
};

export default StateAdminDashboard;
