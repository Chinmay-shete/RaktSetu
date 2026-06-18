import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Countup hook ────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1200, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(ease * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

// Shared section container — full width with consistent edge padding
const Container = ({ children, className = '' }) => (
  <div className={`w-full px-6 md:px-10 lg:px-16 ${className}`}>{children}</div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const statsRef = useRef(null);

  const stat1 = useCountUp(10, 1200, statsVisible);
  const stat2 = useCountUp(5, 1200, statsVisible);
  const stat3 = useCountUp(6, 1200, statsVisible);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Stats count-up on scroll
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formEmail) return;
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 4000);
    setFormEmail('');
  };

  return (
    <div className="bg-[#F5F0EB] text-[#1A1A1A] overflow-x-hidden min-h-screen" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="noise-filter" />

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          navScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-[#E0DAD4]'
            : 'bg-white/90 backdrop-blur-md border-b border-[#E0DAD4]'
        }`}
        style={{ height: 72 }}
      >
        <Container className="flex justify-between items-center h-full">
          {/* Logo */}
          <a
            className="font-serif text-[24px] font-bold text-[#BE1F2E] tracking-tight shrink-0"
            href="#"
            style={{ fontFeatureSettings: '"liga" 0' }}
          >
            RaktSetu
          </a>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-10">
            {[
              { label: 'Features', href: '#features' },
              { label: 'How it works', href: '#process' },
              { label: 'Who uses it', href: '#who' },
              { label: 'Pilot', href: '#pilot' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[14px] font-[500] text-[#5A5A5A] hover:text-[#BE1F2E] transition-colors whitespace-nowrap"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="px-5 py-2 text-[14px] font-[600] text-[#BE1F2E] hover:bg-[rgba(190,31,46,0.06)] rounded-full transition-all whitespace-nowrap"
              onClick={() => {
                localStorage.setItem('raktsetu_login_flow', 'true');
                navigate('/register-donor');
              }}
            >
              Login
            </button>
            <button
              className="btn-primary whitespace-nowrap"
              style={{ padding: '10px 22px', minHeight: 42, fontSize: 14, borderRadius: 9999 }}
              onClick={() => setIsModalOpen(true)}
            >
              Register as Donor
            </button>
          </div>
        </Container>
      </nav>

      {/* ── HERO SECTION ───────────────────────────────────────────────── */}
      <section
        className="relative aceternity-grid overflow-hidden flex items-center"
        style={{ paddingTop: 72, minHeight: '88vh' }}
      >
        <div className="absolute inset-0 radial-glow pointer-events-none" />
        <Container className="relative z-10 text-center py-20 md:py-28">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(190,31,46,0.2)] bg-[rgba(190,31,46,0.06)] mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#22A06B] pulse-dot" />
            <span className="text-[11px] font-[700] text-[#BE1F2E] uppercase tracking-widest">
              Now Scaling in Maharashtra
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-serif text-[#1A0A0A] mb-8 mx-auto animate-fade-in-delay-1"
            style={{
              fontSize: 'clamp(52px, 8vw, 100px)',
              lineHeight: 0.92,
              fontWeight: 700,
              maxWidth: 900,
              fontFeatureSettings: '"liga" 0',
            }}
          >
            The smartest way to manage{' '}
            <span className="text-[#BE1F2E] italic">blood</span> in India
          </h1>

          {/* Subtext */}
          <p
            className="text-[#5A5A5A] mx-auto mb-10 animate-fade-in-delay-2"
            style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.6, maxWidth: 600 }}
          >
            AI-driven logistics layer for India's blood supply chain. Reducing wastage by up to{' '}
            <strong className="text-[#1A1A1A]">10%</strong> using real-time predictive demand sensing.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-3">
            <button
              className="btn-primary btn-arrow-hover"
              style={{ fontSize: 15, padding: '16px 36px', minHeight: 56 }}
            >
              Request Emergency Access
              <span className="material-symbols-outlined btn-arrow text-[20px]">arrow_forward</span>
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 bg-white border border-[#D8D0CA] rounded-full text-[15px] font-[600] text-[#1A1A1A] hover:border-[#BE1F2E] hover:text-[#BE1F2E] transition-all"
              style={{ padding: '16px 36px', minHeight: 56 }}
            >
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
              Watch Product Pilot
            </button>
          </div>
        </Container>
      </section>

      {/* ── STATS SECTION ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-y border-[#E0DAD4]" ref={statsRef}>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E0DAD4]">
            {[
              { value: stat1, suffix: '%', label: 'Avg. Wastage Reduced', desc: 'Consistent across pilot hospitals' },
              { value: stat2, suffix: ' Days', label: 'Stock Forecasting Window', desc: 'Precision demand sensing ahead' },
              { value: stat3, suffix: 'x', label: 'Logistics Features Unique', desc: 'No other platform matches this' },
            ].map(({ value, suffix, label, desc }) => (
              <div key={label} className="relative pt-8 px-6 md:px-10 pb-8">
                {/* Red top indicator line */}
                <div className="absolute top-0 left-6 right-6 md:left-10 md:right-10 h-[2px] bg-[rgba(190,31,46,0.1)]">
                  <div className="h-full bg-[#BE1F2E] counter-scale active" />
                </div>
                <div
                  className="font-serif text-[#1A0A0A] leading-none mb-2"
                  style={{ fontSize: 'clamp(52px, 6vw, 72px)', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}
                >
                  {Math.round(value)}{suffix}
                </div>
                <p className="text-[14px] font-[600] text-[#1A1A1A] mb-1">{label}</p>
                <p className="text-[13px] text-[#6B6B6B]">{desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── DARK MARQUEE ───────────────────────────────────────────────── */}
      <div className="bg-[#1A0A0A] py-5 overflow-hidden flex border-y border-white/5" style={{ whiteSpace: 'nowrap' }}>
        {[0, 1].map((k) => (
          <div key={k} className="flex animate-marquee gap-16 items-center shrink-0" style={{ paddingRight: 64 }}>
            {['PREDICTIVE ANALYTICS', 'COLD CHAIN MONITORING', 'DONOR RETENTION', 'REAL-TIME INVENTORY', 'INTER-HOSPITAL TRANSFER'].map((t) => (
              <span key={t} className="text-white/40 text-[11px] font-[700] tracking-widest flex items-center gap-4">
                {t}
                <span className="w-1.5 h-1.5 rounded-full bg-[#BE1F2E] inline-block" />
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* ── FEATURES SECTION ───────────────────────────────────────────── */}
      <section className="py-24" id="features">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Large Dashboard Card */}
            <div className="bg-[#1A0A0A] rounded-2xl p-10 md:row-span-2 relative overflow-hidden flex flex-col justify-between min-h-[520px]">
              <div className="relative z-10">
                <span className="text-[#BE1F2E] text-[11px] font-[700] uppercase tracking-widest mb-4 block">
                  Central Intelligence
                </span>
                <h3
                  className="text-white font-serif text-[32px] font-[700] mb-4 leading-tight"
                  style={{ fontFeatureSettings: '"liga" 0, "clig" 0' }}
                >
                  Unified Supply Dashboard
                </h3>
                <p className="text-white/60 text-[16px] leading-[1.6] max-w-sm">
                  Every unit tracked, from collection to transfusion. Zero blind spots in the national grid.
                </p>
              </div>

              {/* Stock widget */}
              <div className="mt-10 bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-white text-[14px] font-[500]">Real-time Stock (Pune Cluster)</span>
                  <span className="flex items-center gap-1.5 bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full text-[11px] font-[700]">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
                    LIVE
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    { type: 'O+', units: '742u', pct: '75%', color: '#BE1F2E' },
                    { type: 'A−', units: '118u', pct: '25%', color: '#E07B00' },
                    { type: 'AB+', units: '340u', pct: '50%', color: '#BE1F2E' },
                  ].map(({ type, units, pct, color }) => (
                    <div key={type} className="flex items-center gap-4">
                      <span className="text-white font-[700] text-[15px] w-10 shrink-0">{type}</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full animate-progress" style={{ background: color, width: pct }} />
                      </div>
                      <span className="text-[#BE1F2E] font-[600] text-[14px] w-12 text-right">{units}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature cards 01–04 */}
            {[
              { num: '01', icon: 'analytics', title: 'AI Forecasting', desc: 'Predict demand surges based on historical events, weather, and hospital data.' },
              { num: '02', icon: 'local_shipping', title: 'Optimized Routing', desc: 'Dynamic transit paths for life-saving units between banks and surgical units.' },
              { num: '03', icon: 'verified_user', title: 'Chain of Custody', desc: 'QR-based verification at every touchpoint ensures unit integrity and safety.' },
              { num: '04', icon: 'notifications_active', title: 'Smart Alerts', desc: 'Automated SMS and App triggers for rare blood type donors in specific zones.' },
            ].map(({ num, icon, title, desc }) => (
              <div
                key={num}
                className="bg-white border border-[#EDE7E1] rounded-2xl p-7 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 cursor-pointer"
                style={{ transition: 'all 0.25s ease' }}
              >
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[12px] font-[700] text-[#BE1F2E] uppercase tracking-wider">{num}</span>
                  <div className="w-10 h-10 rounded-xl bg-[rgba(190,31,46,0.08)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#BE1F2E] text-[20px]">{icon}</span>
                  </div>
                </div>
                <h4 className="font-[700] text-[18px] text-[#1A1A1A] mb-3" style={{ fontFeatureSettings: '"liga" 0' }}>
                  {title}
                </h4>
                <p className="text-[15px] text-[#5A5A5A] leading-[1.6]">{desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section className="py-24 bg-white border-y border-[#E0DAD4]" id="process">
        <Container>
          <h2
            className="font-serif text-center mb-20"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#1A0A0A', fontFeatureSettings: '"liga" 0' }}
          >
            The Lifecycle of a <span className="text-[#BE1F2E] italic">Life</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connector */}
            <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-[#E0DAD4]" />
            {[
              { icon: 'volunteer_activism', title: 'Sourcing', desc: 'Strategic donor mapping and mobile camp optimization across districts.' },
              { icon: 'science', title: 'Validation', desc: 'Digital documentation of testing and cross-matching results.' },
              { icon: 'inventory_2', title: 'Optimized Storage', desc: 'AI-suggested stocking based on localized demand heatmaps.' },
              { icon: 'emergency_share', title: 'Transfusion', desc: 'Real-time matching and priority delivery to operating rooms.' },
            ].map(({ icon, title, desc }, i) => (
              <div key={title} className="relative z-10 text-center">
                <div className="w-14 h-14 rounded-xl bg-[rgba(190,31,46,0.08)] flex items-center justify-center mx-auto mb-6 relative border border-white shadow-sm">
                  <span className="material-symbols-outlined text-[#BE1F2E] text-[24px]">{icon}</span>
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border border-[#E0DAD4] flex items-center justify-center text-[10px] font-[700] text-[#BE1F2E]">
                    {i + 1}
                  </span>
                </div>
                <h5 className="font-[700] text-[17px] text-[#1A1A1A] mb-3">{title}</h5>
                <p className="text-[15px] text-[#5A5A5A] leading-[1.6]">{desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── WHO USES IT ────────────────────────────────────────────────── */}
      <section className="py-24" id="who">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <h2
                className="font-serif mb-4"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#1A0A0A', fontFeatureSettings: '"liga" 0' }}
              >
                Built for the <span className="italic text-[#BE1F2E]">entire</span> ecosystem
              </h2>
              <p className="text-[17px] text-[#5A5A5A] leading-[1.6]">
                A modular platform that scales across organizational roles and requirements.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              {['west', 'east'].map((dir) => (
                <button
                  key={dir}
                  className="w-11 h-11 rounded-full border border-[#E0DAD4] flex items-center justify-center hover:bg-[#F5F0EB] transition-colors"
                >
                  <span className="material-symbols-outlined text-[#5A5A5A]">{dir}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              { icon: 'medical_services', title: 'Hospital Staff', desc: 'Request units in seconds and track transit in real-time with live updates.' },
              { icon: 'admin_panel_settings', title: 'Health Officer', desc: 'District-wide oversight and crisis management tools with drill-down reports.' },
              { icon: 'account_balance', title: 'Bank Admin', desc: 'Digital inventory logs and automated compliance reporting dashboards.' },
              { icon: 'favorite', title: 'Life Donor', desc: 'Digital donor card, health history, and reward points for loyal donors.' },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="group bg-white border border-[#EDE7E1] rounded-2xl p-7 hover:-translate-y-2 hover:shadow-xl transition-all duration-200 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-[rgba(190,31,46,0.06)] flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-[#BE1F2E] text-[26px]">{icon}</span>
                </div>
                <h6 className="font-[700] text-[17px] text-[#1A1A1A] mb-2">{title}</h6>
                <p className="text-[15px] text-[#5A5A5A] leading-[1.6] mb-6">{desc}</p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[#BE1F2E] text-[13px] font-[600]">
                  Learn more
                  <span className="material-symbols-outlined text-[16px] btn-arrow">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── PILOT / CTA SECTION ────────────────────────────────────────── */}
      <section className="py-24 bg-white border-y border-[#E0DAD4]" id="pilot">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            {/* Left */}
            <div>
              <h2
                className="font-serif mb-8 leading-tight"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#1A0A0A', fontFeatureSettings: '"liga" 0' }}
              >
                Ready to modernize your{' '}
                <span className="italic">blood logistics?</span>
              </h2>
              <ul className="space-y-5 mb-10">
                {[
                  'Onboard your hospital in under 48 hours.',
                  'Zero upfront capital expenditure for government banks.',
                  '24/7 technical support and on-site training.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-4">
                    <span className="w-6 h-6 rounded-full bg-[rgba(34,160,107,0.1)] flex items-center justify-center shrink-0 mt-0.5">
                      <span
                        className="material-symbols-outlined text-[#22A06B] text-[16px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    </span>
                    <p className="text-[16px] font-[500] text-[#1A1A1A] leading-[1.5]">{item}</p>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-[28px] font-[700] text-[#1A1A1A]">14+</div>
                  <div className="text-[14px] font-[500] text-[#5A5A5A] mt-0.5">Active Pilots</div>
                </div>
                <div className="w-px h-10 bg-[#E0DAD4]" />
                <div>
                  <div className="text-[28px] font-[700] text-[#1A1A1A]">120k+</div>
                  <div className="text-[14px] font-[500] text-[#5A5A5A] mt-0.5">Units Tracked</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                {['Maharashtra Pilot', 'NABH Compliant', 'AI-Enabled'].map((b) => (
                  <span key={b} className="trust-badge">
                    <span className="text-[#22A06B] font-[700]">✓</span> {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Demo Form */}
            <div className="relative">
              <div className="absolute -inset-6 bg-[rgba(190,31,46,0.06)] blur-[80px] rounded-full pointer-events-none" />
              <div className="relative bg-[#1A0A0A] rounded-2xl p-10 border border-white/10 shadow-2xl">
                <h4
                  className="text-white font-serif text-[28px] font-[700] mb-3"
                  style={{ fontFeatureSettings: '"liga" 0' }}
                >
                  Request Demo Access
                </h4>
                <p className="text-white/60 text-[15px] leading-[1.6] mb-8">
                  See how RaktSetu can optimize your district's blood supply through real-time predictive data.
                </p>
                {formSubmitted ? (
                  <div className="bg-[rgba(34,160,107,0.15)] border border-[rgba(34,160,107,0.3)] rounded-xl p-6 text-center animate-fade-in">
                    <span
                      className="material-symbols-outlined text-[#22A06B] text-[36px] mb-2 block"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <p className="text-[#22A06B] font-[600] text-[15px]">Request received!</p>
                    <p className="text-white/60 text-[13px] mt-1">We'll be in touch within 24 hours.</p>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={handleFormSubmit}>
                    <input
                      className="w-full bg-white border-0 rounded-xl px-4 py-3.5 text-[16px] text-[#1A1A1A] placeholder:text-[#A8A0A0] focus:ring-2 focus:ring-[#BE1F2E] focus:outline-none transition-all"
                      placeholder="Your work email"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn-primary w-full" style={{ minHeight: 52, fontSize: 15 }}>
                      Start Pilot Discussion
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="bg-[#1A0A0A] py-20 border-t border-white/10">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <a
                className="font-serif text-[24px] font-bold text-white tracking-tight mb-5 block"
                href="#"
                style={{ fontFeatureSettings: '"liga" 0' }}
              >
                RaktSetu
              </a>
              <p className="text-[#A09890] text-[15px] leading-[1.7] max-w-sm mb-6">
                Precision blood logistics for India's 1.4 billion people. Building the digital infrastructure for a healthier tomorrow.
              </p>
              <span className="text-[#8A8078] text-[13px] flex items-center gap-2">
                Made with pride in India
                <span
                  className="material-symbols-outlined text-[#BE1F2E] text-[14px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  favorite
                </span>
              </span>
            </div>
            {[
              { title: 'Platform', links: ['Features', 'Impact Metrics', 'Security', 'API Documentation'] },
              { title: 'Company', links: ['Mission', 'Partner Hospitals', 'Contact Support', 'Privacy Policy'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h6 className="text-white text-[11px] font-[600] uppercase tracking-widest mb-6">{title}</h6>
                <ul className="space-y-3">
                  {links.map((l) => (
                    <li key={l}>
                      <a className="text-[#A09890] hover:text-white transition-colors text-[14px]" href="#">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[#6A6062] text-[13px]">
            <span>© 2024 RaktSetu AI. Precision Blood Logistics.</span>
            <div className="flex gap-6">
              {['Twitter', 'LinkedIn', 'GitHub'].map((s) => (
                <a key={s} className="hover:text-white transition-colors" href="#">{s}</a>
              ))}
            </div>
          </div>
        </Container>
      </footer>

      {/* ── ROLE SELECTION MODAL ───────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1A0A0A]/50 backdrop-blur-md transition-opacity duration-300 ${
          isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`bg-white rounded-2xl w-full max-w-4xl p-10 relative transition-all duration-300 ${
            isModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 rounded-full border border-[#E0DAD4] flex items-center justify-center text-[#5A5A5A] hover:bg-[#F5F0EB] transition-colors"
            onClick={() => setIsModalOpen(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="text-center mb-10">
            <h2
              className="font-serif text-[32px] font-[700] text-[#1A1A1A] mb-3"
              style={{ fontFeatureSettings: '"liga" 0' }}
            >
              Choose your journey
            </h2>
            <p className="text-[15px] text-[#5A5A5A]">Select the role that matches your intent to continue.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: 'volunteer_activism',
                title: 'Individual Donor',
                desc: 'Register to donate blood and track impact.',
                action: () => navigate('/register-donor'),
                active: true,
              },
              {
                icon: 'local_hospital',
                title: 'Hospital Admin',
                desc: 'Access the clinical blood supply command center.',
                action: () => navigate('/admin'),
                active: true,
              },
              {
                icon: 'group',
                title: 'Hospital Staff',
                desc: 'Access clinical blood inventory, requests, and updates.',
                action: () => navigate('/staff/login'),
                active: true,
              },
              { icon: 'shield', title: 'Government', desc: 'District or State level monitoring.', active: false },
            ].map(({ icon, title, desc, action, active }) => (
              <div
                key={title}
                className={`p-6 rounded-xl border transition-all cursor-pointer group ${
                  active
                    ? 'border-[rgba(190,31,46,0.4)] hover:bg-[rgba(190,31,46,0.04)]'
                    : 'border-[#E0DAD4] hover:border-[rgba(190,31,46,0.3)] opacity-60'
                }`}
                onClick={action}
              >
                <div className="w-12 h-12 rounded-xl bg-[rgba(190,31,46,0.08)] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[#BE1F2E] text-[24px]">{icon}</span>
                </div>
                <h6 className="font-[700] text-[15px] text-[#1A1A1A] mb-1">{title}</h6>
                <p className="text-[13px] text-[#9A9A9A] leading-[1.5]">{desc}</p>
                {!active && (
                  <p className="text-[11px] font-[600] text-[#BE1F2E] mt-3 uppercase tracking-wide">Coming soon</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
