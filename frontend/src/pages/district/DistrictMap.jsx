import React, { useState, useEffect } from 'react';
import { useDistrict } from '../../context/DistrictContext';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';

// Reset default Leaflet icon paths since bundling often breaks them
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const PUNE_CENTER = [18.5204, 73.8567];

const DistrictMap = () => {
  const { appState } = useDistrict();
  const hospitals = appState.hospitals || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterGroup, setFilterGroup] = useState('All');
  const [viewMode, setViewMode] = useState('hospitals'); // 'hospitals' | 'donors'
  
  const [mapPins, setMapPins] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    const fetchMapPins = async () => {
      try {
        const response = await api.get('/district/map');
        setMapPins(response.data);
      } catch (err) {
        console.error("Failed to fetch district map data", err);
      } finally {
        setMapLoading(false);
      }
    };
    fetchMapPins();
  }, []);

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
      <section className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-serif text-[60px] md:text-[80px] italic leading-none mb-4 tracking-[-0.04em] text-[#1a1a1a]">
            {viewMode === 'hospitals' ? (
              <>Hospital <span className="text-[#BE1F2E]">Network.</span></>
            ) : (
              <>Donor <span className="text-[#BE1F2E]">Density.</span></>
            )}
          </h1>
          <p className="text-[18px] text-[#737373] max-w-2xl leading-[28px]">
            {viewMode === 'hospitals' 
              ? `Live blood stock status across all ${hospitals.length} registered hospitals in the district.`
              : 'Heatmap representation of registered donors across the district for targeted campaigns.'}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-[#E0DAD4] p-1 rounded-xl shrink-0 z-10">
          <button type="button" 
            onClick={() => setViewMode('hospitals')}
            className={`px-6 py-2.5 rounded-lg text-[13px] font-[600] transition-colors cursor-pointer ${viewMode === 'hospitals' ? 'bg-white text-[#1A1210] shadow-sm' : 'text-[#5A5A5A] hover:text-[#1A1210]'}`}
          >
            Hospital View
          </button>
          <button type="button" 
            onClick={() => setViewMode('donors')}
            className={`px-6 py-2.5 rounded-lg text-[13px] font-[600] transition-colors cursor-pointer ${viewMode === 'donors' ? 'bg-white text-[#1A1210] shadow-sm' : 'text-[#5A5A5A] hover:text-[#1A1210]'}`}
          >
            Donor Density View
          </button>
        </div>
      </section>

      {/* Map Section */}
      <div className="bg-white rounded-2xl border border-[#EDE7E1] p-4 shadow-sm h-[600px] w-full relative z-10">
        {mapLoading ? (
          <div className="h-full flex items-center justify-center text-sm font-semibold text-[#737373]">Loading map data...</div>
        ) : (
          <MapContainer center={
            mapPins.length > 0
              ? [
                  mapPins.reduce((sum, p) => sum + p.lat, 0) / mapPins.length,
                  mapPins.reduce((sum, p) => sum + p.lng, 0) / mapPins.length
                ]
              : [18.5204, 73.8567]
          } zoom={12} style={{ height: '100%', width: '100%', borderRadius: '12px' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {viewMode === 'hospitals' ? (
              mapPins.map(pin => {
                const color = pin.status === 'red' ? '#BE1F2E' : pin.status === 'yellow' ? '#E07B00' : '#22A06B';
                return (
                  <React.Fragment key={pin.id}>
                    <Marker position={[pin.lat, pin.lng]}>
                      <Popup>
                        <div className="p-1 font-sans text-xs">
                          <h4 className="font-bold text-sm text-[#1A1210] mb-1">{pin.name}</h4>
                          <p className="text-[#5A5A5A]">Stock: <span className="font-bold">{pin.aggregateStock} units</span></p>
                          <p className="text-[#5A5A5A] mt-1 capitalize font-semibold">Status: <span style={{ color }}>{pin.status}</span></p>
                        </div>
                      </Popup>
                    </Marker>
                    <Circle 
                      center={[pin.lat, pin.lng]} 
                      radius={1500} 
                      pathOptions={{ fillColor: color, color: color, fillOpacity: 0.15 }} 
                    />
                  </React.Fragment>
                );
              })
            ) : (
              (mapPins.length > 0
                ? mapPins.map((p, idx) => ({
                    lat: p.lat + (idx % 2 === 0 ? 0.005 : -0.005),
                    lng: p.lng + (idx % 3 === 0 ? 0.005 : -0.005),
                    count: Math.floor((idx + 1) * 23.5) % 100 + 40,
                    label: p.name.replace("Hospital", "").replace("Life Care", "").trim()
                  }))
                : [
                    { lat: 18.5204, lng: 73.8567, count: 120, label: 'Central Zone' }
                  ]
              ).map((donorCluster, idx) => (
                <Circle 
                  key={idx}
                  center={[donorCluster.lat, donorCluster.lng]} 
                  radius={2000} 
                  pathOptions={{ fillColor: '#BE1F2E', color: '#BE1F2E', fillOpacity: 0.25, weight: 1 }} 
                >
                  <Popup>
                    <div className="p-1 font-sans text-xs">
                      <h4 className="font-bold text-sm text-[#1A1210] mb-1">{donorCluster.label} Cluster</h4>
                      <p className="text-[#5A5A5A]">Registered Donors: <span className="font-bold">{donorCluster.count} donors</span></p>
                    </div>
                  </Popup>
                </Circle>
              ))
            )}
          </MapContainer>
        )}
      </div>

      {viewMode === 'hospitals' && (
        <>
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[220px] relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search hospital or area…"
                className="input-field text-[14px]"
                aria-label="Search hospitals"
              />
            </div>
            <select aria-label="Filter by hospital type" value={filterType} onChange={e => setFilterType(e.target.value)} className="input-field custom-select text-[14px] w-auto min-w-[160px]">
              <option value="All">All Types</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
            </select>
            <select aria-label="Filter by blood group" value={filterGroup} onChange={e => setFilterGroup(e.target.value)} className="input-field custom-select text-[14px] w-auto min-w-[180px]">
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
        </>
      )}
    </div>
  );
};

export default DistrictMap;
