import React, { useState } from 'react';
import { useStateAdmin } from '../../context/StateAdminContext';

const CrossDistrictTransfers = () => {
  const { appState, approveTransfer } = useStateAdmin();
  const transfers = appState.transfers || [];
  const [filter, setFilter] = useState('All');

  const statuses = ['All', 'Pending Approval', 'In Transit', 'Completed'];
  const filtered = filter === 'All' ? transfers : transfers.filter(t => t.status === filter);

  const statusBadge = (status) => {
    if (status === 'In Transit') return 'badge-state';
    if (status === 'Pending Approval') return 'badge-warning';
    if (status === 'Completed') return 'badge-success';
    return 'badge-neutral';
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <section>
        <div className="inline-block badge-state mb-4">State Logistics</div>
        <h1 className="font-serif text-[52px] md:text-[64px] italic leading-none mb-3 tracking-[-0.04em] text-[#1a1a1a]">
          Cross-District <span style={{ color: 'var(--state)' }}>Transfers.</span>
        </h1>
        <p className="text-[16px] text-[#737373] max-w-xl leading-relaxed">
          State-ordered and AI-triggered blood transfers between Maharashtra districts. Approve, track, and close inter-district movements.
        </p>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Transfers', value: transfers.length },
          { label: 'Pending Approval', value: transfers.filter(t => t.status === 'Pending Approval').length },
          { label: 'In Transit', value: transfers.filter(t => t.status === 'In Transit').length },
          { label: 'Completed', value: transfers.filter(t => t.status === 'Completed').length },
        ].map(s => (
          <div key={s.label} className="bg-white p-6 rounded-lg border border-[rgba(26,18,16,0.09)]">
            <p className="text-[10px] font-[600] uppercase tracking-wider text-[#737373] mb-2">{s.label}</p>
            <p className="font-serif text-[40px] leading-none" style={{ color: 'var(--state)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs + Table */}
      <div className="bg-white rounded-lg border border-[rgba(26,18,16,0.09)] overflow-hidden">
        <div className="p-5 border-b border-[rgba(26,18,16,0.09)] flex flex-wrap gap-2">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-[600] transition-all ${
                filter === s ? 'text-white' : 'bg-[#f5f3f0] text-[#5A5A5A]'
              }`}
              style={filter === s ? { backgroundColor: 'var(--state)' } : {}}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="divide-y divide-[rgba(26,18,16,0.06)]">
          {filtered.length === 0 && (
            <p className="text-center text-[13px] text-[#9A9A9A] py-10">No transfers found.</p>
          )}
          {filtered.map(t => (
            <div key={t.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#faf8f5] transition-colors">
              <div className="flex items-center gap-4">
                {/* Blood group badge */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-white text-[15px] shrink-0"
                  style={{ backgroundColor: 'var(--state)' }}
                >
                  {t.bloodGroup}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-[600] text-[16px] text-[#1A1A1A]">{t.from}</span>
                    <span className="material-symbols-outlined text-[18px] text-[#737373]">arrow_forward</span>
                    <span className="font-[600] text-[16px] text-[#1A1A1A]">{t.to}</span>
                    <span className={statusBadge(t.status)} style={{ fontSize: 10 }}>{t.status}</span>
                  </div>
                  <p className="text-[13px] text-[#737373]">
                    <span className="font-[600] text-[#1A1A1A]">{t.units} units</span> · {t.reason}
                  </p>
                  <p className="text-[11px] text-[#9A9A9A]">
                    Initiated by: {t.initiatedBy} · {t.date}
                  </p>
                </div>
              </div>

              {t.status === 'Pending Approval' && (
                <button
                  onClick={() => approveTransfer(t.id)}
                  className="shrink-0 btn-state text-[13px]"
                  style={{ minHeight: 38, padding: '8px 20px', minWidth: 'auto' }}
                >
                  Approve Transfer
                </button>
              )}
              {t.status === 'Completed' && (
                <span className="shrink-0 flex items-center gap-1.5 text-[13px] font-[600] text-[#22A06B]">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Completed
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Insight dark panel */}
      <div className="bg-[#1a1210] p-8 rounded-lg text-white">
        <span className="material-symbols-outlined text-[28px] mb-3 block" style={{ color: '#c4b5fd' }}>route</span>
        <h4 className="text-[20px] font-[500] italic mb-3">AI Transfer Recommendations</h4>
        <div className="space-y-3 text-white/70 text-[14px] leading-relaxed">
          <p>• <strong className="text-white">Latur ← Mumbai</strong> — Transfer 18 units of AB- from Mumbai's surplus. Estimated arrival: 3.5 hours by road.</p>
          <p>• <strong className="text-white">Akola ← Nagpur</strong> — O+ surplus at Nagpur (63 units). 15-unit transfer recommended before expiry risk in 5 days.</p>
          <p>• <strong className="text-white">Dhule ← Nashik</strong> — B- stock critically low at Dhule (3 units). Nashik has 11 units available.</p>
        </div>
      </div>
    </div>
  );
};

export default CrossDistrictTransfers;
