import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const bloodGroups = ['A+', 'A−', 'B+', 'B−', 'O+', 'O−', 'AB+', 'AB−'];

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [bgSelected, setBgSelected] = useState(null);

  // Inline validation on blur
  const validateField = (name, val) => {
    const errs = { ...errors };
    if (name === 'fullName') {
      const trimmed = val.trim();
      if (!trimmed) {
        errs.fullName = 'Full name is required';
      } else if (!/^[A-Za-z\s]+$/.test(trimmed)) {
        errs.fullName = 'Name can only contain letters and spaces';
      } else if (trimmed.split(/\s+/).length < 2) {
        errs.fullName = 'Please enter both your first and last name';
      } else {
        errs.fullName = '';
      }
    }
    if (name === 'age') {
      if (!val) errs.age = 'Age is required';
      else if (parseInt(val) < 18 || parseInt(val) > 65) errs.age = 'Age must be between 18 and 65';
      else errs.age = '';
    }
    setErrors(errs);
  };

  const validate = () => {
    const errs = {};
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      errs.fullName = 'Full name is required';
    } else if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      errs.fullName = 'Name can only contain letters and spaces';
    } else if (trimmedName.split(/\s+/).length < 2) {
      errs.fullName = 'Please enter both your first and last name';
    }
    
    if (!age) errs.age = 'Age is required';
    else if (parseInt(age) < 18 || parseInt(age) > 65) errs.age = 'Age must be between 18 and 65';
    if (!gender) errs.gender = 'Please select your biological sex';
    if (!bloodGroup) errs.bloodGroup = 'Please select your blood group';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ fullName: true, age: true, gender: true, bloodGroup: true });
    if (!validate()) return;
    const existing = JSON.parse(localStorage.getItem('raktsetu_donor_profile') || '{}');
    localStorage.setItem('raktsetu_donor_profile', JSON.stringify({ ...existing, fullName, age, gender, bloodGroup }));
    navigate('/location');
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
        <div className="w-full max-w-[540px] bg-white border border-[#EDE7E1] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-10 animate-fade-in">

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-label-tag text-[#9A9A9A]">Step 2 of 4</span>
              <span className="text-label-tag text-[#BE1F2E]">Basic Profile</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <div className="step-bar-done" />
              <div className="step-bar-active" />
              <div className="step-bar-upcoming" />
              <div className="step-bar-upcoming" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif mb-2" style={{ fontSize: 'clamp(28px,5vw,38px)', fontWeight: 700, color: '#1A0A0A', lineHeight: 1.1, fontFeatureSettings: '"liga" 0' }}>
              Basic <span className="text-[#BE1F2E] italic">Profile</span>
            </h1>
            <p className="text-[15px] text-[#9A9A9A] leading-[1.6]">Provide your core physiological details to ensure accurate matching.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Full Name */}
            <div>
              <label className="text-[14px] font-[600] text-[#1A1A1A] mb-1.5 block" htmlFor="fullName">Full Name</label>
              <div className={`flex items-center border rounded-xl overflow-hidden transition-all input-with-icon ${errors.fullName && touched.fullName ? 'border-[#BE1F2E] bg-[rgba(190,31,46,0.02)]' : 'border-[#D8D0CA]'} focus-within:border-[#BE1F2E] focus-within:shadow-[0_0_0_3px_rgba(190,31,46,0.12)]`}>
                <span className="material-symbols-outlined input-icon text-[#A8A0A0] text-[20px] ml-4 shrink-0 transition-colors">person</span>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => { setTouched((p) => ({ ...p, fullName: true })); validateField('fullName', fullName); }}
                  placeholder="e.g. Aarav Sharma"
                  className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-3.5 text-[16px] text-[#1A1A1A] placeholder:text-[#A8A0A0] outline-none"
                />
              </div>
              {errors.fullName && touched.fullName && (
                <p className="text-[12px] text-[#BE1F2E] mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span> {errors.fullName}
                </p>
              )}
            </div>

            {/* Age + Sex Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Age */}
              <div>
                <label className="text-[14px] font-[600] text-[#1A1A1A] mb-1.5 block" htmlFor="age">
                  Age <span className="text-[12px] font-normal text-[#9A9A9A]">(18–65)</span>
                </label>
                <input
                  id="age"
                  type="number"
                  min="18" max="65"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  onBlur={() => { setTouched((p) => ({ ...p, age: true })); validateField('age', age); }}
                  placeholder="Yrs"
                  className={`input-field ${errors.age && touched.age ? 'error' : ''}`}
                  style={{ borderRadius: 12 }}
                />
                {errors.age && touched.age && (
                  <p className="text-[12px] text-[#BE1F2E] mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span> {errors.age}
                  </p>
                )}
              </div>

              {/* Biological Sex */}
              <div>
                <label className="text-[14px] font-[600] text-[#1A1A1A] mb-1.5 block">Biological Sex</label>
                <div className="flex gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setGender(g);
                        setTouched((p) => ({ ...p, gender: true }));
                        setErrors((errs) => ({ ...errs, gender: '' }));
                      }}
                      className={`flex-1 py-3 rounded-xl text-[13px] font-[600] border transition-all duration-300 transform active:scale-95 ${
                        gender === g
                          ? 'bg-[#BE1F2E] border-[#BE1F2E] text-white shadow-[0_4px_14px_rgba(190,31,46,0.35)] scale-[1.03]'
                          : 'bg-white border-[#D8D0CA] text-[#5A5A5A] hover:border-[#BE1F2E] hover:text-[#BE1F2E] hover:scale-[1.01]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {errors.gender && touched.gender && (
                  <p className="text-[12px] text-[#BE1F2E] mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span> {errors.gender}
                  </p>
                )}
              </div>
            </div>

            {/* Blood Group Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[14px] font-[600] text-[#1A1A1A]">Blood Group</label>
                <button type="button" className="text-[13px] font-[500] text-[#BE1F2E] flex items-center gap-1 hover:underline">
                  <span className="material-symbols-outlined text-[14px]">info</span> Don't know?
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {bloodGroups.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => {
                      setBloodGroup(bg);
                      setTouched((p) => ({ ...p, bloodGroup: true }));
                      setErrors((errs) => ({ ...errs, bloodGroup: '' }));
                    }}
                    className={`aspect-square flex items-center justify-center rounded-xl border text-[16px] font-[700] transition-all duration-300 transform active:scale-95 ${
                      bloodGroup === bg
                        ? 'bg-[#BE1F2E] border-[#BE1F2E] text-white shadow-[0_4px_14px_rgba(190,31,46,0.35)] scale-[1.05]'
                        : 'border-[#D8D0CA] bg-white text-[#5A5A5A] hover:border-[#BE1F2E] hover:text-[#BE1F2E] hover:scale-[1.02]'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
              {errors.bloodGroup && touched.bloodGroup && (
                <p className="text-[12px] text-[#BE1F2E] mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span> {errors.bloodGroup}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-[#E0DAD4] pt-6">
              <button type="submit" className="btn-primary w-full btn-arrow-hover" style={{ minHeight: 52, fontSize: 15 }}>
                Continue to Location
                <span className="material-symbols-outlined text-[18px] btn-arrow">arrow_forward</span>
              </button>
              <p className="text-center text-[13px] text-[#8A8078] mt-4 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Your medical data is securely encrypted.
              </p>
            </div>
          </form>
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

export default ProfileSetup;
