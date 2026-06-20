import React, { useState } from 'react';
import { useDistrict } from '../../context/DistrictContext';

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const DistrictMap = () => {
  const { appState } = useDistrict();
  const hospitals = appState.hospitals || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterGroup, setFilterGroup] = useState('All');

  const filtered = hospitals.filter(h => {
    const matchSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'All' || h.type === filterType;
    const matchGroup = filterGroup === 'All' || (h.stock[filterGroup] || 0) <= 15;
    return matchSearch && matchType && matchGroup;
  });

  return (
    <div className="space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <section className="mb-12">
        <h1 className="font-serif text-[60px] md:text-[80px] italic leading-none mb-4 tracking-[-0.04em] text-[#1a1a1a]">
          Hospital <span className="text-[#BE1F2E]">Network.</span>
        </h1>
        <p className="text-[18px] text-[#737373] max-w-2xl leading-[28px]">
          Live blood stock status across all {hospitals.length} registered hospitals in the district.
        </p>
      </section>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[220px] relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A] text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search hospital or area…"
            className="input-field pl-10 text-[14px]"
          />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-field custom-select text-[14px] w-auto min-w-[160px]">
          <option value="All">All Types</option>
          <option value="Government">Government</option>
          <option value="Private">Private</option>
        </select>
        <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} className="input-field custom-select text-[14px] w-auto min-w-[180px]">
          <option value="All">All Blood Groups</option>
          {BLOOD_GROUPS.map(g => <option key={g} value={g}>Low {g} stock</option>)}
        </select>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Hospitals', value: hospitals.length },
          { label: 'Government', value: hospitals.filter(h => h.type === 'Government').length },
          { label: 'Private', value: hospitals.filter(h => h.type === 'Private').length },
          { label: 'Critical Stock', value: hospitals.filter(h => Object.values(h.stock).some(v => v <= 5)).length },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-5 rounded-lg border border-[rgba(26,18,16,0.09)]">
            <p className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-2">{stat.label}</p>
            <p className="font-serif text-[40px] leading-none text-[#BE1F2E]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Hospital Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(hospital => {
          const criticalGroups = BLOOD_GROUPS.filter(g => (hospital.stock[g] || 0) <= 5);
          const hasCritical = criticalGroups.length > 0;

          return (
            <div key={hospital.id} className="bg-white rounded-lg border border-[rgba(26,18,16,0.09)] overflow-hidden hover:shadow-md transition-all">
              {/* Card Header */}
              <div className="px-6 py-4 bg-[#f5f3f0] flex justify-between items-start border-b border-[rgba(26,18,16,0.09)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-[rgba(190,31,46,0.08)] text-[#BE1F2E] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                      {hospital.type}
                    </span>
                    {hasCritical && (
                      <span className="bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                        ⚠ Critical
                      </span>
                    )}
                  </div>
                  <h3 className="font-[600] text-[16px] text-[#1a1a1a]">{hospital.name}</h3>
                  <p className="text-[13px] text-[#737373]">{hospital.area}</p>
                </div>
                <p className="text-[11px] text-[#9A9A9A] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {hospital.lastUpdated}
                </p>
              </div>

              {/* Blood Group Grid */}
              <div className="px-6 py-4">
                <p className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-3">Blood Stock (units)</p>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_GROUPS.map(group => {
                    const units = hospital.stock[group] || 0;
                    const isCritical = units <= 5;
                    return (
                      <div
                        key={group}
                        className={`text-center p-2 rounded ${isCritical ? 'bg-[rgba(190,31,46,0.08)]' : 'bg-[#f5f3f0]'}`}
                      >
                        <p className={`text-[10px] font-[700] ${isCritical ? 'text-[#BE1F2E]' : 'text-[#737373]'}`}>{group}</p>
                        <p className={`text-[16px] font-serif font-bold ${isCritical ? 'text-[#BE1F2E]' : 'text-[#1A1A1A]'}`}>{units}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-5 flex items-center justify-between">
                <p className="text-[12px] text-[#737373]">Lic: <span className="font-semibold text-[#5A5A5A]">{hospital.licenseNo}</span></p>
                <a
                  href={`tel:${hospital.contact}`}
                  className="bg-[#1a1210] text-white px-4 py-2 rounded-full text-[12px] font-[500] hover:scale-105 transition-transform flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[14px]">call</span>
                  Contact
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#9A9A9A] bg-white rounded-lg border border-[rgba(26,18,16,0.09)]">
          <p className="text-[18px] font-serif italic mb-2">No hospitals match your filters.</p>
          <p className="text-[14px]">Try clearing the search or changing filter options.</p>
        </div>
      )}
    </div>
  );
};

export default DistrictMap;
