import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospital } from '../../context/HospitalContext';
import { hospitalApi } from '../../services/api';
import { Loader } from '../../components/ui/Loader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  CheckCircle
} from 'lucide-react';

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { appState } = useHospital();
  const [emergencyStatus, setEmergencyStatus] = useState(true);

  // Get hospital details from context
  const hospitalName = appState.hospitalDetails?.hospitalName || "Apex City Hospital";
  const city = appState.hospitalDetails?.city || "Pune";

  // State for fetched data
  const [inventory, setInventory] = useState([
    { group: 'O+', units: 0, status: 'Optimal', color: '#BE1F2E' },
    { group: 'O-', units: 0, status: 'Optimal', color: '#BE1F2E' },
    { group: 'A+', units: 0, status: 'Optimal', color: '#BE1F2E' },
    { group: 'A-', units: 0, status: 'Optimal', color: '#BE1F2E' },
    { group: 'B+', units: 0, status: 'Optimal', color: '#BE1F2E' },
    { group: 'B-', units: 0, status: 'Optimal', color: '#BE1F2E' },
    { group: 'AB+', units: 0, status: 'Optimal', color: '#BE1F2E' },
    { group: 'AB-', units: 0, status: 'Optimal', color: '#BE1F2E' }
  ]);
  const [requests, setRequests] = useState([]);
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLiveData = async () => {
    try {
      setIsLoading(true);
      const [invData, reqData, transData] = await Promise.all([
        hospitalApi.getInventory(),
        hospitalApi.getEmergencyRequests(),
        hospitalApi.getTransferRequests()
      ]);

      // Group live inventory by blood group
      const groups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
      const groupedInv = groups.map(g => {
        const batches = Array.isArray(invData) ? invData.filter(b => b.bloodGroup === g) : [];
        const units = batches.reduce((sum, b) => sum + b.units, 0);
        const reserved = batches.reduce((sum, b) => sum + b.reservedUnits, 0);
        const available = Math.max(0, units - reserved);
        return {
          group: g,
          units: available,
          status: available < 10 ? 'Critical' : 'Optimal',
          color: '#BE1F2E'
        };
      });
      setInventory(groupedInv);

      // Map pending/fulfilled emergency requests
      const mappedReqs = (Array.isArray(reqData) ? reqData : []).slice(0, 4).map(req => ({
        id: req.id,
        patient: req.patientName || `Emergency Patient #${req.id}`,
        type: req.bloodGroup,
        units: req.unitsRequired || req.units,
        priority: req.priority || 'Critical',
        status: req.status,
        progress: req.status === 'Accepted' || req.status === 'fulfilled' ? 100 : 30
      }));
      setRequests(mappedReqs);

      // Map transfers/movements
      const mappedMovements = (Array.isArray(transData) ? transData : []).slice(0, 5).map(t => ({
        id: t.id,
        date: t.date || 'Recent',
        type: t.type === 'incoming' ? 'Receive' : 'Issue',
        group: t.bloodGroup,
        units: t.unitsRequired || t.units,
        status: t.status,
        loc: t.hospitalName
      }));
      setMovements(mappedMovements);
    } catch (err) {
      console.error("Failed to load admin live data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  // Countup stats matching donor dashboard feel
  const totalBagsRaw = inventory.reduce((acc, curr) => acc + curr.units, 0);
  const totalBags = useCountUp(totalBagsRaw);
  const criticalCategories = useCountUp(totalBagsRaw === 0 ? 0 : inventory.filter(i => i.units < 15).length);

  // Approve pending request function
  const handleApproveRequest = async (id) => {
    try {
      await hospitalApi.updateEmergencyStatus(id, 'Accepted');
      await fetchLiveData();
    } catch (err) {
      console.error(err);
      alert('Failed to authorize dispatch.');
    }
  };

  if (isLoading) {
    return <Loader message="Fetching hospital admin live statistics..." />;
  }

  return (
    <div className="space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Editorial Greeting Header */}
      <section className="mb-12">
        <h1 className="font-serif text-[60px] md:text-[80px] italic leading-none mb-4 tracking-[-0.04em] text-[#1a1a1a]">
          Welcome back, <span className="text-[#BE1F2E]">{hospitalName.replace("Hospital", "").trim()}.</span>
        </h1>
        <p className="text-[18px] text-[#737373] max-w-2xl leading-[28px]">
          Command center for blood supply logistics, stock tracking, and emergency donor mobilization in {city}. Your precision saves lives.
        </p>
      </section>

      {/* Grid Layout: Bento cards on left, Sidebar on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Stats Bento (Bags Stocked, Critical alerts, Alert Toggle) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Total Stocked Bags */}
            <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)] relative overflow-hidden group">
              <span className="absolute -bottom-4 -right-2 font-serif text-[120px] text-[#BE1F2E]/5 select-none transition-transform group-hover:scale-110">01</span>
              <p className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-4">Total Stocked</p>
              <div className="flex items-end gap-2">
                <h2 className="font-serif text-[60px] leading-[54px] text-[#BE1F2E]">{totalBags}</h2>
                <span className="text-[14px] font-[500] text-[#737373] mb-4 italic">Bags</span>
              </div>
            </div>

            {/* Critical Shortage Alert Categories */}
            <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)] relative overflow-hidden group">
              <span className="absolute -bottom-4 -right-2 font-serif text-[120px] text-[#BE1F2E]/5 select-none transition-transform group-hover:scale-110">02</span>
              <p className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-4">Shortages</p>
              <div className="flex items-end gap-2">
                <h2 className="font-serif text-[60px] leading-[54px] text-[#BE1F2E]">{criticalCategories}</h2>
                <span className="text-[14px] font-[500] text-[#737373] mb-4 italic">Groups</span>
              </div>
            </div>

            {/* Emergency Alert Switch Card */}
            <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)] relative overflow-hidden flex flex-col justify-between">
              <div>
                <p className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-1">SOS Alert System</p>
                <h4 className="text-[18px] font-bold text-[#1A0A0A]">
                  {emergencyStatus ? 'Active & Monitoring' : 'Muted'}
                </h4>
              </div>
              <div className="flex justify-between items-center mt-6">
                <span className="text-xs text-[#9A9A9A]">Receive regional requests</span>
                <button aria-label="Toggle emergency status" type="button" 
                  onClick={() => setEmergencyStatus(!emergencyStatus)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                    emergencyStatus ? 'bg-[#BE1F2E]' : 'bg-slate-200'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    emergencyStatus ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

          </div>

          {/* Recharts Bar Chart (Inventory metrics by type) */}
          <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)] shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-serif text-[24px] italic">Blood Bank Stock levels</h3>
                <p className="text-xs text-[#737373] mt-1">Current available bags across all registered blood groups.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#737373]">
                <span className="w-2.5 h-2.5 bg-[#BE1F2E] rounded-full inline-block" />
                <span>Available Units</span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0DAD4" />
                  <XAxis dataKey="group" tickLine={false} axisLine={false} tick={{ fill: '#737373', fontSize: 12, fontWeight: 600 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#737373', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'rgba(190,31,46,0.02)' }} contentStyle={{ background: '#FFFFFF', border: '1px solid #E0DAD4', borderRadius: 8, fontFamily: 'DM Sans' }} />
                  <Bar dataKey="units" fill="#BE1F2E" radius={[4, 4, 0, 0]} maxBarSize={45}>
                    {inventory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={totalBagsRaw === 0 ? '#E0DAD4' : (entry.units < 15 ? '#BE1F2E' : '#7A5F5F')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Stock Movements Table */}
          <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-lg p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#BE1F2E]">history</span>
                <h3 className="text-[24px] font-[500] italic">Recent Movements</h3>
              </div>
              <button type="button" 
                onClick={() => navigate('/admin/forecast')}
                className="text-[12px] font-bold text-[#BE1F2E] uppercase hover:underline tracking-wider"
              >
                View Analytics
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[14px]">
                <thead>
                  <tr className="border-b border-[#E0DAD4] text-[11px] font-[600] uppercase tracking-wider text-[#9A9A9A] pb-3">
                    <th className="pb-3 pr-4">Timestamp</th>
                    <th className="pb-3 px-4">Operation</th>
                    <th className="pb-3 px-4">Type</th>
                    <th className="pb-3 px-4">Entity / Source</th>
                    <th className="pb-3 pl-4 text-right">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(26,18,16,0.05)] text-[#5A5A5A]">
                  {movements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-[#fbf9f6]/40 transition-colors">
                      <td className="py-4 pr-4 text-xs font-[600] text-[#9A9A9A]">{mov.date}</td>
                      <td className="py-4 px-4 font-semibold text-[#1a1a1a]">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          mov.type === 'Receive' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-[#BE1F2E]'
                        }`}>
                          {mov.type === 'Receive' ? 'Inward Transfer' : 'Outward Transfer'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-xs">{mov.group}</td>
                      <td className="py-4 px-4 font-medium text-[#737373] truncate max-w-[180px]">{mov.loc || 'Peer Hospital'}</td>
                      <td className="py-4 pl-4 text-right">
                        <span className="font-[600] text-[#1a1a1a]">
                          {mov.units} Bags
                        </span>
                      </td>
                    </tr>
                  ))}
                  {movements.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-xs text-[#9A9A9A]">
                        No stock transfers have been logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Operations Matrix Banner CTA */}
          <div className="relative rounded-lg overflow-hidden h-64 flex items-center bg-[#BE1F2E] group">
            <img className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-40 transition-transform duration-700 group-hover:scale-110" alt="CTA Background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPibRz0Po3cADqWVeJotqwI5fjq6J_LGtmvf97Pejz_dB8BC95-AYRDHtr68mR1jSCGNyrNHad216bN9r8ZhfCzM6rMBVRpJaOPeTLR4LLYeuwgM631WjmL6mQq6TjXgaNgswV-M_rMRC-HGyfZKVcbfV5xztNZInaEPUjsO6E3CucCbAOR1GnD3CEVbeEFvaZotTR3Z9HKRE9CnyH30i9UXdVMJk2zfx-MeQaE8o0lDXZbgCfsFl7E_HVMJo_QrxKg2gVJoco21Q" />
            <div className="relative z-10 p-12 w-full flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <h3 className="font-serif text-[48px] text-white italic leading-tight">Need neighborhood donors?</h3>
                <p className="text-white/80 text-[16px] mt-2">Broadcast a critical alert to matches inside the district.</p>
              </div>
              <button type="button" 
                onClick={() => alert(`🚨 Siren alert sent to eligible donors matching hospital groups.`)}
                className="bg-white text-[#BE1F2E] px-10 py-4 rounded-full text-[14px] font-[500] hover:scale-105 active:scale-95 transition-transform duration-400 whitespace-nowrap"
              >
                Broadcast Siren Alert
              </button>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Active Emergency Requests (Fulfillment queue matching donor urgent requests) */}
          <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-lg p-8 shadow-sm">
            <div className="flex items-center gap-3 text-[#BE1F2E] mb-6">
              <span className="material-symbols-outlined text-[24px]">priority_high</span>
              <h3 className="text-[24px] font-[500] italic">Emergency Queue</h3>
            </div>

            <div className="space-y-8">
              {requests.map(req => (
                <div key={req.id} className="p-6 bg-[#f5f3f0] rounded-lg border border-[rgba(26,18,16,0.09)]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                        req.priority === 'Critical' || req.priority === 'critical' ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#eae8e5] text-[#685c59]'
                      }`}>
                        {req.priority}
                      </span>
                      <h4 className="text-[18px] font-[500] mt-2 truncate max-w-[150px]">{req.patient}</h4>
                    </div>
                    <div className="bg-[#BE1F2E] text-white w-12 h-12 flex items-center justify-center rounded font-bold text-xl">{req.type}</div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[12px] font-[600] text-[#737373]">
                      <span>Order Fulfillment ({req.units} Units)</span>
                      <span className="font-bold">{req.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#eae8e5] rounded-full overflow-hidden">
                      <div className="h-full bg-[#BE1F2E] transition-all" style={{ width: `${req.progress}%` }}></div>
                    </div>
                  </div>

                  {req.status === 'Pending' || req.status === 'pending' ? (
                    <button type="button" 
                      onClick={() => handleApproveRequest(req.id)}
                      className="w-full bg-[#1a1210] text-white py-3 rounded-full text-[14px] font-[500] hover:scale-105 active:scale-95 transition-transform duration-400"
                    >
                      Approve &amp; Dispatch
                    </button>
                  ) : (
                    <div className="w-full py-2.5 rounded-full text-[14px] font-[600] bg-[#22A06B]/10 text-[#22A06B] text-center border border-[#22A06B]/20 flex items-center justify-center gap-1.5">
                      <CheckCircle size={16} />
                      <span>{req.status}</span>
                    </div>
                  )}
                </div>
              ))}
              {requests.length === 0 && (
                <div className="text-center py-6 text-xs text-[#9A9A9A]">
                  No active emergency requests pending.
                </div>
              )}
            </div>
          </div>

          {/* AI Clinical Recommendations (matching Logistics Insight) */}
          <div className="bg-[#1a1210] p-8 rounded-lg text-white relative overflow-hidden">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-[#BE1F2E] text-[32px] mb-4">insights</span>
              <h4 className="text-[24px] font-[500] mb-4 italic">AI Supply Insights</h4>
              
              <div className="space-y-4 text-white/70 text-[14px] leading-relaxed mb-6">
                <p>
                  • **O- Registry Surge:** Universal donor stocks have dipped below minimum buffer levels. Trigger O- negative SMS campaign by Tuesday to cover predicted Friday ICU spikes.
                </p>
                <p>
                  • **AB- Expiry Alert:** Pausing active collection drives for AB- for 7 days is recommended to prevent expiry wastage risk.
                </p>
                <p>
                  • **Rotational Swap:** Dispatch excess B+ stock units to municipal trauma centers where turnaround rates are higher.
                </p>
              </div>

              <a 
                onClick={() => navigate('/admin/forecast')}
                className="inline-flex items-center gap-2 text-[#BE1F2E] text-[14px] font-[500] group cursor-pointer hover:underline"
              >
                Open AI Prediction Engine
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
              </a>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
};

export default AdminDashboard;
