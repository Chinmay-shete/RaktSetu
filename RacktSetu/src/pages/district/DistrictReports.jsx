import React, { useState } from 'react';
import { useDistrict } from '../../context/DistrictContext';
import { CheckCircle } from 'lucide-react';

const REPORTS = [
  {
    id: 1,
    title: 'Monthly Blood Health Summary',
    desc: 'Total bags stocked, units transfused, waste percentage, and critical events across all district hospitals.',
    format: 'PDF',
    lastGenerated: 'June 15, 2026',
    icon: 'analytics',
    stats: [{ label: 'Total Bags', value: '1,284' }, { label: 'Waste %', value: '6.2%' }, { label: 'Critical Events', value: '4' }],
  },
  {
    id: 2,
    title: 'Shortage Prediction Report',
    desc: 'AI-generated 7-day forecast of blood group shortages per hospital across the district.',
    format: 'PDF',
    lastGenerated: 'June 18, 2026',
    icon: 'trending_down',
    stats: [{ label: 'Hospitals at Risk', value: '3' }, { label: 'Forecasted Shortages', value: '6' }, { label: 'AI Confidence', value: '87%' }],
  },
  {
    id: 3,
    title: 'Donor Density Map',
    desc: 'Blood group donor distribution per pincode — identifies underserved areas for targeted camp planning.',
    format: 'CSV',
    lastGenerated: 'June 10, 2026',
    icon: 'person_pin',
    stats: [{ label: 'Active Donors', value: '8,432' }, { label: 'Pincodes', value: '47' }, { label: 'Rare Donors', value: '312' }],
  },
  {
    id: 4,
    title: 'Camp Activity Log',
    desc: 'Record of all donation camps held this quarter — units collected, areas covered, donor turnout.',
    format: 'CSV',
    lastGenerated: 'June 17, 2026',
    icon: 'volunteer_activism',
    stats: [{ label: 'Camps Held', value: '12' }, { label: 'Units Collected', value: '2,840' }, { label: 'Avg Donors', value: '186' }],
  },
  {
    id: 5,
    title: 'Hospital Compliance Report',
    desc: 'Tracks which hospitals updated blood stock data regularly, flagging inactive or delayed entries.',
    format: 'PDF',
    lastGenerated: 'June 14, 2026',
    icon: 'fact_check',
    stats: [{ label: 'Compliant', value: '6/8' }, { label: 'Delayed', value: '2' }, { label: 'Last Sync', value: '20 mins' }],
  },
  {
    id: 6,
    title: 'Cross-District Transfer Log',
    desc: 'Record of all blood transfers between Pune District hospitals and neighboring districts.',
    format: 'PDF',
    lastGenerated: 'June 12, 2026',
    icon: 'local_shipping',
    stats: [{ label: 'Transfers', value: '23' }, { label: 'Units Moved', value: '487' }, { label: 'Success Rate', value: '96%' }],
  },
];

const DistrictReports = () => {
  const { appState } = useDistrict();
  const hospitals = appState.hospitals || [];
  const [downloadedId, setDownloadedId] = useState(null);

  const totalBags = hospitals.reduce((sum, h) => sum + Object.values(h.stock).reduce((a, b) => a + b, 0), 0);

  const handleDownload = (report) => {
    setDownloadedId(report.id);
    setTimeout(() => {
      setDownloadedId(null);
      window.alert(`✅ "${report.title}" has been generated and downloaded as ${report.format}.`);
    }, 1200);
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <section className="mb-12">
        <h1 className="font-serif text-[60px] md:text-[80px] italic leading-none mb-4 tracking-[-0.04em] text-[#1a1a1a]">
          District <span className="text-[#BE1F2E]">Reports.</span>
        </h1>
        <p className="text-[18px] text-[#737373] max-w-2xl leading-[28px]">
          Export district-level analytics for government records, NHM submissions, and policy decisions.
        </p>
      </section>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Bags', value: totalBags.toLocaleString() },
          { label: 'Hospitals', value: hospitals.length },
          { label: 'Camps This Month', value: '12' },
          { label: 'Avg Waste %', value: '6.2%' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)] relative overflow-hidden group">
            <p className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-4">{stat.label}</p>
            <h2 className="font-serif text-[48px] leading-none text-[#BE1F2E]">{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORTS.map(report => {
          const isDownloading = downloadedId === report.id;
          return (
            <div key={report.id} className="bg-white rounded-lg border border-[rgba(26,18,16,0.09)] p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all">
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(190,31,46,0.08)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#BE1F2E] text-[24px]">{report.icon}</span>
                  </div>
                  <span className="bg-[rgba(190,31,46,0.08)] text-[#BE1F2E] px-3 py-1 rounded-full text-[12px] font-[600] uppercase">
                    {report.format}
                  </span>
                </div>
                <h3 className="text-[18px] font-[500] text-[#1a1a1a] mb-2 leading-tight">{report.title}</h3>
                <p className="text-[14px] text-[#737373] leading-[1.6] mb-4">{report.desc}</p>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {report.stats.map(stat => (
                    <div key={stat.label} className="bg-[#f5f3f0] rounded p-2 text-center">
                      <p className="font-[700] text-[14px] text-[#1a1a1a]">{stat.value}</p>
                      <p className="text-[10px] text-[#9A9A9A] leading-tight mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-[#9A9A9A] mb-6">
                  Last generated: <span className="font-semibold text-[#5A5A5A]">{report.lastGenerated}</span>
                </p>
              </div>

              <button
                onClick={() => handleDownload(report)}
                disabled={isDownloading}
                className={`w-full py-3 rounded-full text-[13px] font-[500] transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
                  isDownloading ? 'bg-[#22A06B] text-white' : 'bg-[#1a1210] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{isDownloading ? 'check_circle' : 'download'}</span>
                {isDownloading ? 'Generating…' : `Download ${report.format}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Submission Guidelines */}
      <div className="bg-[#1a1210] rounded-lg p-8 text-white">
        <div className="relative z-10">
          <span className="material-symbols-outlined text-[#BE1F2E] text-[32px] mb-4">policy</span>
          <h4 className="text-[24px] font-[500] mb-4 italic">Report Submission Guidelines</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[14px] text-white/70">
            <div>
              <p className="text-white font-semibold mb-2">Monthly Submission</p>
              <p>Monthly Blood Health Summary must be submitted to the Maharashtra State Health Department by the 5th of each month.</p>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">NHM Reporting</p>
              <p>Quarterly reports are required for National Health Mission (NHM) grant eligibility and blood bank license renewal.</p>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">NBTC Compliance</p>
              <p>All data formatted to meet National Blood Transfusion Council (NBTC) reporting standards for government records.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistrictReports;
