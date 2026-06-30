import React from 'react';
import { useSystemAdmin } from '../../context/SystemAdminContext';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Activity, 
  Database, 
  Users, 
  Cpu, 
  ArrowRight,
  RefreshCw,
  AlertOctagon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Loader } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/ErrorState';

const MOCK_LATENCY_DATA = [
  { time: '00:00', latency: 80 },
  { time: '02:00', latency: 85 },
  { time: '04:00', latency: 90 },
  { time: '06:00', latency: 78 },
  { time: '08:00', latency: 82 },
  { time: '10:00', latency: 89 },
  { time: '12:00', latency: 84 },
  { time: '14:00', latency: 81 },
  { time: '16:00', latency: 86 },
  { time: '18:00', latency: 91 },
  { time: '20:00', latency: 83 },
  { time: '22:00', latency: 84 },
];

export const SystemAdminDashboard = () => {
  const { adminState, testIntegration, triggerBackup, isLoading, error, refetchData } = useSystemAdmin();

  if (isLoading) {
    return <Loader message="Loading system dashboard statistics..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetchData} />;
  }

  const totalUsers = adminState.users.length;
  const pendingHospitalsCount = adminState.pendingHospitals.length;
  const pendingOfficersCount = adminState.pendingOfficers.length;
  const totalPending = pendingHospitalsCount + pendingOfficersCount;

  return (
    <div className="space-y-10 animate-page-enter">
      {/* Editorial Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-sysadmin">SysAdmin Panel</span>
          <span className="flex items-center gap-1.5 text-xs text-[#22A06B] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22A06B] pulse-dot" />
            ALL SYSTEMS ACTIVE
          </span>
        </div>
        <h1 className="font-serif text-[44px] md:text-[56px] font-[700] text-[#1A0A0A] leading-tight" style={{ fontFeatureSettings: '"liga" 0' }}>
          Platform Health. <span className="italic font-normal">Console status: active.</span>
        </h1>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1: Uptime */}
        <div className="bg-white border border-[#EDE7E1] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            <Activity size={20} />
          </div>
          <p className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] mb-1">System Uptime</p>
          <h3 className="font-serif text-[36px] font-[700] text-[#1A1A1A] leading-none mb-2">
            {adminState.systemHealth.uptime}
          </h3>
          <span className="badge-success text-[10px]">Stable</span>
        </div>

        {/* Stat 2: Database */}
        <div className="bg-white border border-[#EDE7E1] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            <Database size={20} />
          </div>
          <p className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] mb-1">Database Status</p>
          <h3 className="font-serif text-[36px] font-[700] text-[#1A1A1A] leading-none mb-2">
            {adminState.systemHealth.dbStatus}
          </h3>
          <span className="badge-success text-[10px]">0 latency alerts</span>
        </div>

        {/* Stat 3: Users */}
        <div className="bg-white border border-[#EDE7E1] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            <Users size={20} />
          </div>
          <p className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] mb-1">Active Accounts</p>
          <h3 className="font-serif text-[36px] font-[700] text-[#1A1A1A] leading-none mb-2">
            {totalUsers}
          </h3>
          <span className="badge-neutral text-[10px]">Across 5 Roles</span>
        </div>

        {/* Stat 4: Pending Approvals */}
        <Link to="/systemadmin/approvals" className="bg-white border border-[#EDE7E1] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group block">
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-[rgba(71,85,105,0.06)] group-hover:bg-[rgba(71,85,105,0.12)] flex items-center justify-center text-[#475569] transition-colors">
            <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] mb-1">Pending Registrations</p>
          <h3 className="font-serif text-[36px] font-[700] text-[#1A1A1A] leading-none mb-2">
            {totalPending}
          </h3>
          {totalPending > 0 ? (
            <span className="badge-warning text-[10px] animate-pulse">{totalPending} Action Needed</span>
          ) : (
            <span className="badge-success text-[10px]">All Clear</span>
          )}
        </Link>
      </div>

      {/* Main Grid: Chart & Diagnostic Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Latency Chart Card */}
        <div className="bg-white border border-[#EDE7E1] rounded-2xl p-8 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="font-serif text-[24px] font-[700] text-[#1A1A1A] mb-1">API Response Latency</h3>
            <p className="text-[14px] text-[#5A5A5A]">Hourly telemetry of the core RaktSetu routing and prediction server APIs.</p>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_LATENCY_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE7E1" vertical={false} />
                <XAxis dataKey="time" stroke="#9A9A9A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9A9A9A" fontSize={11} tickLine={false} axisLine={false} unit="ms" />
                <Tooltip 
                  contentStyle={{ background: '#fff', border: '1px solid #E0DAD4', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#475569" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, strokeWidth: 1.5, fill: '#fff' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Diagnostics Column */}
        <div className="space-y-6">
          {/* AI Insight Card */}
          <div className="bg-[#1A0A0A] rounded-2xl p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 opacity-[0.04] pointer-events-none">
              <Cpu size={150} />
            </div>
            <div>
              <span className="text-[#BE1F2E] text-[10px] font-[700] uppercase tracking-widest mb-3 block">
                Platform Diagnostic AI
              </span>
              <h4 className="font-serif text-[20px] font-[700] mb-2 leading-tight">
                Health Telemetry Insight
              </h4>
              <p className="text-white/60 text-xs leading-[1.6]">
                "MySQL database connections are at 18% capacity. API Gateway cache hit ratio is 84%. Next automated state backup is scheduled for 04:00 AM."
              </p>
            </div>
            <div className="mt-4">
              <button 
                onClick={triggerBackup}
                className="text-xs font-bold text-[#BE1F2E] hover:text-white flex items-center gap-1.5 transition-colors group"
              >
                <span>Trigger Manual Backup</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* API Integrations Status Widget */}
          <div className="bg-white border border-[#EDE7E1] rounded-2xl p-6 shadow-sm">
            <h4 className="font-serif text-[18px] font-[700] text-[#1A1A1A] mb-4">Integration Services</h4>
            <div className="space-y-4">
              {Object.entries(adminState.systemHealth.integrations).map(([key, status]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs capitalize text-[#1A1A1A]">{key} API</span>
                    {status === 'Connected' ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22A06B]" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E07B00] animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${status === 'Connected' ? 'text-[#9A9A9A]' : 'text-[#E07B00] font-semibold'}`}>
                      {status}
                    </span>
                    <button 
                      onClick={() => testIntegration(key)}
                      className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                      title="Ping Check"
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Overview Panel */}
      <div className="bg-white border border-[#EDE7E1] rounded-2xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-serif text-[24px] font-[700] text-[#1A1A1A] mb-1">Recent Platform Activities</h3>
            <p className="text-[14px] text-[#5A5A5A]">Real-time stream of audit logs recorded across the blood platform.</p>
          </div>
          <Link to="/systemadmin/audit-logs" className="btn-dark flex items-center gap-2 py-2.5 px-5 bg-slate-100 text-slate-700 hover:bg-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider">Full Logs</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EDE7E1] text-[10px] font-[700] uppercase tracking-widest text-[#9A9A9A]">
                <th className="py-3 pr-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 pl-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE7E1] text-xs text-[#5A5A5A]">
              {adminState.auditLogs.slice(0, 3).map(log => (
                <tr key={log.id} className="table-row-hover">
                  <td className="py-3 pr-4 font-mono">{log.timestamp}</td>
                  <td className="py-3 px-4 font-semibold text-[#1A1A1A]">{log.actor}</td>
                  <td className="py-3 px-4">{log.action}</td>
                  <td className="py-3 px-4">
                    {log.severity === 'Critical' && (
                      <span className="badge-danger text-[9px] px-1.5 py-0.5">Critical</span>
                    )}
                    {log.severity === 'Warning' && (
                      <span className="badge-warning text-[9px] px-1.5 py-0.5">Warning</span>
                    )}
                    {log.severity === 'Info' && (
                      <span className="badge-neutral text-[9px] px-1.5 py-0.5 text-slate-600 bg-slate-100">Info</span>
                    )}
                  </td>
                  <td className="py-3 pl-4 font-mono">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
