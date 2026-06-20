import React, { useState } from 'react';
import { useStateAdmin } from '../../context/StateAdminContext';

const RECOMMENDATIONS = [
  {
    id: 1,
    district: 'Solapur',
    priority: 'Critical',
    type: 'Emergency Camp Budget',
    recommendation: 'Authorize ₹3.5L emergency budget for 2 O- targeted donation drives in Solapur. Current donor density: 1.4 per 10k (state avg: 4.8). Estimated yield: 85-100 units per camp.',
    estimatedImpact: '+170 O- units',
    timeline: '7 days',
    budgetINR: '3,50,000',
    aiConfidence: 94,
  },
  {
    id: 2,
    district: 'Latur',
    priority: 'Critical',
    type: 'Camp + Hospital Upgrade',
    recommendation: 'Authorize ₹4.2L combined budget: ₹2L for 2 AB- targeted camps in Latur city, ₹2.2L for inventory management software upgrade at Govt District Hospital Latur to reduce waste from 11.2% to target.',
    estimatedImpact: '+60 AB- units + waste ↓6%',
    timeline: '10 days',
    budgetINR: '4,20,000',
    aiConfidence: 88,
  },
  {
    id: 3,
    district: 'Akola',
    priority: 'High',
    type: 'Donor Activation Drive',
    recommendation: 'Authorize ₹1.8L for a 30-day door-to-door donor registration drive in Akola. Partner with Rotary Club Akola (existing network of 2,400 volunteers). Target: 400 new registered donors.',
    estimatedImpact: '+400 registered donors',
    timeline: '30 days',
    budgetINR: '1,80,000',
    aiConfidence: 79,
  },
  {
    id: 4,
    district: 'Nashik',
    priority: 'Medium',
    type: 'Camp Marketing Budget',
    recommendation: 'Authorize ₹2.5L for district-wide digital and local media campaign. Current camp attendance: 62% of target. Marketing package: social media, college partnerships, FM radio spots.',
    estimatedImpact: 'Camp attendance ↑40%',
    timeline: '14 days',
    budgetINR: '2,50,000',
    aiConfidence: 74,
  },
  {
    id: 5,
    district: 'Amravati',
    priority: 'Medium',
    type: 'System Audit',
    recommendation: 'Authorize ₹80K for independent waste audit at Amravati Govt Medical College blood bank. Waste at 6.3% for 3 consecutive months. Audit scope: cold chain management, forecasting, batch handling.',
    estimatedImpact: 'Waste ↓2-3%',
    timeline: '5 days',
    budgetINR: '80,000',
    aiConfidence: 83,
  },
  {
    id: 6,
    district: 'Buldhana',
    priority: 'Low',
    type: 'Donor Re-engagement',
    recommendation: 'Authorize ₹60K for WhatsApp + SMS re-activation campaign targeting lapsed donors (donated 1+ times but inactive >6 months). Estimated 240 lapsed donors in district.',
    estimatedImpact: '+60-80 reactivated donors',
    timeline: '10 days',
    budgetINR: '60,000',
    aiConfidence: 68,
  },
];

const PRIORITY_BADGES = {
  Critical: 'badge-danger',
  High: 'badge-state',
  Medium: 'badge-warning',
  Low: 'badge-success',
};

const PRIORITY_CARD_BORDERS = {
  Critical: 'rgba(190,31,46,0.15)',
  High: 'rgba(107,33,168,0.15)',
  Medium: 'rgba(224,123,0,0.15)',
  Low: 'rgba(34,160,107,0.15)',
};

const FundingRecommendations = () => {
  const [approved, setApproved] = useState(new Set());
  const [dismissed, setDismissed] = useState(new Set());

  const totalBudget = RECOMMENDATIONS.reduce((s, r) => s + parseInt(r.budgetINR.replace(/,/g, '')), 0);
  const approvedBudget = RECOMMENDATIONS
    .filter(r => approved.has(r.id))
    .reduce((s, r) => s + parseInt(r.budgetINR.replace(/,/g, '')), 0);

  const toggleApprove = (id) => {
    setApproved(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleDismiss = (id) => {
    setDismissed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-8 state-page-enter" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <section>
        <div className="inline-block badge-state mb-4">Maharashtra State Health</div>
        <h1 className="font-serif text-[58px] md:text-[76px] italic leading-none mb-4 tracking-[-0.04em] text-[#1a1a1a]">
          Funding <span style={{ color: 'var(--state)' }}>Recommendations.</span>
        </h1>
        <p className="text-[18px] text-[#737373] max-w-xl leading-relaxed">
          AI-generated district-level intervention funding suggestions. Prioritized by impact and shortage severity.
        </p>
      </section>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-[rgba(26,18,16,0.09)]">
          <p className="text-[10px] font-[600] uppercase tracking-wider text-[#737373] mb-2">Total Recommended</p>
          <p className="font-serif text-[36px] leading-none" style={{ color: 'var(--state)' }}>
            ₹{(totalBudget / 100000).toFixed(1)}L
          </p>
          <p className="text-[11px] text-[#737373] mt-1.5">Across {RECOMMENDATIONS.length} districts</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-[rgba(26,18,16,0.09)]">
          <p className="text-[10px] font-[600] uppercase tracking-wider text-[#737373] mb-2">Approved by You</p>
          <p className="font-serif text-[36px] leading-none text-[#22A06B]">
            ₹{(approvedBudget / 100000).toFixed(1)}L
          </p>
          <p className="text-[11px] text-[#22A06B] mt-1.5 font-[500]">{approved.size} recommendations</p>
        </div>
        <div className="bg-[#1a1210] p-6 rounded-lg text-white">
          <p className="text-[10px] font-[600] uppercase tracking-wider text-white/60 mb-2">AI Confidence</p>
          <p className="font-serif text-[36px] leading-none text-white">
            {Math.round(RECOMMENDATIONS.filter(r => !dismissed.has(r.id)).reduce((s, r) => s + r.aiConfidence, 0) / Math.max(RECOMMENDATIONS.filter(r => !dismissed.has(r.id)).length, 1))}%
          </p>
          <p className="text-[11px] text-white/50 mt-1.5 font-[500]">Average recommendation confidence</p>
        </div>
      </div>

      {/* Recommendation Cards */}
      <div className="space-y-4">
        {RECOMMENDATIONS.filter(r => !dismissed.has(r.id)).map(rec => {
          const badgeClass = PRIORITY_BADGES[rec.priority];
          const borderStyle = PRIORITY_CARD_BORDERS[rec.priority];
          const isApproved = approved.has(rec.id);
          return (
            <div
              key={rec.id}
              className="bg-white border rounded-xl p-6 transition-all duration-350 hover:shadow-md"
              style={{ borderColor: isApproved ? '#22A06B' : borderStyle }}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={badgeClass}>
                      {rec.priority}
                    </span>
                    <span className="text-[14px] font-[600] text-[#1A1A1A]">{rec.district}</span>
                    <span className="text-[12px] text-[#5A5A5A] bg-[#f5f3f0] px-2.5 py-0.5 rounded font-[500]">{rec.type}</span>
                  </div>
                  <p className="text-[14px] text-[#5A5A5A] leading-relaxed font-[500]">{rec.recommendation}</p>
                  <div className="flex flex-wrap gap-4 text-[12px]">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-[#737373]">trending_up</span>
                      <span className="font-[600] text-[#1A1A1A]">{rec.estimatedImpact}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-[#737373]">schedule</span>
                      <span className="text-[#737373]">{rec.timeline}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-[#737373]">psychology</span>
                      <span className="text-[#737373]">AI Confidence: <span className="font-[600] text-[#1A1A1A]">{rec.aiConfidence}%</span></span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] font-[600] uppercase tracking-wider text-[#737373] mb-0.5">Budget</p>
                    <p className="font-serif text-[28px] leading-none" style={{ color: 'var(--state)' }}>₹{rec.budgetINR}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleDismiss(rec.id)}
                      className="px-4 py-2 rounded-full text-[12px] font-[600] border border-[#E0DAD4] text-[#5A5A5A] hover:bg-[#f5f3f0] transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => toggleApprove(rec.id)}
                      className="px-5 py-2 rounded-full text-[12px] font-[600] text-white transition-all"
                      style={{ 
                        backgroundColor: isApproved ? '#22A06B' : 'var(--state)',
                        boxShadow: isApproved ? '0 4px 12px rgba(34, 160, 107, 0.2)' : 'none'
                      }}
                    >
                      {isApproved ? '✓ Approved' : 'Approve'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FundingRecommendations;
