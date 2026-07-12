import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createRecaptchaVerifier, sendFirebaseOtp, isFirebaseConfigured, auth } from '../services/firebaseConfig';
import api from '../services/api';

const DonorRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email/Phone, 2: OTP, 3: Create Password
  const [inputVal, setInputVal] = useState('');
  const [isEmail, setIsEmail] = useState(false);
  const [buttonState, setButtonState] = useState('default');

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // OTP
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
  const [emailVerificationToken, setEmailVerificationToken] = useState('');

  // Password Setup
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Password strength helper
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score: 1, label: 'Weak', color: '#BE1F2E' };
    if (score === 2) return { score: 2, label: 'Fair', color: '#E07B00' };
    if (score === 3) return { score: 3, label: 'Good', color: '#22A06B' };
    return { score: 4, label: 'Strong', color: '#22A06B' };
  };
  const pwdStrength = getPasswordStrength(password);
  const isPasswordValid =
    password.trim().length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    password === confirmPassword;

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

  // ── SEND OTP ──────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!inputVal || buttonState !== 'default') return;
    setButtonState('sending');
    setOtpError('');

    if (!isEmail) {
      // ── PHONE OTP ──
      try {
        const phoneNumber = inputVal.startsWith('+') ? inputVal : `+91${inputVal.replace(/\D/g, '')}`;

        if (!isFirebaseConfigured) {
          // Fallback: Send local OTP using backend endpoint
          await api.post('/auth/send-otp', {
            phone: phoneNumber,
            purpose: 'registration'
          });
        } else {
          // Create reCAPTCHA verifier (invisible)
          if (!recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current = createRecaptchaVerifier('recaptcha-container');
          }
          const confirmation = await sendFirebaseOtp(phoneNumber, recaptchaVerifierRef.current);
          setConfirmationResult(confirmation);
        }

        setButtonState('sent');
        setTimeout(() => {
          setStep(2);
          setTimer(45);
          setResendDisabled(true);
          setOtpError('');
          setOtpSuccess(false);
          setButtonState('default');
        }, 700);
      } catch (err) {
        console.error('[OTP] Send error:', err);
        setButtonState('default');
        recaptchaVerifierRef.current = null;

        let errorMsg = err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.';
        if (err.code === 'auth/too-many-requests') {
          errorMsg = 'Too many attempts. Please wait a few minutes and try again.';
        } else if (err.code === 'auth/invalid-phone-number') {
          errorMsg = 'Invalid phone number. Please enter a valid 10-digit number.';
        } else if (err.code === 'auth/quota-exceeded') {
          errorMsg = 'SMS quota exceeded. Please try again later.';
        }
        setOtpError(errorMsg);
      }
    } else {
      // ── EMAIL OTP (SIMULATED VIA BACKEND) ──
      try {
        const response = await api.post('/auth/send-otp', {
          email: inputVal.toLowerCase().trim()
        });
        
        setButtonState('sent');
        setTimeout(() => {
          setStep(2);
          setTimer(45);
          setResendDisabled(true);
          setOtpError('');
          setOtpSuccess(false);
          setButtonState('default');
        }, 700);
      } catch (err) {
        console.error('[Email OTP] Send error:', err);
        setButtonState('default');
        const msg = err.response?.data?.message || 'Failed to send OTP to your email.';
        setOtpError(msg);
      }
    }
  };

  // ── RESEND OTP ────────────────────────────────────────────────────
  const handleResendOTP = async () => {
    setTimer(45);
    setResendDisabled(true);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');

    if (!isEmail) {
      try {
        const phoneNumber = inputVal.startsWith('+') ? inputVal : `+91${inputVal.replace(/\D/g, '')}`;
        if (!isFirebaseConfigured) {
          await api.post('/auth/send-otp', {
            phone: phoneNumber,
            purpose: 'registration'
          });
        } else {
          const confirmation = await sendFirebaseOtp(phoneNumber, recaptchaVerifierRef.current);
          setConfirmationResult(confirmation);
        }
        setOtpSuccess(false);
      } catch (err) {
        console.error('[OTP] Resend error:', err);
        setOtpError('Failed to resend OTP. Please try again.');
      }
    } else {
      try {
        await api.post('/auth/send-otp', {
          email: inputVal.toLowerCase().trim()
        });
        setOtpSuccess(false);
      } catch (err) {
        console.error('[Email OTP] Resend error:', err);
        setOtpError('Failed to resend email OTP.');
      }
    }
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };

  // ── VERIFY OTP ────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }

    setButtonState('sending');
    setOtpError('');

    if (!isEmail) {
      try {
        const phoneNumber = inputVal.startsWith('+') ? inputVal : `+91${inputVal.replace(/\D/g, '')}`;
        if (!isFirebaseConfigured) {
          // Verify Phone code via backend
          const response = await api.post('/auth/verify-otp', {
            phone: phoneNumber,
            otp: code,
            purpose: 'registration'
          });
          const token = response.data.verification_token || response.data.token;
          setEmailVerificationToken(token);
          setOtpSuccess(true);
          setButtonState('default');
          localStorage.setItem('raktsetu_otp_verified', 'true');
          localStorage.setItem('raktsetu_register_mobile', inputVal);
          setTimeout(() => {
            setStep(3);
          }, 1000);
        } else {
          // Verify Firebase SMS code
          if (!confirmationResult) {
            throw new Error('No OTP transaction active. Please request code again.');
          }
          await confirmationResult.confirm(code);
          const idToken = await auth.currentUser.getIdToken(true);
          const response = await api.post('/auth/donor/firebase-register', {
            idToken
          });
          const { token, refreshToken, refresh_token, user } = response.data;
          setOtpSuccess(true);
          setButtonState('default');
          localStorage.setItem('raktsetu_auth_token', token);
          if (refreshToken || refresh_token) {
            localStorage.setItem('raktsetu_refresh_token', refreshToken || refresh_token);
          }
          localStorage.setItem('raktsetu_donor_authenticated', 'true');
          localStorage.setItem('raktsetu_donor_profile', JSON.stringify(user));
          setTimeout(() => {
            navigate('/profile-setup');
          }, 1000);
        }
      } catch (err) {
        console.error('[Phone OTP] Verify error:', err);
        setButtonState('default');
        const msg = err.response?.data?.message || err.message || 'Invalid or expired OTP. Please try again.';
        setOtpError(msg);
      }
    } else {
      // Verify Email code via backend
      try {
        const response = await api.post('/auth/verify-otp', {
          email: inputVal.toLowerCase().trim(),
          otp: code
        });
        
        const token = response.data.verification_token || response.data.token;
        setEmailVerificationToken(token);
        
        setOtpSuccess(true);
        setButtonState('default');
        localStorage.setItem('raktsetu_otp_verified', 'true');
        
        setTimeout(() => {
          setStep(3);
        }, 1000);
      } catch (err) {
        console.error('[Email OTP] Verify error:', err);
        setButtonState('default');
        const msg = err.response?.data?.message || 'Invalid or expired OTP. Please try again.';
        setOtpError(msg);
      }
    }
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

  // Create password and complete register
  const handleCreatePassword = async (e) => {
    if (e) e.preventDefault();

    const trimmed = password.trim();
    if (trimmed.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(trimmed)) {
      setPasswordError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(trimmed)) {
      setPasswordError('Password must contain at least one number.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordError('');
    setButtonState('sending');

    try {
      const payload = {
        role: 'donor',
        password: password,
        verificationToken: emailVerificationToken
      };

      if (isEmail) {
        payload.email = inputVal.toLowerCase().trim();
      } else {
        payload.phone = inputVal.startsWith('+') ? inputVal : `+91${inputVal.replace(/\D/g, '')}`;
      }

      // Send register details to backend
      const response = await api.post('/auth/register', payload);
      
      const { token, refreshToken, refresh_token, user } = response.data;
      
      localStorage.setItem('raktsetu_auth_token', token);
      if (refreshToken || refresh_token) {
        localStorage.setItem('raktsetu_refresh_token', refreshToken || refresh_token);
      }
      localStorage.setItem('raktsetu_donor_authenticated', 'true');
      localStorage.setItem('raktsetu_donor_profile', JSON.stringify(user));
      
      setButtonState('default');
      navigate('/profile-setup');
    } catch (err) {
      console.error('[Email Register] Error:', err);
      setButtonState('default');
      const msg = err.response?.data?.message || 'Failed to complete registration.';
      setPasswordError(msg);
    }
  };

  // Basic validation for Step 1
  const isInputValid = isEmail 
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputVal)
    : /^\d{10}$/.test(inputVal.replace(/\D/g, ''));

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

              <div className="flex justify-between items-center mb-10">
                <span className="font-serif text-[20px] font-bold text-[#BE1F2E] italic">RaktSetu</span>
                <span className="badge-neutral">Donor Registration</span>
              </div>

              {step === 1 && (
                <div className="animate-fade-in">
                  <h1 className="font-serif mb-2" style={{ fontSize: 'clamp(32px,5vw,42px)', fontWeight: 700, color: '#1A0A0A', lineHeight: 1.1, fontFeatureSettings: '"liga" 0' }}>
                    Create your account
                  </h1>
                  <p className="text-[15px] text-[#9A9A9A] mb-8 leading-[1.6]">Join thousands of users saving lives across Maharashtra.</p>

                  <div className="mb-5">
                    <label htmlFor="email-or-mobile-number-1" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Email or Mobile Number</label>
                    <div className={`flex items-center h-[52px] border rounded-xl bg-white overflow-hidden transition-all ${isInputValid ? 'border-[#BE1F2E]' : 'border-[#D8D0CA]'} focus-within:border-[#BE1F2E] focus-within:shadow-[0_0_0_3px_rgba(190,31,46,0.12)]`}>
                      <input id="email-or-mobile-number-1"
                        className="flex-grow bg-transparent border-none focus:ring-0 px-4 text-[16px] text-[#1A1A1A] placeholder:text-[#A8A0A0] outline-none"
                        type="text"
                        value={inputVal}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                        placeholder="Enter email or 10-digit mobile"
                      />
                    </div>
                  </div>

                  {otpError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)] mb-4 animate-fade-in">
                      <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                      <p className="text-[13px] font-[600] text-[#BE1F2E]">{otpError}</p>
                    </div>
                  )}

                  <button type="button"
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

              {step === 2 && (
                <div className="animate-fade-in">
                  <h1 className="font-serif mb-2" style={{ fontSize: 'clamp(28px,5vw,38px)', fontWeight: 700, color: '#1A0A0A', lineHeight: 1.1, fontFeatureSettings: '"liga" 0' }}>
                    Verify your contact
                  </h1>
                  <p className="text-[15px] text-[#9A9A9A] mb-8 leading-[1.6]">
                    We've sent a 6-digit code to <strong className="text-[#1A1A1A]">{inputVal}</strong>
                  </p>

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
                        aria-label={`OTP digit ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)] mb-4 animate-fade-in">
                      <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                      <p className="text-[13px] font-[600] text-[#BE1F2E]">{otpError}</p>
                    </div>
                  )}
                  {otpSuccess && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(34,160,107,0.08)] border border-[rgba(34,160,107,0.2)] mb-4 animate-fade-in">
                      <span className="material-symbols-outlined text-[#22A06B] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      <p className="text-[13px] font-[600] text-[#22A06B]">Verified! Setting up your account…</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-6 text-[13px]">
                    {resendDisabled ? (
                      <span className="text-[#9A9A9A]">Resend OTP in {timer}s</span>
                    ) : (
                      <button type="button" onClick={handleResendOTP} className="text-link text-[13px] font-[600]">Resend OTP</button>
                    )}
                  </div>

                  <div className="flex gap-3 mb-6">
                    <button type="button"
                      onClick={() => { setStep(1); setButtonState('default'); setOtpError(''); }}
                      className="w-1/3 h-[52px] rounded-full border border-[#D8D0CA] text-[#5A5A5A] text-[14px] font-[600] hover:bg-[#F5F0EB] transition-all cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button type="button"
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

              {step === 3 && (
                <div className="animate-fade-in">
                  <h1 className="font-serif mb-2" style={{ fontSize: 'clamp(28px,5vw,38px)', fontWeight: 700, color: '#1A0A0A', lineHeight: 1.1, fontFeatureSettings: '"liga" 0' }}>
                    Create a Password
                  </h1>
                  <p className="text-[15px] text-[#9A9A9A] mb-8 leading-[1.6]">Use 8+ characters with at least one uppercase letter and one number.</p>

                  <form onSubmit={handleCreatePassword} className="space-y-5">
                    <div>
                      <label htmlFor="password-2" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Password</label>
                      <div className="relative flex items-center h-[52px] border border-[#D8D0CA] rounded-xl bg-white focus-within:border-[#BE1F2E] focus-within:shadow-[0_0_0_3px_rgba(190,31,46,0.12)]">
                        <input id="password-2"
                          className="flex-grow bg-transparent border-none focus:ring-0 px-4 text-[16px] text-[#1A1A1A] outline-none"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 8 chars, 1 uppercase, 1 number"
                          required
                        />
                        <button type="button"
                          
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 text-[#9A9A9A] hover:text-[#BE1F2E] focus:outline-none"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>

                      {password.length > 0 && (
                        <div className="mt-2 animate-fade-in">
                          <div className="flex gap-1 mb-1">
                            {[1,2,3,4].map(i => (
                              <div
                                key={i}
                                className="flex-1 h-1 rounded-full transition-all duration-300"
                                style={{ backgroundColor: i <= pwdStrength.score ? pwdStrength.color : '#E0DAD4' }}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between text-[11px] font-[600]">
                            <span style={{ color: pwdStrength.color }}>{pwdStrength.label}</span>
                            <span className="text-[#9A9A9A]">
                              {!password.trim() && 'Cannot be empty'}
                              {password.trim() && password.trim().length < 8 && '8+ characters'}
                              {password.trim().length >= 8 && !/[A-Z]/.test(password) && 'Add uppercase'}
                              {password.trim().length >= 8 && /[A-Z]/.test(password) && !/[0-9]/.test(password) && 'Add a number'}
                              {password.trim().length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && '✓ All requirements met'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirm-password-3" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Confirm Password</label>
                      <div className={`relative flex items-center h-[52px] border rounded-xl bg-white focus-within:shadow-[0_0_0_3px_rgba(190,31,46,0.12)] ${
                        confirmPassword && confirmPassword !== password
                          ? 'border-[#BE1F2E]'
                          : confirmPassword && confirmPassword === password
                          ? 'border-[#22A06B]'
                          : 'border-[#D8D0CA] focus-within:border-[#BE1F2E]'
                      }`}>
                        <input
                          className="flex-grow bg-transparent border-none focus:ring-0 px-4 text-[16px] text-[#1A1A1A] outline-none"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat your password"
                          required
                        />
                        <button type="button"
                          
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 text-[#9A9A9A] hover:text-[#BE1F2E] focus:outline-none"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                      {confirmPassword && confirmPassword !== password && (
                        <p className="text-[12px] text-[#BE1F2E] font-[600] mt-1 ml-1">Passwords do not match</p>
                      )}
                      {confirmPassword && confirmPassword === password && (
                        <p className="text-[12px] text-[#22A06B] font-[600] mt-1 ml-1">✓ Passwords match</p>
                      )}
                    </div>

                    {passwordError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)] animate-fade-in">
                        <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                        <p className="text-[13px] font-[600] text-[#BE1F2E]">{passwordError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!isPasswordValid || buttonState === 'sending'}
                      className="btn-primary w-full mt-6"
                      style={{ minHeight: 52, opacity: isPasswordValid ? 1 : 0.5 }}
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

              <p className="text-center text-[11px] text-[#9A9A9A] leading-relaxed mt-8 px-4">
                By continuing you agree to RaktSetu's{' '}
                <Link className="text-link text-[11px]" to="/terms">Terms of Service</Link> and{' '}
                <Link className="text-link text-[11px]" to="/privacy">Privacy Policy</Link>.
              </p>
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
            {step > 1 ? (
              <button type="button"
                onClick={() => { setStep(prev => prev - 1); setButtonState('default'); setOtpError(''); }}
                className="text-[#9e001f] active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            ) : (
              <Link to="/" className="text-[#9e001f] active:scale-95 transition-transform">
                <span className="material-symbols-outlined">home</span>
              </Link>
            )}
            <h1 className="text-[20px] font-semibold text-[#9e001f] leading-none">Register</h1>
            <div className="w-6"></div>
          </header>

          {/* Setup Progress Bar */}
          <div className="w-full bg-[#e4e2df] h-1 shrink-0">
            <div className="bg-[#9e001f] h-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>

          {/* Form Content */}
          <main className="flex-grow px-5 py-8 max-w-md mx-auto w-full space-y-8 overflow-y-auto">
            {step === 1 && (
              <div className="space-y-6">
                <section>
                  <h2 className="text-[32px] font-serif text-[#9e001f] italic leading-none">Create Account</h2>
                  <p className="text-[#5c403f] text-[15px] mt-2">Join regional lifesaving networks in Maharashtra.</p>
                </section>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email-or-mobile-number-4" className="text-[14px] font-medium text-[#5c403f]">Email or Mobile Number</label>
                    <input id="email-or-mobile-number-4"
                      type="text"
                      value={inputVal}
                      onChange={handleInputChange}
                      placeholder="Enter email or 10-digit mobile"
                      className="w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[16px] outline-none transition-all focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f]"
                    />
                  </div>
                </div>

                {otpError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)] animate-fade-in">
                    <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                    <p className="text-[13px] font-[600] text-[#BE1F2E]">{otpError}</p>
                  </div>
                )}

                <div className="pt-4">
                  <button type="button"
                    disabled={!isInputValid || buttonState !== 'default'}
                    onClick={handleSendOTP}
                    className="w-full bg-[#9e001f] text-white font-semibold py-4 rounded-full active:scale-95 hover:opacity-90 shadow-xl shadow-[#9e001f]/20 transition-all flex items-center justify-center gap-2"
                  >
                    {buttonState === 'default' && <>Verify Details <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>}
                    {buttonState === 'sending' && <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Sending...</>}
                    {buttonState === 'sent' && <><span className="material-symbols-outlined text-[18px]">check_circle</span> Code Sent!</>}
                  </button>
                </div>

                <div className="text-center pt-6 text-[14px] text-[#5c403f]">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#9e001f] font-semibold hover:underline">
                    Sign in here
                  </Link>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <section>
                  <h2 className="text-[32px] font-serif text-[#9e001f] italic leading-none font-medium">Verify Contact</h2>
                  <p className="text-[#5c403f] text-[15px] mt-2">
                    We've sent a verification code to <strong className="text-[#1a1210]">{inputVal}</strong>
                  </p>
                </section>

                {/* Mobile Pin Code Grid */}
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
                      aria-label={`OTP digit ${idx + 1}`}
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
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(34,160,107,0.08)] border border-[rgba(34,160,107,0.2)] animate-fade-in">
                    <span className="material-symbols-outlined text-[#22A06B] text-[18px]">check_circle</span>
                    <p className="text-[13px] font-[600] text-[#22A06B]">Verified! Loading next step...</p>
                  </div>
                )}

                <div className="flex justify-between items-center text-[13px]">
                  {resendDisabled ? (
                    <span className="text-[#737373]">Resend OTP in {timer}s</span>
                  ) : (
                    <button type="button" onClick={handleResendOTP} className="text-[#9e001f] font-semibold hover:underline">Resend OTP</button>
                  )}
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button"
                    onClick={() => { setStep(1); setButtonState('default'); setOtpError(''); }}
                    className="w-1/3 bg-transparent border border-[rgba(26,18,16,0.15)] text-[#5c403f] font-semibold py-4 rounded-full active:scale-95 transition-colors"
                  >
                    Back
                  </button>
                  <button type="button"
                    onClick={handleVerifyOTP}
                    disabled={!allFilled || buttonState === 'sending'}
                    className="w-2/3 bg-[#9e001f] text-white font-semibold py-4 rounded-full active:scale-95 hover:opacity-90 shadow-xl shadow-[#9e001f]/20 transition-all flex items-center justify-center gap-1"
                  >
                    {buttonState === 'sending' ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleCreatePassword} className="space-y-6">
                <section>
                  <h2 className="text-[32px] font-serif text-[#9e001f] italic leading-none">Setup Password</h2>
                  <p className="text-[#5c403f] text-[15px] mt-2">Create a secure login credentials profile.</p>
                </section>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="password-5" className="text-[14px] font-medium text-[#5c403f]">Password</label>
                    <div className="relative">
                      <input id="password-5"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                        className="w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[16px] outline-none transition-all focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f]"
                      />
                      <button type="button"
                        
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#906f6e]"
                      >
                        <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>

                    {password.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1 h-1">
                          {[1,2,3,4].map(i => (
                            <div
                              key={i}
                              className="flex-grow rounded-full transition-colors duration-300"
                              style={{ backgroundColor: i <= pwdStrength.score ? pwdStrength.color : '#e4e2df' }}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span style={{ color: pwdStrength.color }}>{pwdStrength.label}</span>
                          <span className="text-[#737373]">
                            {!password.trim() && 'Required'}
                            {password.trim() && password.trim().length < 8 && 'Needs 8+ chars'}
                            {password.trim().length >= 8 && !/[A-Z]/.test(password) && 'Needs 1 uppercase'}
                            {password.trim().length >= 8 && /[A-Z]/.test(password) && !/[0-9]/.test(password) && 'Needs 1 number'}
                            {password.trim().length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && '✓ Secure'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="confirm-password-6" className="text-[14px] font-medium text-[#5c403f]">Confirm Password</label>
                    <div className="relative">
                      <input id="confirm-password-6"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        className={`w-full bg-white border rounded-lg px-4 py-3 text-[16px] outline-none transition-all ${
                          confirmPassword && confirmPassword !== password
                            ? 'border-[#BE1F2E] focus:ring-[#BE1F2E]/25'
                            : confirmPassword && confirmPassword === password
                            ? 'border-[#22A06B] focus:ring-[#22A06B]/25'
                            : 'border-[rgba(26,18,16,0.09)] focus:ring-[#9e001f]/40 focus:border-[#9e001f]'
                        }`}
                      />
                      <button type="button"
                        
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#906f6e]"
                      >
                        <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== password && (
                      <p className="text-[12px] text-[#BE1F2E] font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span> Passwords do not match
                      </p>
                    )}
                  </div>
                </div>

                {passwordError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)]">
                    <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                    <p className="text-[13px] font-semibold text-[#BE1F2E]">{passwordError}</p>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!isPasswordValid || buttonState === 'sending'}
                    className="w-full bg-[#9e001f] text-white font-semibold py-4 rounded-full active:scale-95 hover:opacity-90 shadow-xl shadow-[#9e001f]/20 transition-all flex items-center justify-center"
                  >
                    {buttonState === 'sending' ? 'Creating Account...' : 'Complete Registration'}
                  </button>
                </div>
              </form>
            )}

            <p className="text-center text-[12px] text-[#737373] leading-relaxed pt-6">
              By registering you agree to RaktSetu's{' '}
              <Link className="text-[#9e001f] font-semibold hover:underline" to="/terms">Terms of Service</Link> and{' '}
              <Link className="text-[#9e001f] font-semibold hover:underline" to="/privacy">Privacy Policy</Link>.
            </p>
          </main>
        </div>
      )}
    </div>
  );
};

export default DonorRegistration;
