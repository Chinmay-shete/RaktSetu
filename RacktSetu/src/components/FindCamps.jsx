import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CAMP_DATA = {
  default: [
    { name: 'Fortis Emergency Wing', type: 'High Need', typeColor: '#ffdad8', typeTextColor: '#92001c', location: 'Sec-44, Gurugram • 0.8km away', date: 'Tomorrow, 9 AM - 5 PM', pinTop: '33%', pinLeft: '33%' },
    { name: 'Red Cross Mobile Camp', type: 'Standard', typeColor: '#eae8e5', typeTextColor: '#685c59', location: 'Connaught Place Central Park • 2.1km away', date: 'Oct 24, 10 AM - 4 PM', pinTop: '50%', pinLeft: '75%' },
    { name: 'AIIMS Blood Bank', type: 'Standard', typeColor: '#eae8e5', typeTextColor: '#685c59', location: 'Ansari Nagar East • 5.4km away', date: 'Oct 26, 8 AM - 8 PM', pinTop: '70%', pinLeft: '40%' },
  ],
  kolhapur: [
    { name: 'CPR Hospital Camp', type: 'High Need', typeColor: '#ffdad8', typeTextColor: '#92001c', location: 'Dasara Chowk, Kolhapur • 1.2km away', date: 'Tomorrow, 8 AM - 4 PM', pinTop: '40%', pinLeft: '45%' },
    { name: 'Apple Saraswati Hospital', type: 'Standard', typeColor: '#eae8e5', typeTextColor: '#685c59', location: 'Kadamwadi, Kolhapur • 3.5km away', date: 'Oct 25, 9 AM - 6 PM', pinTop: '25%', pinLeft: '65%' },
    { name: 'Rotary Blood Bank', type: 'Standard', typeColor: '#eae8e5', typeTextColor: '#685c59', location: 'Rajarampuri, Kolhapur • 2.8km away', date: 'Oct 28, 10 AM - 5 PM', pinTop: '60%', pinLeft: '30%' },
  ]
};

const FindCamps = () => {
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  
  // eRaktKosh style filters
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState('Kolhapur');
  const [activeDistrict, setActiveDistrict] = useState('New Delhi');

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = () => {
    setActiveDistrict(selectedDistrict);
  };

  const isKolhapur = activeDistrict.toLowerCase() === 'kolhapur';
  const activeCamps = isKolhapur ? CAMP_DATA.kolhapur : CAMP_DATA.default;
  const mapCenterText = isKolhapur ? 'Kolhapur' : 'New Delhi';

  return (
    <div className="bg-[#fbf9f6] text-[#1b1c1a] min-h-screen selection:bg-[#ffdad8] selection:text-[#1b1c1a]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="noise-filter" />

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          navScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-[#E0DAD4]'
            : 'bg-white/90 backdrop-blur-md border-b border-[#E0DAD4]'
        }`}
        style={{ height: 72 }}
      >
        <div className="flex justify-between items-center h-full w-full px-6 md:px-10 lg:px-16">
          <Link
            to="/"
            className="font-serif text-[24px] font-bold text-[#BE1F2E] tracking-tight shrink-0"
            style={{ fontFeatureSettings: '"liga" 0' }}
          >
            RaktSetu
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            <Link to="/find-camps" className="text-[14px] font-[600] text-[#BE1F2E] border-b-2 border-[#BE1F2E] pb-1 whitespace-nowrap">Find Camps</Link>
            <Link to="/dashboard" className="text-[14px] font-[500] text-[#5A5A5A] hover:text-[#BE1F2E] transition-colors whitespace-nowrap">My Impact</Link>
            <Link to="/edit-profile" className="text-[14px] font-[500] text-[#5A5A5A] hover:text-[#BE1F2E] transition-colors whitespace-nowrap">Profile</Link>
          </div>
          
          <div className="flex items-center gap-6 shrink-0">
            <button className="px-5 py-2 text-[14px] font-[600] text-[#BE1F2E] hover:bg-[rgba(190,31,46,0.06)] rounded-full transition-all whitespace-nowrap hidden sm:block">
              Emergency Request
            </button>
            <div className="w-10 h-10 rounded-full bg-[#eae8e5] flex items-center justify-center border border-[rgba(26,18,16,0.09)] overflow-hidden cursor-pointer shrink-0" onClick={() => navigate('/edit-profile')}>
              <img className="w-full h-full object-cover" alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4LePSzF9UlW9h3IVZNZA-jV2c_WlVBNOPY2YRf99m4LW6pnZCOJow0bRw6skvc_LwP1Sjs85QaT6fzeIhBQQwGz1cr7qSI-8pe5tYU7UGinXprHgh-PK3cqnJI4GSnh0oPXhDHqPSKEOnfTxKJG5Rq2yoBTo7yub1N3Vml9LsMa5dsvmQIi2q31bqbhLaYDbmBFE5idwcqyYnZUlrzUizutMwPtY0Wobo9nsUpDKigPRPnhBg27638USNnXdaUSlGAlX-APGnWJw" />
            </div>
          </div>
        </div>
      </nav>

      {/* ── MAIN ───────────────────────────────────────────────────────── */}
      <main className="pt-32 pb-32 w-full px-6 md:px-10 lg:px-16">
        <header className="mb-8">
          <h1 className="font-serif text-[60px] md:text-[100px] italic mb-4 leading-none tracking-[-0.04em]">Blood Camps</h1>
          <p className="text-[#737373] text-[18px] max-w-xl leading-[28px]">
            Locate precision-guided blood donation drives in your vicinity. Your contribution is forecasted and matched to real-time clinical deficits.
          </p>
        </header>

        {/* eRaktKosh Style Filter Bar */}
        <div className="bg-white border border-[rgba(26,18,16,0.09)] shadow-sm rounded-lg p-6 mb-8 flex flex-col md:flex-row gap-6 items-end">
          <div className="w-full md:w-1/4">
            <label className="block text-[11px] font-[600] uppercase tracking-widest text-[#685c59] mb-2">Select State</label>
            <select 
              className="w-full border border-[rgba(26,18,16,0.09)] bg-[#faf8f5] rounded-md px-4 py-3 text-[14px] text-[#1a1210] font-[500] outline-none focus:border-[#c8102e] cursor-pointer"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                // Reset district when state changes
                setSelectedDistrict(e.target.value === 'Maharashtra' ? 'Kolhapur' : 'New Delhi');
              }}
            >
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
            </select>
          </div>
          <div className="w-full md:w-1/4">
            <label className="block text-[11px] font-[600] uppercase tracking-widest text-[#685c59] mb-2">Select District</label>
            <select 
              className="w-full border border-[rgba(26,18,16,0.09)] bg-[#faf8f5] rounded-md px-4 py-3 text-[14px] text-[#1a1210] font-[500] outline-none focus:border-[#c8102e] cursor-pointer"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              {selectedState === 'Maharashtra' ? (
                <>
                  <option value="Kolhapur">Kolhapur</option>
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                </>
              ) : (
                <>
                  <option value="New Delhi">New Delhi</option>
                  <option value="South Delhi">South Delhi</option>
                </>
              )}
            </select>
          </div>
          <div className="w-full md:w-1/4">
            <label className="block text-[11px] font-[600] uppercase tracking-widest text-[#685c59] mb-2">Camp Date</label>
            <input 
              type="date"
              className="w-full border border-[rgba(26,18,16,0.09)] bg-[#faf8f5] rounded-md px-4 py-3 text-[14px] text-[#1a1210] font-[500] outline-none focus:border-[#c8102e] cursor-pointer"
            />
          </div>
          <div className="w-full md:w-1/4">
            <button 
              className="w-full bg-[#1a1210] text-white px-6 py-3 rounded-md text-[14px] font-[600] hover:bg-[#c8102e] transition-colors flex items-center justify-center gap-2"
              onClick={handleSearch}
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              Find Camps
            </button>
          </div>
        </div>

        <section className="bg-white border border-[rgba(26,18,16,0.09)] shadow-sm rounded-lg overflow-hidden flex flex-col lg:flex-row h-[700px]">
          
          {/* Map Placeholder */}
          <div className="w-full lg:w-2/3 bg-[#f5f3f0] relative h-full flex flex-col justify-center items-center border-b lg:border-b-0 lg:border-r border-[rgba(26,18,16,0.09)]">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#685c59_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            <div className="absolute top-6 left-6 z-10 bg-white border border-[rgba(26,18,16,0.09)] px-4 py-3 rounded-md shadow-sm">
              <p className="text-[#1a1210] font-[500] text-[14px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#c8102e]">my_location</span>
                Showing camps near {mapCenterText}
              </p>
            </div>
            
            {activeCamps.map((camp, index) => (
              <div 
                key={index} 
                className="absolute flex flex-col items-center group cursor-pointer"
                style={{ top: camp.pinTop, left: camp.pinLeft }}
              >
                <div className={`text-white p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform ${camp.type === 'High Need' ? 'bg-[#c8102e]' : 'bg-[#1a1210]'}`}>
                  <span className="material-symbols-outlined text-[20px]">{camp.type === 'High Need' ? 'water_drop' : 'location_on'}</span>
                </div>
                <div className="mt-2 bg-white px-3 py-1 text-[12px] font-[600] rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {camp.name.split(' ')[0]} ({camp.location.split(' • ')[1]})
                </div>
              </div>
            ))}
          </div>

          {/* List Placeholder */}
          <div className="w-full lg:w-1/3 bg-white h-full overflow-y-auto">
            <div className="p-6 border-b border-[rgba(26,18,16,0.09)] sticky top-0 bg-white z-10">
              <h3 className="text-[24px] font-[500] italic text-[#1a1210]">Camps in {mapCenterText}</h3>
            </div>
            
            <div className="divide-y divide-[rgba(26,18,16,0.09)]">
              {activeCamps.map((camp, index) => (
                <div key={index} className="p-6 hover:bg-[#faf8f5] transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-[18px] font-[500] text-[#1a1210] group-hover:text-[#c8102e] transition-colors">{camp.name}</h4>
                    <span 
                      className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest"
                      style={{ backgroundColor: camp.typeColor, color: camp.typeTextColor }}
                    >
                      {camp.type}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#737373] mb-4">{camp.location}</p>
                  <div className="flex items-center gap-4 text-[14px] text-[#685c59]">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      {camp.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1210] border-t border-white/10 w-full py-32">
        <div className="flex flex-col md:flex-row justify-between items-start w-full px-6 md:px-10 lg:px-16 gap-16 md:gap-0">
          <div className="space-y-6">
            <div className="font-serif text-[60px] text-white italic leading-[54px]">RaktSetu</div>
            <p className="text-[#737373] text-[16px] max-w-xs leading-[24px]">© 2024 RaktSetu. Clinical Excellence in Blood Logistics.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-6">
            <a className="text-[#737373] hover:text-white transition-colors text-[16px]" href="#">Privacy Policy</a>
            <a className="text-[#737373] hover:text-white transition-colors text-[16px]" href="#">Terms of Service</a>
            <a className="text-[#737373] hover:text-white transition-colors text-[16px]" href="#">Donor Guidelines</a>
            <a className="text-[#737373] hover:text-white transition-colors text-[16px]" href="#">Contact Medical Team</a>
          </div>
          <div className="space-y-4">
            <div className="text-white text-[14px] font-[500] uppercase tracking-[0.02em] opacity-50">Operational Status</div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-white text-[16px]">Live Logistics Network</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FindCamps;
