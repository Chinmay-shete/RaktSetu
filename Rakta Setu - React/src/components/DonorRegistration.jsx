import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createRecaptchaVerifier, sendFirebaseOtp } from '../services/firebaseConfig';
import api from '../services/api';

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
      // ── FIREBASE PHONE OTP ──
      try {
        const phoneNumber = inputVal.startsWith('+') ? inputVal : `+91${inputVal.replace(/\D/g, '')}`;

        // Create reCAPTCHA verifier (invisible)
        if (!recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current = createRecaptchaVerifier('recaptcha-container');
        }

        const confirmation = await sendFirebaseOtp(phoneNumber, recaptchaVerifierRef.current);
        setConfirmationResult(confirmation);

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
        console.error('[Firebase OTP] Send error:', err);
        setButtonState('default');
        // Reset reCAPTCHA on error so it can be retried
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
    } else {
      // ── EMAIL FLOW (Real Resend OTP) ──
      try {
        await api.post('/auth/send-otp', {
          email: inputVal.toLowerCase().trim(),
          purpose: 'registration'
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
        const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
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

    if (!isEmail && confirmationResult) {
      // Re-trigger Firebase OTP
      try {
        const phoneNumber = inputVal.startsWith('+') ? inputVal : `+91${inputVal.replace(/\D/g, '')}`;
        // Need a fresh reCAPTCHA verifier for resend
        recaptchaVerifierRef.current = createRecaptchaVerifier('recaptcha-container');
        const confirmation = await sendFirebaseOtp(phoneNumber, recaptchaVerifierRef.current);
        setConfirmationResult(confirmation);
      } catch (err) {
        console.error('[Firebase OTP] Resend error:', err);
        setOtpError('Failed to resend OTP. Please try again.');
        recaptchaVerifierRef.current = null;
      }
    } else if (isEmail) {
      try {
        await api.post('/auth/send-otp', {
          email: inputVal.toLowerCase().trim(),
          purpose: 'registration'
        });
      } catch (err) {
        console.error('[Email OTP] Resend error:', err);
        setOtpError('Failed to resend OTP. Please try again.');
      }
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

      // 4. Store auth data
        localStorage.setItem('raktsetu_auth_token', token);
        if (refreshToken || refresh_token) {
          localStorage.setItem('raktsetu_refresh_token', refreshToken || refresh_token);
        }
        localStorage.setItem('raktsetu_donor_authenticated', 'true');
        localStorage.setItem('raktsetu_donor_profile', JSON.stringify(user));

        setOtpSuccess(true);
        setTimeout(() => {
          setButtonState('default');
          navigate('/profile-setup');
        }, 700);
      } catch (err) {
        console.error('[Firebase OTP] Verify error:', err);
        setButtonState('default');

        if (err.code === 'auth/invalid-verification-code') {
          setOtpError('Invalid OTP code. Please check and try again.');
        } else if (err.code === 'auth/code-expired') {
          setOtpError('OTP has expired. Please request a new one.');
        } else if (err.response?.data?.code === 'PHONE_EXISTS') {
          // Phone already registered – redirect to login
          setOtpError('Phone number already registered. Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          const msg = err.response?.data?.message || 'Verification failed. Please try again.';
          setOtpError(msg);
        }
      }
    } else {
      // ── EMAIL FLOW (Real Resend OTP Verification) ──
      try {
        const response = await api.post('/auth/verify-otp', {
          email: inputVal.toLowerCase().trim(),
          otp: code,
          purpose: 'registration'
        });
        const { verification_token } = response.data;
        setEmailVerificationToken(verification_token);
        setOtpSuccess(true);
        setOtpError('');
        setTimeout(() => {
          setButtonState('default');
          setStep(3);
        }, 700);
      } catch (err) {
        console.error('[Email OTP] Verify error:', err);
        setButtonState('default');
        const msg = err.response?.data?.message || 'Invalid OTP code. Please try again.';
        setOtpError(msg);
      }
    }
  };

  const handleCreatePassword = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordError('');
    setButtonState('sending');

    try {
      // Send register details to backend
      const registerBody = {
        role: 'donor',
        password: password,
        verificationToken: emailVerificationToken
      };

      // If registration was via phone (Firebase), include phone; if via email, include email
      if (isEmail) {
        registerBody.email = inputVal.toLowerCase().trim();
      } else {
        registerBody.phone = inputVal.trim();
      }

      const response = await api.post('/auth/register', registerBody);
        const { verification_token } = response.data;
        setEmailVerificationToken(verification_token);
        setOtpSuccess(true);
        setOtpError('');
        setTimeout(() => {
          setButtonState('default');
          setStep(3);
        }, 700);
      } catch (err) {
        console.error('[Email OTP] Verify error:', err);
        setButtonState('default');
        const msg = err.response?.data?.message || 'Invalid OTP code. Please try again.';
        setOtpError(msg);
      }
    }
  };

  const handleCreatePassword = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordError('');
    setButtonState('sending');

    try {
      // Send register details to backend
      const response = await api.post('/auth/register', {
        role: 'donor',
        phone: inputVal.toLowerCase().trim(), // Pass verified email as the 'phone' parameter for verification matching
        password: password,
        verificationToken: emailVerificationToken
      });
      
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

              {/* Error message for OTP send failures */}
              {otpError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)] mb-4 animate-fade-in">
                  <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                  <p className="text-[13px] font-[600] text-[#BE1F2E]">{otpError}</p>
                </div>
              )}

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
                  <p className="text-[13px] font-[600] text-[#22A06B]">Verified! Setting up your account…</p>
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
                  onClick={() => { setStep(1); setButtonState('default'); setOtpError(''); }}
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
                      placeholder="At least 8 characters"
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
