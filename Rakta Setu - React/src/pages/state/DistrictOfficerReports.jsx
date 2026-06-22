import React, { useState } from 'react';
import { useStateAdmin } from '../../context/StateAdminContext';

const DistrictOfficerReports = () => {
  const { appState, updateEscalationStatus } = useStateAdmin();
  const reports = appState.escalationReports || [];
  const [activeReport, setActiveReport] = useState(null);

  const pending = reports.filter(r => r.status === 'Pending Response').length;
  const inReview = reports.filter(r => r.status === 'In Review').length;
  const actionTaken = reports.filter(r => r.status === 'Action Taken').length;

  const getStatusBadge = (status) => {
    if (status === 'Pending Response') return 'badge-danger';
    if (status === 'In Review') return 'badge-warning';
    if (status === 'Action Taken') return 'badge-success';
    return 'badge-neutral';
  };

  const getBorderColor = (status) => {
    if (status === 'Pending Response') return 'rgba(190,31,46,0.2)';
    if (status === 'In Review') return '#FDE68A';
    if (status === 'Action Taken') return 'rgba(34,160,107,0.2)';
    return 'rgba(26,18,16,0.09)';
  };

  const getSeverityBadge = (severity) => {
    if (severity === 'Critical') return 'badge-danger';
    if (severity === 'Warning') return 'badge-warning';
    return 'badge-neutral';
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <section>
        <div className="inline-block badge-state mb-4">Escalation Review</div>
        <h1 className="font-serif text-[52px] md:text-[64px] italic leading-none mb-3 tracking-[-0.04em] text-[#1a1a1a]">
          District <span style={{ color: 'var(--state)' }}>Reports.</span>
        </h1>
        <p className="text-[16px] text-[#737373] max-w-xl leading-relaxed">
          Escalation reports filed by District Officers across Maharashtra. Review, respond, and authorize state-level interventions.
        </p>
      </section>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Response', value: pending, color: '#BE1F2E' },
          { label: 'In Review', value: inReview, color: '#D97706' },
          { label: 'Action Taken', value: actionTaken, color: '#22A06B' },
        ].map(s => (
          <div key={s.label} className="bg-white p-6 rounded-lg border border-[rgba(26,18,16,0.09)] text-center">
            <p className="text-[10px] font-[600] uppercase tracking-wider text-[#737373] mb-2">{s.label}</p>
            <p className="font-serif text-[44px] leading-none" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Report Cards */}
      <div className="space-y-4">
        {reports.map(report => {
          const isOpen = activeReport === report.id;
          return (
            <div
              key={report.id}
              className="bg-white border rounded-xl overflow-hidden transition-all"
              style={{ borderColor: getBorderColor(report.status) }}
            >
              {/* Accordion Header */}
              <button
                className="w-full p-6 text-left flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#faf8f5] transition-colors"
                onClick={() => setActiveReport(isOpen ? null : report.id)}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={getSeverityBadge(report.severity)} style={{ fontSize: 10 }}>{report.severity}</span>
                    <span className={getStatusBadge(report.status)} style={{ fontSize: 10 }}>{report.status}</span>
                    <span className="text-[12px] text-[#9A9A9A]">{report.district} — {report.officerName}</span>
                  </div>
                  <h4 className="font-[600] text-[16px] text-[#1A1A1A]">{report.title}</h4>
                  <p className="text-[13px] text-[#737373]">
                    {new Date(report.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span
                  className="material-symbols-outlined text-[#737373] shrink-0 transition-transform"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                >
                  expand_more
                </span>
              </button>

              {/* Expanded Detail */}
              {isOpen && (
                <div className="px-6 pb-6 space-y-5 border-t border-[rgba(26,18,16,0.06)]">
                  <div className="pt-4">
                    <p className="text-[11px] font-[600] uppercase tracking-wider text-[#737373] mb-2">Escalation Summary</p>
                    <p className="text-[14px] text-[#5A5A5A] leading-relaxed">{report.summary}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#f5f3f0] border border-[rgba(26,18,16,0.09)]">
                    <p className="text-[11px] font-[600] uppercase tracking-wider text-[#737373] mb-1">Requested Action</p>
                    <p className="text-[14px] font-[600] text-[#1A1A1A]">{report.requestedAction}</p>
                  </div>

                  {report.status !== 'Action Taken' && (
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => updateEscalationStatus(report.id, 'In Review')}
                        className="px-5 py-2 rounded-full text-[13px] font-[600] bg-[#f5f3f0] text-[#5A5A5A] hover:text-[#1A1A1A] hover:bg-[#eae8e5] transition-colors"
                      >
                        Mark In Review
                      </button>
                      <button
                        onClick={() => updateEscalationStatus(report.id, 'Action Taken')}
                        className="btn-state text-[13px]"
                        style={{ minHeight: 38, padding: '8px 20px', minWidth: 'auto' }}
                      >
                        Mark Action Taken
                      </button>
                    </div>
                  )}
                  {report.status === 'Action Taken' && (
                    <span className="flex items-center gap-1.5 text-[13px] font-[600] text-[#22A06B]">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      Action has been taken on this report.
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DistrictOfficerReports;
