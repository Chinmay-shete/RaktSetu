import { useState } from 'react';
import { useDistrict } from '../../context/DistrictContext';
import { CheckCircle, AlertTriangle, Radio } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

const DistrictAlerts = () => {
  const { appState, resolveAlert } = useDistrict();
  const alerts = appState.alerts || [];

  const [filter, setFilter] = useState('Active');
  const [resolvedId, setResolvedId] = useState(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const activeAlerts = alerts.filter(a => a.status === 'Active');
  const resolvedAlerts = alerts.filter(a => a.status === 'Resolved');
  const displayed = filter === 'Active' ? activeAlerts : resolvedAlerts;

  const handleResolve = (id) => {
    setResolvedId(id);
    setTimeout(() => { resolveAlert(id); setResolvedId(null); }, 600);
  };

  const handleBroadcast = (alert) => {
    window.alert(`📢 Emergency camp alert broadcast sent to all registered donors in ${alert.hospitalName} area for ${alert.bloodGroup} blood group.`);
  };

  const handleEscalate = (alert) => {
    window.alert(`🚨 Escalation report sent to Maharashtra State Health Department for ${alert.bloodGroup} shortage at ${alert.hospitalName}. Response expected within 2 hours.`);
  };

  const handleDistrictBroadcast = () => {
    window.alert(`📢 District-wide emergency broadcast sent to all registered hospitals!`);
    setShowBroadcastModal(false);
  };

  const criticalCount = activeAlerts.filter(a => a.severity === 'Critical').length;
  const warningCount = activeAlerts.filter(a => a.severity === 'Warning').length;
  const watchCount = activeAlerts.filter(a => a.severity === 'Watch').length;

  return (
    <div className="space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <section className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-serif text-[60px] md:text-[80px] italic leading-none mb-4 tracking-[-0.04em] text-[#1a1a1a]">
            Shortage <span className="text-[#BE1F2E]">Alerts.</span>
          </h1>
          <p className="text-[18px] text-[#737373] max-w-2xl leading-[28px]">
            District-wide shortage alerts. Act proactively before hospitals run critically low.
          </p>
        </div>
        
        <button type="button" 
          onClick={() => setShowBroadcastModal(true)}
          className="btn-primary shrink-0 flex items-center gap-2 bg-[#1A1210] hover:bg-[#BE1F2E] text-white px-6 py-3.5 rounded-full font-bold shadow-lg shadow-[#1A1210]/10 transition-all hover:-translate-y-0.5"
        >
          <Radio size={18} />
          Emergency Broadcast
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">

          {/* Tab Filter */}
          <div className="flex gap-3">
            {['Active', 'Resolved'].map(tab => (
              <button type="button"
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-6 py-2.5 rounded-full text-[13px] font-[600] transition-all ${
                  filter === tab
                    ? 'bg-[#BE1F2E] text-white'
                    : 'bg-white border border-[rgba(26,18,16,0.09)] text-[#5A5A5A] hover:text-[#BE1F2E]'
                }`}
              >
                {tab} ({tab === 'Active' ? activeAlerts.length : resolvedAlerts.length})
              </button>
            ))}
          </div>

          {/* Alert Cards */}
          <div className="space-y-4">
            {displayed.length === 0 && (
              <div className="bg-white rounded-lg border border-[rgba(26,18,16,0.09)] p-12 text-center">
                <CheckCircle size={40} className="text-[#22A06B] mx-auto mb-4" />
                <p className="font-serif text-[24px] italic text-[#1a1a1a]">All clear!</p>
                <p className="text-[14px] text-[#737373] mt-2">No {filter.toLowerCase()} alerts at this time.</p>
              </div>
            )}

            {displayed.map(alert => {
              const isCritical = alert.severity === 'Critical';
              const isBeingResolved = resolvedId === alert.id;

              return (
                <div
                  key={alert.id}
                  className={`bg-white rounded-lg border border-[rgba(26,18,16,0.09)] overflow-hidden transition-all ${
                    isBeingResolved ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Blood group badge */}
                        <div className="bg-[#BE1F2E] text-white w-14 h-14 flex items-center justify-center rounded font-bold text-xl shrink-0">
                          {alert.bloodGroup}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                              isCritical ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#eae8e5] text-[#685c59]'
                            }`}>
                              {alert.severity}
                            </span>
                            <span className="text-[11px] text-[#9A9A9A]">{alert.time}</span>
                          </div>
                          <h3 className="font-[600] text-[18px] text-[#1a1a1a]">{alert.hospitalName}</h3>
                          <p className="text-[13px] text-[#737373]">
                            <span className="font-semibold text-[#1a1a1a]">{alert.units} units</span> remaining ·
                            Depletes: <span className="font-semibold text-[#BE1F2E]">{alert.predictedDepleted}</span>
                          </p>
                        </div>
                      </div>

                      {alert.status === 'Active' && (
                        <div className="flex flex-col gap-2 shrink-0">
                          <button type="button"
                            onClick={() => handleBroadcast(alert)}
                            className="bg-[#1a1210] text-white px-5 py-2.5 rounded-full text-[13px] font-[500] hover:scale-105 active:scale-95 transition-transform whitespace-nowrap"
                          >
                            Broadcast Alert
                          </button>
                          {isCritical && (
                            <button type="button"
                              onClick={() => handleEscalate(alert)}
                              className="border border-[#BE1F2E] text-[#BE1F2E] px-5 py-2.5 rounded-full text-[13px] font-[500] hover:bg-[rgba(190,31,46,0.04)] transition-colors whitespace-nowrap"
                            >
                              Escalate to State
                            </button>
                          )}
                          <button type="button"
                            onClick={() => handleResolve(alert.id)}
                            className="border border-[rgba(26,18,16,0.09)] text-[#737373] px-5 py-2.5 rounded-full text-[13px] font-[500] hover:bg-[#f5f3f0] transition-colors whitespace-nowrap"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      )}

                      {alert.status === 'Resolved' && (
                        <div className="flex items-center gap-2 text-[#22A06B] text-[13px] font-semibold shrink-0">
                          <CheckCircle size={16} />
                          Resolved
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">

          {/* Summary */}
          <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-lg p-8">
            <div className="flex items-center gap-3 text-[#BE1F2E] mb-6">
              <span className="material-symbols-outlined text-[24px]">bar_chart</span>
              <h3 className="text-[24px] font-[500] italic">Summary</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Critical', count: criticalCount, style: 'bg-[#ffdad6] text-[#93000a]' },
                { label: 'Warning', count: warningCount, style: 'bg-[#eae8e5] text-[#685c59]' },
                { label: 'Watch', count: watchCount, style: 'bg-[#f5f3f0] text-[#737373]' },
              ].map(({ label, count, style }) => (
                <div key={label} className="flex items-center justify-between p-4 bg-[#f5f3f0] rounded-lg">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${style}`}>{label}</span>
                  <span className="font-serif text-[28px] text-[#BE1F2E]">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-[#1a1210] p-8 rounded-lg text-white relative overflow-hidden">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-[#BE1F2E] text-[32px] mb-4">insights</span>
              <h4 className="text-[24px] font-[500] mb-4 italic">AI Alert Insight</h4>
              <div className="space-y-4 text-white/70 text-[14px] leading-relaxed mb-6">
                <p>• <strong className="text-white">O- at KEM</strong> will reach zero by tomorrow. Schedule emergency camp today.</p>
                <p>• <strong className="text-white">AB- system-wide</strong> — Only 31 units across 8 hospitals. Cross-hospital transfer recommended.</p>
                <p>• <strong className="text-white">Poona Hospital</strong> has 2 active critical alerts. Contact blood bank director directly.</p>
              </div>
              <a
                href="/district/camps"
                className="inline-flex items-center gap-2 text-[#BE1F2E] text-[14px] font-[500] group hover:underline cursor-pointer"
              >
                Plan a camp now
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
              </a>
            </div>
          </div>

        </aside>
      </div>

      <Modal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        title="District-Wide Broadcast"
      >
        <div className="flex flex-col gap-4">
          <div className="bg-[#ffdad6] p-4 rounded-xl flex items-start gap-3 border border-[#93000a]/20">
            <AlertTriangle className="text-[#93000a] shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-bold text-[#93000a] text-sm mb-1">Warning: High Priority Action</h4>
              <p className="text-xs text-[#93000a]/80 leading-relaxed">
                This will trigger an immediate emergency notification to the administrators of all registered hospitals within your district. 
                Use this strictly for severe, multi-hospital shortages or mass-casualty events.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5 mt-2">
            <label htmlFor="broadcast-message-1" className="text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block">Broadcast Message</label>
            <textarea id="broadcast-message-1" 
              rows={4}
              placeholder="E.g., CRITICAL SHORTAGE: O- blood urgently required across district. All hospitals report immediate inventory status."
              className="input-field resize-none"
            ></textarea>
          </div>

          <div className="flex gap-3 mt-4 border-t border-[#EDE7E1] pt-4">
            <button type="button"
              onClick={() => setShowBroadcastModal(false)}
              className="w-1/2 px-4 py-3 rounded-full border border-[#EDE7E1] text-[13px] font-bold text-[#5A5A5A] hover:bg-[#FAF8F5] transition-colors"
            >
              Cancel
            </button>
            <button type="button"
              onClick={handleDistrictBroadcast}
              className="w-1/2 px-4 py-3 rounded-full bg-[#BE1F2E] hover:bg-[#9E1825] text-white text-[13px] font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Radio size={16} />
              Send Broadcast
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DistrictAlerts;
