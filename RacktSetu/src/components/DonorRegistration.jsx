import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DonorRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [phone, setPhone] = useState('');
  const [buttonState, setButtonState] = useState('default');

  // OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [allFilled, setAllFilled] = useState(false);
  const otpRefs = useRef([]);

  // Detect when all 6 digits are filled → pulse the button
  useEffect(() => {
    setAllFilled(otp.every((d) => d !== ''));
  }, [otp]);

  // Countdown
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

  const handlePhoneChange = (e) => {
    const v = e.target.value.replace(/\D/g, '');
    if (v.length <= 10) setPhone(v);
  };

  const handleSendOTP = () => {
    if (phone.length !== 10 || buttonState !== 'default') return;
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

  // Handle paste of 6-digit code
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
      // Any 6-digit code is accepted — no real verification
      setOtpSuccess(true);
      setOtpError('');
      setTimeout(() => {
        setButtonState('default');
        const isLogin = localStorage.getItem('raktsetu_login_flow');
        if (isLogin) {
          localStorage.removeItem('raktsetu_login_flow');
          navigate('/location');
        } else {
          navigate('/profile-setup');
        }
      }, 700);
    }, 900);
  };

  const isPhoneValid = phone.length === 10;

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

          {/* ── STEP 1: PHONE ────────────────────────────────────────── */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h1 className="font-serif mb-2" style={{ fontSize: 'clamp(32px,5vw,42px)', fontWeight: 700, color: '#1A0A0A', lineHeight: 1.1, fontFeatureSettings: '"liga" 0' }}>
                Create your donor account
              </h1>
              <p className="text-[15px] text-[#9A9A9A] mb-8 leading-[1.6]">Join thousands of donors saving lives across Maharashtra.</p>

              {/* Google Button */}
              <button className="w-full h-[52px] flex items-center justify-center gap-3 bg-white border border-[#D8D0CA] rounded-full hover:shadow-md transition-all cursor-pointer mb-6">
                <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlZahqAhaI-_VqJ5BfF0k5ymhZSzpKch_ARN0A-lz26JDTzLbQYrr5NJGPaD6kQpcZwJOokaotXh9SClB-JPTIX4w-inEFtsP819-EgdhCR11soMFjkgxonKtH20A-UYwYvL3RGbK1hfUzXsiqzxCM5_50KpdJgC5SxqIxh2W5M1y3NFl2s4AiEP8WgnWiQyrunEeBS-L0kHQIkZd7_4i9gxvc1TvLy7dpM39Zee2AMiGpWrNStYfAnL-LsZXJZdHVzxFKXu66cHo" />
                <span className="text-[15px] font-[500] text-[#1A1A1A]">Continue with Google</span>
              </button>

              <div className="relative flex items-center py-3 mb-6">
                <div className="flex-grow border-t border-[#E0DAD4]" />
                <span className="mx-4 text-[12px] text-[#9A9A9A] bg-white px-2">or register with mobile number</span>
                <div className="flex-grow border-t border-[#E0DAD4]" />
              </div>

              <div className="mb-5">
                <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Mobile Number</label>
                <div className={`flex items-center h-[52px] border rounded-xl bg-white overflow-hidden transition-all ${isPhoneValid ? 'border-[#BE1F2E]' : 'border-[#D8D0CA]'} focus-within:border-[#BE1F2E] focus-within:shadow-[0_0_0_3px_rgba(190,31,46,0.12)]`}>
                  <div className="flex items-center px-4 border-r border-[#E0DAD4] h-1/2">
                    <span className="text-[14px] font-[500] text-[#5A5A5A]">+91</span>
                  </div>
                  <input
                    className="flex-grow bg-transparent border-none focus:ring-0 px-4 text-[16px] text-[#1A1A1A] placeholder:text-[#A8A0A0] outline-none"
                    id="mobile"
                    maxLength="10"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                    placeholder="Enter 10-digit number"
                  />
                </div>
              </div>

              <button
                className="btn-primary w-full"
                style={{ minHeight: 52 }}
                disabled={!isPhoneValid || buttonState !== 'default'}
                onClick={handleSendOTP}
              >
                {buttonState === 'default' && <>Send OTP <span className="material-symbols-outlined text-[18px] btn-arrow">arrow_forward</span></>}
                {buttonState === 'sending' && <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Sending…</>}
                {buttonState === 'sent' && <><span className="material-symbols-outlined text-[18px]">check_circle</span> OTP Sent!</>}
              </button>
            </div>
          )}

          {/* ── STEP 2: OTP ──────────────────────────────────────────── */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h1 className="font-serif mb-2" style={{ fontSize: 'clamp(28px,5vw,38px)', fontWeight: 700, color: '#1A0A0A', lineHeight: 1.1, fontFeatureSettings: '"liga" 0' }}>
                Verify your mobile
              </h1>
              <p className="text-[15px] text-[#9A9A9A] mb-8 leading-[1.6]">
                We've sent a 6-digit code to <strong className="text-[#1A1A1A]">+91 {phone}</strong>
              </p>

              {/* OTP Boxes */}
              <div className="flex gap-2.5 justify-between mb-6">
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
                    className={`otp-box flex-1 max-w-[52px] ${digit ? 'filled' : ''}`}
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
                  <p className="text-[13px] font-[600] text-[#22A06B]">Verified! Redirecting…</p>
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

              {/* Back link */}
              <div className="text-center">
                <button
                  className="text-[14px] text-[#5A5A5A] hover:text-[#BE1F2E] transition-colors border-b border-transparent hover:border-[#BE1F2E] pb-px"
                  onClick={() => { setStep(1); setButtonState('default'); }}
                >
                  ← Back to change mobile number
                </button>
              </div>
            </div>
          )}

          {/* Legal */}
          <p className="text-center text-[11px] text-[#9A9A9A] leading-relaxed mt-8 px-4">
            By continuing you agree to RaktSetu's{' '}
            <a className="text-link text-[11px]" href="#">Terms of Service</a> and{' '}
            <a className="text-link text-[11px]" href="#">Privacy Policy</a>.
          </p>
        </div>
      </main>

      {/* ── MINIMAL AUTH FOOTER ────────────────────────────────────────── */}
      <footer className="py-6 text-center text-[12px] text-[#9A9A9A]">
        © 2024 RaktSetu ·{' '}
        <a className="hover:text-[#BE1F2E] transition-colors" href="#">Privacy Policy</a> ·{' '}
        <a className="hover:text-[#BE1F2E] transition-colors" href="#">Terms of Service</a>
      </footer>
    </div>
  );
};

export default DonorRegistration;
