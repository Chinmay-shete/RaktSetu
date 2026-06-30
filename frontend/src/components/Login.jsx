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
      recaptchaVerifierRef.current = createRecaptchaVerifier('recaptcha-container');
      const confirmation = await sendFirebaseOtp(phoneNumber, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
    } catch (err) {
      console.error('[Firebase OTP] Resend error:', err);
      setOtpError('Failed to resend OTP. Please try again.');
      recaptchaVerifierRef.current = null;
    }

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

  // ── EMAIL LOGIN ───────────────────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setButtonState('sending');

    try {
      const response = await api.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password: password
      });

      setButtonState('default');
      const { token, user } = response.data;
      const userRole = user.role;

      // Save token
      localStorage.setItem('raktsetu_auth_token', token);

      // Route users based on role and set appropriate authentication keys
      if (userRole === 'staff') {
        localStorage.setItem('raktsetu_hospital_authenticated', 'true');
        localStorage.setItem('raktsetu_hospital_profile', JSON.stringify(user));
        window.location.href = '/staff/dashboard';
      } else if (userRole === 'admin') {
        localStorage.setItem('raktsetu_admin_app_state', JSON.stringify({ status: 'logged_in', user }));
        window.location.href = '/admin/dashboard';
      } else if (userRole === 'district') {
        localStorage.setItem('raktsetu_district_state', JSON.stringify({ status: 'logged_in', user }));
        window.location.href = '/district/dashboard';
      } else if (userRole === 'state') {
        localStorage.setItem('raktsetu_state_admin', JSON.stringify({ status: 'logged_in', user }));
        window.location.href = '/state/dashboard';
      } else if (userRole === 'sysadmin') {
        localStorage.setItem('raktsetu_sysadmin_state', JSON.stringify({ status: 'logged_in', user }));
        window.location.href = '/systemadmin/dashboard';
      } else {
        localStorage.setItem('raktsetu_donor_authenticated', 'true');
        localStorage.setItem('raktsetu_donor_profile', JSON.stringify(user));
        navigate('/dashboard');
      }
    } catch (err) {
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
      // 1. Verify OTP with Firebase client SDK
      const userCredential = await confirmationResult.confirm(code);
      const firebaseUser = userCredential.user;

      // 2. Get the Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // 3. Send to backend for login
      const loginRes = await api.post('/auth/donor/firebase-login', { idToken });

      const { token, refreshToken, refresh_token, user } = loginRes.data;
      localStorage.setItem('raktsetu_auth_token', token);
      if (refreshToken || refresh_token) {
        localStorage.setItem('raktsetu_refresh_token', refreshToken || refresh_token);
      }
      localStorage.setItem('raktsetu_donor_authenticated', 'true');
      localStorage.setItem('raktsetu_donor_profile', JSON.stringify(user));
      
      setOtpSuccess(true);
      setOtpError('');
      setTimeout(() => {
        setButtonState('default');
        navigate('/dashboard');
      }, 700);
    } catch (err) {
      console.error('[Firebase OTP] Login verify error:', err);
      setButtonState('default');

      if (err.code === 'auth/invalid-verification-code') {
        setOtpError('Invalid OTP code. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        setOtpError('OTP has expired. Please request a new one.');
      } else if (err.response?.data?.code === 'USER_NOT_FOUND') {
        setOtpError('No account found. Please register first.');
      } else {
        const msg = err.response?.data?.message || 'Invalid OTP code. Please try again.';
        setOtpError(msg);
      }
    }
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isMobileValid = /^\d{10}$/.test(mobile.replace(/\D/g, ''));

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex flex-col" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="noise-filter" />

      {/* Invisible reCAPTCHA container – required by Firebase Phone Auth */}
      <div id="recaptcha-container" />

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
          {loginMethod === 'mobile' && mobileStep === 1 && (
            <div className="animate-fade-in">
              <div className="mb-5">
                <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Mobile Number</label>
                <div className={`flex items-center h-[52px] border rounded-xl bg-white overflow-hidden transition-all ${isMobileValid ? 'border-[#BE1F2E]' : 'border-[#D8D0CA]'} focus-within:border-[#BE1F2E] focus-within:shadow-[0_0_0_3px_rgba(190,31,46,0.12)]`}>
                  <span className="pl-4 text-[16px] text-[#9A9A9A] font-[500]">+91</span>
                  <input
                    className="flex-grow bg-transparent border-none focus:ring-0 px-3 text-[16px] text-[#1A1A1A] placeholder:text-[#A8A0A0] outline-none"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                </div>
              </div>

              {otpError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)] mb-4 animate-fade-in">
                  <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                  <p className="text-[13px] font-[600] text-[#BE1F2E]">{otpError}</p>
                </div>
              )}

              <button
                className="btn-primary w-full"
                style={{ minHeight: 52 }}
                disabled={!isMobileValid || buttonState !== 'default'}
                onClick={handleSendOTP}
              >
                {buttonState === 'default' && <>Send OTP <span className="material-symbols-outlined text-[18px] btn-arrow">arrow_forward</span></>}
                {buttonState === 'sending' && <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Sending OTP…</>}
                {buttonState === 'sent' && <><span className="material-symbols-outlined text-[18px]">check_circle</span> OTP Sent!</>}
              </button>

              <div className="text-center mt-6">
                <p className="text-[12px] text-[#9A9A9A] flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  Secured by Firebase Phone Authentication
                </p>
              </div>
            </div>
          )}

          {/* ── MOBILE OTP VERIFICATION ─────────────────────────────── */}
          {loginMethod === 'mobile' && mobileStep === 2 && (
            <div className="animate-fade-in">
              <p className="text-[15px] text-[#9A9A9A] mb-8 leading-[1.6]">
                We've sent a 6-digit code to <strong className="text-[#1A1A1A]">+91 {mobile}</strong>
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
                  <p className="text-[13px] font-[600] text-[#22A06B]">Verified! Signing you in…</p>
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
                  onClick={() => { setMobileStep(1); setButtonState('default'); setOtpError(''); }}
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
                    <>Verify & Sign In <span className="material-symbols-outlined text-[18px] btn-arrow">arrow_forward</span></>
                  )}
                </button>
              </div>
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
