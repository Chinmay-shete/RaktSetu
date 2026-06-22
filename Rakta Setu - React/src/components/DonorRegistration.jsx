import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DonorRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email/Phone, 2: OTP, 3: Create Password
  const [inputVal, setInputVal] = useState('');
  const [isEmail, setIsEmail] = useState(false);
  const [buttonState, setButtonState] = useState('default');

  // OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [allFilled, setAllFilled] = useState(false);
  const otpRefs = useRef([]);

  // Password Setup
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Detect when all 6 digits are filled
  useEffect(() => {
    setAllFilled(otp.every((d) => d !== ''));
  }, [otp]);

  // Countdown for OTP
  useEffect(() => {
    if (step !== 2) return;
    if (timer <= 0) { setResendDisabled(false); return; }
    const t = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [step, timer]);

  // Auto-focus first OTP box on step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    }
  }, [step]);

  const handleInputChange = (e) => {
    const v = e.target.value;
    setInputVal(v);
    setIsEmail(v.includes('@'));
  };

  const handleSendOTP = () => {
    if (!inputVal || buttonState !== 'default') return;
    setButtonState('sending');
    setTimeout(() => {
      setButtonState('sent');
      setTimeout(() => {
        setStep(2);
        setTimer(45);
        setResendDisabled(true);
        setOtpError('');
        setOtpSuccess(false);
        setButtonState('default');
      }, 700);
    }, 1200);
  };

  const handleResendOTP = () => {
    setTimer(45);
    setResendDisabled(true);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const next = [...otp];
      if (!otp[index] && index > 0) {
        next[index - 1] = '';
        setOtp(next);
        otpRefs.current[index - 1]?.focus();
      } else {
        next[index] = '';
        setOtp(next);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    const lastFilled = Math.min(pasted.length, 5);
    otpRefs.current[lastFilled]?.focus();
  };

  const handleVerifyOTP = () => {
    const code = otp.join('');
    if (code.length < 6) { setOtpError('Please enter all 6 digits.'); return; }
    setButtonState('sending');
    setTimeout(() => {
      setOtpSuccess(true);
      setOtpError('');
      setTimeout(() => {
        setButtonState('default');
        setStep(3); // Go to Password setup step
      }, 700);
    }, 900);
  };

  const handleCreatePassword = (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordError('');
    setButtonState('sending');

    setTimeout(() => {
      setButtonState('default');
      const normalizedInput = inputVal.toLowerCase().trim();
      const userKey = 'raktsetu_user_' + normalizedInput;
      const mockRole = getRoleFromEmail(inputVal);
      
      localStorage.setItem(userKey, JSON.stringify({
        username: normalizedInput,
        password: password,
        role: mockRole
      }));

      // Route users automatically based on their roles
      if (mockRole === 'staff') {
        localStorage.setItem('raktsetu_hospital_authenticated', 'true');
        window.location.href = '/staff/dashboard';
      } else if (mockRole === 'admin') {
        const adminState = {
          status: 'logged_in',
          hospitalDetails: { hospitalName: 'Apex City Hospital' },
          invitedStaff: [
            { id: 1, name: 'Dr. Ramesh Kumar', email: 'ramesh.kumar@hospital.com', role: 'Medical Officer', status: 'Accepted', date: '2026-06-10' }
          ]
        };
        localStorage.setItem('raktsetu_admin_app_state', JSON.stringify(adminState));
        window.location.href = '/admin/dashboard';
      } else if (mockRole === 'district') {
        const districtState = {
          status: 'logged_in',
          officerDetails: { name: 'Rajesh Patil', district: 'Pune' }
        };
        localStorage.setItem('raktsetu_district_state', JSON.stringify(districtState));
        window.location.href = '/district/dashboard';
      } else if (mockRole === 'state') {
        const stateState = {
          status: 'logged_in',
          officerDetails: { name: 'Arvind Sawant', state: 'Maharashtra' }
        };
        localStorage.setItem('raktsetu_state_admin', JSON.stringify(stateState));
        window.location.href = '/state/dashboard';
      } else if (mockRole === 'systemadmin') {
        const sysAdminState = { status: 'logged_in' };
        localStorage.setItem('raktsetu_sysadmin_state', JSON.stringify(sysAdminState));
        window.location.href = '/systemadmin/dashboard';
      } else {
        localStorage.setItem('raktsetu_otp_verified', 'true');
        navigate('/profile-setup');
      }
    }, 1000);
  };

  const getRoleFromEmail = (val) => {
    const email = val.toLowerCase().trim();
    const parts = email.split('@');
    if (parts.length < 2) return 'donor';
    const domain = parts[1];
    if (domain.includes('staff')) return 'staff';
    if (domain.includes('admin')) return 'admin';
    if (domain.includes('district')) return 'district';
    if (domain.includes('state')) return 'state';
    if (domain.includes('systemadmin') || domain.includes('sysadmin')) return 'systemadmin';
    return 'donor';
  };

  // Basic validation for Step 1
  const isInputValid = isEmail 
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputVal)
    : /^\d{10}$/.test(inputVal.replace(/\D/g, ''));

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex flex-col" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="noise-filter" />

      {/* ── SIMPLIFIED AUTH NAVBAR ─────────────────────────────────────── */}
      <nav className="w-full bg-white border-b border-[#E0DAD4] sticky top-0 z-40">
        <div className="flex justify-between items-center h-16 px-6 md:px-10 lg:px-16 w-full">
          <Link to="/" className="font-serif text-[22px] font-bold text-[#BE1F2E]" style={{ fontFeatureSettings: '"liga" 0' }}>
            RaktSetu
          </Link>
          <a className="text-[13px] text-[#9A9A9A] hover:text-[#BE1F2E] transition-colors" href="#">
            Need help?
          </a>
        </div>
      </nav>

      {/* ── MAIN CARD ──────────────────────────────────────────────────── */}
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-[500px] bg-white border border-[#EDE7E1] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-10 relative overflow-hidden animate-fade-in">

          {/* Watermark */}
          <div className="absolute -top-8 -right-8 opacity-[0.03] pointer-events-none">
            <span className="material-symbols-outlined text-[200px]">medical_services</span>
          </div>

          {/* Header Row */}
          <div className="flex justify-between items-center mb-10">
            <span className="font-serif text-[20px] font-bold text-[#BE1F2E] italic">RaktSetu</span>
            <span className="badge-neutral">Donor Registration</span>
          </div>

          {/* ── STEP 1: EMAIL OR MOBILE ───────────────────────────────── */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h1 className="font-serif mb-2" style={{ fontSize: 'clamp(32px,5vw,42px)', fontWeight: 700, color: '#1A0A0A', lineHeight: 1.1, fontFeatureSettings: '"liga" 0' }}>
                Create your account
              </h1>
              <p className="text-[15px] text-[#9A9A9A] mb-8 leading-[1.6]">Join thousands of users saving lives across Maharashtra.</p>

              <div className="mb-5">
                <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Email or Mobile Number</label>
                <div className={`flex items-center h-[52px] border rounded-xl bg-white overflow-hidden transition-all ${isInputValid ? 'border-[#BE1F2E]' : 'border-[#D8D0CA]'} focus-within:border-[#BE1F2E] focus-within:shadow-[0_0_0_3px_rgba(190,31,46,0.12)]`}>
                  <input
                    className="flex-grow bg-transparent border-none focus:ring-0 px-4 text-[16px] text-[#1A1A1A] placeholder:text-[#A8A0A0] outline-none"
                    id="authInput"
                    type="text"
                    value={inputVal}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                    placeholder="Enter email or 10-digit mobile"
                  />
                </div>
              </div>

              <button
                className="btn-primary w-full"
                style={{ minHeight: 52 }}
                disabled={!isInputValid || buttonState !== 'default'}
                onClick={handleSendOTP}
              >
                {buttonState === 'default' && <>Verify <span className="material-symbols-outlined text-[18px] btn-arrow">arrow_forward</span></>}
                {buttonState === 'sending' && <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Sending OTP…</>}
                {buttonState === 'sent' && <><span className="material-symbols-outlined text-[18px]">check_circle</span> OTP Sent!</>}
              </button>
            </div>
          )}

          {/* ── STEP 2: OTP VERIFICATION ──────────────────────────────── */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h1 className="font-serif mb-2" style={{ fontSize: 'clamp(28px,5vw,38px)', fontWeight: 700, color: '#1A0A0A', lineHeight: 1.1, fontFeatureSettings: '"liga" 0' }}>
                Verify your contact
              </h1>
              <p className="text-[15px] text-[#9A9A9A] mb-8 leading-[1.6]">
                We've sent a 6-digit code to <strong className="text-[#1A1A1A]">{inputVal}</strong>
              </p>

              {/* OTP Boxes */}
              <div className="flex gap-2.5 justify-center mb-6">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    onPaste={handleOtpPaste}
                    className={`otp-box flex-1 w-[52px] h-[60px] max-w-[52px] ${digit ? 'filled' : ''}`}
                  />
                ))}
              </div>

              {/* Error / Success */}
              {otpError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)] mb-4 animate-fade-in">
                  <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                  <p className="text-[13px] font-[600] text-[#BE1F2E]">{otpError}</p>
                </div>
              )}
              {otpSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(34,160,107,0.08)] border border-[rgba(34,160,107,0.2)] mb-4 animate-fade-in">
                  <span className="material-symbols-outlined text-[#22A06B] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <p className="text-[13px] font-[600] text-[#22A06B]">Verified! Moving to password setup…</p>
                </div>
              )}

              {/* Resend countdown */}
              <div className="flex justify-between items-center mb-6 text-[13px]">
                {resendDisabled ? (
                  <span className="text-[#9A9A9A]">Resend OTP in {timer}s</span>
                ) : (
                  <button onClick={handleResendOTP} className="text-link text-[13px] font-[600]">Resend OTP</button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => { setStep(1); setButtonState('default'); }}
                  className="w-1/3 h-[52px] rounded-full border border-[#D8D0CA] text-[#5A5A5A] text-[14px] font-[600] hover:bg-[#F5F0EB] transition-all cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  onClick={handleVerifyOTP}
                  disabled={!allFilled || buttonState === 'sending'}
                  className={`btn-primary w-2/3 btn-arrow-hover ${allFilled ? 'btn-pulse' : ''}`}
                  style={{ minHeight: 52 }}
                >
                  {buttonState === 'sending' ? (
                    <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Verifying…</>
                  ) : (
                    <>Verify &amp; Continue <span className="material-symbols-outlined text-[18px] btn-arrow">arrow_forward</span></>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: PASSWORD SETUP ────────────────────────────────── */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h1 className="font-serif mb-2" style={{ fontSize: 'clamp(28px,5vw,38px)', fontWeight: 700, color: '#1A0A0A', lineHeight: 1.1, fontFeatureSettings: '"liga" 0' }}>
                Create a Password
              </h1>
              <p className="text-[15px] text-[#9A9A9A] mb-8 leading-[1.6]">Secure your account with a strong password.</p>

              <form onSubmit={handleCreatePassword} className="space-y-5">
                <div>
                  <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Password</label>
                  <div className="relative flex items-center h-[52px] border border-[#D8D0CA] rounded-xl bg-white focus-within:border-[#BE1F2E] focus-within:shadow-[0_0_0_3px_rgba(190,31,46,0.12)]">
                    <input
                      className="flex-grow bg-transparent border-none focus:ring-0 px-4 text-[16px] text-[#1A1A1A] outline-none"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-[#9A9A9A] hover:text-[#BE1F2E] focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Confirm Password</label>
                  <div className="relative flex items-center h-[52px] border border-[#D8D0CA] rounded-xl bg-white focus-within:border-[#BE1F2E] focus-within:shadow-[0_0_0_3px_rgba(190,31,46,0.12)]">
                    <input
                      className="flex-grow bg-transparent border-none focus:ring-0 px-4 text-[16px] text-[#1A1A1A] outline-none"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 text-[#9A9A9A] hover:text-[#BE1F2E] focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)] animate-fade-in">
                    <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                    <p className="text-[13px] font-[600] text-[#BE1F2E]">{passwordError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={buttonState === 'sending'}
                  className="btn-primary w-full mt-6"
                  style={{ minHeight: 52 }}
                >
                  {buttonState === 'sending' ? (
                    <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Creating account…</>
                  ) : (
                    <>Complete Setup <span className="material-symbols-outlined text-[18px] btn-arrow">arrow_forward</span></>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Legal */}
          <p className="text-center text-[11px] text-[#9A9A9A] leading-relaxed mt-8 px-4">
            By continuing you agree to RaktSetu's{' '}
            <Link className="text-link text-[11px]" to="/terms">Terms of Service</Link> and{' '}
            <Link className="text-link text-[11px]" to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </main>

      {/* ── MINIMAL AUTH FOOTER ────────────────────────────────────────── */}
      <footer className="py-6 text-center text-[12px] text-[#9A9A9A]">
        © 2024 RaktSetu ·{' '}
        <Link className="hover:text-[#BE1F2E] transition-colors" to="/privacy">Privacy Policy</Link> ·{' '}
        <Link className="hover:text-[#BE1F2E] transition-colors" to="/terms">Terms of Service</Link>
      </footer>
    </div>
  );
};

export default DonorRegistration;
