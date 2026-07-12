import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DonorNavbar from './layout/DonorNavbar';
import DonorFooter from './layout/DonorFooter';
import { useToast } from '../hooks/useToast';

const EditProfile = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [profile, setProfile] = useState({
    fullName: '',
    age: '',
    gender: 'Male',
    city: '',
    pincode: '',
    address: '',
    district: '',
    lat: 0,
    lng: 0,
    bloodGroup: 'O+',
    weight: '',
    chronicIllness: false,
    donorCode: '',
    notifySMS: true,
    notifyWhatsApp: false,
    notifyEmail: true
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [initialProfile, setInitialProfile] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // States to track label focus color highlights
  const [focusedField, setFocusedField] = useState(null);

  /* ── Fetch profile on mount ─────────────────────────────────────── */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/donor/profile');
        const data = response.data;
        const merged = {
          fullName:      data.fullName || '',
          age:           data.age?.toString() || '',
          gender:        data.gender || 'Male',
          city:          data.city || '',
          pincode:       data.pincode || '',
          address:       data.address || '',
          district:      data.district || '',
          lat:           data.lat || 0,
          lng:           data.lng || 0,
          bloodGroup:    data.bloodGroup || 'O+',
          weight:        data.weight ? data.weight.toString() : '',
          chronicIllness: !!data.chronicIllness,
          donorCode:     data.donorCode || '',
          notifySMS:     true,
          notifyWhatsApp: false,
          notifyEmail:   true
        };
        setProfile(merged);
        setInitialProfile(merged);
      } catch (err) {
        console.error('Failed to fetch donor profile', err);
        const stored = localStorage.getItem('raktsetu_donor_profile');
        if (stored) {
          const data = JSON.parse(stored);
          const merged = {
            fullName:      data.fullName || '',
            age:           data.age?.toString() || '',
            gender:        data.gender || 'Male',
            city:          data.city || '',
            pincode:       data.pincode || '',
            address:       data.address || '',
            lat:           data.lat || 0,
            lng:           data.lng || 0,
            bloodGroup:    data.bloodGroup || 'O+',
            weight:        data.weight ? data.weight.toString() : '',
            chronicIllness: !!data.chronicIllness,
            donorCode:     data.donorCode || '',
            notifySMS:     true,
            notifyWhatsApp: false,
            notifyEmail:   true
          };
          setProfile(merged);
          setInitialProfile(merged);
        }
      }
    };
    fetchProfile();
  }, []);

  const [gpsLoading, setGpsLoading] = useState(false);

  const handleGetGps = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setProfile(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude
        }));
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          if (data) {
            const detectedCity = data.address?.city || data.address?.town || data.address?.village || '';
            const detectedDistrict = data.address?.county || data.address?.district || detectedCity || '';
            setProfile(prev => ({
              ...prev,
              address: data.display_name || prev.address,
              city: detectedCity || prev.city,
              district: detectedDistrict || prev.district,
              pincode: data.address?.postcode?.slice(0, 6) || prev.pincode
            }));
            toast.success('Live location coordinates & address loaded!');
          }
        } catch (err) {
          console.error(err);
          toast.warning('Live coordinates loaded, but failed to fetch address name.');
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        setGpsLoading(false);
        toast.error('Failed to get location. Please allow browser location access.');
      }
    );
  };

  /* ── Dirty detection ─────────────────────────────────────────────── */
  useEffect(() => {
    if (initialProfile) {
      const dirty = Object.keys(profile).some(
        key => String(profile[key]) !== String(initialProfile[key])
      );
      setIsDirty(dirty);
    }
  }, [profile, initialProfile]);

  /* ── Field change handler ────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  /* ── Inline blur validation ──────────────────────────────────────── */
  const handleFieldBlur = (field) => {
    setFocusedField(null);
    setTouched(prev => ({ ...prev, [field]: true }));
    const errs = { ...errors };
    const val = profile[field];
    if (field === 'fullName') {
      const t = val.trim();
      if (!t) errs.fullName = 'Full name is required';
      else if (!/^[A-Za-z\s]+$/.test(t)) errs.fullName = 'Name can only contain letters and spaces';
      else if (t.split(/\s+/).length < 2) errs.fullName = 'Enter both first and last name';
      else delete errs.fullName;
    }
    if (field === 'age') {
      if (!val) errs.age = 'Age is required';
      else if (parseInt(val) < 18 || parseInt(val) > 65) errs.age = 'Age must be 18–65';
      else delete errs.age;
    }
    if (field === 'weight' && val) {
      const w = parseFloat(val);
      if (isNaN(w) || w < 45 || w > 300) errs.weight = 'Weight must be at least 45 kg';
      else delete errs.weight;
    }
    setErrors(errs);
  };

  /* ── Save ────────────────────────────────────────────────────────── */
  const handleSave = async (e) => {
    if (e) e.preventDefault();

    const errs = {};
    const trimmedName = profile.fullName.trim();
    if (!trimmedName) errs.fullName = 'Full name is required';
    else if (!/^[A-Za-z\s]+$/.test(trimmedName)) errs.fullName = 'Letters and spaces only';
    else if (trimmedName.split(/\s+/).length < 2) errs.fullName = 'Enter both first and last name';
    if (!profile.age) errs.age = 'Age is required';
    else if (parseInt(profile.age) < 18 || parseInt(profile.age) > 65) errs.age = 'Age must be 18–65';
    if (profile.weight) {
      const w = parseFloat(profile.weight);
      if (isNaN(w) || w < 45 || w > 300) errs.weight = 'Weight must be at least 45 kg';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTouched({ fullName: true, age: true, weight: true });
      return;
    }

    setSaveLoading(true);
    setSaveSuccess(false);

    try {
      const payload = {
        fullName:      profile.fullName.trim(),
        age:           parseInt(profile.age, 10),
        gender:        profile.gender,
        chronicIllness: profile.chronicIllness,
        availableForDonation: true
      };
      if (profile.weight !== '' && profile.weight !== null) {
        payload.weight = parseFloat(profile.weight);
      } else {
        payload.weight = null;
      }

      const response = await api.put('/donor/profile', payload);
      const data = response.data;

      // Sync geography details (coordinates, city, pincode, exact address) to backend
      await api.post('/donor/location', {
        lat: parseFloat(profile.lat || 0),
        lng: parseFloat(profile.lng || 0),
        city: profile.city || 'Mumbai',
        pincode: profile.pincode || '400001',
        address: profile.address || null,
        district: profile.district || null
      });

      const updated = {
        ...profile,
        fullName:      data.fullName || profile.fullName,
        age:           data.age?.toString() || profile.age,
        gender:        data.gender || profile.gender,
        weight:        data.weight ? data.weight.toString() : '',
        chronicIllness: data.chronicIllness ?? profile.chronicIllness,
        city:          profile.city,
        pincode:       profile.pincode,
        address:       profile.address,
        district:      profile.district,
        lat:           profile.lat,
        lng:           profile.lng
      };

      localStorage.setItem('raktsetu_donor_profile', JSON.stringify(updated));
      setProfile(updated);
      setInitialProfile(updated);
      setIsDirty(false);
      setSaveSuccess(true);
      toast.success('Profile saved successfully!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setErrors({ api: err.response?.data?.message || 'Failed to update profile.' });
      toast.error('Failed to update profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCopyId = () => {
    if (profile.donorCode) {
      navigator.clipboard.writeText(profile.donorCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getBloodGroupParts = (bg) => {
    if (!bg) return { type: 'O', sign: '+', label: 'Positive' };
    const sign = bg.includes('-') || bg.includes('−') ? '-' : '+';
    const type = bg.replace('+', '').replace('-', '').replace('−', '').trim();
    const label = sign === '-' ? 'Negative' : 'Positive';
    return { type, sign, label };
  };

  const bgParts = getBloodGroupParts(profile.bloodGroup);

  return (
    <div className="bg-[#fbf9f6] text-[#1b1c1a] min-h-screen selection:bg-[#ffdad8]"
         style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="noise-filter" />

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── DESKTOP LAYOUT (md:block hidden) ───────────────────── */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="hidden md:block">
        <DonorNavbar />

        {isDirty && (
          <div className="fixed top-[72px] left-0 w-full bg-[#BE1F2E] text-white py-3 px-4 z-40 flex items-center justify-between gap-3 shadow-md">
            <span className="text-[13px] font-[500] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>You have unsaved changes.</span>
            </span>
            <div className="flex gap-2 shrink-0">
              <button type="button"
                
                onClick={() => { setProfile(initialProfile); setErrors({}); setTouched({}); }}
                className="px-3 py-1.5 text-[12px] font-[600] border border-white rounded-full hover:bg-white hover:text-[#BE1F2E] transition-all"
              >
                Discard
              </button>
              <button type="button"
                
                onClick={handleSave}
                disabled={saveLoading}
                className="px-4 py-1.5 text-[12px] font-[600] bg-white text-[#BE1F2E] rounded-full hover:bg-[#ffdad8] transition-all disabled:opacity-50"
              >
                {saveLoading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}

        <main className={`pb-24 w-full max-w-3xl mx-auto px-6 ${isDirty ? 'pt-36' : 'pt-24'}`}>
          <header className="mb-8">
            <h1 className="font-serif italic leading-none tracking-[-0.03em] text-[#1A0A0A] text-[72px]">
              Edit Profile
            </h1>
            <p className="text-[#737373] text-[16px] mt-3 max-w-md leading-relaxed">
              Keep your donor profile up to date for accurate matching and emergency readiness.
            </p>
          </header>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Identity */}
            <section className="bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-7 shadow-sm">
              <div className="mb-5 pb-4 border-b border-[rgba(26,18,16,0.07)]">
                <h3 className="text-[22px] font-[600] italic text-[#BE1F2E]">Identity</h3>
                <p className="text-[13px] text-[#737373] mt-0.5 font-medium">Official donor identification details</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="full-name-1" className="text-[13px] font-[600] text-[#685c59]">Full Name</label>
                  <input id="full-name-1"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('fullName')}
                    className={`w-full h-[48px] border rounded-xl px-4 text-[15px] bg-[#faf8f5] outline-none transition-all ${
                      errors.fullName && touched.fullName ? 'border-[#BE1F2E]' : 'border-[#D8D0CA] focus:border-[#BE1F2E]'
                    }`}
                  />
                  {errors.fullName && touched.fullName && <p className="text-[12px] text-[#BE1F2E] mt-1">{errors.fullName}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="age-2" className="text-[13px] font-[600] text-[#685c59]">Age</label>
                    <input id="age-2"
                      name="age"
                      type="number"
                      value={profile.age}
                      onChange={handleChange}
                      onBlur={() => handleFieldBlur('age')}
                      className={`w-full h-[48px] border rounded-xl px-4 text-[15px] bg-[#faf8f5] outline-none transition-all ${
                        errors.age && touched.age ? 'border-[#BE1F2E]' : 'border-[#D8D0CA] focus:border-[#BE1F2E]'
                      }`}
                    />
                    {errors.age && touched.age && <p className="text-[12px] text-[#BE1F2E] mt-1">{errors.age}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="gender-3" className="text-[13px] font-[600] text-[#685c59]">Gender</label>
                    <select id="gender-3"
                      name="gender"
                      value={profile.gender}
                      onChange={handleChange}
                      className="w-full h-[48px] border border-[#D8D0CA] rounded-xl px-4 text-[15px] bg-[#faf8f5] outline-none pr-10 cursor-pointer"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Geography */}
            <section className="bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-7 shadow-sm">
              <div className="mb-5 pb-4 border-b border-[rgba(26,18,16,0.07)] flex justify-between items-center">
                <div>
                  <h3 className="text-[22px] font-[600] italic text-[#BE1F2E]">Geography</h3>
                  <p className="text-[13px] text-[#737373] mt-0.5 font-medium">Location details for proximity camp matching</p>
                </div>
                <button
                  type="button"
                  onClick={handleGetGps}
                  disabled={gpsLoading}
                  className="px-4 py-2 text-[12px] font-[600] bg-[#1a1210] text-white hover:bg-[#BE1F2E] rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px] animate-none">{gpsLoading ? 'progress_activity' : 'my_location'}</span>
                  {gpsLoading ? 'Getting GPS...' : 'Get Live GPS'}
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="city-4" className="text-[13px] font-[600] text-[#685c59]">City</label>
                    <input id="city-4"
                      name="city"
                      value={profile.city}
                      onChange={handleChange}
                      className="w-full h-[48px] border border-[#D8D0CA] rounded-xl px-4 text-[15px] bg-[#faf8f5] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="district-desktop" className="text-[13px] font-[600] text-[#685c59]">District</label>
                    <input id="district-desktop"
                      name="district"
                      value={profile.district || ''}
                      onChange={handleChange}
                      className="w-full h-[48px] border border-[#D8D0CA] rounded-xl px-4 text-[15px] bg-[#faf8f5] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="pincode-5" className="text-[13px] font-[600] text-[#685c59]">Pincode</label>
                    <input id="pincode-5"
                      name="pincode"
                      value={profile.pincode}
                      onChange={handleChange}
                      className="w-full h-[48px] border border-[#D8D0CA] rounded-xl px-4 text-[15px] bg-[#faf8f5] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="address-desktop" className="text-[13px] font-[600] text-[#685c59]">Street Address / Landmark</label>
                  <textarea id="address-desktop"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Capture live location or enter manually..."
                    className="w-full border border-[#D8D0CA] rounded-xl px-4 py-3 text-[15px] bg-[#faf8f5] outline-none resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Medical */}
            <section className="bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-7 shadow-sm">
              <div className="mb-5 pb-4 border-b border-[rgba(26,18,16,0.07)]">
                <h3 className="text-[22px] font-[600] italic text-[#BE1F2E]">Medical</h3>
                <p className="text-[13px] text-[#737373] mt-0.5 font-medium">Clinical health parameters</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#ffdad8]/20 border border-[#ffdad8] rounded-xl">
                  <div>
                    <p className="text-[12px] font-[600] uppercase tracking-widest text-[#92001c]">Blood Group</p>
                    <p className="text-[12px] text-[#737373] mt-0.5">Requires medical verification to change</p>
                  </div>
                  <span className="text-[28px] font-[800] text-[#BE1F2E]">{profile.bloodGroup}</span>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="weight-kg-6" className="text-[13px] font-[600] text-[#685c59]">Weight (kg)</label>
                  <input id="weight-kg-6"
                    name="weight"
                    type="number"
                    value={profile.weight}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('weight')}
                    placeholder="Optional"
                    className={`w-full h-[48px] border rounded-xl px-4 text-[15px] bg-[#faf8f5] outline-none transition-all ${
                      errors.weight && touched.weight ? 'border-[#BE1F2E]' : 'border-[#D8D0CA] focus:border-[#BE1F2E]'
                    }`}
                  />
                  {errors.weight && touched.weight && <p className="text-[12px] text-[#BE1F2E] mt-1">{errors.weight}</p>}
                </div>
                <div className="flex items-center justify-between p-4 border border-[#D8D0CA] rounded-xl bg-[#faf8f5]">
                  <div>
                    <p className="text-[14px] font-[500] text-[#685c59]">Chronic Illness</p>
                    <p className="text-[12px] text-[#A8A0A0] mt-0.5">Existing medical conditions</p>
                  </div>
                  <button type="button"
                    aria-label="Toggle chronic illness status"
                    onClick={() => setProfile(prev => ({ ...prev, chronicIllness: !prev.chronicIllness }))}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      profile.chronicIllness ? 'bg-[#BE1F2E]' : 'bg-[#D8D0CA]'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                      profile.chronicIllness ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </section>

            <div className="flex justify-end gap-3">
              <button type="button"
                
                onClick={() => navigate('/dashboard')}
                className="px-6 py-4 border border-[rgba(26,18,16,0.12)] rounded-full text-[14px] font-[600] text-[#685c59] hover:bg-[#f5f0eb]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="bg-[#BE1F2E] text-white px-8 py-4 rounded-full text-[14px] font-[600] hover:bg-[#a31825]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </main>
        <DonorFooter />
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── MOBILE LAYOUT (block md:hidden) ────────────────────── */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="block md:hidden">
        {/* TopAppBar */}
        <header className="w-full top-0 sticky z-50 bg-[#faf8f5] border-b border-[rgba(26,18,16,0.09)] flex items-center justify-between px-4 py-4">
          <button type="button"
            onClick={() => navigate('/dashboard')}
            className="text-[#9e001f] hover:opacity-80 transition-opacity active:scale-95 transition-transform duration-200"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-[20px] font-semibold text-[#9e001f]">Profile</h1>
          <div className="w-6"></div>
        </header>

        <main className="max-w-md mx-auto px-4 pt-8 pb-32 space-y-10">
          <form onSubmit={handleSave} className="space-y-10">
            {/* Identity Section */}
            <section className="space-y-6">
              <div className="flex items-end justify-between border-b border-[#e5bdbb] pb-2">
                <h2 className="text-[32px] font-serif text-[#9e001f] italic leading-none">Identity</h2>
                <span className="text-[12px] font-semibold text-[#737373] uppercase tracking-widest">Section 01</span>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="full-name-7" className={`text-[14px] font-medium transition-colors ${focusedField === 'fullName' ? 'text-[#9e001f]' : 'text-[#5c403f]'}`}>Full Name</label>
                  <input id="full-name-7"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => handleFieldBlur('fullName')}
                    placeholder="Enter your full name"
                    type="text"
                    className={`w-full bg-white border rounded-lg px-4 py-3 text-[16px] outline-none transition-all ${
                      errors.fullName && touched.fullName
                        ? 'border-[#BE1F2E] focus:ring-2 focus:ring-[#BE1F2E]/25'
                        : 'border-[rgba(26,18,16,0.09)] focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f]'
                    }`}
                  />
                  {errors.fullName && touched.fullName && (
                    <p className="text-[12px] text-[#BE1F2E] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span> {errors.fullName}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="age-8" className={`text-[14px] font-medium transition-colors ${focusedField === 'age' ? 'text-[#9e001f]' : 'text-[#5c403f]'}`}>Age</label>
                    <input id="age-8"
                      name="age"
                      type="number"
                      value={profile.age}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('age')}
                      onBlur={() => handleFieldBlur('age')}
                      className={`w-full bg-white border rounded-lg px-4 py-3 text-[16px] outline-none transition-all ${
                        errors.age && touched.age
                          ? 'border-[#BE1F2E] focus:ring-2 focus:ring-[#BE1F2E]/25'
                          : 'border-[rgba(26,18,16,0.09)] focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f]'
                      }`}
                    />
                    {errors.age && touched.age && (
                      <p className="text-[12px] text-[#BE1F2E] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span> {errors.age}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="gender-9" className="text-[14px] font-medium text-[#5c403f]">Gender</label>
                    <div className="relative">
                      <select id="gender-9"
                        name="gender"
                        value={profile.gender}
                        onChange={handleChange}
                        className="w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[16px] outline-none transition-all focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f] appearance-none"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Non-binary</option>
                        <option>Prefer not to say</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-[#906f6e] pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Geography Section */}
            <section className="space-y-6">
              <div className="flex items-end justify-between border-b border-[#e5bdbb] pb-2">
                <h2 className="text-[32px] font-serif text-[#9e001f] italic leading-none">Geography</h2>
                <button
                  type="button"
                  onClick={handleGetGps}
                  disabled={gpsLoading}
                  className="px-3.5 py-1.5 text-[11px] font-[600] bg-[#9e001f] text-white hover:opacity-90 rounded-full transition-all disabled:opacity-50 flex items-center gap-1 active:scale-95 shadow-md shadow-[#9e001f]/10"
                >
                  <span className="material-symbols-outlined text-[14px] animate-none">{gpsLoading ? 'progress_activity' : 'my_location'}</span>
                  {gpsLoading ? 'GPS...' : 'Live GPS'}
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="city-10" className={`text-[14px] font-medium transition-colors ${focusedField === 'city' ? 'text-[#9e001f]' : 'text-[#5c403f]'}`}>City</label>
                  <input id="city-10"
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('city')}
                    onBlur={() => setFocusedField(null)}
                    type="text"
                    className="w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[16px] outline-none transition-all focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f]"
                  />
                </div>
                 <div className="flex flex-col gap-2">
                  <label htmlFor="district-mobile-input" className={`text-[14px] font-medium transition-colors ${focusedField === 'district' ? 'text-[#9e001f]' : 'text-[#5c403f]'}`}>District</label>
                  <input id="district-mobile-input"
                    name="district"
                    value={profile.district || ''}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('district')}
                    onBlur={() => setFocusedField(null)}
                    type="text"
                    className="w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[16px] outline-none transition-all focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="pincode-11" className={`text-[14px] font-medium transition-colors ${focusedField === 'pincode' ? 'text-[#9e001f]' : 'text-[#5c403f]'}`}>Pincode</label>
                  <input id="pincode-11"
                    name="pincode"
                    value={profile.pincode}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('pincode')}
                    onBlur={() => setFocusedField(null)}
                    type="text"
                    className="w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[16px] outline-none transition-all focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="address-mobile" className={`text-[14px] font-medium transition-colors ${focusedField === 'address' ? 'text-[#9e001f]' : 'text-[#5c403f]'}`}>Street Address / Landmark</label>
                  <textarea id="address-mobile"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => setFocusedField(null)}
                    rows="2"
                    placeholder="Capture live location or enter manually..."
                    className="w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[16px] outline-none transition-all focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f] resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Medical Section */}
            <section className="space-y-6">
              <div className="flex items-end justify-between border-b border-[#e5bdbb] pb-2">
                <h2 className="text-[32px] font-serif text-[#9e001f] italic leading-none">Medical</h2>
                <span className="text-[12px] font-semibold text-[#737373] uppercase tracking-widest">Section 03</span>
              </div>

              {/* Blood Group Highlight Card */}
              <div className="bg-[#9e001f]/5 border border-[#9e001f]/10 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10">
                  <span className="material-symbols-outlined text-[96px] text-[#9e001f]" style={{ fontVariationSettings: "'FILL' 1" }}>bloodtype</span>
                </div>
                <div className="relative z-10 flex flex-col gap-1">
                  <span className="text-[12px] font-semibold text-[#9e001f] uppercase tracking-widest">Verified Blood Type</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[60px] font-serif text-[#9e001f] leading-none">{bgParts.type}</span>
                    <span className="bg-[#9e001f] text-white rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">{bgParts.label}</span>
                  </div>
                  <p className="text-[12px] text-[#5c403f] mt-2 flex items-start gap-2 leading-relaxed">
                    <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">info</span>
                    This field is locked. Changing blood group requires medical verification from a certified center.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <label htmlFor="weight-kg-12" className={`text-[14px] font-medium transition-colors ${focusedField === 'weight' ? 'text-[#9e001f]' : 'text-[#5c403f]'}`}>Weight (kg)</label>
                    <span className="text-[10px] font-[600] text-[#A8A0A0] bg-[#f5f0eb] px-1.5 py-0.5 rounded uppercase tracking-wide">Optional</span>
                  </div>
                  <input id="weight-kg-12"
                    name="weight"
                    type="number"
                    value={profile.weight}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('weight')}
                    onBlur={() => handleFieldBlur('weight')}
                    className={`w-full bg-white border rounded-lg px-4 py-3 text-[16px] outline-none transition-all ${
                      errors.weight && touched.weight
                        ? 'border-[#BE1F2E] focus:ring-2 focus:ring-[#BE1F2E]/25'
                        : 'border-[rgba(26,18,16,0.09)] focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f]'
                    }`}
                  />
                  {errors.weight && touched.weight && (
                    <p className="text-[12px] text-[#BE1F2E] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span> {errors.weight}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between bg-white border border-[rgba(26,18,16,0.09)] rounded-lg p-4">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-semibold text-[#1b1c1a]">Chronic Illness</span>
                    <span className="text-[12px] text-[#737373]">Do you have any existing conditions?</span>
                  </div>
                  <label aria-label="Toggle chronic illness status" className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.chronicIllness}
                      onChange={(e) => setProfile(prev => ({ ...prev, chronicIllness: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#e4e2df] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9e001f]" />
                  </label>
                </div>
              </div>
            </section>

            {/* Form Actions */}
            <div className="flex flex-col gap-3 pt-6">
              <button
                type="submit"
                disabled={saveLoading}
                className="w-full bg-[#9e001f] text-white font-semibold py-4 rounded-full active:scale-95 hover:opacity-90 shadow-xl shadow-[#9e001f]/20 transition-all flex items-center justify-center gap-2"
              >
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button"
                
                onClick={() => navigate('/dashboard')}
                className="w-full bg-transparent text-[#5c403f] font-semibold py-3 rounded-full hover:bg-[#f5f3f0] transition-colors text-center"
              >
                Cancel
              </button>
            </div>
          </form>
        </main>

        {/* BottomNavBar */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 px-2 py-2 flex items-center justify-around"
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(26,18,16,0.09)',
            boxShadow: '0 -4px 24px rgba(26,18,16,0.08)',
          }}
        >
          {[
            { name: 'Home', path: '/dashboard', icon: 'home' },
            { name: 'Camps', path: '/find-camps', icon: 'bloodtype' },
            { name: 'Map', path: '/location', icon: 'explore' },
            { name: 'Profile', path: '/edit-profile', icon: 'person' }
          ].map((item) => {
            const isActive = item.path === '/edit-profile'; // Profile is active
            return (
              <button type="button"
                key={item.name}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl flex-1 transition-all cursor-pointer"
                style={{
                  color: isActive ? '#C8102E' : '#5C403F',
                  background: isActive ? 'rgba(200,16,46,0.06)' : 'transparent',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                <span className="text-[9px] font-[700] uppercase tracking-wider text-center" style={{ fontSize: '9px' }}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
