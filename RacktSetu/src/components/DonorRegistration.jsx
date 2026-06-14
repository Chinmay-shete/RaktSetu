import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const DonorRegistration = () => {
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Profile, 4: Success
    const [phone, setPhone] = useState("");
    const [buttonState, setButtonState] = useState("default"); // 'default', 'sending', 'sent'
    
    // OTP State
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(60);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [otpError, setOtpError] = useState("");
    const [otpSuccess, setOtpSuccess] = useState(false);
    
    // Profile Fields
    const [profile, setProfile] = useState({
        fullName: "",
        age: "",
        gender: "Male",
        bloodGroup: "O+",
        city: "Mumbai",
        pincode: "",
        weight: "",
        emergencyAvailable: true
    });
    const [profileErrors, setProfileErrors] = useState({});

    // References for OTP autofocus inputs
    const otpRefs = useRef([]);

    // Countdown Timer for OTP Resend
    useEffect(() => {
        let interval = null;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setResendDisabled(false);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length <= 10) {
            setPhone(val);
        }
    };

    const handleSendOTP = () => {
        if (phone.length === 10 && buttonState === "default") {
            setButtonState("sending");
            setTimeout(() => {
                setButtonState("sent");
                setTimeout(() => {
                    setStep(2); // Go to OTP step
                    setTimer(60);
                    setResendDisabled(true);
                    setOtpError("");
                    setOtpSuccess(false);
                }, 800);
            }, 1500);
        }
    };

    const handleResendOTP = () => {
        setTimer(60);
        setResendDisabled(true);
        setOtp(["", "", "", "", "", ""]);
        setOtpError("");
        if (otpRefs.current[0]) otpRefs.current[0].focus();
    };

    const handleOtpChange = (value, index) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next box
        if (value !== "" && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                // Focus previous box and clear it
                const newOtp = [...otp];
                newOtp[index - 1] = "";
                setOtp(newOtp);
                otpRefs.current[index - 1].focus();
            } else if (otp[index]) {
                // Clear current box
                const newOtp = [...otp];
                newOtp[index] = "";
                setOtp(newOtp);
            }
        }
    };

    const handleVerifyOTP = () => {
        const otpCode = otp.join("");
        if (otpCode.length < 6) {
            setOtpError("Please enter all 6 digits.");
            return;
        }

        setButtonState("sending");
        setTimeout(() => {
            // For testing and interactive preview:
            // Entering '123456' (or any code beginning with '123') is considered valid.
            if (otpCode === "123456" || otpCode.startsWith("123")) {
                setOtpSuccess(true);
                setOtpError("");
                setTimeout(() => {
                    setStep(3); // Transition to Profile Form
                    setButtonState("default");
                }, 1000);
            } else {
                setOtpError("Invalid OTP. Enter '123456' to pass the verification check.");
                setButtonState("sent");
            }
        }, 1200);
    };

    const handleProfileChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateProfile = () => {
        const errors = {};
        if (!profile.fullName.trim()) errors.fullName = "Full name is required";
        if (!profile.age) {
            errors.age = "Age is required";
        } else {
            const ageNum = parseInt(profile.age, 10);
            if (ageNum < 18 || ageNum > 65) {
                errors.age = "Donors must be between 18 and 65 years old";
            }
        }
        if (!profile.weight) {
            errors.weight = "Weight is required";
        } else {
            const weightNum = parseFloat(profile.weight);
            if (weightNum < 45) {
                errors.weight = "Weight must be at least 45 kg to donate blood";
            }
        }
        if (!profile.pincode.trim() || profile.pincode.length !== 6) {
            errors.pincode = "Please enter a valid 6-digit pincode";
        }
        
        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        if (validateProfile()) {
            setButtonState("sending");
            setTimeout(() => {
                const donorData = {
                    phone,
                    ...profile,
                    registrationDate: new Date().toISOString()
                };
                localStorage.setItem('raktsetu_registered_donor', JSON.stringify(donorData));
                setStep(4); // Go to Success Screen
                setButtonState("default");
            }, 1500);
        }
    };

    const isPhoneValid = phone.length === 10;

    return (
        <div 
            className="bg-bone-bg min-h-screen flex flex-col font-body-md text-on-surface bg-surface-bright"
            style={{
                backgroundImage: `
                    radial-gradient(at 0% 0%, rgba(200, 16, 46, 0.03) 0px, transparent 50%),
                    radial-gradient(at 100% 100%, rgba(200, 16, 46, 0.02) 0px, transparent 50%)
                `
            }}
        >
            <div className="noise-filter"></div>

            {/* Top Navigation Bar */}
            <nav className="fixed top-0 w-full z-60 bg-surface/80 backdrop-blur-xl border-b border-border-subtle transition-all duration-300">
                <div className="flex justify-between items-center h-[10vh] px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="font-serif text-headline-lg font-bold text-crimson-accent tracking-tight">RaktSetu</Link>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex gap-8 items-center mr-8">
                            <Link to="/#about" className="text-label-md font-label-md text-secondary hover:text-primary transition-colors">About Us</Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="material-symbols-outlined text-secondary hover:text-primary transition-colors">notifications</button>
                            <button className="material-symbols-outlined text-secondary hover:text-primary transition-colors">help</button>
                            <button className="text-secondary hover:text-primary font-label-md text-label-md transition-all duration-300 hover:scale-105 ml-2">Login</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-grow flex items-center justify-center py-32 px-margin-mobile min-h-[calc(100vh-80px-280px)]">
                <div className="w-full max-w-[540px] bg-surface-container-lowest border border-border-subtle rounded-xl p-10 shadow-sm relative overflow-hidden">
                    {/* Step indicator watermark */}
                    <div className="absolute -top-6 -right-6 text-[120px] font-display-xl text-primary/5 select-none pointer-events-none">
                        0{step}
                    </div>
                    
                    <div className="space-y-8 relative z-10">
                        {/* ----------------- STEP 1: PHONE NUMBER ENTRY ----------------- */}
                        {step === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="space-y-2">
                                    <h1 className="font-serif text-[40px] md:text-[48px] leading-[1.1] text-charcoal-card">Create your donor account</h1>
                                    <p className="font-body-md text-body-md text-text-muted">Join thousands of donors saving lives across Maharashtra</p>
                                </div>

                                <button className="w-full h-[52px] flex items-center justify-center gap-3 bg-white border border-border-subtle rounded-full hover:shadow-md transition-all cursor-pointer">
                                    <img alt="Google G Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlZahqAhaI-_VqJ5BfF0k5ymhZSzpKch_ARN0A-lz26JDTzLbQYrr5NJGPaD6kQpcZwJOokaotXh9SClB-JPTIX4w-inEFtsP819-EgdhCR11soMFjkgxonKtH20A-UYwYvL3RGbK1hfUzXsiqzxCM5_50KpdJgC5SxqIxh2W5M1y3NFl2s4AiEP8WgnWiQyrunEeBS-L0kHQIkZd7_4i9gxvc1TvLy7dpM39Zee2AMiGpWrNStYfAnL-LsZXJZdHVzxFKXu66cHo" />
                                    <span className="font-label-md text-label-md text-on-surface">Continue with Google</span>
                                </button>

                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-border-subtle"></div>
                                    <span className="flex-shrink mx-4 font-label-sm text-label-sm text-text-muted bg-white px-2">or register with mobile number</span>
                                    <div className="flex-grow border-t border-border-subtle"></div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="mobile">Mobile number</label>
                                        <div className="flex items-center w-full h-[56px] border border-border-subtle rounded-xl bg-surface-bright overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20">
                                            <div className="flex items-center px-4 border-r border-border-subtle h-1/2">
                                                <span className="font-label-md text-label-md text-secondary">+91</span>
                                            </div>
                                            <input 
                                                className="flex-grow bg-transparent border-none focus:ring-0 px-4 font-body-md text-body-md placeholder:text-text-muted/60 outline-none" 
                                                id="mobile" 
                                                maxLength="10" 
                                                name="mobile" 
                                                value={phone}
                                                onChange={handlePhoneChange}
                                                placeholder="Enter your 10-digit mobile number" 
                                                type="tel" 
                                            />
                                        </div>
                                    </div>
                                    
                                    <button 
                                        className={`w-full h-[52px] text-white rounded-full font-label-md text-label-md flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                                            !isPhoneValid ? 'bg-primary opacity-40 cursor-not-allowed' : 
                                            buttonState === 'sent' ? 'bg-green-600 shadow-lg shadow-green-600/20 hover:scale-105' : 
                                            'bg-primary shadow-lg shadow-primary/20 hover:scale-105'
                                        }`}
                                        disabled={!isPhoneValid || buttonState !== "default"}
                                        onClick={handleSendOTP}
                                    >
                                        {buttonState === "default" && (
                                            <>
                                                Send OTP
                                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                            </>
                                        )}
                                        {buttonState === "sending" && (
                                            <>
                                                <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span> Sending...
                                            </>
                                        )}
                                        {buttonState === "sent" && (
                                            <>
                                                OTP Sent! <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ----------------- STEP 2: OTP ENTRY ----------------- */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="space-y-2">
                                    <h1 className="font-serif text-[40px] md:text-[48px] leading-[1.1] text-charcoal-card">Verify your number</h1>
                                    <p className="font-body-md text-body-md text-text-muted">
                                        We sent a verification code to <strong className="text-on-surface">+91 {phone}</strong>
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between gap-2.5 py-2">
                                        {otp.map((digit, idx) => (
                                            <input
                                                key={idx}
                                                type="text"
                                                maxLength="1"
                                                value={digit}
                                                ref={(el) => (otpRefs.current[idx] = el)}
                                                onChange={(e) => handleOtpChange(e.target.value, idx)}
                                                onKeyDown={(e) => handleKeyDown(e, idx)}
                                                className="w-[58px] h-[64px] text-center font-serif text-[28px] font-bold border border-border-subtle rounded-xl bg-surface-bright focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                placeholder="•"
                                            />
                                        ))}
                                    </div>

                                    {otpError && (
                                        <p className="text-xs font-bold text-error flex items-center gap-1.5 px-1 bg-error/5 py-2.5 rounded-lg border border-error/10 animate-shake">
                                            <span className="material-symbols-outlined text-[18px]">error</span>
                                            {otpError}
                                        </p>
                                    )}

                                    {otpSuccess && (
                                        <p className="text-xs font-bold text-green-600 flex items-center gap-1.5 px-1 bg-green-50 py-2.5 rounded-lg border border-green-150">
                                            <span className="material-symbols-outlined text-[18px]">verified</span>
                                            OTP Code Verified Successfully! Loading profile wizard...
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-between items-center text-label-sm font-label-sm">
                                    <span className="text-text-muted">
                                        {timer > 0 ? `Resend code in ${timer}s` : "Didn't receive the code?"}
                                    </span>
                                    <button
                                        onClick={handleResendOTP}
                                        disabled={resendDisabled}
                                        className={`font-bold transition-all cursor-pointer ${
                                            resendDisabled 
                                                ? 'text-secondary/40 cursor-not-allowed' 
                                                : 'text-primary hover:underline hover:scale-105'
                                        }`}
                                    >
                                        Resend OTP
                                    </button>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { setStep(1); setButtonState("default"); }}
                                        className="w-1/3 h-[52px] rounded-full border border-border-subtle text-secondary font-label-md text-label-md hover:bg-surface-container-low transition-colors cursor-pointer"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleVerifyOTP}
                                        disabled={otp.join("").length < 6 || buttonState === "sending"}
                                        className="w-2/3 h-[52px] rounded-full bg-primary text-white font-label-md text-label-md shadow-lg shadow-primary/20 hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        {buttonState === "sending" ? (
                                            <>
                                                <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span> Verifying...
                                            </>
                                        ) : (
                                            <>
                                                Verify & Continue
                                                <span className="material-symbols-outlined text-[18px]">shield</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ----------------- STEP 3: CLINICAL PROFILE SETUP ----------------- */}
                        {step === 3 && (
                            <form onSubmit={handleProfileSubmit} className="space-y-6 animate-fade-in">
                                <div className="space-y-2">
                                    <h1 className="font-serif text-[36px] md:text-[40px] leading-[1.1] text-charcoal-card">Donor Clinical Profile</h1>
                                    <p className="font-body-md text-body-md text-text-muted">Complete your NBTC safety credentials to join the database.</p>
                                </div>

                                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                                    {/* Full Name */}
                                    <div className="space-y-1.5">
                                        <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={profile.fullName}
                                            onChange={handleProfileChange}
                                            placeholder="Enter your first and last name"
                                            className="w-full px-4 py-3 border border-border-subtle rounded-xl bg-surface-bright text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                        {profileErrors.fullName && <p className="text-xxs font-bold text-error mt-0.5">{profileErrors.fullName}</p>}
                                    </div>

                                    {/* Age & Weight */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Age (18-65)</label>
                                            <input
                                                type="number"
                                                name="age"
                                                value={profile.age}
                                                onChange={handleProfileChange}
                                                placeholder="E.g., 28"
                                                className="w-full px-4 py-3 border border-border-subtle rounded-xl bg-surface-bright text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                            {profileErrors.age && <p className="text-xxs font-bold text-error mt-0.5">{profileErrors.age}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Weight (kg)</label>
                                            <input
                                                type="number"
                                                name="weight"
                                                value={profile.weight}
                                                onChange={handleProfileChange}
                                                placeholder="E.g., 68"
                                                className="w-full px-4 py-3 border border-border-subtle rounded-xl bg-surface-bright text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                            {profileErrors.weight && <p className="text-xxs font-bold text-error mt-0.5">{profileErrors.weight}</p>}
                                        </div>
                                    </div>

                                    {/* Gender & Blood Group */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Gender</label>
                                            <select
                                                name="gender"
                                                value={profile.gender}
                                                onChange={handleProfileChange}
                                                className="w-full px-4 py-3 border border-border-subtle rounded-xl bg-surface-bright text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Blood Group</label>
                                            <select
                                                name="bloodGroup"
                                                value={profile.bloodGroup}
                                                onChange={handleProfileChange}
                                                className="w-full px-4 py-3 border border-border-subtle rounded-xl bg-surface-bright text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                            >
                                                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                                    <option key={bg} value={bg}>{bg}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* City & Pincode */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={profile.city}
                                                onChange={handleProfileChange}
                                                placeholder="Mumbai"
                                                className="w-full px-4 py-3 border border-border-subtle rounded-xl bg-surface-bright text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Pincode</label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                maxLength="6"
                                                value={profile.pincode}
                                                onChange={handleProfileChange}
                                                placeholder="400001"
                                                className="w-full px-4 py-3 border border-border-subtle rounded-xl bg-surface-bright text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                            {profileErrors.pincode && <p className="text-xxs font-bold text-error mt-0.5">{profileErrors.pincode}</p>}
                                        </div>
                                    </div>

                                    {/* Emergency Match Toggle */}
                                    <div className="flex items-center gap-3 py-2 border-t border-border-subtle mt-2">
                                        <input
                                            type="checkbox"
                                            name="emergencyAvailable"
                                            id="emergencyAvailable"
                                            checked={profile.emergencyAvailable}
                                            onChange={handleProfileChange}
                                            className="w-5.5 h-5.5 rounded accent-primary cursor-pointer"
                                        />
                                        <label htmlFor="emergencyAvailable" className="font-label-sm text-[11px] text-text-muted leading-tight cursor-pointer select-none">
                                            Available for emergency SOS match notifications in my local radius (Recommend)
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={buttonState === "sending"}
                                    className="w-full h-[52px] rounded-full bg-primary text-white font-label-md text-label-md shadow-lg shadow-primary/20 hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    {buttonState === "sending" ? (
                                        <>
                                            <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span> Registering...
                                        </>
                                    ) : (
                                        <>
                                            Register & Save Account
                                            <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* ----------------- STEP 4: SUCCESS SCREEN ----------------- */}
                        {step === 4 && (
                            <div className="space-y-6 text-center py-4 animate-fade-in">
                                <div className="mx-auto w-20 h-20 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                                    <span className="material-symbols-outlined text-[42px] animate-bounce">check_circle</span>
                                </div>

                                <div className="space-y-2">
                                    <h1 className="font-serif text-[36px] md:text-[40px] leading-[1.1] text-charcoal-card">Account Registered!</h1>
                                    <p className="font-body-md text-body-md text-text-muted">
                                        Welcome to RaktSetu, <strong className="text-on-surface">{profile.fullName}</strong>. Your account is active.
                                    </p>
                                </div>

                                <div className="bg-surface-container-low border border-border-subtle p-5 rounded-2xl text-left space-y-3 font-body-md text-xs">
                                    <div className="flex justify-between border-b border-border-subtle/50 pb-2">
                                        <span className="text-text-muted font-bold uppercase tracking-wider">Blood Group</span>
                                        <strong className="text-primary text-sm font-black">{profile.bloodGroup}</strong>
                                    </div>
                                    <div className="flex justify-between border-b border-border-subtle/50 pb-2">
                                        <span className="text-text-muted font-bold uppercase tracking-wider">Verification Status</span>
                                        <strong className="text-green-650 font-bold flex items-center gap-1"><span className="material-symbols-outlined text-xs">shield</span> Verified</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-muted font-bold uppercase tracking-wider">Registered Location</span>
                                        <strong className="text-on-surface font-semibold">{profile.city} (Pincode: {profile.pincode})</strong>
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setStep(1); setPhone(""); setOtp(["", "", "", "", "", ""]); }}
                                    className="w-full h-[52px] rounded-full border border-border-subtle text-secondary font-label-md text-label-md hover:bg-surface-container-low transition-colors cursor-pointer"
                                >
                                    Log Out / Register New Donor
                                </button>
                            </div>
                        )}

                        {/* Legal Footer */}
                        {step !== 4 && (
                            <p className="text-center font-label-sm text-[11px] text-text-muted leading-relaxed px-8">
                                By continuing you agree to RaktSetu's 
                                <a className="text-primary hover:underline transition-colors ml-1" href="#">Terms of Service</a> and 
                                <a className="text-primary hover:underline transition-colors ml-1" href="#">Privacy Policy</a>.
                            </p>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer Section */}
            <footer className="w-full py-16 px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-8 bg-charcoal-card dark:bg-black border-t border-white/10 text-white mt-auto">
                <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="font-headline-lg text-crimson-accent italic">RaktSetu</div>
                    <p className="font-body-md text-body-md text-text-muted max-w-sm text-center md:text-left">
                        © 2024 RaktSetu Medical Logistics. Clinical Excellence meets Modern Intelligence.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                    <a className="font-label-sm text-label-sm text-text-muted hover:text-crimson-accent transition-colors duration-300" href="#">Privacy Policy</a>
                    <a className="font-label-sm text-label-sm text-text-muted hover:text-crimson-accent transition-colors duration-300" href="#">Terms of Service</a>
                    <a className="font-label-sm text-label-sm text-text-muted hover:text-crimson-accent transition-colors duration-300" href="#">Donor Guidelines</a>
                    <a className="font-label-sm text-label-sm text-text-muted hover:text-crimson-accent transition-colors duration-300" href="#">Contact Support</a>
                </div>
            </footer>
        </div>
    );
};

export default DonorRegistration;
