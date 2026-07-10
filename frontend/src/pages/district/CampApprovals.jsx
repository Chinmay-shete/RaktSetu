import React, { useState } from 'react';
import { useDistrict } from '../../context/DistrictContext';
import { CheckCircle, XCircle } from 'lucide-react';

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const CampApprovals = () => {
  const { appState, approveCamp, rejectCamp, addCamp } = useDistrict();
  const camps = appState.camps || [];
  const hospitals = appState.hospitals || [];

  const [activeTab, setActiveTab] = useState('list');
  const [formData, setFormData] = useState({
    name: '', location: '', date: '', organizer: '', capacity: '', expectedDonors: '', bloodGroups: [], notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const pendingCamps = camps.filter(c => c.status === 'Pending');
  const approvedCamps = camps.filter(c => c.status === 'Approved');

  const toggleBloodGroup = (group) => {
    setFormData(prev => ({
      ...prev,
      bloodGroups: prev.bloodGroups.includes(group)
        ? prev.bloodGroups.filter(g => g !== group)
        : [...prev.bloodGroups, group],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.date || !formData.organizer) return;
    addCamp({ ...formData, capacity: Number(formData.capacity), expectedDonors: Number(formData.expectedDonors) });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', location: '', date: '', organizer: '', capacity: '', expectedDonors: '', bloodGroups: [], notes: '' });
      setActiveTab('list');
    }, 2000);
  };

  const statusStyle = {
    Approved: 'bg-[rgba(34,160,107,0.1)] text-[#22A06B]',
    Pending:  'bg-[#eae8e5] text-[#685c59]',
    Rejected: 'bg-[#ffdad6] text-[#93000a]',
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <section className="mb-12">
        <h1 className="font-serif text-[60px] md:text-[80px] italic leading-none mb-4 tracking-[-0.04em] text-[#1a1a1a]">
          Camp <span className="text-[#BE1F2E]">Approvals.</span>
        </h1>
        <p className="text-[18px] text-[#737373] max-w-2xl leading-[28px]">
          Manage and plan donation camps. Approve hospital requests or schedule new ones to prevent shortages.
        </p>
      </section>

      {/* Tab Bar */}
      <div className="flex gap-3">
        <button type="button"
          onClick={() => setActiveTab('list')}
          className={`px-6 py-2.5 rounded-full text-[13px] font-[600] transition-all ${activeTab === 'list' ? 'bg-[#BE1F2E] text-white' : 'bg-white border border-[rgba(26,18,16,0.09)] text-[#5A5A5A] hover:text-[#BE1F2E]'}`}
        >
          Camp List ({camps.length})
        </button>
        <button type="button"
          onClick={() => setActiveTab('plan')}
          className={`px-6 py-2.5 rounded-full text-[13px] font-[600] transition-all ${activeTab === 'plan' ? 'bg-[#BE1F2E] text-white' : 'bg-white border border-[rgba(26,18,16,0.09)] text-[#5A5A5A] hover:text-[#BE1F2E]'}`}
        >
          + Plan New Camp
        </button>
      </div>

      {activeTab === 'list' && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Pending Review', value: pendingCamps.length },
              { label: 'Approved', value: approvedCamps.length },
              { label: 'Total Camps', value: camps.length },
            ].map(stat => (
              <div key={stat.label} className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)] relative overflow-hidden group">
                <p className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-4">{stat.label}</p>
                <h2 className="font-serif text-[60px] leading-[54px] text-[#BE1F2E]">{stat.value}</h2>
              </div>
            ))}
          </div>

          {/* Camp Cards */}
          <div className="space-y-5">
            {camps.map(camp => (
              <div key={camp.id} className="bg-white rounded-lg border border-[rgba(26,18,16,0.09)] overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${statusStyle[camp.status] || statusStyle.Pending}`}>
                          {camp.status}
                        </span>
                      </div>
                      <h3 className="text-[18px] font-[500] mb-2">{camp.name}</h3>
                      <div className="space-y-1 text-[13px] text-[#737373]">
                        <p className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {camp.location}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {new Date(camp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px]">group</span>
                          Expected {camp.expectedDonors} donors · Capacity {camp.capacity}
                        </p>
                        <p>Organized by: <span className="font-semibold text-[#1A1A1A]">{camp.organizer}</span></p>
                      </div>
                      {camp.bloodGroups && camp.bloodGroups.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {camp.bloodGroups.map(g => (
                            <span key={g} className="bg-[rgba(190,31,46,0.08)] text-[#BE1F2E] px-3 py-1 rounded-full text-[12px] font-[600] uppercase">
                              {g}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {camp.status === 'Pending' && (
                      <div className="flex gap-3 shrink-0">
                        <button type="button"
                          onClick={() => approveCamp(camp.id)}
                          className="bg-[#1a1210] text-white px-6 py-2.5 rounded-full text-[13px] font-[500] hover:scale-105 active:scale-95 transition-transform"
                        >
                          Approve
                        </button>
                        <button type="button"
                          onClick={() => rejectCamp(camp.id)}
                          className="border border-[rgba(26,18,16,0.09)] text-[#5A5A5A] px-6 py-2.5 rounded-full text-[13px] font-[500] hover:bg-[#f5f3f0] transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {submitted ? (
              <div className="bg-white rounded-lg border border-[rgba(26,18,16,0.09)] p-12 text-center">
                <CheckCircle size={48} className="text-[#22A06B] mx-auto mb-4" />
                <h3 className="font-serif text-[28px] italic text-[#1a1a1a] mb-2">Camp Request Submitted!</h3>
                <p className="text-[14px] text-[#737373]">Added to the pending review queue. Redirecting…</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-[rgba(26,18,16,0.09)] p-8">
                <h2 className="text-[24px] font-[500] italic mb-6">Plan a New Donation Camp</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="camp-name-1" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Camp Name</label>
                      <input id="camp-name-1" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="e.g. Kothrud Community Camp" required />
                    </div>
                    <div>
                      <label htmlFor="date-2" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Date</label>
                      <input id="date-2" type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} className="input-field" required />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="location-address-3" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Location / Address</label>
                    <input id="location-address-3" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} className="input-field" placeholder="Venue name, area, Pune" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="organizing-hospital-4" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Organizing Hospital</label>
                      <select id="organizing-hospital-4" value={formData.organizer} onChange={e => setFormData(p => ({ ...p, organizer: e.target.value }))} className="input-field custom-select" required>
                        <option value="">Select hospital…</option>
                        {hospitals.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="donor-capacity-5" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Donor Capacity</label>
                      <input id="donor-capacity-5" type="number" value={formData.capacity} onChange={e => setFormData(p => ({ ...p, capacity: e.target.value }))} className="input-field" placeholder="e.g. 200" required />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="target-blood-groups-6" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-3">Target Blood Groups</label>
                    <div className="flex flex-wrap gap-2">
                      {BLOOD_GROUPS.map(g => (
                        <button type="button"
                          key={g}
                          type="button"
                          onClick={() => toggleBloodGroup(g)}
                          className={`px-4 py-2 rounded-full text-[12px] font-[700] transition-all ${
                            formData.bloodGroups.includes(g)
                              ? 'bg-[#BE1F2E] text-white'
                              : 'bg-[#f5f3f0] text-[#5A5A5A] hover:bg-[rgba(190,31,46,0.08)] hover:text-[#BE1F2E]'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full" style={{ minHeight: 52 }}>
                    Submit Camp Request
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* AI Suggestion */}
          <aside className="lg:col-span-4">
            <div className="bg-[#1a1210] p-8 rounded-lg text-white">
              <span className="material-symbols-outlined text-[#BE1F2E] text-[32px] mb-4">insights</span>
              <h4 className="text-[24px] font-[500] mb-4 italic">AI Camp Suggestion</h4>
              <div className="space-y-4 text-white/70 text-[14px] leading-relaxed mb-6">
                <p>• <strong className="text-white">Sadashiv Peth / Rasta Peth</strong> — Poona Hospital & KEM are critically low on O- and AB-.</p>
                <p>• <strong className="text-white">O- and AB- donors</strong> needed most. District total is 8 and 31 units respectively.</p>
                <p>• <strong className="text-white">Within 5 days</strong> — KEM predicts O- depletion by tomorrow.</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default CampApprovals;
