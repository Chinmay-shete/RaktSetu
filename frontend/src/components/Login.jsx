import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { createRecaptchaVerifier, sendFirebaseOtp } from '../services/firebaseConfig';

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
  
  // Firebase OTP state
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaVerifierRef = useRef(null);

  const [buttonState, setButtonState] = useState('default');

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // ── SEND OTP VIA FIREBASE ─────────────────────────────────────────
  const handleSendOTP = async () => {
    if (mobile.length !== 10 || buttonState !== 'default') return;
    setButtonState('sending');
    setOtpError('');

    try {
      const phoneNumber = `+91${mobile}`;

      // Create reCAPTCHA verifier (invisible)
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = createRecaptchaVerifier('recaptcha-container');
      }

      const confirmation = await sendFirebaseOtp(phoneNumber, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);

      setButtonState('sent');
      setTimeout(() => {
        setMobileStep(2);
        setTimer(45);
        setResendDisabled(true);
        setOtpError('');
        setOtpSuccess(false);
        setButtonState('default');
      }, 700);
    } catch (err) {
      console.error('[Firebase OTP] Send error:', err);
      setButtonState('default');
      recaptchaVerifierRef.current = null;

      let errorMsg = `Failed to send OTP. Please try again. [${err.code || 'UNKNOWN'}]: ${err.message || 'No message'}`;
      if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Too many attempts. Please wait a few minutes and try again.';
      } else if (err.code === 'auth/invalid-phone-number') {
        errorMsg = 'Invalid phone number. Please enter a valid 10-digit number.';
      } else if (err.code === 'auth/quota-exceeded') {
        errorMsg = 'SMS quota exceeded. Please try again later.';
      }
      setOtpError(errorMsg);
    }
  };

  // ── RESEND OTP ────────────────────────────────────────────────────
  const handleResendOTP = async () => {
    setTimer(45);
    setResendDisabled(true);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');

    try {
      const phoneNumber = `+91${mobile}`;
      const confirmation = await sendFirebaseOtp(phoneNumber, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setOtpSuccess(false);
    } catch (err) {
      console.error('[Firebase OTP] Resend error:', err);
      setOtpError('Failed to resend OTP. Please try again.');
    }
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };

  const handleOtpChange = (value, index) => {
    const clean = value.replace(/\D/g, '');
    const next = [...otp];
    next[index] = clean.slice(-1);
    setOtp(next);
    if (clean && index < 5) otpRefs.current[index + 1]?.focus();
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
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    for (let i = 0; i < data.length; i++) {
      next[i] = data[i];
    }
    setOtp(next);
    const lastFilled = Math.min(data.length, 5);
    otpRefs.current[lastFilled]?.focus();
  };

  // ── EMAIL SUBMIT ──────────────────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    if (e) e.preventDefault();
    setEmailError('');
    setButtonState('sending');

    try {
      const response = await api.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password: password
      });
      const { token, refreshToken, refresh_token, user } = response.data;
      
      localStorage.setItem('raktsetu_auth_token', token);
      if (refreshToken || refresh_token) {
        localStorage.setItem('raktsetu_refresh_token', refreshToken || refresh_token);
      }
      localStorage.setItem('raktsetu_donor_authenticated', 'true');
      localStorage.setItem('raktsetu_donor_profile', JSON.stringify(user));

      setButtonState('default');
      navigate('/dashboard');
    } catch (err) {
      console.error('[Email Login] Error:', err);
      setButtonState('default');
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      setEmailError(msg);
    }
  };

  // ── VERIFY OTP (FIREBASE) ─────────────────────────────────────────
  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length < 6) { setOtpError('Please enter all 6 digits.'); return; }
    
    setButtonState('sending');
    setOtpError('');

    try {
      if (!confirmationResult) {
        throw new Error('No OTP transaction active. Please request code again.');
      }
      await confirmationResult.confirm(code);
      setOtpSuccess(true);

      const response = await api.post('/auth/firebase-login', {
        mobile: mobile
      });
      const { token, refreshToken, refresh_token, user } = response.data;
      
      localStorage.setItem('raktsetu_auth_token', token);
      if (refreshToken || refresh_token) {
        localStorage.setItem('raktsetu_refresh_token', refreshToken || refresh_token);
      }
      localStorage.setItem('raktsetu_donor_authenticated', 'true');
      localStorage.setItem('raktsetu_donor_profile', JSON.stringify(user));

      setButtonState('default');
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      console.error('[Firebase OTP] Verify error:', err);
      setButtonState('default');
      const msg = err.response?.data?.message || 'Invalid verification code. Please try again.';
      setOtpError(msg);
    }
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isMobileValid = /^\d{10}$/.test(mobile);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1b1c1a] selection:bg-[#ffdad8] flex flex-col" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="noise-filter" />

      {/* Invisible reCAPTCHA container – required by Firebase Phone Auth */}
      <div id="recaptcha-container" />

      {!isMobile ? (
        /* ──────────────────────────────────────────────────────── */
        /* ── DESKTOP AUTH DESIGN ───────────────────────────────── */
        /* ──────────────────────────────────────────────────────── */
        <div className="min-h-screen bg-[#F5F0EB] flex flex-col">
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

          <main className="flex-grow flex items-center justify-center py-16 px-4">
            <div className="w-full max-w-[500px] bg-white border border-[#EDE7E1] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-10 relative overflow-hidden animate-fade-in">
              <div className="absolute -top-8 -right-8 opacity-[0.03] pointer-events-none">
                <span className="material-symbols-outlined text-[200px]">medical_services</span>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="font-serif text-[20px] font-bold text-[#BE1F2E] italic">RaktSetu</span>
                <span className="badge-neutral">Secure Sign In</span>
              </div>

              <h1 className="font-serif mb-6 text-[32px] font-[700] text-[#1A0A0A] leading-tight" style={{ fontFeatureSettings: '"liga" 0' }}>
                Sign in to your account
              </h1>

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

              {loginMethod === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-5 animate-fade-in">
                  <div>
                    <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] block mb-2">Email Address</label>
                    <input
                      className="input-field w-full border border-[#D8D0CA] rounded-xl px-4 py-3 bg-[#faf8f5] outline-none"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] block mb-2">Password</label>
                    <div className="relative flex items-center h-[52px] border border-[#D8D0CA] rounded-xl bg-[#faf8f5] focus-within:border-[#BE1F2E]">
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
                        className="absolute right-4 text-[#9A9A9A] hover:text-[#BE1F2E]"
                      >
                        <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
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
                    {buttonState === 'sending' ? 'Signing in…' : 'Sign In'}
                  </button>
                </form>
              )}

              {loginMethod === 'mobile' && mobileStep === 1 && (
                <div className="animate-fade-in space-y-5">
                  <div>
                    <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] block mb-2">Mobile Number</label>
                    <div className="flex items-center h-[52px] border border-[#D8D0CA] rounded-xl bg-[#faf8f5] overflow-hidden">
                      <span className="pl-4 text-[16px] text-[#9A9A9A] font-[500]">+91</span>
                      <input
                        className="flex-grow bg-transparent border-none focus:ring-0 px-3 text-[16px] outline-none"
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Enter 10-digit number"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  {otpError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)] animate-fade-in">
                      <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                      <p className="text-[13px] font-[600] text-[#BE1F2E]">{otpError}</p>
                    </div>
                  )}

                  <button
                    className="btn-primary w-full"
                    disabled={!isMobileValid || buttonState !== 'default'}
                    onClick={handleSendOTP}
                    style={{ minHeight: 52 }}
                  >
                    {buttonState === 'sending' ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              )}

              {loginMethod === 'mobile' && mobileStep === 2 && (
                <div className="animate-fade-in space-y-5">
                  <p className="text-[15px] text-[#9A9A9A]">Verification code sent to +91 {mobile}</p>
                  <div className="flex gap-2.5 justify-center">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        className="w-12 h-14 bg-[#faf8f5] border border-[#D8D0CA] rounded-xl text-center font-bold text-[20px] outline-none"
                      />
                    ))}
                  </div>

                  {otpError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)] animate-fade-in">
                      <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                      <p className="text-[13px] font-[600] text-[#BE1F2E]">{otpError}</p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setMobileStep(1)}
                      className="w-1/3 h-[52px] rounded-xl border border-[#D8D0CA] text-[14px]"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerifyOTP}
                      disabled={!allFilled || buttonState === 'sending'}
                      className="btn-primary w-2/3"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-10 pt-6 border-t border-[#EDE7E1] text-center text-sm text-[#5A5A5A]">
                Don't have an account?{' '}
                <Link className="text-[#BE1F2E] font-semibold hover:underline" to="/register-donor">
                  Register here
                </Link>
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
            {mobileStep === 2 ? (
              <button
                onClick={() => { setMobileStep(1); setButtonState('default'); setOtpError(''); }}
                className="text-[#9e001f] active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            ) : (
              <Link to="/" className="text-[#9e001f] active:scale-95 transition-transform">
                <span className="material-symbols-outlined">home</span>
              </Link>
            )}
            <h1 className="text-[20px] font-semibold text-[#9e001f] leading-none">Sign In</h1>
            <div className="w-6"></div>
          </header>

          {/* Form Content */}
          <main className="flex-grow px-5 py-8 max-w-md mx-auto w-full space-y-8 overflow-y-auto">
            {mobileStep === 1 && (
              <div className="space-y-6">
                <section>
                  <h2 className="text-[32px] font-serif text-[#9e001f] italic leading-none">Welcome Back</h2>
                  <p className="text-[#5c403f] text-[15px] mt-2">Sign in to coordinate emergency blood requests.</p>
                </section>

                {/* Login tab toggle styled exactly like camps tab */}
                <div className="flex bg-[#eae8e5]/60 rounded-full p-1 max-w-[260px] mx-auto mb-6">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('email')}
                    className={`flex-1 py-1.5 text-[12px] font-bold rounded-full transition-all duration-200 ${
                      loginMethod === 'email' ? 'bg-[#9e001f] text-white' : 'text-[#5c403f]'
                    }`}
                  >
                    Email Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('mobile')}
                    className={`flex-1 py-1.5 text-[12px] font-bold rounded-full transition-all duration-200 ${
                      loginMethod === 'mobile' ? 'bg-[#9e001f] text-white' : 'text-[#5c403f]'
                    }`}
                  >
                    Mobile Number
                  </button>
                </div>

                {loginMethod === 'email' ? (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] font-medium text-[#5c403f]">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[16px] outline-none transition-all focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f]"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] font-medium text-[#5c403f]">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          className="w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[16px] outline-none transition-all focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#906f6e]"
                        >
                          <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                    </div>

                    {emailError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)]">
                        <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                        <p className="text-[13px] font-semibold text-[#BE1F2E]">{emailError}</p>
                      </div>
                    )}

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={!isEmailValid || buttonState === 'sending'}
                        className="w-full bg-[#9e001f] text-white font-semibold py-4 rounded-full active:scale-95 hover:opacity-90 shadow-xl shadow-[#9e001f]/20 transition-all flex items-center justify-center"
                      >
                        {buttonState === 'sending' ? 'Signing in...' : 'Sign In'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] font-medium text-[#5c403f]">Mobile Number</label>
                      <div className="flex items-center bg-white border border-[rgba(26,18,16,0.09)] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#9e001f]/40 focus-within:border-[#9e001f]">
                        <span className="pl-4 text-[16px] text-[#906f6e] font-semibold">+91</span>
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="Enter 10-digit mobile number"
                          className="flex-grow border-none focus:ring-0 px-3 py-3 text-[16px] outline-none bg-transparent"
                          maxLength={10}
                        />
                      </div>
                    </div>

                    {otpError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)]">
                        <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                        <p className="text-[13px] font-semibold text-[#BE1F2E]">{otpError}</p>
                      </div>
                    )}

                    <div className="pt-4">
                      <button
                        disabled={!isMobileValid || buttonState !== 'default'}
                        onClick={handleSendOTP}
                        className="w-full bg-[#9e001f] text-white font-semibold py-4 rounded-full active:scale-95 hover:opacity-90 shadow-xl shadow-[#9e001f]/20 transition-all flex items-center justify-center gap-1"
                      >
                        {buttonState === 'sending' ? 'Sending...' : 'Send OTP'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-center pt-6 text-[14px] text-[#5c403f]">
                  Don't have an account?{' '}
                  <Link to="/register-donor" className="text-[#9e001f] font-semibold hover:underline">
                    Register here
                  </Link>
                </div>
              </div>
            )}

            {mobileStep === 2 && (
              <div className="space-y-6">
                <section>
                  <h2 className="text-[32px] font-serif text-[#9e001f] italic leading-none font-medium">Verify Contact</h2>
                  <p className="text-[#5c403f] text-[15px] mt-2">
                    We've sent a verification code to <strong className="text-[#1a1210]">+91 {mobile}</strong>
                  </p>
                </section>

                <div className="flex gap-2.5 justify-center py-2">
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
                      className="w-12 h-14 bg-white border border-[rgba(26,18,16,0.09)] rounded-lg text-center font-bold text-[20px] outline-none transition-all focus:border-[#9e001f] focus:ring-2 focus:ring-[#9e001f]/30"
                    />
                  ))}
                </div>

                {otpError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)] animate-fade-in">
                    <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                    <p className="text-[13px] font-[600] text-[#BE1F2E]">{otpError}</p>
                  </div>
                )}
                {otpSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(34,160,107,0.08)] border border-[rgba(34,160,107,0.2)]">
                    <span className="material-symbols-outlined text-[#22A06B] text-[18px]">check_circle</span>
                    <p className="text-[13px] font-semibold text-[#22A06B]">Verified! Signing you in...</p>
                  </div>
                )}

                <div className="flex justify-between items-center text-[13px]">
                  {resendDisabled ? (
                    <span className="text-[#737373]">Resend OTP in {timer}s</span>
                  ) : (
                    <button onClick={handleResendOTP} className="text-[#9e001f] font-semibold hover:underline">Resend OTP</button>
                  )}
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => { setMobileStep(1); setButtonState('default'); setOtpError(''); }}
                    className="w-1/3 bg-transparent border border-[rgba(26,18,16,0.15)] text-[#5c403f] font-semibold py-4 rounded-full active:scale-95 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={!allFilled || buttonState === 'sending'}
                    className="w-2/3 bg-[#9e001f] text-white font-semibold py-4 rounded-full active:scale-95 hover:opacity-90 shadow-xl shadow-[#9e001f]/20 transition-all flex items-center justify-center gap-1"
                  >
                    {buttonState === 'sending' ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default Login;
