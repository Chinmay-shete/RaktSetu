import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const bloodGroups = ['A+', 'A−', 'B+', 'B−', 'O+', 'O−', 'AB+', 'AB−'];

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [weight, setWeight] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [bgSelected, setBgSelected] = useState(null);
  
  // New state for NBTC screening wizard
  const [wizardStep, setWizardStep] = useState('basic'); // 'basic' | 'screening'
  const [screeningAnswers, setScreeningAnswers] = useState({
    q1: null, q2: null, q3: null, q4: null, q5: null,
    q6: null, q7: null, q8: null, q9: null,
  });
  const [screeningError, setScreeningError] = useState('');

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const hasProfile = localStorage.getItem('raktsetu_donor_profile');
    const otpVerified = localStorage.getItem('raktsetu_otp_verified');
    if (!hasProfile && !otpVerified) {
      navigate('/');
    }
  }, [navigate]);

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
    if (name === 'weight' && val) {
      const w = parseFloat(val);
      if (isNaN(w) || w < 45 || w > 300) {
        errs.weight = 'Weight must be at least 45 kg';
      } else {
        errs.weight = '';
      }
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
    
    if (weight) {
      const w = parseFloat(weight);
      if (isNaN(w) || w < 45 || w > 300) {
        errs.weight = 'Weight must be at least 45 kg';
      }
    }
    
    if (!gender) errs.gender = 'Please select your biological sex';
    if (!bloodGroup) errs.bloodGroup = 'Please select your blood group';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBasicSubmit = (e) => {
    if (e) e.preventDefault();
    setTouched({ fullName: true, age: true, gender: true, bloodGroup: true, weight: true });
    if (!validate()) return;
    setWizardStep('screening');
  };

  const handleScreeningSubmit = (e) => {
    if (e) e.preventDefault();
    // Check if all questions are answered. q8 is only for females.
    const questions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q9'];
    if (gender === 'Female') questions.push('q8');

    const unanswered = questions.some((q) => screeningAnswers[q] === null);
    if (unanswered) {
      setScreeningError('Please answer all applicable questions.');
      return;
    }

    const existing = JSON.parse(localStorage.getItem('raktsetu_donor_profile') || '{}');
    localStorage.setItem('raktsetu_donor_profile', JSON.stringify({ 
      ...existing, fullName, age, gender, bloodGroup, weight: weight ? parseFloat(weight) : null, screeningAnswers 
    }));
    navigate('/location');
  };

  const questionsList = [
    { id: 'q1', text: 'Are you currently taking any antibiotics or other medications?' },
    { id: 'q2', text: 'Have you had a tattoo, ear, or skin piercing in the last 6 months?' },
    { id: 'q3', text: 'Have you had any dental work or tooth extraction in the last 1 month?' },
    { id: 'q4', text: 'Have you suffered from malaria, typhoid, or dengue in the last 1 year?' },
    { id: 'q5', text: 'Have you ever tested positive for HIV, Hepatitis B, or Hepatitis C?' },
    { id: 'q6', text: 'Do you have any chronic illness like diabetes, heart disease, or cancer?' },
    { id: 'q7', text: 'Have you consumed alcohol in the last 24 hours?' },
    { id: 'q8', text: 'Are you pregnant, breastfeeding, or have had a miscarriage in the last 6 months?', condition: gender === 'Female' },
    { id: 'q9', text: 'Have you donated blood in the last 3 months?' }
  ];

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
                  <span className="text-label-tag text-[#9A9A9A]">
                    {wizardStep === 'basic' ? 'Step 2 of 4' : 'Step 2.5 of 4'}
                  </span>
                  <span className="text-label-tag text-[#BE1F2E]">
                    {wizardStep === 'basic' ? 'Basic Profile' : 'Health Screening'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="step-bar-done" />
                  <div className="step-bar-active" />
                  <div className={wizardStep === 'screening' ? 'step-bar-active' : 'step-bar-upcoming'} />
                  <div className="step-bar-upcoming" />
                </div>
              </div>

              <div className="mb-8">
                <h1 className="font-serif mb-2" style={{ fontSize: 'clamp(28px,5vw,38px)', fontWeight: 700, color: '#1A0A0A', lineHeight: 1.1, fontFeatureSettings: '"liga" 0' }}>
                  {wizardStep === 'basic' ? (
                    <>Basic <span className="text-[#BE1F2E] italic">Profile</span></>
                  ) : (
                    <>Health <span className="text-[#BE1F2E] italic">Screening</span></>
                  )}
                </h1>
                <p className="text-[15px] text-[#9A9A9A] leading-[1.6]">
                  {wizardStep === 'basic' 
                    ? 'Provide your core physiological details to ensure accurate matching.' 
                    : 'Please answer these NBTC eligibility questions honestly to ensure blood safety.'}
                </p>
              </div>

              {wizardStep === 'basic' ? (
                <form onSubmit={handleBasicSubmit} className="space-y-6">
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

                  <div className="grid grid-cols-2 gap-4">
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

                    <div>
                      <label htmlFor="biological-sex-1" className="text-[14px] font-[600] text-[#1A1A1A] mb-1.5 block">Biological Sex</label>
                      <div className="flex gap-2">
                        {['Male', 'Female', 'Other'].map((g) => (
                        <button type="button"
                          key={g}
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

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <label htmlFor="weight-2" className="text-[14px] font-[600] text-[#1A1A1A]">Weight</label>
                      <span className="text-[10px] font-[600] text-[#A8A0A0] bg-[#f5f0eb] px-1.5 py-0.5 rounded uppercase tracking-wide">Optional</span>
                    </div>
                    <div className={`flex items-center border rounded-xl overflow-hidden focus-within:border-[#BE1F2E] focus-within:shadow-[0_0_0_3px_rgba(190,31,46,0.12)] ${errors.weight && touched.weight ? 'border-[#BE1F2E]' : 'border-[#D8D0CA]'}`}>
                      <span className="material-symbols-outlined text-[#A8A0A0] text-[20px] ml-4 shrink-0">weight</span>
                      <input id="weight-2"
                        type="number"
                        min="30"
                        max="300"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        onBlur={() => { setTouched((p) => ({ ...p, weight: true })); validateField('weight', weight); }}
                        placeholder="e.g. 60 (Min 45 kg for blood donation)"
                        className="flex-grow bg-transparent border-none focus:ring-0 px-3 py-3.5 text-[16px] text-[#1A1A1A] placeholder:text-[#A8A0A0] outline-none"
                      />
                    </div>
                    {errors.weight && touched.weight && (
                      <p className="text-[12px] text-[#BE1F2E] mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span> {errors.weight}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label htmlFor="blood-group-3" className="text-[14px] font-[600] text-[#1A1A1A]">Blood Group</label>
                      <button type="button" className="text-[13px] font-[500] text-[#BE1F2E] flex items-center gap-1 hover:underline">
                        <span className="material-symbols-outlined text-[14px]">info</span> Don't know?
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2.5">
                      {bloodGroups.map((bg) => (
                        <button type="button"
                          key={bg}
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

                  <div className="border-t border-[#E0DAD4] pt-6">
                    <button type="submit" className="btn-primary w-full btn-arrow-hover" style={{ minHeight: 52, fontSize: 15 }}>
                      Continue to Screening
                      <span className="material-symbols-outlined text-[18px] btn-arrow">arrow_forward</span>
                    </button>
                    <p className="text-center text-[13px] text-[#8A8078] mt-4 flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      Your medical data is securely encrypted.
                    </p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleScreeningSubmit} className="space-y-5">
                  <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {questionsList.filter(q => q.condition !== false).map((q, index) => (
                      <div key={q.id} className="bg-[#FAFAFA] border border-[#E0DAD4] rounded-xl p-4">
                        <p className="text-[14px] font-[600] text-[#1A1A1A] mb-3">
                          <span className="text-[#BE1F2E] mr-1.5">{index + 1}.</span>
                          {q.text}
                        </p>
                        <div className="flex gap-3">
                          <button type="button"
                            
                            onClick={() => {
                              setScreeningAnswers(p => ({ ...p, [q.id]: true }));
                              setScreeningError('');
                            }}
                            className={`flex-1 py-2 rounded-lg text-[13px] font-[600] border transition-all ${
                              screeningAnswers[q.id] === true
                                ? 'bg-[#BE1F2E] border-[#BE1F2E] text-white shadow-sm'
                                : 'bg-white border-[#D8D0CA] text-[#5A5A5A] hover:border-[#BE1F2E] hover:text-[#BE1F2E]'
                            }`}
                          >
                            Yes
                          </button>
                          <button type="button"
                            
                            onClick={() => {
                              setScreeningAnswers(p => ({ ...p, [q.id]: false }));
                              setScreeningError('');
                            }}
                            className={`flex-1 py-2 rounded-lg text-[13px] font-[600] border transition-all ${
                              screeningAnswers[q.id] === false
                                ? 'bg-[#10B981] border-[#10B981] text-white shadow-sm'
                                : 'bg-white border-[#D8D0CA] text-[#5A5A5A] hover:border-[#10B981] hover:text-[#10B981]'
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {screeningError && (
                    <p className="text-[13px] text-[#BE1F2E] flex items-center justify-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-[16px]">error</span> {screeningError}
                    </p>
                  )}

                  <div className="border-t border-[#E0DAD4] pt-6 flex gap-3">
                    <button type="button" 
                       
                      onClick={() => setWizardStep('basic')}
                      className="flex-1 py-3 rounded-xl border border-[#D8D0CA] bg-white text-[#5A5A5A] font-[600] text-[15px] hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button type="submit" className="flex-[2] btn-primary btn-arrow-hover" style={{ minHeight: 52, fontSize: 15 }}>
                      Finish & Setup Location
                      <span className="material-symbols-outlined text-[18px] btn-arrow">arrow_forward</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </main>

          <footer className="py-6 text-center text-[12px] text-[#9A9A9A]">
            © 2024 RaktSetu ·{' '}
            <Link className="hover:text-[#BE1F2E] transition-colors" to="/privacy">Privacy Policy</Link> ·{' '}
            <Link className="hover:text-[#BE1F2E] transition-colors" to="/terms">Terms of Service</Link>
          </footer>
        </div>
      ) : (
        /* ──────────────────────────────────────────────────────── */
        /* ── MOBILE AUTH DESIGN ────────────────────────────────── */
        /* ──────────────────────────────────────────────────────── */
        <div className="bg-[#faf8f5] min-h-screen flex flex-col">
          {/* TopAppBar */}
          <header className="w-full top-0 sticky z-50 bg-[#faf8f5] border-b border-[rgba(26,18,16,0.09)] flex items-center justify-between px-4 py-4 shrink-0">
            {wizardStep === 'screening' ? (
              <button type="button"
                onClick={() => setWizardStep('basic')}
                className="text-[#9e001f] active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            ) : (
              <div className="w-6"></div>
            )}
            <h1 className="text-[20px] font-semibold text-[#9e001f] leading-none">Profile Setup</h1>
            <div className="w-6"></div>
          </header>

          {/* Setup Progress Bar */}
          <div className="w-full bg-[#e4e2df] h-1 shrink-0">
            <div className="bg-[#9e001f] h-full transition-all duration-300" style={{ width: wizardStep === 'basic' ? '50%' : '75%' }}></div>
          </div>

          {/* Form Content */}
          <main className="flex-grow px-5 py-8 max-w-md mx-auto w-full space-y-8 overflow-y-auto">
            {wizardStep === 'basic' ? (
              <form onSubmit={handleBasicSubmit} className="space-y-6">
                <section>
                  <h2 className="text-[32px] font-serif text-[#9e001f] italic leading-none">Basic Details</h2>
                  <p className="text-[#5c403f] text-[15px] mt-2">Core physiological profile for donation mapping.</p>
                </section>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="full-name-4" className="text-[14px] font-medium text-[#5c403f]">Full Name</label>
                    <input id="full-name-4"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={() => { setTouched((p) => ({ ...p, fullName: true })); validateField('fullName', fullName); }}
                      placeholder="e.g. Aarav Sharma"
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

                  {/* Age & Weight */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="age-18-65-5" className="text-[14px] font-medium text-[#5c403f]">Age (18–65)</label>
                      <input id="age-18-65-5"
                        type="number"
                        min="18" max="65"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        onBlur={() => { setTouched((p) => ({ ...p, age: true })); validateField('age', age); }}
                        placeholder="Yrs"
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
                      <div className="flex items-center gap-2">
                        <label htmlFor="weight-6" className="text-[14px] font-medium text-[#5c403f]">Weight</label>
                        <span className="text-[9px] font-bold text-[#A8A0A0] bg-[#f5f0eb] px-1 py-0.5 rounded uppercase tracking-wide">Optional</span>
                      </div>
                      <input id="weight-6"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        onBlur={() => { setTouched((p) => ({ ...p, weight: true })); validateField('weight', weight); }}
                        placeholder="kg"
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
                  </div>

                  {/* Biological Sex */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="biological-sex-7" className="text-[14px] font-medium text-[#5c403f]">Biological Sex</label>
                    <div className="flex bg-[#eae8e5]/50 rounded-full p-1 w-full border border-[rgba(26,18,16,0.05)]">
                      {['Male', 'Female', 'Other'].map((g) => (
                        <button type="button"
                          key={g}
                          onClick={() => {
                            setGender(g);
                            setTouched((p) => ({ ...p, gender: true }));
                            setErrors((errs) => ({ ...errs, gender: '' }));
                          }}
                          className={`flex-1 py-2 text-[13px] font-bold rounded-full transition-all duration-200 ${
                            gender === g ? 'bg-[#9e001f] text-white shadow' : 'text-[#5c403f]'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                    {errors.gender && touched.gender && (
                      <p className="text-[12px] text-[#BE1F2E] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span> {errors.gender}
                      </p>
                    )}
                  </div>

                  {/* Blood Group Grid Selection */}
                  <div className="flex flex-col gap-2 pt-2">
                    <label htmlFor="blood-group-8" className="text-[14px] font-medium text-[#5c403f]">Blood Group</label>
                    <div className="grid grid-cols-4 gap-2.5">
                      {bloodGroups.map((bg) => (
                        <button type="button"
                          key={bg}
                          type="button"
                          onClick={() => {
                            setBloodGroup(bg);
                            setTouched((p) => ({ ...p, bloodGroup: true }));
                            setErrors((errs) => ({ ...errs, bloodGroup: '' }));
                          }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-[18px] font-bold transition-all duration-200 active:scale-95 ${
                            bloodGroup === bg
                              ? 'bg-[#9e001f] border-[#9e001f] text-white shadow-lg shadow-[#9e001f]/20 scale-105'
                              : 'border-[rgba(26,18,16,0.09)] bg-white text-[#5c403f] hover:border-[#9e001f] focus:border-[#9e001f]'
                          }`}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                    {errors.bloodGroup && touched.bloodGroup && (
                      <p className="text-[12px] text-[#BE1F2E] flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[14px]">error</span> {errors.bloodGroup}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full bg-[#9e001f] text-white font-semibold py-4 rounded-full active:scale-95 hover:opacity-90 shadow-xl shadow-[#9e001f]/20 transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Screening <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleScreeningSubmit} className="space-y-6">
                <section>
                  <h2 className="text-[32px] font-serif text-[#9e001f] italic leading-none">Health Screening</h2>
                  <p className="text-[#5c403f] text-[15px] mt-2">Answer honestly to fulfill national blood safety regulations.</p>
                </section>

                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                  {questionsList.filter(q => q.condition !== false).map((q, index) => (
                    <div key={q.id} className="bg-white border border-[rgba(26,18,16,0.07)] rounded-xl p-4 shadow-sm space-y-3.5">
                      <p className="text-[14px] font-semibold text-[#1b1c1a] leading-snug">
                        <span className="text-[#9e001f] mr-1.5">{index + 1}.</span>
                        {q.text}
                      </p>
                      <div className="flex gap-3">
                        <button type="button"
                          
                          onClick={() => {
                            setScreeningAnswers(p => ({ ...p, [q.id]: true }));
                            setScreeningError('');
                          }}
                          className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold border transition-all ${
                            screeningAnswers[q.id] === true
                              ? 'bg-[#9e001f] border-[#9e001f] text-white shadow-sm'
                              : 'bg-white border-[rgba(26,18,16,0.09)] text-[#5c403f] hover:border-[#9e001f]'
                          }`}
                        >
                          Yes
                        </button>
                        <button type="button"
                          
                          onClick={() => {
                            setScreeningAnswers(p => ({ ...p, [q.id]: false }));
                            setScreeningError('');
                          }}
                          className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold border transition-all ${
                            screeningAnswers[q.id] === false
                              ? 'bg-[#10B981] border-[#10B981] text-white shadow-sm'
                              : 'bg-white border-[rgba(26,18,16,0.09)] text-[#5c403f] hover:border-[#10B981]'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {screeningError && (
                  <p className="text-[13px] text-[#BE1F2E] flex items-center justify-center gap-1 mt-2">
                    <span className="material-symbols-outlined text-[16px]">error</span> {screeningError}
                  </p>
                )}

                <div className="pt-4 flex gap-3">
                  <button type="button"
                    
                    onClick={() => setWizardStep('basic')}
                    className="w-1/3 bg-transparent border border-[rgba(26,18,16,0.15)] text-[#5c403f] font-semibold py-4 rounded-full active:scale-95 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-[#9e001f] text-white font-semibold py-4 rounded-full active:scale-95 hover:opacity-90 shadow-xl shadow-[#9e001f]/20 transition-all flex items-center justify-center gap-1"
                  >
                    Finish Setup <span className="material-symbols-outlined text-[18px]">done</span>
                  </button>
                </div>
              </form>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default ProfileSetup;
