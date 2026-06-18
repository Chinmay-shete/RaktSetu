import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Count-up hook
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [donorName, setDonorName] = useState('Aarav');
  const [bloodGroup, setBloodGroup] = useState('O+');

  const totalDonations = useCountUp(12);
  const livesImpacted = useCountUp(36);

  useEffect(() => {
    const stored = localStorage.getItem('raktsetu_donor_profile');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.fullName) setDonorName(data.fullName.split(' ')[0]);
      if (data.bloodGroup) setBloodGroup(data.bloodGroup);
    }
    const registered = localStorage.getItem('raktsetu_registered_donor');
    if (registered) {
      const data = JSON.parse(registered);
      if (data.fullName) setDonorName(data.fullName.split(' ')[0]);
      if (data.bloodGroup) setBloodGroup(data.bloodGroup);
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDeleteProfile = () => {
    if (window.confirm('Are you sure you want to delete your profile? This cannot be undone.')) {
      localStorage.removeItem('raktsetu_donor_profile');
      localStorage.removeItem('raktsetu_registered_donor');
      localStorage.removeItem('raktsetu_location');
      navigate('/');
    }
  };

  const recentDonations = [
    { date: 'Aug 15, 2024', location: 'City General Hospital', type: 'Whole Blood', status: 'Completed' },
    { date: 'May 02, 2024', location: 'Red Cross Mobile Camp', type: 'Whole Blood', status: 'Completed' },
    { date: 'Jan 10, 2024', location: 'Metro Blood Bank', type: 'Plasma', status: 'Completed' },
  ];

  return (
    <div className="bg-[#F5F0EB] text-[#1A1A1A] min-h-screen" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="noise-filter" />

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#E0DAD4] w-full sticky top-0 z-40" style={{ height: 64 }}>
        <div className="flex justify-between items-center h-full px-6 md:px-10 max-w-[1280px] mx-auto">
          <a className="font-serif text-[22px] font-bold text-[#BE1F2E]" href="#" style={{ fontFeatureSettings: '"liga" 0' }}>RaktSetu</a>

          <nav className="hidden md:flex items-center gap-8">
            {['Find Camps', 'My Impact', 'Profile'].map((link, i) => (
              <a
                key={link}
                href="#"
                className={`text-[14px] font-[500] transition-colors whitespace-nowrap ${i === 1 ? 'text-[#BE1F2E] font-[700] border-b-2 border-[#BE1F2E] pb-px' : 'text-[#5A5A5A] hover:text-[#BE1F2E]'}`}
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="notif-btn">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="notif-badge" />
            </div>
            {/* Help */}
            <div className="notif-btn">
              <span className="material-symbols-outlined text-[20px]">help_outline</span>
            </div>
            {/* Check Eligibility */}
            <button className="btn-primary" style={{ padding: '10px 20px', minHeight: 40, fontSize: 14 }}>
              Check Eligibility
            </button>
            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-10 h-10 rounded-full bg-[rgba(190,31,46,0.08)] border-2 border-[rgba(190,31,46,0.2)] flex items-center justify-center hover:scale-110 transition-transform"
                title="Profile menu"
              >
                <span className="material-symbols-outlined text-[#BE1F2E] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-[#EDE7E1] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-[#EDE7E1]">
                    <p className="text-[11px] font-[600] text-[#9A9A9A] uppercase tracking-wider">Signed in as</p>
                    <p className="text-[15px] font-[600] text-[#1A1A1A] truncate mt-0.5">{donorName}</p>
                  </div>
                  <button
                    onClick={() => { setProfileMenuOpen(false); navigate('/edit-profile'); }}
                    className="w-full text-left px-4 py-3 text-[14px] text-[#1A1A1A] hover:bg-[#F5F0EB] transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#5A5A5A]">edit</span>
                    Edit Profile
                  </button>
                  <button
                    onClick={handleDeleteProfile}
                    className="w-full text-left px-4 py-3 text-[14px] text-[#BE1F2E] hover:bg-[rgba(190,31,46,0.05)] transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Delete Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN ───────────────────────────────────────────────────────── */}
      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-12 space-y-10 page-enter">

        {/* Welcome */}
        <div>
          <h1 className="font-serif mb-3" style={{ fontSize: 'clamp(36px,5vw,60px)', fontWeight: 700, color: '#1A0A0A', lineHeight: 1.05, fontFeatureSettings: '"liga" 0' }}>
            Your <span className="italic text-[#BE1F2E]">Impact</span> Dashboard
          </h1>
          <p className="text-[16px] text-[#5A5A5A] leading-[1.6] max-w-[520px]">
            Welcome back, <strong className="text-[#1A1A1A]">{donorName}</strong>. Your commitment to the clinical supply chain has directly supported three local trauma centers this month.
          </p>
        </div>

        {/* ── STAT CARDS ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5" style={{ gridTemplateColumns: '1fr 1fr 1.2fr' }}>

          {/* Card 1: Total Donations */}
          <div className="bg-white border border-[#EDE7E1] rounded-2xl p-7 overflow-hidden relative shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(190,31,46,0.08)] flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-[#BE1F2E] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
            </div>
            <p className="text-[11px] font-[600] text-[#9A9A9A] uppercase tracking-widest mb-2">Total Donations</p>
            <p className="font-serif text-[#1A0A0A] mb-1" style={{ fontSize: 'clamp(40px,5vw,60px)', fontWeight: 700, lineHeight: 1 }}>
              {totalDonations} <span className="text-[16px] font-normal text-[#9A9A9A]">units</span>
            </p>
          </div>

          {/* Card 2: Lives Impacted */}
          <div className="bg-white border border-[#EDE7E1] rounded-2xl p-7 overflow-hidden relative shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(190,31,46,0.08)] flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-[#BE1F2E] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </div>
            <p className="text-[11px] font-[600] text-[#9A9A9A] uppercase tracking-widest mb-2">Lives Impacted</p>
            <p className="font-serif text-[#1A0A0A] mb-1" style={{ fontSize: 'clamp(40px,5vw,60px)', fontWeight: 700, lineHeight: 1 }}>
              {livesImpacted} <span className="text-[16px] font-normal text-[#9A9A9A]">lives</span>
            </p>
          </div>

          {/* Card 3: Next Eligible — Dark */}
          <div className="bg-[#1A0A0A] border border-white/10 rounded-2xl p-7 overflow-hidden relative shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div className="w-10 h-10 rounded-[10px] bg-white/10 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
            </div>
            <p className="text-[11px] font-[600] text-white/50 uppercase tracking-widest mb-2">Next Eligible Date</p>
            <p className="text-white font-serif text-[26px] font-[700] leading-tight mb-3">October 24, 2024</p>
            <button className="flex items-center gap-1.5 text-[13px] text-[#BE1F2E] font-[600] hover:underline">
              <span className="material-symbols-outlined text-[14px]">calendar_add_on</span>
              Mark Calendar
            </button>
          </div>
        </div>

        {/* ── TWO COLUMN ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT — 2/3 */}
          <div className="lg:col-span-2 space-y-6">

            {/* Eligibility CTA */}
            <div className="bg-white border border-[#EDE7E1] rounded-2xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="flex-1 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(190,31,46,0.08)] text-[#BE1F2E] text-[11px] font-[700] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BE1F2E] pulse-dot" />
                  Action Required
                </div>
                <h2 className="font-serif text-[22px] font-[700] text-[#1A0A0A] leading-tight" style={{ fontFeatureSettings: '"liga" 0' }}>
                  Are you ready to save a life today?
                </h2>
                <p className="text-[15px] text-[#5A5A5A] leading-[1.6]">Take the 2-minute health check to ensure you meet clinical requirements for donation.</p>
              </div>
              {/* Primary red button */}
              <button className="btn-primary whitespace-nowrap w-full md:w-auto" style={{ padding: '14px 24px', fontSize: 14 }}>
                Start Screening
              </button>
            </div>

            {/* Recent Donations */}
            <div className="bg-white border border-[#EDE7E1] rounded-2xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-[20px] font-[700] text-[#1A0A0A]" style={{ fontFeatureSettings: '"liga" 0' }}>
                  Recent Donations
                </h3>
                <a href="#" className="flex items-center gap-1 text-[13px] font-[600] text-[#BE1F2E] uppercase tracking-wider border border-[#BE1F2E] px-3 py-1.5 rounded-full hover:bg-[rgba(190,31,46,0.06)] transition-colors">
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  Download
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-[1.5px] border-[#EDE7E1]">
                      {['Date', 'Location', 'Type', 'Status'].map((h) => (
                        <th key={h} className="pb-3 text-[12px] font-[600] text-[#9A9A9A] uppercase tracking-[0.06em]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentDonations.map((d, i) => (
                      <tr key={i} className="table-row-hover border-b border-[#EDE7E1]/60 last:border-0">
                        <td className="py-4 text-[14px] text-[#1A1A1A]">{d.date}</td>
                        <td className="py-4 text-[14px] text-[#5A5A5A]">{d.location}</td>
                        <td className="py-4 text-[14px] text-[#1A1A1A]">{d.type}</td>
                        <td className="py-4">
                          <span className="badge-success">{d.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Donation Timeline — fills whitespace */}
            <div className="bg-white border border-[#EDE7E1] rounded-2xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <h3 className="font-serif text-[18px] font-[700] text-[#1A0A0A] mb-6" style={{ fontFeatureSettings: '"liga" 0' }}>
                Your Donation Timeline
              </h3>
              <div className="flex items-end gap-1.5 h-20">
                {[3,6,4,8,5,9,7,10,6,8,12,9].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ height: `${(h / 12) * 100}%`, background: i === 11 ? '#BE1F2E' : 'rgba(190,31,46,0.2)' }}
                    title={`${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}: ${h} donations`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[11px] text-[#9A9A9A]">
                {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
              <p className="text-[13px] text-[#5A5A5A] mt-4">
                <span className="font-[600] text-[#BE1F2E]">Highest in December</span> — great consistency all year!
              </p>
            </div>
          </div>

          {/* RIGHT — 1/3 */}
          <div className="space-y-5">
            <h3 className="font-serif text-[20px] font-[700] text-[#1A0A0A] flex items-center gap-2" style={{ fontFeatureSettings: '"liga" 0' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#BE1F2E"/>
              </svg>
              Nearby Urgent Requests
            </h3>

            {/* Critical */}
            <div className="bg-white border-l-4 border-l-[#BE1F2E] border-r border-r-[#EDE7E1] border-y border-y-[#EDE7E1] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-[rgba(190,31,46,0.1)] flex items-center justify-center text-[#BE1F2E] font-serif font-[700] text-[16px] shrink-0">
                  {bloodGroup}
                </div>
                <div>
                  <h4 className="text-[15px] font-[700] text-[#1A1A1A]">Critical Shortage</h4>
                  <span className="badge-danger">High Priority</span>
                </div>
              </div>
              <p className="text-[14px] font-[500] text-[#1A1A1A] mb-1">City General Hospital</p>
              <p className="text-[13px] text-[#5A5A5A] flex items-center gap-1 mb-4">
                <span className="material-symbols-outlined text-[14px]">location_on</span> 2.4 miles away
              </p>
              {/* Progress bar */}
              <div className="w-full bg-[#EDE7E1] rounded-full h-2 mb-1.5">
                <div className="progress-fill rounded-full" style={{ width: '85%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-[#9A9A9A] mb-4">
                <span>Fulfilled</span><span>85%</span>
              </div>
              {/* Primary red CTA */}
              <button className="btn-primary w-full" style={{ fontSize: 14, minHeight: 44, padding: '10px 20px' }}>
                Pledge to Donate
              </button>
            </div>

            {/* Moderate */}
            <div className="bg-white border border-[#EDE7E1] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-[#E0DAD4] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#EDE7E1] flex items-center justify-center text-[#5A5A5A] text-[13px] font-[700]">
                  Any
                </div>
                <div>
                  <h4 className="text-[15px] font-[700] text-[#1A1A1A]">Platelet Request</h4>
                  <span className="badge-warning">Moderate Need</span>
                </div>
              </div>
              <p className="text-[14px] font-[500] text-[#1A1A1A] mb-1">St. Jude's Medical Center</p>
              <p className="text-[13px] text-[#5A5A5A] flex items-center gap-1 mb-4">
                <span className="material-symbols-outlined text-[14px]">location_on</span> 5.1 miles away
              </p>
              <button className="btn-dark w-full" style={{ fontSize: 13 }}>View Details</button>
            </div>

            {/* Supply chain insight */}
            <div className="bg-white border border-[#EDE7E1] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-[15px] font-[700] text-[#1A1A1A]">Supply Chain Insight</h4>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="#BE1F2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="17 6 23 6 23 12" stroke="#BE1F2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[13px] text-[#5A5A5A] leading-[1.6] mb-4">
                O− supply has dropped 18% city-wide. Rare type donors are critical this week.
              </p>
              <a href="#" className="flex items-center gap-1 text-[14px] font-[600] text-[#BE1F2E] hover:underline btn-arrow-hover">
                Read the 2024 Impact Report
                <span className="material-symbols-outlined text-[16px] btn-arrow">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="bg-[#1A0A0A] border-t border-white/10 py-14 px-6 md:px-10 mt-16">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <a className="font-serif text-[22px] font-bold text-white" href="#" style={{ fontFeatureSettings: '"liga" 0' }}>RaktSetu</a>
          <nav className="flex flex-wrap justify-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Donor Guidelines', 'Contact Support'].map((l) => (
              <a key={l} className="text-[#A09890] hover:text-white transition-colors text-[14px]" href="#">{l}</a>
            ))}
          </nav>
        </div>
        <div className="max-w-[1280px] mx-auto mt-8 text-center md:text-left">
          <p className="text-[#6A6062] text-[13px]">© 2024 RaktSetu. Clinical Excellence in Blood Logistics.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
