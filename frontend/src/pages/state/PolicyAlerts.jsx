import { useState } from 'react';
import { useStateAdmin } from '../../context/StateAdminContext';

const PolicyAlerts = () => {
  const { appState, resolveAlert } = useStateAdmin();
  const alerts = appState.policyAlerts || [];
  const [filter, setFilter] = useState('Active');

  const displayed = filter === 'All' ? alerts
    : filter === 'Active' ? alerts.filter(a => a.status === 'Active')
    : alerts.filter(a => a.status === 'Resolved');

  const critical = alerts.filter(a => a.severity === 'Critical' && a.status === 'Active').length;
  const warning = alerts.filter(a => a.severity === 'Warning' && a.status === 'Active').length;
  const resolved = alerts.filter(a => a.status === 'Resolved').length;

  const getSeverityBadge = (alert) => {
    if (alert.status === 'Resolved') return 'badge-success';
    if (alert.severity === 'Critical') return 'badge-danger';
    return 'badge-warning';
  };

  const getDotColor = (alert) => {
    if (alert.status === 'Resolved') return '#22A06B';
    if (alert.severity === 'Critical') return '#BE1F2E';
    return '#D97706';
  };

  const getBorderColor = (alert) => {
    if (alert.status === 'Resolved') return 'rgba(34,160,107,0.2)';
    if (alert.severity === 'Critical') return 'rgba(190,31,46,0.2)';
    return '#FDE68A';
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <section>
        <div className="inline-block badge-state mb-4">State Policy</div>
        <h1 className="font-serif text-[52px] md:text-[64px] italic leading-none mb-3 tracking-[-0.04em] text-[#1a1a1a]">
          Policy <span style={{ color: 'var(--state)' }}>Alerts.</span>
        </h1>
        <p className="text-[16px] text-[#737373] max-w-xl leading-relaxed">
          Automated alerts when any district breaches state health policy thresholds. Acknowledge, escalate to Ministry, or resolve.
        </p>
      </section>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-[rgba(26,18,16,0.09)] text-center">
          <p className="text-[10px] font-[600] uppercase tracking-wider text-[#737373] mb-2">Critical</p>
          <p className="font-serif text-[44px] leading-none text-[#BE1F2E]">{critical}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-[rgba(26,18,16,0.09)] text-center">
          <p className="text-[10px] font-[600] uppercase tracking-wider text-[#737373] mb-2">Warning</p>
          <p className="font-serif text-[44px] leading-none text-[#D97706]">{warning}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-[rgba(26,18,16,0.09)] text-center">
          <p className="text-[10px] font-[600] uppercase tracking-wider text-[#737373] mb-2">Resolved</p>
          <p className="font-serif text-[44px] leading-none text-[#22A06B]">{resolved}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['Active', 'Resolved', 'All'].map(f => (
          <button type="button"
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-[600] transition-all ${
              filter === f ? 'text-white' : 'bg-[#f5f3f0] text-[#5A5A5A]'
            }`}
            style={filter === f ? { backgroundColor: 'var(--state)' } : {}}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {displayed.length === 0 && (
          <div className="bg-white p-10 rounded-lg border border-[rgba(26,18,16,0.09)] text-center text-[#9A9A9A]">
            No alerts in this category.
          </div>
        )}
        {displayed.map(alert => (
          <div
            key={alert.id}
            className="bg-white border rounded-xl p-6 transition-all"
            style={{ borderColor: getBorderColor(alert) }}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: getDotColor(alert) }} />
                  <span className={getSeverityBadge(alert)} style={{ fontSize: 10 }}>
                    {alert.status === 'Resolved' ? 'Resolved' : alert.severity}
                  </span>
                  <span className="text-[12px] text-[#9A9A9A]">{alert.district} District</span>
                  <span className="text-[12px] text-[#9A9A9A]">
                    {new Date(alert.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="font-[600] text-[16px] text-[#1A1A1A]">{alert.type}</h4>
                <p className="text-[14px] text-[#5A5A5A] leading-relaxed">{alert.message}</p>
              </div>

              {alert.status === 'Active' && (
                <div className="flex flex-col gap-2 shrink-0">
                  <button type="button"
                    onClick={() => resolveAlert(alert.id)}
                    className="btn-state text-[12px]"
                    style={{ minHeight: 36, padding: '8px 16px', minWidth: 'auto' }}
                  >
                    Acknowledge
                  </button>
                  <button type="button"
                    onClick={() => window.alert('Escalation report sent to Maharashtra Health Ministry.')}
                    className="px-4 py-2 rounded-full text-[12px] font-[600] text-[#BE1F2E] border border-[rgba(190,31,46,0.3)] hover:bg-[rgba(190,31,46,0.04)] transition-colors"
                  >
                    Escalate to Ministry
                  </button>
                </div>
              )}
              {alert.status === 'Resolved' && (
                <span className="shrink-0 flex items-center gap-1.5 text-[13px] font-[600] text-[#22A06B]">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Resolved
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PolicyAlerts;
