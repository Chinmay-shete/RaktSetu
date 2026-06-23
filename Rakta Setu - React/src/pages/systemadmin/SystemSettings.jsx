import { useSystemAdmin } from '../../context/SystemAdminContext';
import { ToggleLeft, ToggleRight, Download, Server, RefreshCw, Radio } from 'lucide-react';

const MOCK_BACKUP_HISTORY = [
  { id: 1, timestamp: '2026-06-20 04:00:00', type: 'Automated', size: '1.24 MB', status: 'Completed' },
  { id: 2, timestamp: '2026-06-19 04:00:00', type: 'Automated', size: '1.22 MB', status: 'Completed' },
  { id: 3, timestamp: '2026-06-18 04:00:00', type: 'Automated', size: '1.21 MB', status: 'Completed' },
  { id: 4, timestamp: '2026-06-17 14:32:00', type: 'Manual', size: '1.19 MB', status: 'Completed' },
];

export const SystemSettings = () => {
  const { 
    adminState, 
    toggleFeatureFlag, 
    triggerBackup, 
    testIntegration 
  } = useSystemAdmin();

  const flags = adminState.featureFlags;

  const flagDescriptions = {
    emergencyRouting: 'Enables dynamic shortest-path emergency transit calculations for urgent blood transfers.',
    aiDemandForecasting: 'Enables the 7-day predictive AI demand sensing widget on Hospital and District Dashboards.',
    crossHospitalExpiryAutoTransfer: 'Enables auto-matching systems that recommend transfers when blood is nearing expiry.',
  };

  const flagLabels = {
    emergencyRouting: 'Emergency Real-Time Routing',
    aiDemandForecasting: 'AI Demand Forecasting',
    crossHospitalExpiryAutoTransfer: 'Cross-Hospital Expiry Auto-Transfer',
  };

  return (
    <div className="space-y-10 animate-page-enter">
      {/* Editorial Header */}
      <div>
        <span className="badge-sysadmin mb-2">Platform Control</span>
        <h1 className="font-serif text-[44px] md:text-[56px] font-[700] text-[#1A0A0A] leading-tight mb-2" style={{ fontFeatureSettings: '"liga" 0' }}>
          Console Config. <span className="italic font-normal">Environment settings.</span>
        </h1>
        <p className="text-[15px] text-[#5A5A5A] max-w-2xl">
          Configure features, test API endpoints, and trigger system-wide state snapshots.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Feature Flags Panel */}
        <div className="bg-white border border-[#EDE7E1] rounded-2xl p-8 shadow-sm space-y-6">
          <div>
            <h3 className="font-serif text-[24px] font-[700] text-[#1A1A1A] mb-1">Feature Flags</h3>
            <p className="text-xs text-[#9A9A9A]">Control RaktSetu modules dynamically without code redeployment.</p>
          </div>

          <div className="divide-y divide-[#EDE7E1]">
            {Object.entries(flags).map(([key, val]) => (
              <div key={key} className="py-5 flex items-start justify-between gap-6">
                <div className="space-y-1">
                  <h4 className="font-bold text-[14px] text-[#1A1A1A]">{flagLabels[key] || key}</h4>
                  <p className="text-xs text-[#5A5A5A] leading-relaxed">{flagDescriptions[key] || 'No description.'}</p>
                </div>
                <button 
                  onClick={() => toggleFeatureFlag(key)}
                  className="text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                >
                  {val ? (
                    <ToggleRight size={40} className="text-[#BE1F2E]" />
                  ) : (
                    <ToggleLeft size={40} className="text-slate-300" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Gateways Panel */}
        <div className="bg-white border border-[#EDE7E1] rounded-2xl p-8 shadow-sm space-y-6">
          <div>
            <h3 className="font-serif text-[24px] font-[700] text-[#1A1A1A] mb-1">Integrations & API Bridges</h3>
            <p className="text-xs text-[#9A9A9A]">Monitor connections to communication and map services.</p>
          </div>

          <div className="space-y-4">
            {Object.entries(adminState.systemHealth.integrations).map(([key, status]) => (
              <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-[#fbf9f6] border border-[#E0DAD4]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#E0DAD4] flex items-center justify-center text-slate-500">
                    <Radio size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[13px] text-[#1A1A1A] capitalize">{key} Gateway</h4>
                    <span className="text-[10px] text-[#9A9A9A] uppercase tracking-wider font-semibold">Active endpoint</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${status === 'Connected' ? 'text-[#22A06B]' : 'text-[#E07B00] animate-pulse'}`}>
                    {status}
                  </span>
                  <button
                    onClick={() => testIntegration(key)}
                    className="p-2 bg-white border border-[#E0DAD4] hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 transition-all flex items-center gap-1.5 text-xs font-bold"
                  >
                    <RefreshCw size={12} />
                    <span>Ping Check</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Backups Panel */}
      <div className="bg-white border border-[#EDE7E1] rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h3 className="font-serif text-[24px] font-[700] text-[#1A1A1A] mb-1">Data Snapshot & Backup</h3>
            <p className="text-[14px] text-[#5A5A5A]">Download full JSON copies of the platform's relational state.</p>
          </div>
          <button 
            onClick={triggerBackup}
            className="btn-primary bg-[#475569] hover:bg-[#334155] flex items-center gap-2 py-3 px-6 shadow-sm hover:shadow-lg"
          >
            <Download size={16} />
            <span>Generate Backup Snapshot</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EDE7E1] text-[10px] font-[700] uppercase tracking-widest text-[#9A9A9A]">
                <th className="py-3 pr-4">Timestamp</th>
                <th className="py-3 px-4">Backup Type</th>
                <th className="py-3 px-4">Backup Size</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 pl-4 text-right">Audit Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE7E1] text-xs text-[#5A5A5A]">
              {MOCK_BACKUP_HISTORY.map(history => (
                <tr key={history.id} className="table-row-hover">
                  <td className="py-3 pr-4 font-mono">{history.timestamp}</td>
                  <td className="py-3 px-4 font-semibold text-[#1A1A1A]">{history.type}</td>
                  <td className="py-3 px-4 font-mono">{history.size}</td>
                  <td className="py-3 px-4">
                    <span className="badge-success text-[10px]">Verified</span>
                  </td>
                  <td className="py-3 pl-4 text-right font-mono text-[10px] text-[#9A9A9A]">
                    RS-BKP-00{history.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
