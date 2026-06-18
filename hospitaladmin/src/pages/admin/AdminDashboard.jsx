import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospital } from '../../context/HospitalContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  Users, 
  Plus, 
  Truck,
  CheckCircle,
  FileText,
  UserPlus,
  Sliders,
  Sparkles
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

  // Blood Inventory State (Mocked real-time counts)
  const [inventory, setInventory] = useState([
    { group: 'O+', units: 85, status: 'Optimal', color: '#BE1F2E' },
    { group: 'O-', units: 9, status: 'Critical', color: '#BE1F2E' },
    { group: 'A+', units: 64, status: 'Optimal', color: '#BE1F2E' },
    { group: 'A-', units: 14, status: 'Critical', color: '#BE1F2E' },
    { group: 'B+', units: 72, status: 'Optimal', color: '#BE1F2E' },
    { group: 'B-', units: 22, status: 'Optimal', color: '#BE1F2E' },
    { group: 'AB+', units: 48, status: 'Optimal', color: '#BE1F2E' },
    { group: 'AB-', units: 6, status: 'Critical', color: '#BE1F2E' },
  ]);

  // Active Emergency Patient Requests (Emergency Queue)
  const [requests, setRequests] = useState([
    { id: 1, patient: 'Suresh Deshmukh', type: 'O-', units: 3, priority: 'Critical', status: 'Pending', progress: 15 },
    { id: 2, patient: 'Priya Sharma', type: 'AB-', units: 2, priority: 'Critical', status: 'Pending', progress: 30 },
    { id: 3, patient: 'Aniket Patil', type: 'A+', units: 4, priority: 'High', status: 'Approved', progress: 100 },
  ]);

  // Recent Stock Movements
  const [movements, setMovements] = useState([
    { id: 1, date: 'Today', type: 'Issue', group: 'O+', units: 4, status: 'Completed', loc: 'Emergency Ward' },
    { id: 2, date: 'Today', type: 'Receive', group: 'B+', units: 12, status: 'Completed', loc: 'Camp #14' },
    { id: 3, date: 'Yesterday', type: 'Issue', group: 'A-', units: 2, status: 'Completed', loc: 'ICU Cardiac' },
  ]);

  // Countup stats matching donor dashboard feel
  const totalBags = useCountUp(inventory.reduce((acc, curr) => acc + curr.units, 0));
  const criticalCategories = useCountUp(inventory.filter(i => i.units < 15).length);

  // Approve pending request function
  const handleApproveRequest = (id) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        // Decrease corresponding inventory units
        setInventory(inv => inv.map(i => {
          if (i.group === req.type) {
            return { ...i, units: Math.max(0, i.units - req.units), status: i.units - req.units < 15 ? 'Critical' : 'Optimal' };
          }
          return i;
        }));
        // Update request status
        return { ...req, status: 'Approved', progress: 100 };
      }
      return req;
    }));

    // Add to movements table
    const req = requests.find(r => r.id === id);
    if (req) {
      setMovements(prev => [
        {
          id: Date.now(),
          date: 'Just now',
          type: 'Issue',
          group: req.type,
          units: req.units,
          status: 'Completed',
          loc: `Patient ${req.patient.split(' ')[0]}`
        },
        ...prev
      ]);
    }
  };

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
            <div className="bg-[#1a1210] p-8 rounded-lg relative overflow-hidden flex flex-col justify-between">
              <div>
                <p className="text-[12px] font-[600] tracking-[0.05em] text-white/60 uppercase mb-4">Siren Broadcaster</p>
                <h2 className="text-[20px] font-[500] leading-[26px] text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${emergencyStatus ? 'bg-[#BE1F2E] animate-pulse' : 'bg-slate-500'}`} />
                  <span>{emergencyStatus ? 'Active & Ready' : 'Broadcasting Paused'}</span>
                </h2>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-[13px] text-white/60">Toggle intake status</span>
                <button
                  onClick={() => setEmergencyStatus(!emergencyStatus)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${
                    emergencyStatus ? 'bg-[#BE1F2E]' : 'bg-[#3D2B2B]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      emergencyStatus ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Blood Stock Chart (Light-themed Recharts) */}
          <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-[24px] font-[500] italic">Inventory Stock levels</h3>
                <p className="text-[13px] text-[#737373] mt-0.5">Real-time units stocked in the central blood vault.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-[600] text-[#5a5a5a]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#BE1F2E]" />
                  <span>Optimal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#8B0A1E]" />
                  <span>Critical (&lt;15 Bags)</span>
                </div>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eae8e5" />
                  <XAxis dataKey="group" stroke="#737373" fontSize={11} tickLine={false} />
                  <YAxis stroke="#737373" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E0DAD4', borderRadius: '8px' }}
                    labelStyle={{ color: '#1a1a1a', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="units" radius={[4, 4, 0, 0]}>
                    {inventory.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.units < 15 ? '#8B0A1E' : '#BE1F2E'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Stock Movements Table (matching donor table) */}
          <div className="bg-white rounded-lg border border-[rgba(26,18,16,0.09)] overflow-hidden">
            <div className="p-6 border-b border-[rgba(26,18,16,0.09)] flex justify-between items-center">
              <h3 className="text-[24px] font-[500] italic">Recent Movements</h3>
              <button 
                onClick={() => navigate('/admin/waste')}
                className="text-[14px] font-[500] text-[#BE1F2E] hover:underline"
              >
                View Discard Analytics
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#f5f3f0]">
                  <tr>
                    <th className="px-6 py-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Date</th>
                    <th className="px-6 py-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Logistics Operation</th>
                    <th className="px-6 py-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Blood Group</th>
                    <th className="px-6 py-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(26,18,16,0.09)]">
                  {movements.map(mov => (
                    <tr key={mov.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="px-6 py-4 text-[14px] font-[500] text-[#1A1A1A]">{mov.date}</td>
                      <td className="px-6 py-4 text-[16px] text-[#685c59]">
                        <span className="font-[600] text-[#1A1A1A]">{mov.type}</span> to {mov.loc}
                      </td>
                      <td className="px-6 py-4 text-[16px] text-[#685c59] font-bold">{mov.group}</td>
                      <td className="px-6 py-4">
                        <span className="bg-[rgba(190,31,46,0.08)] text-[#BE1F2E] px-3 py-1 rounded-full text-[12px] font-[600] uppercase">
                          {mov.units} Bags
                        </span>
                      </td>
                    </tr>
                  ))}
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
              <button 
                onClick={() => alert("🚨 Siren alert sent to 184 O- and AB- registered neighborhood donors.")}
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
                        req.priority === 'Critical' ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#eae8e5] text-[#685c59]'
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

                  {req.status === 'Pending' ? (
                    <button 
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
