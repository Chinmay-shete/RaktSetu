import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DonorNavbar from './layout/DonorNavbar';
import DonorFooter from './layout/DonorFooter';

const ContactMedicalTeam = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Donation Query',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitting(true);
    // Simulate submission (UI only for now)
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  const isFormValid = formData.name.trim() && formData.email.trim() && formData.message.trim();

  return (
    <div className="bg-[#fbf9f6] text-[#1b1c1a] min-h-screen" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <DonorNavbar />

      <main className="pt-28 pb-24 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-10">
        <header className="mb-12">
          <p className="text-[12px] font-[600] uppercase tracking-widest text-[#BE1F2E] mb-4">Get In Touch</p>
          <h1
            className="font-serif italic leading-none tracking-[-0.03em] text-[#1A0A0A] mb-6"
            style={{ fontSize: 'clamp(40px, 7vw, 80px)' }}
          >
            Contact Medical<br/>Team
          </h1>
          <p className="text-[#737373] text-[16px] md:text-[18px] max-w-2xl leading-relaxed">
            Our medical coordination team is available 24/7 for urgent blood requests, health queries, and donation support. Reach us through any of the channels below.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Left — Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Emergency */}
            <div className="bg-[#BE1F2E] text-white p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
                <h3 className="font-[600] text-[18px]">Emergency Hotline</h3>
              </div>
              <p className="text-[26px] font-bold tracking-tight mb-1">1800-180-1104</p>
              <p className="text-white/70 text-[13px]">Toll-free · 24/7 available</p>
            </div>

            {/* General */}
            <div className="bg-white border border-[rgba(26,18,16,0.09)] p-6 rounded-xl shadow-sm space-y-5">
              <div>
                <p className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] mb-1">Email</p>
                <a href="mailto:medical@raktsetu.in" className="text-[15px] font-[600] text-[#BE1F2E] hover:underline">
                  medical@raktsetu.in
                </a>
              </div>
              <div>
                <p className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] mb-1">WhatsApp Support</p>
                <a href="https://wa.me/919999999999" className="text-[15px] font-[600] text-[#1a1210] hover:text-[#BE1F2E] transition-colors">
                  +91 99999 99999
                </a>
              </div>
              <div>
                <p className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] mb-1">Office Hours</p>
                <p className="text-[15px] text-[#5A5A5A]">Mon–Sat: 9 AM – 6 PM</p>
                <p className="text-[15px] text-[#5A5A5A]">Emergency: 24/7</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white border border-[rgba(26,18,16,0.09)] p-6 rounded-xl shadow-sm">
              <p className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] mb-4">Quick Links</p>
              <div className="space-y-3">
                <Link to="/donor-guidelines" className="flex items-center gap-2 text-[14px] font-[500] text-[#1a1210] hover:text-[#BE1F2E] transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-[#BE1F2E]">menu_book</span>
                  Donor Guidelines
                </Link>
                <Link to="/find-camps" className="flex items-center gap-2 text-[14px] font-[500] text-[#1a1210] hover:text-[#BE1F2E] transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-[#BE1F2E]">location_on</span>
                  Find Donation Camps
                </Link>
                <Link to="/privacy" className="flex items-center gap-2 text-[14px] font-[500] text-[#1a1210] hover:text-[#BE1F2E] transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-[#BE1F2E]">privacy_tip</span>
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          {/* Right — Contact Form */}
          <div className="lg:col-span-3 bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-6 md:p-10 shadow-sm">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="w-16 h-16 bg-[#d4edda] rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#22A06B] text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h3 className="font-serif italic text-[28px] text-[#1A0A0A] mb-3">Message Sent!</h3>
                <p className="text-[#737373] text-[15px] max-w-sm leading-relaxed mb-8">
                  Our medical team will respond within 24 hours. For urgent needs, please call the emergency hotline.
                </p>
                <button type="button"
                  onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: 'Donation Query', message: '' }); }}
                  className="px-6 py-3 border border-[rgba(26,18,16,0.12)] rounded-full text-[14px] font-[600] text-[#1a1210] hover:bg-[#f5f0eb] transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-serif italic text-[28px] md:text-[32px] text-[#1A0A0A] mb-6">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="full-name-1" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] block mb-2">Full Name *</label>
                      <input id="full-name-1"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                        className="w-full h-[48px] border border-[#D8D0CA] rounded-xl px-4 text-[15px] text-[#1a1a1a] bg-[#faf8f5] focus:border-[#BE1F2E] focus:shadow-[0_0_0_3px_rgba(190,31,46,0.1)] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone-optional-2" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] block mb-2">Phone (Optional)</label>
                      <input id="phone-optional-2"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full h-[48px] border border-[#D8D0CA] rounded-xl px-4 text-[15px] text-[#1a1a1a] bg-[#faf8f5] focus:border-[#BE1F2E] focus:shadow-[0_0_0_3px_rgba(190,31,46,0.1)] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email-address-3" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] block mb-2">Email Address *</label>
                    <input id="email-address-3"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full h-[48px] border border-[#D8D0CA] rounded-xl px-4 text-[15px] text-[#1a1a1a] bg-[#faf8f5] focus:border-[#BE1F2E] focus:shadow-[0_0_0_3px_rgba(190,31,46,0.1)] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject-4" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] block mb-2">Subject</label>
                    <select id="subject-4"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full h-[48px] border border-[#D8D0CA] rounded-xl px-4 text-[15px] text-[#1a1a1a] bg-[#faf8f5] focus:border-[#BE1F2E] outline-none cursor-pointer transition-all"
                    >
                      <option>Donation Query</option>
                      <option>Health Eligibility Question</option>
                      <option>Emergency Blood Request</option>
                      <option>Camp Information</option>
                      <option>Technical Support</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message-5" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] block mb-2">Message *</label>
                    <textarea id="message-5"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your query or concern in detail..."
                      required
                      rows={5}
                      className="w-full border border-[#D8D0CA] rounded-xl px-4 py-3 text-[15px] text-[#1a1a1a] bg-[#faf8f5] focus:border-[#BE1F2E] focus:shadow-[0_0_0_3px_rgba(190,31,46,0.1)] outline-none transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!isFormValid || submitting}
                    className="w-full h-[52px] bg-[#BE1F2E] text-white rounded-full text-[15px] font-[600] hover:bg-[#a31825] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Sending…</>
                    ) : (
                      <>Send Message <span className="material-symbols-outlined text-[18px]">send</span></>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <DonorFooter />
    </div>
  );
};

export default ContactMedicalTeam;
