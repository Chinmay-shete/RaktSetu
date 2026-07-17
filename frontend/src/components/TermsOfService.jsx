import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0EB] text-[#1A0A0A] flex flex-col" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="noise-filter" />

      {/* Navbar */}
      <nav className="w-full bg-white border-b border-[#E0DAD4] sticky top-0 z-40">
        <div className="flex justify-between items-center h-16 px-6 md:px-10 lg:px-16 w-full">
          <Link to="/" className="font-serif text-[22px] font-bold text-[#BE1F2E]" style={{ fontFeatureSettings: '"liga" 0' }}>
            RaktSetu
          </Link>
          <Link to="/" className="text-[13px] text-[#5A5A5A] hover:text-[#BE1F2E] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-grow max-w-3xl mx-auto px-6 py-16 w-full">
        <div className="bg-white border border-[#EDE7E1] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 md:p-12 animate-fade-in space-y-8">
          <div>
            <h1 className="font-serif text-[36px] md:text-[44px] font-[700] text-[#1A0A0A] leading-tight mb-2">
              Terms of <span className="text-[#BE1F2E] italic">Service</span>
            </h1>
            <p className="text-[13px] text-[#8A8078] uppercase tracking-wider font-[600]">Last Updated: June 20, 2026</p>
          </div>

          <div className="border-t border-[#EDE7E1] pt-6 space-y-6 text-[#5A5A5A] text-[15px] leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-serif text-[20px] font-[700] text-[#1A0A0A]">1. Agreement to Terms</h2>
              <p>
                By accessing the RaktSetu blood logistics platform, you agree to comply with and be bound by these Terms of Service. If you are registering as a donor, hospital admin, staff, or district coordinator, you certify that you have the legal capacity to represent your entity or register individual health credentials.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-[20px] font-[700] text-[#1A0A0A]">2. Physiological Profile Accuracy</h2>
              <p>
                As a registered donor, you agree to provide accurate, up-to-date, and truthful medical status parameters (such as biological sex, weight, and blood group) during onboarding. Inaccurate profile details pose clinical risks to blood extraction safety and clinical recipients. If any parameter changes, you are responsible for updating it on your Edit Profile portal.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-[20px] font-[700] text-[#1A0A0A]">3. Voluntary Pledges & Appointments</h2>
              <p>
                All pledges to donate blood generated via RaktSetu are voluntary clinical logistics contributions. While hospitals rely on pledges to balance supply chains, scheduling is subject to medical examination at the local facility. Registered hospitals retain the absolute right to refuse extraction based on clinical eligibility checks.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-[20px] font-[700] text-[#1A0A0A]">4. Platform Console Security</h2>
              <p>
                Hospital administrators, staff, and coordinators are responsible for safeguarding portal credentials. System actions are captured in the immutable System Audit Logs to trace supply command updates, inventory alterations, or threshold changes. Accounts engaging in unauthorized data alterations will be suspended immediately.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-[20px] font-[700] text-[#1A0A0A]">5. Medical Disclaimers</h2>
              <p>
                RaktSetu is a logistics sensor and coordination system; it does not replace medical diagnostics or clinical decision-making. If you experience an active clinical emergency, contact regional medical responders directly.
              </p>
            </section>
          </div>

          <div className="pt-8 border-t border-[#EDE7E1] flex justify-between items-center text-[13px] text-[#8A8078]">
            <span>© 2024 RaktSetu AI. All rights reserved.</span>
            <Link to="/privacy" className="text-[#BE1F2E] hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-[12px] text-[#9A9A9A] bg-white border-t border-[#E0DAD4]">
        © 2024 RaktSetu · Clinical Excellence in Blood Logistics
      </footer>
    </div>
  );
};

export default TermsOfService;
