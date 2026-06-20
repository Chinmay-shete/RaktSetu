import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [profile, setProfile] = useState({
    fullName: 'Arjun Malhotra',
    age: '29',
    gender: 'Male',
    city: 'New Delhi',
    pincode: '110001',
    bloodGroup: 'O-Positive',
    weight: '78',
    chronicIllness: false
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [initialProfile, setInitialProfile] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = { ...errors };
    const val = profile[field];
    
    if (field === 'fullName') {
      const trimmed = val.trim();
      if (!trimmed) {
        errs.fullName = 'Full name is required';
      } else if (!/^[A-Za-z\s]+$/.test(trimmed)) {
        errs.fullName = 'Name can only contain letters and spaces';
      } else if (trimmed.split(/\s+/).length < 2) {
        errs.fullName = 'Please enter both your first and last name';
      } else {
        delete errs.fullName;
      }
    }
    if (field === 'age') {
      if (!val) errs.age = 'Age is required';
      else if (parseInt(val) < 18 || parseInt(val) > 65) errs.age = 'Age must be between 18 and 65';
      else delete errs.age;
    }
    setErrors(errs);
  };

  useEffect(() => {
    const stored = localStorage.getItem('raktsetu_donor_profile');
    if (stored) {
      const data = JSON.parse(stored);
      setProfile(prev => {
        const merged = { ...prev, ...data };
        setInitialProfile(merged);
        return merged;
      });
    } else {
      setInitialProfile(profile);
    }
  }, []);

  useEffect(() => {
    if (initialProfile) {
      const dirty = Object.keys(profile).some(key => profile[key] !== initialProfile[key]);
      setIsDirty(dirty);
    }
  }, [profile, initialProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    const errs = {};
    const trimmedName = profile.fullName.trim();
    if (!trimmedName) {
      errs.fullName = 'Full name is required';
    } else if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      errs.fullName = 'Name can only contain letters and spaces';
    } else if (trimmedName.split(/\s+/).length < 2) {
      errs.fullName = 'Please enter both your first and last name';
    }
    if (!profile.age) errs.age = 'Age is required';
    else if (parseInt(profile.age) < 18 || parseInt(profile.age) > 65) errs.age = 'Age must be between 18 and 65';
    
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTouched({ fullName: true, age: true });
      return;
    }
    setSaveLoading(true);
    setTimeout(() => {
      localStorage.setItem('raktsetu_donor_profile', JSON.stringify(profile));
      setInitialProfile(profile);
      setIsDirty(false);
      setSaveLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText('RS-2024-8892');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            <Link to="/find-camps" className="text-[14px] font-[500] text-[#5A5A5A] hover:text-[#BE1F2E] transition-colors whitespace-nowrap">Find Camps</Link>
            <Link to="/dashboard" className="text-[14px] font-[500] text-[#5A5A5A] hover:text-[#BE1F2E] transition-colors whitespace-nowrap">My Impact</Link>
            <Link to="/edit-profile" className="text-[14px] font-[600] text-[#BE1F2E] border-b-2 border-[#BE1F2E] pb-1 whitespace-nowrap">Profile</Link>
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

      {/* Sticky Save Bar */}
      {isDirty && (
        <div className="sticky top-[72px] left-0 w-full bg-[#BE1F2E] text-white py-3.5 px-6 z-40 flex items-center justify-between shadow-md animate-slide-down">
          <span className="text-[14px] font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            You have unsaved changes in your profile.
          </span>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setProfile(initialProfile);
                setIsDirty(false);
              }}
              className="px-4 py-1.5 text-[13px] font-[600] border border-white rounded-full hover:bg-white hover:text-[#BE1F2E] transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              onClick={handleSave}
              disabled={saveLoading}
              className="px-5 py-1.5 text-[13px] font-[600] bg-white text-[#BE1F2E] rounded-full hover:bg-[#F5F0EB] transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {saveLoading ? 'Saving...' : 'Save Now'}
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN ───────────────────────────────────────────────────────── */}
      <main className="pt-32 pb-32 w-full max-w-4xl mx-auto px-6">
        <header className="mb-12">
          <h1 className="font-serif italic mb-4 leading-none tracking-[-0.03em] text-[#1A0A0A]" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>Edit Profile</h1>
          <p className="text-[#737373] text-[18px] max-w-xl leading-[28px]">
            Maintain your medical logistics profile to ensure accurate donor matching and clinical readiness during emergencies.
          </p>
        </header>

        <section className="bg-white border border-[rgba(26,18,16,0.09)] p-8 md:p-12 shadow-sm rounded-lg">
          <form className="space-y-12" onSubmit={handleSave}>
            
            {/* Profile Image & Header */}
            <div className="flex flex-col md:flex-row items-center pb-12 border-b border-[rgba(26,18,16,0.09)] justify-center text-center">
              <div>
                <h2 className="font-serif italic leading-[48px] text-[#1A0A0A]" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>Donor Credentials</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <p className="text-[#737373] text-[14px] font-[500] uppercase tracking-[0.02em]">Patient ID: RS-2024-8892</p>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1 text-[#BE1F2E] hover:bg-[#BE1F2E]/10 rounded-full transition-colors flex items-center justify-center"
                    title="Copy Patient ID"
                  >
                    <span className="material-symbols-outlined text-[16px]">{copied ? 'done' : 'content_copy'}</span>
                  </button>
                  {copied && <span className="text-[11px] text-[#22A06B] font-semibold uppercase tracking-wider">Copied!</span>}
                </div>
              </div>
            </div>

            {/* Identity Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8 gap-x-12">
              <div className="md:col-span-4">
                <h3 className="text-[24px] font-[500] italic text-[#BE1F2E] leading-[32px]">Identity</h3>
                <p className="text-[#737373] text-[12px] font-[600] tracking-[0.05em] mt-1">Official donor identification details.</p>
              </div>
              <div className="md:col-span-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[14px] font-[500] text-[#685c59]">Full Name</label>
                  <input 
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('fullName')}
                    className={`input-field ${errors.fullName && touched.fullName ? 'error' : ''}`} 
                    type="text" 
                  />
                  {errors.fullName && touched.fullName && (
                    <p className="text-[12px] text-[#BE1F2E] mt-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span> {errors.fullName}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[14px] font-[500] text-[#685c59]">Age</label>
                    <input 
                      name="age"
                      value={profile.age}
                      onChange={handleChange}
                      onBlur={() => handleFieldBlur('age')}
                      className={`input-field ${errors.age && touched.age ? 'error' : ''}`} 
                      type="number" 
                    />
                    {errors.age && touched.age && (
                      <p className="text-[12px] text-[#BE1F2E] mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span> {errors.age}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[14px] font-[500] text-[#685c59]">Gender</label>
                    <div className="relative">
                      <select 
                        name="gender"
                        value={profile.gender}
                        onChange={handleChange}
                        className="input-field appearance-none pr-10"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Non-binary</option>
                        <option>Prefer not to say</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#A8A0A0]">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Geography Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8 gap-x-12 pt-8 border-t border-[rgba(26,18,16,0.04)]">
              <div className="md:col-span-4">
                <h3 className="text-[24px] font-[500] italic text-[#BE1F2E] leading-[32px]">Geography</h3>
                <p className="text-[#737373] text-[12px] font-[600] tracking-[0.05em] mt-1">Logistics optimization parameters.</p>
              </div>
              <div className="md:col-span-8 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[14px] font-[500] text-[#685c59]">City</label>
                  <input 
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    className="input-field" 
                    type="text" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-[500] text-[#685c59]">Pincode</label>
                  <input 
                    name="pincode"
                    value={profile.pincode}
                    onChange={handleChange}
                    className="input-field" 
                    type="text" 
                  />
                </div>
              </div>
            </div>

            {/* Medical Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8 gap-x-12 pt-8 border-t border-[rgba(26,18,16,0.04)]">
              <div className="md:col-span-4">
                <h3 className="text-[24px] font-[500] italic text-[#BE1F2E] leading-[32px]">Medical</h3>
                <p className="text-[#737373] text-[12px] font-[600] tracking-[0.05em] mt-1">Clinical data for safe extraction.</p>
              </div>
              <div className="md:col-span-8 space-y-8">
                <div className="flex items-center justify-between p-6 bg-[#ffdad8]/30 border border-[#ffdad8] rounded-lg">
                  <div>
                    <h4 className="text-[14px] font-[500] text-[#92001c]">Blood Group</h4>
                    <p className="text-[#737373] text-[12px] font-[600] tracking-[0.05em]">Requires verification to change</p>
                  </div>
                  <span className="text-[30px] font-[700] text-[#BE1F2E]">{profile.bloodGroup}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[14px] font-[500] text-[#685c59]">Weight (kg)</label>
                    <input 
                      name="weight"
                      value={profile.weight}
                      onChange={handleChange}
                      className="input-field" 
                      type="number" 
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-[#D8D0CA] rounded-xl bg-white relative group">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-[500] text-[#685c59]">Chronic Illness</span>
                      <div className="relative cursor-pointer group/tooltip">
                        <span className="material-symbols-outlined text-[16px] text-[#A8A0A0] hover:text-[#BE1F2E] transition-colors">info</span>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#1A0A0A] text-white text-[12px] rounded-lg shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity z-25 leading-normal">
                          Includes conditions like hypertension, diabetes, asthma, or cardiac issues which affect donation windows.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1A0A0A]"></div>
                        </div>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, chronicIllness: !prev.chronicIllness }))}
                      className={`toggle-track ${profile.chronicIllness ? 'on' : ''}`}
                    >
                      <span className="toggle-thumb" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-12 flex flex-col md:flex-row items-center justify-end gap-4 border-t border-[rgba(26,18,16,0.09)]">
              <button 
                type="button" 
                onClick={() => navigate('/dashboard')}
                className="w-full md:w-auto px-8 py-4 text-[14px] font-[500] text-[#685c59] hover:text-[#1b1c1a] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={saveLoading}
                className="w-full md:w-auto bg-[#BE1F2E] text-white px-12 py-4 rounded-full text-[14px] font-[500] hover:scale-105 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveLoading && (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {saveLoading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
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
            <Link className="text-[#737373] hover:text-white transition-colors text-[16px]" to="/privacy">Privacy Policy</Link>
            <Link className="text-[#737373] hover:text-white transition-colors text-[16px]" to="/terms">Terms of Service</Link>
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

export default EditProfile;
