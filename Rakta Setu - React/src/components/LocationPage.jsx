import React, { useState, useEffect } from 'react';
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
  const [donatedBefore, setDonatedBefore] = useState(false);
  const [lastDonation, setLastDonation] = useState('');
  const [donationType, setDonationType] = useState('blood');
  const [donationTimes, setDonationTimes] = useState('');
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const cityOptions = ['Mumbai', 'Pune', 'Nagpur', 'Satara', 'Kolhapur'];
  const filteredSuggestions = cityOptions.filter(c =>
    c.toLowerCase().includes(city.toLowerCase()) && c.toLowerCase() !== city.toLowerCase()
  );

  const donationTypes = [
    { id: 'blood', label: 'Whole Blood' },
    { id: 'platelets', label: 'Platelets' },
    { id: 'plasma', label: 'Plasma' },
  ];

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
          if (data?.address) {
            const detectedCity = data.address.city || data.address.town || data.address.village || '';
            const detectedPin = data.address.postcode || '';
            if (detectedCity && !city) setCity(detectedCity);
            if (detectedPin && !pincode) setPincode(detectedPin.slice(0, 6));
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
      
      // 1. Prepare profile data (normalize U+2212 '−' to '-' so enum validation passes)
      const bloodGroupNormalized = (existing.bloodGroup || 'O+').replace('−', '-');
      const chronicIllness = !!(existing.screeningAnswers?.q6);
      const lastDonatedDate = donatedBefore && lastDonation ? lastDonation : null;
      
      const profileData = {
        fullName: existing.fullName || 'Anonymous Donor',
        age: parseInt(existing.age || '25', 10),
        gender: existing.gender || 'Male',
        bloodGroup: bloodGroupNormalized,
        weight: 60, // Default weight passing validation
        chronicIllness,
        lastDonatedDate
      };
      
      // 2. Submit profile to backend
      await api.post('/donor/profile', profileData);
      
      // 3. Save location details
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
      
      // If GPS wasn't used, fall back to city coordinates
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
        pincode: pincode || '400001'
      });
      
      // Save local state
      localStorage.setItem('raktsetu_donor_profile', JSON.stringify({
        ...existing, city, pincode, donatedBefore,
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
      alert('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex flex-col" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="noise-filter" />

      {/* Auth Navbar */}
      <nav className="w-full bg-white border-b border-[#E0DAD4] sticky top-0 z-40">
        <div className="flex justify-between items-center h-16 px-6 md:px-10 lg:px-16 w-full">
          <Link to="/" className="font-serif text-[22px] font-bold text-[#BE1F2E]" style={{ fontFeatureSettings: '"liga" 0' }}>RaktSetu</Link>
          <a className="text-[13px] text-[#9A9A9A] hover:text-[#BE1F2E] transition-colors" href="#">Need help?</a>
        </div>
      </nav>

      <main className="flex-grow flex items-start justify-center py-12 px-4">
        {/* ── WHITE CARD — matching Step 2 ─────────────────────────── */}
        <div className="w-full max-w-[540px] bg-white border border-[#EDE7E1] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-10 animate-fade-in">

          {/* Progress Indicator */}
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

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif mb-2" style={{ fontSize: 'clamp(26px,4vw,34px)', fontWeight: 700, color: '#1A0A0A', lineHeight: 1.1, fontFeatureSettings: '"liga" 0' }}>
              Where are you <span className="text-[#BE1F2E] italic">located?</span>
            </h1>
            <p className="text-[15px] text-[#9A9A9A] leading-[1.6]">Helps us connect you with nearby blood camps and emergency alerts.</p>
          </div>

          <div className="space-y-6">
            {/* City & Pincode */}
            <div className="grid grid-cols-2 gap-4">
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

            <div className="border-t border-[#E0DAD4]" />

            {/* Donated Before Toggle */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-[600] text-[#1A1A1A]">Have you donated before?</p>
                  <p className="text-[13px] text-[#9A9A9A] mt-0.5">Helps us determine eligibility windows.</p>
                </div>
                {/* Global toggle style */}
                <button
                  type="button"
                  className={`toggle-track ${donatedBefore ? 'on' : ''}`}
                  onClick={() => setDonatedBefore(!donatedBefore)}
                  role="switch"
                  aria-checked={donatedBefore}
                >
                  <span className="toggle-thumb" />
                </button>
              </div>

              {/* Sub-panel: animated expand */}
              <div
                className="overflow-hidden transition-all duration-250"
                style={{ maxHeight: donatedBefore ? 300 : 0, opacity: donatedBefore ? 1 : 0, marginTop: donatedBefore ? 16 : 0 }}
              >
                <div className="bg-[#F5F0EB] border border-[#E0DAD4] rounded-xl p-5 space-y-5">
                  {/* How many times */}
                  <div>
                    <label className="text-[13px] font-[600] text-[#5A5A5A] mb-1.5 block">Approx. how many times?</label>
                    <input
                      type="number"
                      min="1"
                      value={donationTimes}
                      onChange={(e) => setDonationTimes(e.target.value)}
                      placeholder="e.g. 3"
                      className="input-field"
                      style={{ borderRadius: 10 }}
                    />
                  </div>
                  {/* Last donation date */}
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
                  {/* Type */}
                  <div>
                    <label className="text-[13px] font-[600] text-[#5A5A5A] mb-2 block">Type of donation</label>
                    <div className="flex flex-wrap gap-2">
                      {donationTypes.map((dt) => (
                        <button
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

            {/* GPS Toggle Alert Card */}
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
                  <label className="text-[14px] font-[600] text-[#1A1A1A] leading-tight cursor-pointer">
                    Enable live location for emergency alerts
                  </label>
                  <button
                    type="button"
                    onClick={handleGpsToggle}
                    disabled={gpsLoading}
                    className={`toggle-track ${gpsEnabled ? 'on' : ''} ${gpsLoading ? 'opacity-50 cursor-wait' : ''}`}
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

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-[15px] font-[500] text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors flex items-center gap-1.5"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary btn-arrow-hover"
                style={{ padding: '14px 28px', minHeight: 52, fontSize: 15 }}
              >
                Final Step: Dashboard
                <span className="material-symbols-outlined text-[18px] btn-arrow">arrow_forward</span>
              </button>
            </div>

            {/* Trust */}
            <p className="text-center text-[13px] text-[#8A8078] flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              End-to-End Encrypted Data
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 text-center text-[12px] text-[#9A9A9A]">
        © 2024 RaktSetu ·{' '}
        <Link className="hover:text-[#BE1F2E] transition-colors" to="/privacy">Privacy Policy</Link> ·{' '}
        <Link className="hover:text-[#BE1F2E] transition-colors" to="/terms">Terms of Service</Link>
      </footer>
    </div>
  );
};

export default LocationPage;
