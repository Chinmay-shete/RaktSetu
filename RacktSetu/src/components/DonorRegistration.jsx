import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DonorRegistration = () => {
    const [phone, setPhone] = useState("");
    const [buttonState, setButtonState] = useState("default"); // 'default', 'sending', 'sent'

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
            }, 1500);
        }
    };

    const isValid = phone.length === 10;

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

            {/* Main Registration Container */}
            <main className="flex-grow flex items-center justify-center py-32 px-margin-mobile min-h-[calc(100vh-80px-280px)]">
                <div className="w-full max-w-[520px] bg-surface-container-lowest border border-border-subtle rounded-xl p-10 shadow-sm relative overflow-hidden">
                    {/* Decorative Serif Watermark */}
                    <div className="absolute -top-6 -right-6 text-[120px] font-display-xl text-primary/5 select-none pointer-events-none">01</div>
                    
                    {/* Content */}
                    <div className="space-y-8 relative z-10">
                        <div className="space-y-2">
                            <h1 className="font-serif text-[40px] md:text-[48px] leading-[1.1] text-charcoal-card">Create your donor account</h1>
                            <p className="font-body-md text-body-md text-text-muted">Join thousands of donors saving lives across Maharashtra</p>
                        </div>

                        {/* Google OAuth */}
                        <div className="space-y-4">
                            <button className="w-full h-[52px] flex items-center justify-center gap-3 bg-white border border-border-subtle rounded-full spring-transition hover:shadow-md transition-all">
                                <img alt="Google G Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlZahqAhaI-_VqJ5BfF0k5ymhZSzpKch_ARN0A-lz26JDTzLbQYrr5NJGPaD6kQpcZwJOokaotXh9SClB-JPTIX4w-inEFtsP819-EgdhCR11soMFjkgxonKtH20A-UYwYvL3RGbK1hfUzXsiqzxCM5_50KpdJgC5SxqIxh2W5M1y3NFl2s4AiEP8WgnWiQyrunEeBS-L0kHQIkZd7_4i9gxvc1TvLy7dpM39Zee2AMiGpWrNStYfAnL-LsZXJZdHVzxFKXu66cHo" />
                                <span className="font-label-md text-label-md text-on-surface">Continue with Google</span>
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-border-subtle"></div>
                            <span className="flex-shrink mx-4 font-label-sm text-label-sm text-text-muted bg-white">or register with mobile number</span>
                            <div className="flex-grow border-t border-border-subtle"></div>
                        </div>

                        {/* Mobile Registration Form */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="mobile">Mobile number</label>
                                <div className="flex items-center w-full h-[56px] border border-border-subtle rounded-xl bg-surface-bright input-focus-ring overflow-hidden group transition-all">
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
                                className={`w-full h-[52px] text-white rounded-full font-label-md text-label-md flex items-center justify-center gap-2 spring-transition transition-colors ${
                                    !isValid ? 'bg-primary opacity-40 cursor-not-allowed transform-none' : 
                                    buttonState === 'sent' ? 'bg-green-600 shadow-lg shadow-green-600/20 hover:scale-105' : 
                                    'bg-primary shadow-lg shadow-primary/20 hover:scale-105'
                                }`}
                                disabled={!isValid || buttonState !== "default"}
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
                                        <span className="animate-spin material-symbols-outlined">progress_activity</span> Sending...
                                    </>
                                )}
                                {buttonState === "sent" && (
                                    <>
                                        OTP Sent! <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Legal Footer */}
                        <p className="text-center font-label-sm text-[11px] text-text-muted leading-relaxed px-8">
                            By continuing you agree to RaktSetu's 
                            <a className="text-primary hover:underline transition-colors ml-1" href="#">Terms of Service</a> and 
                            <a className="text-primary hover:underline transition-colors ml-1" href="#">Privacy Policy</a>.
                        </p>
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
