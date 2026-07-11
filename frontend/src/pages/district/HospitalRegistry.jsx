import React, { useState } from 'react';
import { useDistrict } from '../../context/DistrictContext';
import { CheckCircle } from 'lucide-react';

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const HospitalRegistry = () => {
  const { appState } = useDistrict();
  const hospitals = appState.hospitals || [];

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [selectedId, setSelectedId] = useState(null);
  const [notifyId, setNotifyId] = useState(null);

  const filtered = hospitals
    .filter(h => {
      const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.area.toLowerCase().includes(search.toLowerCase()) ||
        h.licenseNo.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'All' || h.type === typeFilter;
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'area') return a.area.localeCompare(b.area);
      if (sortBy === 'stock') {
        const aTotal = Object.values(a.stock).reduce((s, v) => s + v, 0);
        const bTotal = Object.values(b.stock).reduce((s, v) => s + v, 0);
        return aTotal - bTotal;
      }
      return 0;
    });

  const selected = hospitals.find(h => h.id === selectedId);
  const getTotalStock = (h) => Object.values(h.stock).reduce((s, v) => s + v, 0);
  const hasCritical = (h) => Object.values(h.stock).some(v => v <= 5);

  const handleNotify = (hospital) => {
    setNotifyId(hospital.id);
    setTimeout(() => {
      setNotifyId(null);
      window.alert(`📨 Notification sent to ${hospital.name} blood bank team regarding stock update request.`);
    }, 1000);
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <section className="mb-12">
        <h1 className="font-serif text-[60px] md:text-[80px] italic leading-none mb-4 tracking-[-0.04em] text-[#1a1a1a]">
          Hospital <span className="text-[#BE1F2E]">Registry.</span>
        </h1>
        <p className="text-[18px] text-[#737373] max-w-2xl leading-[28px]">
          Complete directory of all registered blood banks and hospitals under {appState.officerDetails?.district || 'Pune'} District jurisdiction.
        </p>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Hospitals', value: hospitals.length },
          { label: 'Government', value: hospitals.filter(h => h.type === 'Government').length },
          { label: 'Private', value: hospitals.filter(h => h.type === 'Private').length },
          { label: 'Critical Stock', value: hospitals.filter(hasCritical).length },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)] relative overflow-hidden group">
            <p className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-4">{stat.label}</p>
            <h2 className="font-serif text-[60px] leading-[54px] text-[#BE1F2E]">{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[220px] relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A] text-[18px]">search</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hospital, area, or license…" className="input-field !pl-10 text-[14px]" aria-label="Search hospitals" />
        </div>
        <select aria-label="Filter by type" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field custom-select text-[14px] w-auto min-w-[160px]">
          <option value="All">All Types</option>
          <option value="Government">Government</option>
          <option value="Private">Private</option>
        </select>
        <select aria-label="Sort hospitals" value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field custom-select text-[14px] w-auto min-w-[180px]">
          <option value="name">Sort by Name</option>
          <option value="area">Sort by Area</option>
          <option value="stock">Sort by Stock (Low → High)</option>
        </select>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-lg border border-[rgba(26,18,16,0.09)] overflow-hidden">
        <div className="p-6 border-b border-[rgba(26,18,16,0.09)] flex justify-between items-center">
          <h3 className="text-[24px] font-[500] italic">All Registered Hospitals</h3>
          <span className="text-[13px] text-[#737373]">{filtered.length} results</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f5f3f0]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Hospital</th>
                <th className="px-6 py-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Type</th>
                <th className="px-6 py-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Area</th>
                <th className="px-6 py-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">License</th>
                <th className="px-6 py-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Total Stock</th>
                <th className="px-6 py-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Updated</th>
                <th className="px-6 py-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(26,18,16,0.09)]">
              {filtered.map(hospital => {
                const totalStock = getTotalStock(hospital);
                const critical = hasCritical(hospital);
                return (
                  <tr
                    key={hospital.id}
                    className={`hover:bg-[#faf8f5] transition-colors cursor-pointer ${selectedId === hospital.id ? 'bg-[#faf8f5]' : ''}`}
                    onClick={() => setSelectedId(selectedId === hospital.id ? null : hospital.id)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-[600] text-[14px] text-[#1A1A1A]">{hospital.name}</p>
                        {critical && <span className="text-[10px] font-[700] text-[#BE1F2E]">⚠ Critical stock</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[rgba(190,31,46,0.08)] text-[#BE1F2E] px-3 py-1 rounded-full text-[12px] font-[600] uppercase">
                        {hospital.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#5A5A5A]">{hospital.area}</td>
                    <td className="px-6 py-4 text-[13px] font-mono text-[#737373]">{hospital.licenseNo}</td>
                    <td className="px-6 py-4">
                      <span className={`font-serif text-[20px] font-bold ${critical ? 'text-[#BE1F2E]' : 'text-[#1A1A1A]'}`}>{totalStock}</span>
                      <span className="text-[11px] text-[#9A9A9A] ml-1">bags</span>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#5A5A5A]">{hospital.lastUpdated}</td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${hospital.contact}`}
                          className="p-2 rounded-xl bg-[#f5f3f0] hover:bg-[rgba(190,31,46,0.06)] text-[#5A5A5A] hover:text-[#BE1F2E] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">call</span>
                        </a>
                        <button type="button"
                          onClick={() => handleNotify(hospital)}
                          disabled={notifyId === hospital.id}
                          className="p-2 rounded-xl bg-[#f5f3f0] hover:bg-[rgba(190,31,46,0.06)] text-[#5A5A5A] hover:text-[#BE1F2E] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {notifyId === hospital.id ? 'check_circle' : 'notifications'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Detail Panel */}
      {selected && (
        <div className="bg-white rounded-lg border border-[rgba(26,18,16,0.09)] p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-[24px] font-[500] italic text-[#1a1a1a]">{selected.name}</h3>
              <p className="text-[13px] text-[#737373]">{selected.area} · {selected.contact} · {selected.licenseNo}</p>
            </div>
            <button type="button" onClick={() => setSelectedId(null)} className="text-[#9A9A9A] hover:text-[#BE1F2E] text-sm transition-colors">
              Close ✕
            </button>
          </div>
          <p className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-4">Current Blood Stock</p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {BLOOD_GROUPS.map(g => {
              const units = selected.stock[g] || 0;
              const isCritical = units <= 5;
              return (
                <div key={g} className={`text-center p-3 rounded-lg ${isCritical ? 'bg-[rgba(190,31,46,0.08)]' : 'bg-[#f5f3f0]'}`}>
                  <p className={`text-[11px] font-[700] ${isCritical ? 'text-[#BE1F2E]' : 'text-[#737373]'}`}>{g}</p>
                  <p className={`font-serif text-[24px] font-bold ${isCritical ? 'text-[#BE1F2E]' : 'text-[#1A1A1A]'}`}>{units}</p>
                  <p className={`text-[10px] ${isCritical ? 'text-[#BE1F2E]' : 'text-[#9A9A9A]'}`}>units</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#9A9A9A] bg-white rounded-lg border border-[rgba(26,18,16,0.09)]">
          <p className="text-[18px] font-serif italic mb-2">No hospitals match your search.</p>
          <p className="text-[14px]">Try clearing the search or changing filter options.</p>
        </div>
      )}
    </div>
  );
};

export default HospitalRegistry;
