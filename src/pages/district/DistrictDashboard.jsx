import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDistrict } from '../../context/DistrictContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';

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

const DistrictDashboard = () => {
  const navigate = useNavigate();
  const { appState, approveCamp, rejectCamp, addCamp } = useDistrict();
  const hospitals = appState.hospitals || [];
  const alerts = appState.alerts || [];
  const camps = appState.camps || [];

  const [campTab, setCampTab] = useState('list');
  const [campForm, setCampForm] = useState({
    name: '', location: '', date: '', organizer: '', capacity: '', expectedDonors: '', bloodGroups: []
  });
  const [campSubmitted, setCampSubmitted] = useState(false);

  const handlePlanSubmit = (e) => {
    e.preventDefault();
    if (!campForm.name || !campForm.location || !campForm.date || !campForm.organizer) return;
    addCamp({
      ...campForm,
      capacity: Number(campForm.capacity),
      expectedDonors: Number(campForm.expectedDonors)
    });
    setCampSubmitted(true);
    setTimeout(() => {
      setCampSubmitted(false);
      setCampForm({
        name: '', location: '', date: '', organizer: '', capacity: '', expectedDonors: '', bloodGroups: []
      });
      setCampTab('list');
    }, 2000);
  };

  const district = appState.officerDetails?.district || 'Pune';

  const totalBags = hospitals.reduce((sum, h) => sum + Object.values(h.stock).reduce((a, b) => a + b, 0), 0);
  const criticalHospitals = hospitals.filter(h => Object.values(h.stock).some(v => v <= 5)).length;
  const activeAlerts = alerts.filter(a => a.status === 'Active').length;

  const totalBagsCount = useCountUp(totalBags);
  const criticalCount = useCountUp(criticalHospitals);
  const alertCount = useCountUp(activeAlerts);

  // Aggregate blood stock per group across all hospitals
  const aggregateStock = BLOOD_GROUPS.map(group => ({
    group,
    units: hospitals.reduce((sum, h) => sum + (h.stock[group] || 0), 0),
    status: hospitals.reduce((sum, h) => sum + (h.stock[group] || 0), 0) < 30 ? 'Critical' : 'Optimal',
  }));

  const criticalAlerts = alerts.filter(a => a.severity === 'Critical' && a.status === 'Active');

  return (
    <div className="space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Editorial Greeting Header */}
      <section className="mb-12">
        <h1 className="font-serif text-[60px] md:text-[80px] italic leading-none mb-4 tracking-[-0.04em] text-[#1a1a1a]">
          District <span className="text-[#BE1F2E]">{district}.</span>
        </h1>
        <p className="text-[18px] text-[#737373] max-w-2xl leading-[28px]">
          Real-time blood supply intelligence across all {hospitals.length} registered hospitals. Predict shortages before they happen. Save lives proactively.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Stats Bento Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Total Bags */}
            <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)] relative overflow-hidden group">
              <span className="absolute -bottom-4 -right-2 font-serif text-[120px] text-[#BE1F2E]/5 select-none transition-transform group-hover:scale-110">01</span>
              <p className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-4">Total District Bags</p>
              <div className="flex items-end gap-2">
                <h2 className="font-serif text-[60px] leading-[54px] text-[#BE1F2E]">{totalBagsCount}</h2>
                <span className="text-[14px] font-[500] text-[#737373] mb-4 italic">Bags</span>
              </div>
              <p className="text-[12px] text-[#737373] mt-3">Across {hospitals.length} hospitals</p>
            </div>

            {/* Critical Hospitals */}
            <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)] relative overflow-hidden group">
              <span className="absolute -bottom-4 -right-2 font-serif text-[120px] text-[#BE1F2E]/5 select-none transition-transform group-hover:scale-110">02</span>
              <p className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-4">Critical Hospitals</p>
              <div className="flex items-end gap-2">
                <h2 className="font-serif text-[60px] leading-[54px] text-[#BE1F2E]">{criticalCount}</h2>
                <span className="text-[14px] font-[500] text-[#737373] mb-4 italic">Hospitals</span>
              </div>
              <p className="text-[12px] text-[#BE1F2E] mt-3 font-semibold">≤5 units of any blood group</p>
            </div>

            {/* Active Alerts — dark card exactly like AdminDashboard */}
            <div className="bg-[#1a1210] p-8 rounded-lg relative overflow-hidden flex flex-col justify-between">
              <div>
                <p className="text-[12px] font-[600] tracking-[0.05em] text-white/60 uppercase mb-4">Active Alerts</p>
                <h2 className="text-[20px] font-[500] leading-[26px] text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${activeAlerts > 0 ? 'bg-[#BE1F2E] animate-pulse' : 'bg-slate-500'}`} />
                  <span>{activeAlerts > 0 ? `${alertCount} Shortages` : 'All Clear'}</span>
                </h2>
              </div>
              <button
                onClick={() => navigate('/district/alerts')}
                className="mt-6 w-full bg-[#BE1F2E] text-white py-3 rounded-full text-[13px] font-[500] hover:scale-105 active:scale-95 transition-transform"
              >
                View All Alerts
              </button>
            </div>
          </div>

          {/* District Aggregate Stock Chart */}
          <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-[24px] font-[500] italic">District Blood Stock</h3>
                <p className="text-[13px] text-[#737373] mt-0.5">Total units aggregated across all {hospitals.length} hospitals.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-[600] text-[#5a5a5a]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#BE1F2E]" />
                  <span>Sufficient</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#8B0A1E]" />
                  <span>Critical (&lt;30 Bags)</span>
                </div>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aggregateStock} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eae8e5" />
                  <XAxis dataKey="group" stroke="#737373" fontSize={11} tickLine={false} />
                  <YAxis stroke="#737373" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E0DAD4', borderRadius: '8px' }}
                    labelStyle={{ color: '#1a1a1a', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="units" radius={[4, 4, 0, 0]}>
                    {aggregateStock.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.units < 30 ? '#8B0A1E' : '#BE1F2E'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shortage Heatmap Table */}
          <div className="bg-white rounded-lg border border-[rgba(26,18,16,0.09)] overflow-hidden">
            <div className="p-6 border-b border-[rgba(26,18,16,0.09)] flex justify-between items-center">
              <div>
                <h3 className="text-[24px] font-[500] italic">Shortage Heatmap</h3>
                <p className="text-[13px] text-[#737373] mt-0.5">Live blood stock per hospital × blood group.</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-[600]">
                <span className="bg-[rgba(190,31,46,0.08)] text-[#BE1F2E] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Critical ≤5</span>
                <span className="bg-[#f5f3f0] text-[#737373] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Watch ≤15</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-[#f5f3f0]">
                  <tr>
                    <th className="px-4 py-3 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase whitespace-nowrap">Hospital</th>
                    {BLOOD_GROUPS.map(g => (
                      <th key={g} className="px-3 py-3 text-[12px] font-[600] text-center text-[#1a1a1a]">{g}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(26,18,16,0.06)]">
                  {hospitals.map(hospital => (
                    <tr key={hospital.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="px-4 py-3 font-[600] text-[#1A1A1A] whitespace-nowrap max-w-[180px]">
                        <div className="truncate text-[14px]">{hospital.name.replace(' Hospital', '').replace(' General', '')}</div>
                        <div className="text-[11px] text-[#9A9A9A] font-normal">{hospital.area}</div>
                      </td>
                      {BLOOD_GROUPS.map(g => {
                        const units = hospital.stock[g] || 0;
                        const isCritical = units <= 5;
                        const isWatch = units > 5 && units <= 15;
                        return (
                          <td key={g} className="px-3 py-3 text-center">
                            <span className={`inline-block px-2 py-1 rounded text-[11px] font-bold uppercase tracking-widest ${
                              isCritical 
                                ? 'bg-[rgba(190,31,46,0.08)] text-[#BE1F2E]' 
                                : isWatch 
                                ? 'bg-[rgba(26,18,16,0.05)] text-[#737373]' 
                                : 'text-[#1A1A1A]'
                            }`}>
                              {units}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Donation Camps Hub */}
          <div className="bg-white rounded-lg border border-[rgba(26,18,16,0.09)] overflow-hidden">
            <div className="p-6 border-b border-[rgba(26,18,16,0.09)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-[24px] font-[500] italic">Donation Camps Hub</h3>
                <p className="text-[13px] text-[#737373] mt-0.5">Schedule, approve, and organize district-wide donation drives.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCampTab('list')}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-[600] transition-all ${
                    campTab === 'list' 
                      ? 'bg-[#BE1F2E] text-white shadow-sm' 
                      : 'bg-[#f5f3f0] text-[#5A5A5A] hover:text-[#BE1F2E]'
                  }`}
                >
                  Camps List ({camps.length})
                </button>
                <button
                  onClick={() => setCampTab('plan')}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-[600] transition-all ${
                    campTab === 'plan' 
                      ? 'bg-[#BE1F2E] text-white shadow-sm' 
                      : 'bg-[#f5f3f0] text-[#5A5A5A] hover:text-[#BE1F2E]'
                  }`}
                >
                  + Plan Camp
                </button>
              </div>
            </div>

            <div className="p-6">
              {campTab === 'list' ? (
                <div className="space-y-4">
                  {camps.length === 0 ? (
                    <p className="text-[13px] text-[#9A9A9A] text-center py-4">No donation camps scheduled.</p>
                  ) : (
                    camps.map(camp => (
                      <div key={camp.id} className="p-4 bg-[#fbf9f6] rounded-lg border border-[#E0DAD4] flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-[600] text-[15px] text-[#1A1A1A]">{camp.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              camp.status === 'Approved' 
                                ? 'bg-[rgba(34,160,107,0.1)] text-[#22A06B]' 
                                : camp.status === 'Pending' 
                                ? 'bg-[#eae8e5] text-[#685c59]' 
                                : 'bg-[#ffdad6] text-[#93000a]'
                            }`}>
                              {camp.status}
                            </span>
                          </div>
                          <div className="text-[12px] text-[#737373] space-y-1">
                            <p className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[15px]">location_on</span>
                              {camp.location}
                            </p>
                            <p className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                              {new Date(camp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[15px]">group</span>
                              <span>Beneficiary: <span className="font-[600] text-[#1A1A1A]">{camp.organizer}</span> · Expected Donors: {camp.expectedDonors}</span>
                            </p>
                          </div>
                          {camp.bloodGroups && camp.bloodGroups.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {camp.bloodGroups.map(g => (
                                <span key={g} className="bg-[rgba(190,31,46,0.06)] text-[#BE1F2E] px-2.5 py-0.5 rounded text-[10px] font-[600] uppercase">
                                  {g}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {camp.status === 'Pending' && (
                          <div className="flex gap-2 shrink-0 self-end md:self-center">
                            <button
                              onClick={() => approveCamp(camp.id)}
                              className="bg-[#1a1210] text-white px-4 py-1.5 rounded-full text-[12px] font-[500] hover:scale-105 active:scale-95 transition-transform"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectCamp(camp.id)}
                              className="border border-[#E0DAD4] text-[#5A5A5A] px-4 py-1.5 rounded-full text-[12px] font-[500] hover:bg-[#eae8e5] transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div>
                  {campSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle size={40} className="text-[#22A06B] mx-auto mb-3 animate-bounce" />
                      <h4 className="font-serif text-[20px] italic text-[#1a1a1a] mb-1">Camp Request Scheduled!</h4>
                      <p className="text-[12px] text-[#737373]">Camp created and added to the list.</p>
                    </div>
                  ) : (
                    <form onSubmit={handlePlanSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-[600] uppercase tracking-wider text-[#737373] mb-1.5 block">Camp Name</label>
                          <input 
                            value={campForm.name} 
                            onChange={e => setCampForm(p => ({ ...p, name: e.target.value }))} 
                            className="w-full bg-[#fbf9f6] border border-[#E0DAD4] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#BE1F2E]" 
                            placeholder="e.g. Kothrud Community Camp" 
                            required 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-[600] uppercase tracking-wider text-[#737373] mb-1.5 block">Date</label>
                          <input 
                            type="date" 
                            value={campForm.date} 
                            onChange={e => setCampForm(p => ({ ...p, date: e.target.value }))} 
                            className="w-full bg-[#fbf9f6] border border-[#E0DAD4] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#BE1F2E]" 
                            required 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-[600] uppercase tracking-wider text-[#737373] mb-1.5 block">Location</label>
                        <input 
                          value={campForm.location} 
                          onChange={e => setCampForm(p => ({ ...p, location: e.target.value }))} 
                          className="w-full bg-[#fbf9f6] border border-[#E0DAD4] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#BE1F2E]" 
                          placeholder="Venue name, area, Pune" 
                          required 
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] font-[600] uppercase tracking-wider text-[#737373] mb-1.5 block">Organizing Hospital</label>
                          <select 
                            value={campForm.organizer} 
                            onChange={e => setCampForm(p => ({ ...p, organizer: e.target.value }))} 
                            className="w-full bg-[#fbf9f6] border border-[#E0DAD4] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#BE1F2E] appearance-none" 
                            required
                          >
                            <option value="">Select hospital…</option>
                            {hospitals.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-[600] uppercase tracking-wider text-[#737373] mb-1.5 block">Capacity</label>
                          <input 
                            type="number" 
                            value={campForm.capacity} 
                            onChange={e => setCampForm(p => ({ ...p, capacity: e.target.value }))} 
                            className="w-full bg-[#fbf9f6] border border-[#E0DAD4] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#BE1F2E]" 
                            placeholder="e.g. 200" 
                            required 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-[600] uppercase tracking-wider text-[#737373] mb-1.5 block">Expected Donors</label>
                          <input 
                            type="number" 
                            value={campForm.expectedDonors} 
                            onChange={e => setCampForm(p => ({ ...p, expectedDonors: e.target.value }))} 
                            className="w-full bg-[#fbf9f6] border border-[#E0DAD4] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#BE1F2E]" 
                            placeholder="e.g. 150" 
                            required 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-[600] uppercase tracking-wider text-[#737373] mb-1.5 block">Target Blood Groups</label>
                        <div className="flex flex-wrap gap-1.5">
                          {BLOOD_GROUPS.map(g => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => {
                                setCampForm(p => ({
                                  ...p,
                                  bloodGroups: p.bloodGroups.includes(g)
                                    ? p.bloodGroups.filter(x => x !== g)
                                    : [...p.bloodGroups, g]
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-full text-[11px] font-[600] transition-all ${
                                campForm.bloodGroups.includes(g)
                                  ? 'bg-[#BE1F2E] text-white shadow-sm'
                                  : 'bg-[#f5f3f0] text-[#5A5A5A] hover:bg-[rgba(190,31,46,0.08)] hover:text-[#BE1F2E]'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        className="w-full bg-[#BE1F2E] text-white py-2.5 rounded-full text-[13px] font-[600] hover:scale-102 active:scale-98 transition-all"
                      >
                        Schedule Camp Drive
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Critical Alerts Card */}
          <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-lg p-8 shadow-sm">
            <div className="flex items-center gap-3 text-[#BE1F2E] mb-6">
              <span className="material-symbols-outlined text-[24px]">priority_high</span>
              <h3 className="text-[24px] font-[500] italic">Critical Alerts</h3>
            </div>

            <div className="space-y-8">
              {criticalAlerts.length === 0 && (
                <p className="text-[13px] text-[#9A9A9A] text-center py-4">No critical alerts right now.</p>
              )}
              {criticalAlerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="p-6 bg-[#f5f3f0] rounded-lg border border-[rgba(26,18,16,0.09)]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-[#ffdad6] text-[#93000a]">
                        Critical
                      </span>
                      <h4 className="text-[18px] font-[500] mt-2 truncate max-w-[150px]">{alert.hospitalName}</h4>
                    </div>
                    <div className="bg-[#BE1F2E] text-white w-12 h-12 flex items-center justify-center rounded font-bold text-xl">
                      {alert.bloodGroup}
                    </div>
                  </div>
                  <p className="text-[13px] text-[#737373]">{alert.units} units · Depletes {alert.predictedDepleted}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Supply Insights — dark card exactly like AdminDashboard */}
          <div className="bg-[#1a1210] p-8 rounded-lg text-white relative overflow-hidden">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-[#BE1F2E] text-[32px] mb-4">insights</span>
              <h4 className="text-[24px] font-[500] mb-4 italic">AI Supply Insights</h4>
              
              <div className="space-y-4 text-white/70 text-[14px] leading-relaxed mb-6">
                <p>
                  • <strong className="text-white">O- critical at KEM & Poona</strong> — Schedule a targeted O- camp in Sadashiv Peth by Tuesday.
                </p>
                <p>
                  • <strong className="text-white">AB- district-wide depletion</strong> — 31 units total. Trigger cross-hospital transfer from Ruby Hall to Sassoon.
                </p>
                <p>
                  • <strong className="text-white">District surplus in O+</strong> — 364 units. Consider export to neighboring Solapur district.
                </p>
              </div>

              <a 
                onClick={() => navigate('/district/camps')}
                className="inline-flex items-center gap-2 text-[#BE1F2E] text-[14px] font-[500] group cursor-pointer hover:underline"
              >
                Plan a donation camp
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
              </a>
            </div>
          </div>

          {/* Escalate Banner */}
          <div className="relative rounded-lg overflow-hidden h-48 flex items-center bg-[#BE1F2E] group">
            <div className="relative z-10 p-8 w-full flex flex-col justify-between h-full">
              <h3 className="font-serif text-[28px] text-white italic leading-tight">Shortage unresolvable?</h3>
              <button 
                onClick={() => alert('🚨 Escalation report sent to Maharashtra State Health Department. Response expected within 2 hours.')}
                className="bg-white text-[#BE1F2E] px-8 py-3 rounded-full text-[14px] font-[500] hover:scale-105 active:scale-95 transition-transform w-fit"
              >
                Escalate to State Admin
              </button>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
};

export default DistrictDashboard;
