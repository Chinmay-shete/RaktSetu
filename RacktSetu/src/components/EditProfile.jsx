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
      setProfile(prev => ({
        ...prev,
        ...data,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
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
    localStorage.setItem('raktsetu_donor_profile', JSON.stringify(profile));
    navigate('/dashboard');
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
            <div className="w-10 h-10 rounded-full bg-[#eae8e5] flex items-center justify-center border border-[rgba(26,18,16,0.09)] overflow-hidden cursor-pointer shrink-0">
              <img className="w-full h-full object-cover" alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4LePSzF9UlW9h3IVZNZA-jV2c_WlVBNOPY2YRf99m4LW6pnZCOJow0bRw6skvc_LwP1Sjs85QaT6fzeIhBQQwGz1cr7qSI-8pe5tYU7UGinXprHgh-PK3cqnJI4GSnh0oPXhDHqPSKEOnfTxKJG5Rq2yoBTo7yub1N3Vml9LsMa5dsvmQIi2q31bqbhLaYDbmBFE5idwcqyYnZUlrzUizutMwPtY0Wobo9nsUpDKigPRPnhBg27638USNnXdaUSlGAlX-APGnWJw" />
            </div>
          </div>
        </div>
      </nav>

      {/* ── MAIN ───────────────────────────────────────────────────────── */}
      <main className="pt-32 pb-32 w-full max-w-4xl mx-auto px-6">
        <header className="mb-12">
          <h1 className="font-serif text-[60px] md:text-[100px] italic mb-4 leading-none tracking-[-0.04em]">Edit Profile</h1>
          <p className="text-[#737373] text-[18px] max-w-xl leading-[28px]">
            Maintain your medical logistics profile to ensure accurate donor matching and clinical readiness during emergencies.
          </p>
        </header>

        <section className="bg-white border border-[rgba(26,18,16,0.09)] p-8 md:p-12 shadow-sm rounded-lg">
          <form className="space-y-12" onSubmit={handleSave}>
            
            {/* Profile Image & Header */}
            <div className="flex flex-col md:flex-row items-center pb-12 border-b border-[rgba(26,18,16,0.09)] justify-center text-center">
              <div>
                <h2 className="font-serif text-[48px] italic leading-[56px]">Donor Credentials</h2>
                <p className="text-[#737373] text-[14px] font-[500] uppercase tracking-[0.02em]">Patient ID: RS-2024-8892</p>
              </div>
            </div>

            {/* Identity Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8 gap-x-12">
              <div className="md:col-span-4">
                <h3 className="text-[24px] font-[500] italic text-[#c8102e] leading-[32px]">Identity</h3>
                <p className="text-[#737373] text-[12px] font-[600] tracking-[0.05em] mt-1">Official donor identification details.</p>
              </div>
              <div className="md:col-span-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[14px] font-[500] text-[#685c59]">Full Name</label>
                  <input 
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    className="w-full bg-[#faf8f5] border border-[rgba(26,18,16,0.09)] p-4 text-[16px] focus:outline-none focus:border-[#c8102e] focus:ring-4 focus:ring-[#c8102e]/10 transition-all" 
                    type="text" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[14px] font-[500] text-[#685c59]">Age</label>
                    <input 
                      name="age"
                      value={profile.age}
                      onChange={handleChange}
                      className="w-full bg-[#faf8f5] border border-[rgba(26,18,16,0.09)] p-4 text-[16px] focus:outline-none focus:border-[#c8102e] focus:ring-4 focus:ring-[#c8102e]/10 transition-all" 
                      type="number" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[14px] font-[500] text-[#685c59]">Gender</label>
                    <select 
                      name="gender"
                      value={profile.gender}
                      onChange={handleChange}
                      className="w-full bg-[#faf8f5] border border-[rgba(26,18,16,0.09)] p-4 text-[16px] focus:outline-none focus:border-[#c8102e] focus:ring-4 focus:ring-[#c8102e]/10 transition-all"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Geography Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8 gap-x-12 pt-8 border-t border-[rgba(26,18,16,0.04)]">
              <div className="md:col-span-4">
                <h3 className="text-[24px] font-[500] italic text-[#c8102e] leading-[32px]">Geography</h3>
                <p className="text-[#737373] text-[12px] font-[600] tracking-[0.05em] mt-1">Logistics optimization parameters.</p>
              </div>
              <div className="md:col-span-8 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[14px] font-[500] text-[#685c59]">City</label>
                  <input 
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    className="w-full bg-[#faf8f5] border border-[rgba(26,18,16,0.09)] p-4 text-[16px] focus:outline-none focus:border-[#c8102e] focus:ring-4 focus:ring-[#c8102e]/10 transition-all" 
                    type="text" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-[500] text-[#685c59]">Pincode</label>
                  <input 
                    name="pincode"
                    value={profile.pincode}
                    onChange={handleChange}
                    className="w-full bg-[#faf8f5] border border-[rgba(26,18,16,0.09)] p-4 text-[16px] focus:outline-none focus:border-[#c8102e] focus:ring-4 focus:ring-[#c8102e]/10 transition-all" 
                    type="text" 
                  />
                </div>
              </div>
            </div>

            {/* Medical Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8 gap-x-12 pt-8 border-t border-[rgba(26,18,16,0.04)]">
              <div className="md:col-span-4">
                <h3 className="text-[24px] font-[500] italic text-[#c8102e] leading-[32px]">Medical</h3>
                <p className="text-[#737373] text-[12px] font-[600] tracking-[0.05em] mt-1">Clinical data for safe extraction.</p>
              </div>
              <div className="md:col-span-8 space-y-8">
                <div className="flex items-center justify-between p-6 bg-[#ffdad8]/30 border border-[#ffdad8] rounded-lg">
                  <div>
                    <h4 className="text-[14px] font-[500] text-[#92001c]">Blood Group</h4>
                    <p className="text-[#737373] text-[12px] font-[600] tracking-[0.05em]">Requires verification to change</p>
                  </div>
                  <span className="text-[30px] font-[700] text-[#c8102e]">{profile.bloodGroup}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[14px] font-[500] text-[#685c59]">Weight (kg)</label>
                    <input 
                      name="weight"
                      value={profile.weight}
                      onChange={handleChange}
                      className="w-full bg-[#faf8f5] border border-[rgba(26,18,16,0.09)] p-4 text-[16px] focus:outline-none focus:border-[#c8102e] focus:ring-4 focus:ring-[#c8102e]/10 transition-all" 
                      type="number" 
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-[rgba(26,18,16,0.09)] bg-[#faf8f5]">
                    <span className="text-[14px] font-[500] text-[#685c59]">Chronic Illness</span>
                    <button 
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, chronicIllness: !prev.chronicIllness }))}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none ${profile.chronicIllness ? 'bg-[#c8102e]' : 'bg-[#e4e2df]'}`}
                    >
                      <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform ${profile.chronicIllness ? 'translate-x-6' : 'translate-x-0'}`}></span>
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
                className="w-full md:w-auto bg-[#c8102e] text-white px-12 py-4 rounded-full text-[14px] font-[500] hover:scale-105 shadow-lg active:scale-95 transition-all"
              >
                Save Changes
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

export default EditProfile;
