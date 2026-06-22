import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'mobile'
  
  // Email Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  // Mobile Login States
  const [mobile, setMobile] = useState('');
  const [mobileStep, setMobileStep] = useState(1); // 1: input mobile, 2: verify OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [allFilled, setAllFilled] = useState(false);
  const otpRefs = useRef([]);
  
  const [buttonState, setButtonState] = useState('default');

  // Mobile OTP detection
  useEffect(() => {
    setAllFilled(otp.every((d) => d !== ''));
  }, [otp]);

  // Mobile OTP Countdown
  useEffect(() => {
    if (loginMethod !== 'mobile' || mobileStep !== 2) return;
    if (timer <= 0) { setResendDisabled(false); return; }
    const t = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [loginMethod, mobileStep, timer]);

  // Auto-focus first OTP box
  useEffect(() => {
    if (loginMethod === 'mobile' && mobileStep === 2) {
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    }
  }, [loginMethod, mobileStep]);

  const handleSendOTP = () => {
    if (mobile.length !== 10 || buttonState !== 'default') return;
    setButtonState('sending');
    setTimeout(() => {
      setButtonState('sent');
      setTimeout(() => {
        setMobileStep(2);
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

  const getRoleFromEmail = (val) => {
    const email = val.toLowerCase().trim();
    const parts = email.split('@');
    if (parts.length < 2) return 'donor';
    const domain = parts[1];
    if (domain.includes('staff')) return 'staff';
    if (domain.includes('admin')) return 'admin';
    if (domain.includes('district')) return 'district';
    if (domain.includes('state')) return 'state';
    return 'donor';
  };

  // Perform Email Login
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setEmailError('');
    setButtonState('sending');

    setTimeout(() => {
      setButtonState('default');
      const normalizedEmail = email.toLowerCase().trim();
      const userKey = 'raktsetu_user_' + normalizedEmail;
      const savedUser = localStorage.getItem(userKey);
      
      let authenticated = false;
      let userRole = getRoleFromEmail(email);

      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.password === password) {
          authenticated = true;
          userRole = parsed.role;
        } else {
          setEmailError('Invalid password. Please try again.');
          return;
        }
      } else {
        // Fallback demo logins to make testing easy without prior registration
        authenticated = true; 
      }

      if (authenticated) {
        // Route users based on role
        if (userRole === 'staff') {
          localStorage.setItem('raktsetu_hospital_authenticated', 'true');
          navigate('/staff/dashboard');
        } else if (userRole === 'admin') {
          localStorage.setItem('raktsetu_admin_authenticated', 'true');
          navigate('/admin/dashboard');
        } else if (userRole === 'district') {
          localStorage.setItem('raktsetu_district_authenticated', 'true');
          navigate('/district/dashboard');
        } else if (userRole === 'state') {
          localStorage.setItem('raktsetu_state_authenticated', 'true');
          navigate('/state/dashboard');
        } else {
          localStorage.setItem('raktsetu_donor_authenticated', 'true');
          navigate('/dashboard');
        }
      }
    }, 1000);
  };

  // Perform Mobile OTP Login
  const handleVerifyOTP = () => {
    const code = otp.join('');
    if (code.length < 6) { setOtpError('Please enter all 6 digits.'); return; }
    setButtonState('sending');
    setTimeout(() => {
      setOtpSuccess(true);
      setOtpError('');
      setTimeout(() => {
        setButtonState('default');
        // Mobile number visitors are always donors
        localStorage.setItem('raktsetu_donor_authenticated', 'true');
        navigate('/dashboard');
      }, 700);
    }, 900);
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isMobileValid = /^\d{10}$/.test(mobile.replace(/\D/g, ''));

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
          <div className="flex justify-between items-center mb-8">
            <span className="font-serif text-[20px] font-bold text-[#BE1F2E] italic">RaktSetu</span>
            <span className="badge-neutral">Secure Sign In</span>
          </div>

          <h1 className="font-serif mb-6 text-[32px] font-[700] text-[#1A0A0A] leading-tight" style={{ fontFeatureSettings: '"liga" 0' }}>
            Sign in to your account
          </h1>

          {/* Login Tabs */}
          {mobileStep === 1 && (
            <div className="flex border-b border-[#E0DAD4] mb-8">
              <button
                className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all ${
                  loginMethod === 'email'
                    ? 'border-[#BE1F2E] text-[#BE1F2E]'
                    : 'border-transparent text-[#9A9A9A] hover:text-[#1A0A0A]'
                }`}
                onClick={() => setLoginMethod('email')}
              >
                Email Address
              </button>
              <button
                className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all ${
                  loginMethod === 'mobile'
                    ? 'border-[#BE1F2E] text-[#BE1F2E]'
                    : 'border-transparent text-[#9A9A9A] hover:text-[#1A0A0A]'
                }`}
                onClick={() => setLoginMethod('mobile')}
              >
                Mobile Number
              </button>
            </div>
          )}

          {/* ── EMAIL PATH ────────────────────────────────────────────── */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5 animate-fade-in">
              <div>
                <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Email Address</label>
                <input
                  className="input-field"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Password</label>
                <div className="relative flex items-center h-[52px] border border-[#D8D0CA] rounded-xl bg-white focus-within:border-[#BE1F2E] focus-within:shadow-[0_0_0_3px_rgba(190,31,46,0.12)]">
                  <input
                    className="flex-grow bg-transparent border-none focus:ring-0 px-4 text-[16px] text-[#1A1A1A] outline-none"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
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

              {emailError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)] animate-fade-in">
                  <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                  <p className="text-[13px] font-[600] text-[#BE1F2E]">{emailError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!isEmailValid || buttonState === 'sending'}
                className="btn-primary w-full mt-4"
                style={{ minHeight: 52 }}
              >
                {buttonState === 'sending' ? (
                  <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Signing in…</>
                ) : (
                  <>Sign In <span className="material-symbols-outlined text-[18px] btn-arrow">arrow_forward</span></>
                )}
              </button>
            </form>
          )}

          {/* ── MOBILE PATH ───────────────────────────────────────────── */}
          {loginMethod === 'mobile' && (
            <div className="animate-fade-in">
              {mobileStep === 1 ? (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Mobile Number</label>
                    <div className={`flex items-center h-[52px] border rounded-xl bg-white overflow-hidden transition-all ${isMobileValid ? 'border-[#BE1F2E]' : 'border-[#D8D0CA]'} focus-within:border-[#BE1F2E] focus-within:shadow-[0_0_0_3px_rgba(190,31,46,0.12)]`}>
                      <div className="flex items-center px-4 border-r border-[#E0DAD4] h-1/2">
                        <span className="text-[14px] font-[500] text-[#5A5A5A]">+91</span>
                      </div>
                      <input
                        className="flex-grow bg-transparent border-none focus:ring-0 px-4 text-[16px] text-[#1A1A1A] placeholder:text-[#A8A0A0] outline-none"
                        maxLength="10"
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                        placeholder="Enter 10-digit number"
                      />
                    </div>
                  </div>

                  <button
                    className="btn-primary w-full mt-4"
                    style={{ minHeight: 52 }}
                    disabled={!isMobileValid || buttonState !== 'default'}
                    onClick={handleSendOTP}
                  >
                    {buttonState === 'default' && <>Send OTP <span className="material-symbols-outlined text-[18px] btn-arrow">arrow_forward</span></>}
                    {buttonState === 'sending' && <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Sending…</>}
                    {buttonState === 'sent' && <><span className="material-symbols-outlined text-[18px]">check_circle</span> OTP Sent!</>}
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <p className="text-[15px] text-[#9A9A9A] mb-8 leading-[1.6]">
                    We've sent a 6-digit code via SMS to <strong className="text-[#1A1A1A]">+91 {mobile}</strong>
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
                      <p className="text-[13px] font-[600] text-[#22A06B]">Verified! Signing in…</p>
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
                      onClick={() => { setMobileStep(1); setButtonState('default'); }}
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
                        <>Verify &amp; Sign In <span className="material-symbols-outlined text-[18px] btn-arrow">arrow_forward</span></>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Join Portal */}
          <div className="mt-10 pt-6 border-t border-[#EDE7E1] text-center text-sm text-[#5A5A5A]">
            Don't have an account?{' '}
            <Link className="text-[#BE1F2E] font-semibold hover:underline" to="/register-donor">
              Register here
            </Link>
          </div>
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

export default Login;
