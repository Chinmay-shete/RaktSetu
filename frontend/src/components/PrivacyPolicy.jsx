import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
              Privacy <span className="text-[#BE1F2E] italic">Policy</span>
            </h1>
            <p className="text-[13px] text-[#8A8078] uppercase tracking-wider font-[600]">Last Updated: June 20, 2026</p>
          </div>

          <div className="border-t border-[#EDE7E1] pt-6 space-y-6 text-[#5A5A5A] text-[15px] leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-serif text-[20px] font-[700] text-[#1A0A0A]">1. Clinical Data We Collect</h2>
              <p>
                RaktSetu is a blood logistics orchestration platform. To match donors with clinical centers during emergencies, we collect physiological profile parameters including your full name, age, biological sex, weight, blood group, last donation dates, and chronic illness indications. This data is handled in strict compliance with clinical data management standards.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-[20px] font-[700] text-[#1A0A0A]">2. Locational Services & Geopositioning</h2>
              <p>
                If you choose to activate GPS geopositioning alerts, we capture latitude and longitude parameters to sensor urgent requirements in your immediate vicinity. This tracking is only active to match urgent demands and is encrypted end-to-end. You can disable location tracking at any time via your Profile Settings.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-[20px] font-[700] text-[#1A0A0A]">3. Data Sharing & Security</h2>
              <p>
                We do not sell, trade, or distribute your physiological or contact parameters. Your data is shared exclusively with registered hospital administrations and clinical blood banks within the RaktSetu network when you actively pledge to donate. All medical data records are stored in encrypted databases using AES-256 standard protocols.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-[20px] font-[700] text-[#1A0A0A]">4. HIPAA and Indian Health Data Guidelines</h2>
              <p>
                We adhere strictly to NABH accreditation specifications and national health registries guidelines for clinical supply chain integrity. You have the right to request deletion of your donor credentials at any time by contacting our medical coordination support team.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-[20px] font-[700] text-[#1A0A0A]">5. Contact Us</h2>
              <p>
                For data privacy inquiries, compliance audit requests, or medical support, please contact us at:
              </p>
              <p className="font-[600] text-[#BE1F2E]">privacy@raktsetu.org</p>
            </section>
          </div>

          <div className="pt-8 border-t border-[#EDE7E1] flex justify-between items-center text-[13px] text-[#8A8078]">
            <span>© 2024 RaktSetu AI. All rights reserved.</span>
            <Link to="/terms" className="text-[#BE1F2E] hover:underline">Terms of Service</Link>
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

export default PrivacyPolicy;
