import { useState } from 'react';
import { useSystemAdmin } from '../../context/SystemAdminContext';
import { Search, Info, AlertTriangle, AlertCircle } from 'lucide-react';

export const AuditLogs = () => {
  const { adminState } = useSystemAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const logs = adminState.auditLogs || [];

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const actor = log.actor || '';
    const action = log.action || '';
    const ip = log.ipAddress || '';
    
    const matchesSearch = 
      actor.toLowerCase().includes(searchQuery.toLowerCase()) || 
      action.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ip.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-10 animate-page-enter">
      {/* Editorial Header */}
      <div>
        <span className="badge-sysadmin mb-2">Audit trail</span>
        <h1 className="font-serif text-[36px] md:text-[56px] font-normal text-[#1A1210] leading-tight mb-2" style={{ fontFeatureSettings: '"liga" 0' }}>
          Platform Audit Logs. <span className="italic">History log.</span>
        </h1>
        <p className="text-[15px] text-[#5C403F] max-w-2xl">
          Trace every administrative operation, automated process, and status shift in the national blood network.
        </p>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-[rgba(26,18,16,0.09)] rounded-2xl p-6 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md input-with-icon">
          <span className="absolute inset-y-0 left-4 flex items-center text-[#9A9A9A] input-icon">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="input-field !pl-12"
            placeholder="Search by actor, action or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Severity Filter */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] whitespace-nowrap">Severity:</label>
          <div className="relative w-full md:w-48">
            <select
              className="input-field custom-select"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="Info">Info</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-2xl p-8 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(26,18,16,0.09)] text-[10px] font-[700] uppercase tracking-widest text-[#9A9A9A]">
                <th className="py-3 pr-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 pl-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(26,18,16,0.09)] text-xs text-[#5A5A5A]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="table-row-hover">
                  
                  {/* Timestamp */}
                  <td className="py-4 pr-4 font-mono whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  {/* Actor */}
                  <td className="py-4 px-4 font-serif text-[14px] font-bold text-[#1A1A1A]">
                    {log.actor}
                  </td>

                  {/* Action Description */}
                  <td className="py-4 px-4 text-[#1a1a1a] font-medium leading-relaxed">
                    {log.action}
                  </td>

                  {/* Severity Badge */}
                  <td className="py-4 px-4">
                    {log.severity === 'Critical' && (
                      <span className="badge-danger text-[9px] px-2 py-0.5 inline-flex items-center gap-1">
                        <AlertCircle size={10} />
                        Critical
                      </span>
                    )}
                    {log.severity === 'Warning' && (
                      <span className="badge-warning text-[9px] px-2 py-0.5 inline-flex items-center gap-1">
                        <AlertTriangle size={10} />
                        Warning
                      </span>
                    )}
                    {log.severity === 'Info' && (
                      <span className="text-slate-600 bg-slate-100 border border-slate-200 text-[9px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 uppercase tracking-wider font-bold">
                        <Info size={10} />
                        Info
                      </span>
                    )}
                  </td>

                  {/* IP Address */}
                  <td className="py-4 pl-4 font-mono text-[11px] text-[#9A9A9A]">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#9A9A9A]">
                    No audit records matching selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
