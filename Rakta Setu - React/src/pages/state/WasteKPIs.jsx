import React from 'react';
import { useStateAdmin } from '../../context/StateAdminContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

const TARGET = 5.0;

const WasteKPIs = () => {
  const { appState } = useStateAdmin();
  const districts = appState.districts || [];

  const sorted = [...districts].sort((a, b) => b.wastePercent - a.wastePercent);
  const aboveTarget = districts.filter(d => d.wastePercent > TARGET).length;
  const stateAvgWaste = (districts.reduce((s, d) => s + d.wastePercent, 0) / districts.length).toFixed(1);
  const worstDistrict = sorted[0];
  const bestDistrict = sorted[sorted.length - 1];

  const chartData = sorted.map(d => ({
    name: d.name,
    waste: d.wastePercent,
    aboveTarget: d.wastePercent > TARGET,
  }));

  const zoneData = [
    { zone: 'Mumbai', avg: 3.8 },
    { zone: 'Pune', avg: 4.2 },
    { zone: 'Nashik', avg: 6.5 },
    { zone: 'Marathwada', avg: 9.6 },
    { zone: 'Vidarbha', avg: 7.2 },
    { zone: 'Southern', avg: 4.1 },
  ];

  return (
    <div className="space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <section>
        <div className="inline-block badge-state mb-4">Policy KPI</div>
        <h1 className="font-serif text-[52px] md:text-[64px] italic leading-none mb-3 tracking-[-0.04em] text-[#1a1a1a]">
          Waste <span style={{ color: 'var(--state)' }}>KPIs.</span>
        </h1>
        <p className="text-[16px] text-[#737373] max-w-xl leading-relaxed">
          State policy target: blood waste below <strong>{TARGET}%</strong> per district. Track compliance, identify outliers, and drive corrective action.
        </p>
      </section>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'State Avg Waste', value: `${stateAvgWaste}%`, sub: `Target: ${TARGET}%`, ok: parseFloat(stateAvgWaste) <= TARGET },
          { label: 'Districts Above Target', value: aboveTarget, sub: 'Require intervention', ok: aboveTarget === 0 },
          { label: 'Best District', value: `${bestDistrict?.wastePercent}%`, sub: bestDistrict?.name, ok: true },
          { label: 'Worst District', value: `${worstDistrict?.wastePercent}%`, sub: worstDistrict?.name, ok: false },
        ].map(card => (
          <div key={card.label} className="bg-white p-6 rounded-lg border border-[rgba(26,18,16,0.09)]">
            <p className="text-[10px] font-[600] uppercase tracking-wider text-[#737373] mb-2">{card.label}</p>
            <p className="font-serif text-[36px] leading-none mb-1" style={{ color: card.ok ? '#1A0A0A' : '#BE1F2E' }}>
              {card.value}
            </p>
            <p className={`text-[11px] font-[500] ${card.ok ? 'text-[#22A06B]' : 'text-[#BE1F2E]'}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* District Waste Bar Chart */}
      <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-[22px] font-[500] italic">Waste % by District</h3>
            <p className="text-[13px] text-[#737373] mt-0.5">Red bars = above state policy target of {TARGET}%.</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-[600]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#1A0A0A]" />
              <span>Within Target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#BE1F2E]" />
              <span>Above Target</span>
            </div>
          </div>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eae8e5" />
              <XAxis dataKey="name" stroke="#737373" fontSize={10} tickLine={false} angle={-35} textAnchor="end" />
              <YAxis stroke="#737373" fontSize={11} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderColor: '#E0DAD4', borderRadius: '8px' }}
                formatter={(val) => [`${val}%`, 'Waste']}
              />
              <ReferenceLine
                y={TARGET}
                stroke="#BE1F2E"
                strokeDasharray="4 2"
                label={{ value: `Target ${TARGET}%`, fill: '#BE1F2E', fontSize: 10, position: 'insideTopRight' }}
              />
              <Bar dataKey="waste" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.aboveTarget ? '#BE1F2E' : '#1A0A0A'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Zone Comparison */}
        <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)]">
          <h3 className="text-[20px] font-[500] italic mb-5">Average Waste by Zone</h3>
          <div className="space-y-3">
            {zoneData.map(z => (
              <div key={z.zone} className="flex items-center gap-4">
                <span className="text-[13px] text-[#5A5A5A] w-28 shrink-0">{z.zone}</span>
                <div className="flex-1 bg-[#f5f3f0] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min((z.avg / 12) * 100, 100)}%`,
                      backgroundColor: z.avg > TARGET ? '#BE1F2E' : '#1A0A0A',
                    }}
                  />
                </div>
                <span className={`text-[13px] font-[600] w-12 text-right ${z.avg > TARGET ? 'text-[#BE1F2E]' : 'text-[#22A06B]'}`}>
                  {z.avg}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* District Table */}
        <div className="bg-white rounded-lg border border-[rgba(26,18,16,0.09)] overflow-hidden">
          <div className="p-5 border-b border-[rgba(26,18,16,0.09)]">
            <h3 className="text-[20px] font-[500] italic">All Districts — By Waste Rate</h3>
          </div>
          <div className="overflow-y-auto max-h-[280px] divide-y divide-[rgba(26,18,16,0.06)]">
            {sorted.map(d => (
              <div key={d.id} className="flex items-center justify-between px-5 py-3 hover:bg-[#faf8f5] transition-colors">
                <div>
                  <p className="font-[600] text-[14px] text-[#1A1A1A]">{d.name}</p>
                  <p className="text-[11px] text-[#9A9A9A]">{d.hospitals} hospitals</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    d.wastePercent > TARGET ? 'badge-danger' : 'badge-success'
                  }`} style={{ fontSize: 10 }}>
                    {d.wastePercent}%
                  </span>
                  {d.wastePercent > TARGET && (
                    <span className="material-symbols-outlined text-[16px] text-[#BE1F2E]">warning</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteKPIs;
