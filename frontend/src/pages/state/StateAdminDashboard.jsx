import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateAdmin } from '../../context/StateAdminContext';
import { INDIA_STATES_DISTRICTS } from '../../utils/indiaData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { Loader } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/ErrorState';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Reset Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

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

const STATE_MAP_CONFIGS = {
  "Maharashtra": { center: [19.7515, 75.7139], zoom: 6.5 },
  "Delhi": { center: [28.6139, 77.2090], zoom: 10 },
  "Goa": { center: [15.2993, 74.1240], zoom: 9.5 },
  "Gujarat": { center: [22.2587, 71.1924], zoom: 7 },
  "Karnataka": { center: [15.3173, 75.7139], zoom: 6.8 },
  "Himachal Pradesh": { center: [31.1048, 77.1734], zoom: 7.8 },
  "Andhra Pradesh": { center: [15.9129, 79.7400], zoom: 7 },
  "Tamil Nadu": { center: [11.1271, 78.6569], zoom: 7 },
  "Kerala": { center: [10.8505, 76.2711], zoom: 7.5 },
  "Uttar Pradesh": { center: [26.8467, 80.9462], zoom: 6.5 },
  "West Bengal": { center: [22.9868, 87.8550], zoom: 7 }
};

const StateAdminDashboard = () => {
  const navigate = useNavigate();
  const { appState, isLoading, error, refetchData, createDistrictOfficer } = useStateAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', fullName: '', districtName: '', designation: 'District Health Officer' });
  const [createResult, setCreateResult] = useState(null);
  const [createError, setCreateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateResult(null);
    setIsSubmitting(true);
    try {
      const res = await createDistrictOfficer(createForm);
      setCreateResult(res);
      setCreateForm({ email: '', fullName: '', districtName: '', designation: 'District Health Officer' });
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to commission District Officer. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    refetchData();
  }, [refetchData]);

  const stateName = appState.officialDetails?.state || 'Maharashtra';

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

  // Resolve map center and zoom level based on active state name and district coordinates
  const stateDistricts = districts.filter(d => d.lat && d.lng);
  const stateConfig = STATE_MAP_CONFIGS[stateName] || { center: [20.5937, 78.9629], zoom: 5 }; // Fallback to center of India

  const mapCenter = stateDistricts.length > 0
    ? [
        stateDistricts.reduce((sum, d) => sum + d.lat, 0) / stateDistricts.length,
        stateDistricts.reduce((sum, d) => sum + d.lng, 0) / stateDistricts.length
      ]
    : stateConfig.center;

  const mapZoom = stateDistricts.length > 0 ? 6.5 : stateConfig.zoom;

  if (isLoading) {
    return <Loader message="Loading state health statistics..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetchData} />;
  }

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
        <div className="inline-block badge-state mb-4">{stateName} State Health</div>
        <h1 className="font-serif text-[58px] md:text-[76px] italic leading-none mb-4 tracking-[-0.04em] text-[#1a1a1a]">
          State <span style={{ color: 'var(--state)' }}>Oversight.</span>
        </h1>
        <p className="text-[18px] text-[#737373] max-w-2xl leading-[28px]">
          State-wide blood supply intelligence across all {districts.length} {stateName} districts. Monitor shortages, enforce policy KPIs, and coordinate cross-district interventions.
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

          {/* State Overview Map (Leaflet) */}
          <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-[22px] font-[500] italic">State Overview Map</h3>
                <p className="text-[13px] text-[#737373] mt-0.5">Live health status of districts across {stateName}.</p>
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
            
            <div className="h-[400px] w-full bg-[#fbf9f6] rounded-xl border border-[#EDE7E1] relative overflow-hidden z-10">
              <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {districts.filter(d => d.lat && d.lng).map(d => (
                  <React.Fragment key={d.id}>
                    <Marker position={[d.lat, d.lng]}>
                      <Popup>
                        <div className="p-3 font-sans space-y-1 text-xs">
                          <h4 className="font-bold text-[14px] text-[#1A1A1A] mb-1">{d.name} District</h4>
                          <p className="text-[#5A5A5A]"><strong className="text-[#1A1A1A]">Officer:</strong> {d.officerName}</p>
                          <p className="text-[#5A5A5A]"><strong className="text-[#1A1A1A]">Email:</strong> {d.officerEmail}</p>
                          <p className="text-[#5A5A5A]"><strong className="text-[#1A1A1A]">Total Stock:</strong> {d.totalStock} bags</p>
                          <p className="text-[#5A5A5A]"><strong className="text-[#1A1A1A]">Hospitals:</strong> {d.hospitalsCount}</p>
                          <div className="mt-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              d.status === 'Critical' ? 'bg-[rgba(190,31,46,0.08)] text-[#BE1F2E]'
                                : d.status === 'Watch' ? 'bg-[#FEF3C7] text-[#92400E]'
                                : 'bg-[rgba(34,160,107,0.1)] text-[#22A06B]'
                            }`}>
                              {d.status}
                            </span>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                    <Circle
                      center={[d.lat, d.lng]}
                      radius={35000}
                      pathOptions={{
                        color: d.status === 'Critical' ? '#BE1F2E' : d.status === 'Watch' ? '#D97706' : '#22A06B',
                        fillColor: d.status === 'Critical' ? '#BE1F2E' : d.status === 'Watch' ? '#D97706' : '#22A06B',
                        fillOpacity: 0.15,
                        weight: 2
                      }}
                    />
                  </React.Fragment>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* State Aggregate Blood Stock Chart */}
          <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-[22px] font-[500] italic">State Blood Stock</h3>
                <p className="text-[13px] text-[#737373] mt-0.5">Total units across all {districts.length} {stateName} districts.</p>
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
                <p className="text-[13px] text-[#737373] mt-0.5">Live status across all {districts.length} {stateName} districts.</p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setCreateError('');
                    setCreateResult(null);
                    setShowCreateModal(true);
                  }}
                  className="px-4 py-2 bg-[#9e001f] text-white rounded-full text-[12px] font-[600] hover:bg-[#BE1F2E] transition-all flex items-center gap-1.5 shadow-sm active:scale-95 duration-200 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add District Officer
                </button>
                <div className="flex items-center gap-2 text-[11px] font-[600] flex-wrap">
                  <span className="badge-danger text-[10px]">Critical</span>
                  <span className="badge-warning text-[10px]">Watch</span>
                  <span className="badge-success text-[10px]">Healthy</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#f5f3f0]">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-[600] tracking-[0.05em] text-[#737373] uppercase">District</th>
                    <th className="px-4 py-3 text-[11px] font-[600] tracking-[0.05em] text-[#737373] uppercase">District Officer</th>
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
                      <td className="px-4 py-3">
                        <div className="font-[600] text-[#1A1A1A]">{d.officerName}</div>
                        <div className="text-[11px] text-[#9A9A9A]">{d.officerEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-[#5A5A5A]">{d.hospitalsCount}</td>
                      <td className="px-4 py-3 font-[600] text-[#1A1A1A]">{d.totalStock}</td>
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
            <p className="text-[13px] text-[#737373] mb-6">Total blood bags and waste % across {stateName} — past 6 months.</p>
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
              <button type="button"
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
              <button type="button"
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
              <button type="button"
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

      {/* Create District Officer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#EDE7E1] max-w-lg w-full p-8 shadow-2xl space-y-6 relative overflow-hidden animate-page-enter">
            <div className="flex justify-between items-center pb-4 border-b border-[rgba(26,18,16,0.09)]">
              <h3 className="font-serif text-[24px] italic text-[#1A1210]">Register New District Officer</h3>
              <button
                type="button"
                onClick={() => { setShowCreateModal(false); setCreateResult(null); setCreateError(''); }}
                className="text-[#9A9A9A] hover:text-[#BE1F2E] transition-colors cursor-pointer border-none bg-transparent"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {createError && (
              <div className="p-4 bg-red-50 border border-red-200 text-[#BE1F2E] text-xs font-semibold rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                <span>{createError}</span>
              </div>
            )}

            {createResult ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 text-[#22A06B] text-xs font-semibold rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>District Officer registered and commissioned successfully!</span>
                </div>

                <div className="bg-[#FAF8F5] border border-[#EDE7E1] rounded-xl p-5 font-sans space-y-4 text-xs text-[#5A5A5A]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#9A9A9A] tracking-wider block">Officer Name</span>
                    <span className="text-sm font-semibold text-[#1A1A1A]">{createResult.user?.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#9A9A9A] tracking-wider block">Authorized Email</span>
                    <span className="text-sm font-semibold text-[#1A1A1A]">{createResult.user?.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#9A9A9A] tracking-wider block">District Jurisdiction</span>
                    <span className="text-sm font-semibold text-[#1A1A1A]">{createResult.user?.districtName}</span>
                  </div>
                  <div className="p-4 bg-[#fff6f5] border border-[#ffdad8] rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-[#BE1F2E] tracking-wider block mb-1">Temporary Login Password</span>
                    <span className="font-mono text-lg font-bold text-[#BE1F2E] tracking-wider">{createResult.tempPassword}</span>
                    <p className="text-[11px] text-[#737373] mt-2 leading-relaxed font-sans">
                      Please copy this password and share it with the officer. They will be required to change it on their first login.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setCreateResult(null); }}
                  className="btn-state w-full py-3"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs text-[#5A5A5A]">
                <div className="mb-2">
                  <label htmlFor="create-officer-name" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Full Name *</label>
                  <input id="create-officer-name"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Dr. Rajesh Kulkarni"
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm(p => ({ ...p, fullName: e.target.value }))}
                  />
                </div>

                <div className="mb-2">
                  <label htmlFor="create-officer-email" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Email Address *</label>
                  <input id="create-officer-email"
                    type="email"
                    required
                    className="input-field"
                    placeholder="e.g. rajesh.kulkarni@health.gov.in"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(p => ({ ...p, email: e.target.value }))}
                  />
                </div>

                <div className="mb-2">
                  <label htmlFor="create-officer-district" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">District Jurisdiction *</label>
                  <div className="relative">
                    <select id="create-officer-district"
                      required
                      className="input-field custom-select"
                      value={createForm.districtName}
                      onChange={(e) => setCreateForm(p => ({ ...p, districtName: e.target.value }))}
                    >
                      <option value="">— Select District —</option>
                      {(INDIA_STATES_DISTRICTS[stateName] || []).sort().map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-2">
                  <label htmlFor="create-officer-designation" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Designation</label>
                  <input id="create-officer-designation"
                    type="text"
                    className="input-field"
                    placeholder="e.g. District Health Officer"
                    value={createForm.designation}
                    onChange={(e) => setCreateForm(p => ({ ...p, designation: e.target.value }))}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-state w-full py-3 mt-4 animate-pulse"
                >
                  {isSubmitting ? 'Registering...' : 'Commission District Officer'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StateAdminDashboard;
