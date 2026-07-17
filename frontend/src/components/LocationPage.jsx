import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const LocationPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const hasProfile = localStorage.getItem('raktsetu_donor_profile');
    const otpVerified = localStorage.getItem('raktsetu_otp_verified');
    if (!hasProfile && !otpVerified) {
      navigate('/');
    }
  }, [navigate]);

  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [donatedBefore, setDonatedBefore] = useState(false);
  const [lastDonation, setLastDonation] = useState('');
  const [donationType, setDonationType] = useState('blood');
  const [donationTimes, setDonationTimes] = useState('');
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const cityOptions = ['Mumbai', 'Pune', 'Nagpur', 'Satara', 'Kolhapur'];
  const filteredSuggestions = cityOptions.filter(c =>
    c.toLowerCase().includes(city.toLowerCase()) && c.toLowerCase() !== city.toLowerCase()
  );

  const donationTypes = [
    { id: 'blood', label: 'Whole Blood' },
    { id: 'platelets', label: 'Platelets' },
    { id: 'plasma', label: 'Plasma' },
  ];

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGpsToggle = async () => {
    if (gpsEnabled) { setGpsEnabled(false); return; }
    if (!navigator.geolocation) { setGpsError('Geolocation not supported.'); return; }
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        localStorage.setItem('raktsetu_location', JSON.stringify({ latitude, longitude }));
        setGpsEnabled(true);
        setGpsLoading(false);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          if (data) {
            if (data.display_name) setAddress(data.display_name);
            if (data.address) {
              const detectedCity = data.address.city || data.address.town || data.address.village || '';
              const detectedDistrict = data.address.county || data.address.district || detectedCity || '';
              const detectedPin = data.address.postcode || '';
              if (detectedCity && !city) setCity(detectedCity);
              if (detectedDistrict && !district) setDistrict(detectedDistrict);
              if (detectedPin && !pincode) setPincode(detectedPin.slice(0, 6));
            }
          }
        } catch { /* silent */ }
      },
      () => {
        setGpsLoading(false);
        setGpsError('Location access denied. You can still continue manually.');
      }
    );
  };

  const handlePincodeChange = (v) => {
    const cleaned = v.replace(/\D/g, '').slice(0, 6);
    setPincode(cleaned);
    if (cleaned.length > 0 && cleaned.length < 6) setPincodeError('Enter a valid 6-digit PIN');
    else setPincodeError('');
  };

  const handleNext = async () => {
    if (pincode.length > 0 && pincode.length < 6) { setPincodeError('Enter a valid 6-digit PIN'); return; }
    
    try {
      const existing = JSON.parse(localStorage.getItem('raktsetu_donor_profile') || '{}');
      
      const bloodGroupNormalized = (existing.bloodGroup || 'O+').replace('−', '-');
      const chronicIllness = !!(existing.screeningAnswers?.q6);
      const lastDonatedDate = donatedBefore && lastDonation ? lastDonation : null;
      
      const profileData = {
        fullName: existing.fullName || 'Anonymous Donor',
        age: parseInt(existing.age || '25', 10),
        gender: existing.gender || 'Male',
        bloodGroup: bloodGroupNormalized,
        weight: existing.weight ? parseFloat(existing.weight) : null,
        chronicIllness,
        lastDonatedDate
      };
      
      await api.post('/donor/profile', profileData);
      
      let latitude = 0.0;
      let longitude = 0.0;
      const storedLocation = localStorage.getItem('raktsetu_location');
      if (storedLocation) {
        try {
          const parsedLoc = JSON.parse(storedLocation);
          latitude = parsedLoc.latitude || 0.0;
          longitude = parsedLoc.longitude || 0.0;
        } catch (e) {
          // ignore
        }
      }
      
      if (latitude === 0.0 && longitude === 0.0 && city) {
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', India')}&format=json&limit=1`);
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            latitude = parseFloat(geoData[0].lat);
            longitude = parseFloat(geoData[0].lon);
          }
        } catch (e) {
          console.error("Geocoding failed, using local fallback.", e);
        }
      }

      if (latitude === 0.0 && longitude === 0.0) {
        const cityCoords = {
          'Mumbai': { lat: 19.0760, lng: 72.8777 },
          'Pune': { lat: 18.5204, lng: 73.8567 },
          'Nagpur': { lat: 21.1458, lng: 79.0882 },
          'Satara': { lat: 17.6805, lng: 73.9918 },
          'Kolhapur': { lat: 16.7050, lng: 74.2433 }
        };
        const coords = cityCoords[city] || { lat: 19.0760, lng: 72.8777 };
        latitude = coords.lat;
        longitude = coords.lng;
      }
      
      await api.post('/donor/location', {
        lat: latitude,
        lng: longitude,
        city: city || 'Mumbai',
        pincode: pincode || '400001',
        address: address || null,
        district: district || null
      });
      
      localStorage.setItem('raktsetu_donor_profile', JSON.stringify({
        ...existing, city, pincode, address, district, donatedBefore,
        lastDonation: donatedBefore ? lastDonation : '',
        donationType: donatedBefore ? donationType : '',
        donationTimes: donatedBefore ? donationTimes : '',
        gpsEnabled,
      }));
      localStorage.setItem('raktsetu_donor_authenticated', 'true');
      localStorage.removeItem('raktsetu_otp_verified');
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to submit profile to backend:', err);
      const status = err?.response?.status;
      const code   = err?.response?.data?.code;

      if (status === 401) {
        // Session expired mid-flow — clear auth and go to login
        Object.keys(localStorage).forEach(k => { if (k.startsWith('raktsetu_')) localStorage.removeItem(k); });
        navigate('/login');
        return;
      }

      if (code === 'PROFILE_EXISTS') {
        // Profile was already created (double-submit) — skip ahead to dashboard
        localStorage.setItem('raktsetu_donor_authenticated', 'true');
        navigate('/dashboard');
        return;
      }

      alert('Failed to save profile. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1b1c1a] selection:bg-[#ffdad8] flex flex-col" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="noise-filter" />

      {!isMobile ? (
        /* ──────────────────────────────────────────────────────── */
        /* ── DESKTOP AUTH DESIGN ───────────────────────────────── */
        /* ──────────────────────────────────────────────────────── */
        <div className="min-h-screen bg-[#F5F0EB] flex flex-col">
          <nav className="w-full bg-white border-b border-[#E0DAD4] sticky top-0 z-40">
            <div className="flex justify-between items-center h-16 px-6 md:px-10 lg:px-16 w-full">
              <Link to="/" className="font-serif text-[22px] font-bold text-[#BE1F2E]" style={{ fontFeatureSettings: '"liga" 0' }}>RaktSetu</Link>
              <a className="text-[13px] text-[#9A9A9A] hover:text-[#BE1F2E] transition-colors" href="#">Need help?</a>
            </div>
          </nav>

          <main className="flex-grow flex items-start justify-center py-12 px-4">
            <div className="w-full max-w-[540px] bg-white border border-[#EDE7E1] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-10 animate-fade-in">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-label-tag text-[#9A9A9A]">Step 3 of 4</span>
                  <span className="text-label-tag text-[#BE1F2E]">Location & Eligibility</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="step-bar-done" />
                  <div className="step-bar-done" />
                  <div className="step-bar-active" />
                  <div className="step-bar-upcoming" />
                </div>
              </div>

              <div className="mb-8">
                <h1 className="font-serif mb-2" style={{ fontSize: 'clamp(26px,4vw,34px)', fontWeight: 700, color: '#1A0A0A', lineHeight: 1.1, fontFeatureSettings: '"liga" 0' }}>
                  Where are you <span className="text-[#BE1F2E] italic">located?</span>
                </h1>
                <p className="text-[15px] text-[#9A9A9A] leading-[1.6]">Helps us connect you with nearby blood camps and emergency alerts.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[14px] font-[600] text-[#1A1A1A] mb-1.5 block" htmlFor="city">City</label>
                    <div className="relative">
                      <div className="flex items-center border border-[#D8D0CA] rounded-xl overflow-hidden transition-all focus-within:border-[#BE1F2E] focus-within:shadow-[0_0_0_3px_rgba(190,31,46,0.12)] input-with-icon">
                        <span className="material-symbols-outlined input-icon text-[#A8A0A0] text-[18px] ml-3 shrink-0 transition-colors">location_city</span>
                        <input
                          id="city"
                          type="text"
                          value={city}
                          onChange={(e) => { setCity(e.target.value); setShowSuggestions(true); }}
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                          placeholder="e.g. Mumbai"
                          className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-3.5 text-[16px] text-[#1A1A1A] placeholder:text-[#A8A0A0] outline-none"
                        />
                      </div>
                      {showSuggestions && city && filteredSuggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-[#EDE7E1] rounded-xl shadow-lg mt-1.5 max-h-48 overflow-y-auto divide-y divide-[#F5F0EB]">
                          {filteredSuggestions.map((suggestion) => (
                            <li
                              key={suggestion}
                              onClick={() => {
                                setCity(suggestion);
                                setShowSuggestions(false);
                              }}
                              className="px-4 py-2.5 text-[15px] hover:bg-[#F5F0EB] cursor-pointer text-[#1A1A1A] transition-colors"
                            >
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[14px] font-[600] text-[#1A1A1A] mb-1.5 block" htmlFor="district">District</label>
                    <div className="flex items-center border border-[#D8D0CA] rounded-xl overflow-hidden transition-all focus-within:border-[#BE1F2E] focus-within:shadow-[0_0_0_3px_rgba(190,31,46,0.12)] input-with-icon">
                      <span className="material-symbols-outlined input-icon text-[#A8A0A0] text-[18px] ml-3 shrink-0 transition-colors">map</span>
                      <input
                        id="district"
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="e.g. Pune"
                        className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-3.5 text-[16px] text-[#1A1A1A] placeholder:text-[#A8A0A0] outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[14px] font-[600] text-[#1A1A1A] mb-1.5 block" htmlFor="pincode">Pincode</label>
                    <input
                      id="pincode"
                      type="text"
                      value={pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      placeholder="Enter 6-digit PIN"
                      maxLength="6"
                      className={`input-field ${pincodeError ? 'error' : ''}`}
                      style={{ borderRadius: 12 }}
                    />
                    {pincodeError && <p className="text-[12px] text-[#BE1F2E] mt-1">{pincodeError}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-[14px] font-[600] text-[#1A1A1A] mb-1.5 block" htmlFor="address-textarea">Street Address / Landmark</label>
                  <textarea
                    id="address-textarea"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter detailed street address or landmark"
                    rows="2"
                    className="w-full border border-[#D8D0CA] bg-[#faf8f5] rounded-xl px-4 py-3 text-[15px] text-[#1A1A1A] placeholder:text-[#A8A0A0] outline-none focus:border-[#BE1F2E] transition-all resize-none"
                  />
                </div>
                 <div className="border-t border-[#E0DAD4]" />

                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-[600] text-[#1A1A1A]">Have you donated before?</p>
                      <p className="text-[13px] text-[#9A9A9A] mt-0.5">Helps us determine eligibility windows.</p>
                    </div>
                    <button type="button"
                      className={`toggle-track ${donatedBefore ? 'on' : ''}`}
                      onClick={() => setDonatedBefore(!donatedBefore)}
                      role="switch"
                      aria-checked={donatedBefore}
                      aria-label="Have you donated before?"
                    >
                      <span className="toggle-thumb" />
                    </button>
                  </div>

                  <div
                    className="overflow-hidden transition-all duration-250"
                    style={{ maxHeight: donatedBefore ? 300 : 0, opacity: donatedBefore ? 1 : 0, marginTop: donatedBefore ? 16 : 0 }}
                  >
                    <div className="bg-[#F5F0EB] border border-[#E0DAD4] rounded-xl p-5 space-y-5">
                      <div>
                        <label htmlFor="approx-how-many-times-1" className="text-[13px] font-[600] text-[#5A5A5A] mb-1.5 block">Approx. how many times?</label>
                        <input id="approx-how-many-times-1"
                          type="number"
                          min="1"
                          value={donationTimes}
                          onChange={(e) => setDonationTimes(e.target.value)}
                          placeholder="e.g. 3"
                          className="input-field"
                          style={{ borderRadius: 10 }}
                        />
                      </div>
                      <div>
                        <label className="text-[13px] font-[600] text-[#5A5A5A] mb-1.5 block" htmlFor="lastDonation">Date of last donation</label>
                        <div className="flex items-center border border-[#D8D0CA] rounded-xl overflow-hidden bg-white focus-within:border-[#BE1F2E] focus-within:shadow-[0_0_0_3px_rgba(190,31,46,0.12)] transition-all">
                          <span className="material-symbols-outlined text-[#A8A0A0] text-[18px] ml-3">calendar_month</span>
                          <input
                            id="lastDonation"
                            type="date"
                            value={lastDonation}
                            onChange={(e) => setLastDonation(e.target.value)}
                            className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-3.5 text-[16px] text-[#1A1A1A] outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="type-of-donation-2" className="text-[13px] font-[600] text-[#5A5A5A] mb-2 block">Type of donation</label>
                        <div className="flex flex-wrap gap-2">
                          {donationTypes.map((dt) => (
                            <button type="button"
                              key={dt.id}
                              type="button"
                              onClick={() => setDonationType(dt.id)}
                              className={`px-4 py-2 rounded-full text-[13px] font-[600] border transition-all ${
                                donationType === dt.id
                                  ? 'bg-[#BE1F2E] border-[#BE1F2E] text-white'
                                  : 'border-[#D8D0CA] bg-white text-[#5A5A5A] hover:border-[#BE1F2E] hover:text-[#BE1F2E]'
                              }`}
                            >
                              {dt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#E0DAD4]" />

                <div className={`border rounded-xl p-5 flex items-start gap-4 transition-all duration-300 ${
                  gpsEnabled
                    ? 'bg-[rgba(34,160,107,0.03)] border-[rgba(34,160,107,0.2)] shadow-[0_2px_12px_rgba(34,160,107,0.05)]'
                    : 'bg-[rgba(190,31,46,0.03)] border-[rgba(190,31,46,0.12)]'
                }`}>
                  <span className={`material-symbols-outlined mt-0.5 shrink-0 transition-colors ${gpsEnabled ? 'text-[#22A06B]' : 'text-[#BE1F2E]'}`}>
                    {gpsEnabled ? 'check_circle' : 'my_location'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <label htmlFor="gps-toggle-btn" className="text-[14px] font-[600] text-[#1A1A1A] leading-tight cursor-pointer">
                        Enable live location for emergency alerts
                      </label>
                      <button type="button"
                        id="gps-toggle-btn"
                        onClick={handleGpsToggle}
                        disabled={gpsLoading}
                        className={`toggle-track ${gpsEnabled ? 'on' : ''} ${gpsLoading ? 'opacity-50 cursor-wait' : ''}`}
                        aria-label="Enable live location for emergency alerts"
                      >
                        <span className="toggle-thumb" />
                      </button>
                    </div>
                    <p className="text-[13px] text-[#9A9A9A] mt-1.5 leading-[1.5]">
                      Allows us to notify you if there is an urgent requirement in your immediate vicinity.
                    </p>
                    {gpsLoading && <p className="text-[12px] text-[#BE1F2E] mt-1.5 animate-pulse">Detecting GPS location…</p>}
                    {gpsError && (
                      <p className="text-[12px] text-[#BE1F2E] mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {gpsError}
                      </p>
                    )}
                    {gpsEnabled && !gpsError && (
                      <p className="text-[12px] text-[#22A06B] mt-2 flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Location captured! Emergency alerts active.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <button type="button"
                    
                    onClick={() => navigate(-1)}
                    className="text-[15px] font-[500] text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors flex items-center gap-1.5"
                  >
                    ← Back
                  </button>
                  <button type="button"
                    
                    onClick={handleNext}
                    className="btn-primary btn-arrow-hover"
                    style={{ padding: '14px 28px', minHeight: 52, fontSize: 15 }}
                  >
                    Final Step: Dashboard
                    <span className="material-symbols-outlined text-[18px] btn-arrow">arrow_forward</span>
                  </button>
                </div>

                <p className="text-center text-[13px] text-[#8A8078] flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  End-to-End Encrypted Data
                </p>
              </div>
            </div>
          </main>
        </div>
      ) : (
        /* ──────────────────────────────────────────────────────── */
        /* ── MOBILE AUTH DESIGN ────────────────────────────────── */
        /* ──────────────────────────────────────────────────────── */
        <div className="bg-[#faf8f5] min-h-screen flex flex-col">
          {/* TopAppBar */}
          <header className="w-full top-0 sticky z-50 bg-[#faf8f5] border-b border-[rgba(26,18,16,0.09)] flex items-center justify-between px-4 py-4 shrink-0">
            <button type="button"
              onClick={() => navigate(-1)}
              className="text-[#9e001f] active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-[20px] font-semibold text-[#9e001f] leading-none">Location & Donating</h1>
            <div className="w-6"></div>
          </header>

          {/* Setup Progress Bar */}
          <div className="w-full bg-[#e4e2df] h-1 shrink-0">
            <div className="bg-[#9e001f] h-full" style={{ width: '100%' }}></div>
          </div>

          {/* Form Content */}
          <main className="flex-grow px-5 py-8 max-w-md mx-auto w-full space-y-8 overflow-y-auto">
            <section>
              <h2 className="text-[32px] font-serif text-[#9e001f] italic leading-none">Your Location</h2>
              <p className="text-[#5c403f] text-[15px] mt-2">Connect with matching campaigns and emergency alerts.</p>
            </section>

            <div className="space-y-6">
              {/* City and Pincode */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 relative">
                  <label htmlFor="city-3" className="text-[14px] font-medium text-[#5c403f]">City</label>
                  <input id="city-3"
                    type="text"
                    value={city}
                    onChange={(e) => { setCity(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="e.g. Mumbai"
                    className="w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[16px] outline-none transition-all focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f]"
                  />
                  {showSuggestions && city && filteredSuggestions.length > 0 && (
                    <ul className="absolute z-30 w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg shadow-lg top-[76px] max-h-48 overflow-y-auto divide-y divide-[rgba(26,18,16,0.05)]">
                      {filteredSuggestions.map((suggestion) => (
                        <li
                          key={suggestion}
                          onClick={() => {
                            setCity(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="px-4 py-3 text-[15px] hover:bg-[#faf8f5] cursor-pointer text-[#1b1c1a]"
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="district-mobile" className="text-[14px] font-medium text-[#5c403f]">District</label>
                  <input id="district-mobile"
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Enter District"
                    className="w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[16px] outline-none transition-all focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="pincode-4" className="text-[14px] font-medium text-[#5c403f]">Pincode</label>
                  <input id="pincode-4"
                    type="text"
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="Enter PIN"
                    maxLength="6"
                    className={`w-full bg-white border rounded-lg px-4 py-3 text-[16px] outline-none transition-all ${
                      pincodeError
                        ? 'border-[#BE1F2E] focus:ring-2 focus:ring-[#BE1F2E]/25'
                        : 'border-[rgba(26,18,16,0.09)] focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f]'
                    }`}
                  />
                  {pincodeError && <p className="text-[12px] text-[#BE1F2E] mt-1">{pincodeError}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="address-mobile" className="text-[14px] font-medium text-[#5c403f]">Street Address / Landmark</label>
                <textarea id="address-mobile"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter detailed street address or landmark"
                  rows="2"
                  className="w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[16px] outline-none transition-all focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f] resize-none"
                />
              </div>


              {/* GPS Live Location Toggle Card */}
              <div className={`border rounded-xl p-4 flex items-start gap-3.5 transition-all duration-300 ${
                gpsEnabled
                  ? 'bg-[#22A06B]/5 border-[#22A06B]/20'
                  : 'bg-[#9e001f]/5 border-[#9e001f]/10'
              }`}>
                <span className={`material-symbols-outlined mt-0.5 shrink-0 ${gpsEnabled ? 'text-[#22A06B]' : 'text-[#9e001f]'}`}>
                  {gpsEnabled ? 'check_circle' : 'my_location'}
                </span>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[14px] font-semibold text-[#1b1c1a] leading-snug">GPS Live Verification</span>
                    <label aria-label="Toggle GPS Live Verification" className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={gpsEnabled}
                        onChange={handleGpsToggle}
                        disabled={gpsLoading}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#e4e2df] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9e001f]" />
                    </label>
                  </div>
                  <p className="text-[12px] text-[#737373] mt-1 leading-normal">Required to sort nearest camps and activate regional emergency alerts.</p>
                  {gpsLoading && <p className="text-[12px] text-[#9e001f] mt-1.5 animate-pulse flex items-center gap-1"><span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span> Detecting Location...</p>}
                  {gpsError && <p className="text-[12px] text-[#BE1F2E] mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span> {gpsError}</p>}
                  {gpsEnabled && !gpsError && <p className="text-[12px] text-[#22A06B] mt-1.5 flex items-center gap-1 font-semibold"><span className="material-symbols-outlined text-[14px]">verified</span> Live Coordinates captured!</p>}
                </div>
              </div>

              {/* Past Donation History Toggle */}
              <div className="bg-white border border-[rgba(26,18,16,0.07)] rounded-xl p-4 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col pr-3">
                    <span className="text-[15px] font-semibold text-[#1b1c1a]">Donated before?</span>
                    <span className="text-[12px] text-[#737373]">Determines matching eligibility windows.</span>
                  </div>
                  <label aria-label="Toggle past donation history" className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={donatedBefore}
                      onChange={(e) => setDonatedBefore(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#e4e2df] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9e001f]" />
                  </label>
                </div>

                {/* Donation Sub-panel */}
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: donatedBefore ? 320 : 0, opacity: donatedBefore ? 1 : 0 }}
                >
                  <div className="pt-4 border-t border-[rgba(26,18,16,0.05)] space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="how-many-times-5" className="text-[13px] font-medium text-[#5c403f]">How many times?</label>
                      <input id="how-many-times-5"
                        type="number"
                        min="1"
                        value={donationTimes}
                        onChange={(e) => setDonationTimes(e.target.value)}
                        placeholder="e.g. 3"
                        className="w-full bg-[#faf8f5] border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#9e001f]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="date-of-last-donation-6" className="text-[13px] font-medium text-[#5c403f]">Date of last donation</label>
                      <input id="date-of-last-donation-6"
                        type="date"
                        value={lastDonation}
                        onChange={(e) => setLastDonation(e.target.value)}
                        className="w-full bg-[#faf8f5] border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#9e001f]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="type-of-last-donation-7" className="text-[13px] font-medium text-[#5c403f]">Type of last donation</label>
                      <div className="flex gap-2">
                        {donationTypes.map((dt) => (
                          <button type="button"
                            key={dt.id}
                            type="button"
                            onClick={() => setDonationType(dt.id)}
                            className={`flex-grow py-2 rounded-full text-[12px] font-bold border transition-all ${
                              donationType === dt.id
                                ? 'bg-[#9e001f] border-[#9e001f] text-white shadow-sm'
                                : 'bg-[#faf8f5] border-[rgba(26,18,16,0.09)] text-[#5c403f]'
                            }`}
                          >
                            {dt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col gap-3 pt-6">
                <button type="button"
                  onClick={handleNext}
                  className="w-full bg-[#9e001f] text-white font-semibold py-4 rounded-full active:scale-95 hover:opacity-90 shadow-xl shadow-[#9e001f]/20 transition-all flex items-center justify-center gap-2"
                >
                  Go to Dashboard <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                <button type="button"
                  onClick={() => navigate(-1)}
                  className="w-full bg-transparent text-[#5c403f] font-semibold py-3 rounded-full hover:bg-[#f5f3f0] transition-colors text-center"
                >
                  Back
                </button>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default LocationPage;
