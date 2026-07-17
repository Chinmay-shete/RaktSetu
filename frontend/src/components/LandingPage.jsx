import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// ─── Countup hook ─────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1400, start = false) {
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

// ─── Design Tokens (from DESIGN.md) ──────────────────────────────────────────
// Primary Crimson:   #C8102E  (crimson-accent / primary-container)
// Deep Crimson:      #9E001F  (primary)
// Charcoal:          #1A1210  (charcoal-card / inverse-surface ~#30312f)
// Bone BG:           #FAF8F5  (bone-bg / surface)
// Surface White:     #FFFFFF  (surface-container-lowest)
// Surface Card:      #EFEEEB  (surface-container)
// Border Subtle:     rgba(26,18,16,0.09)  (border-subtle)
// Border Variant:    #E5BDBB  (outline-variant)
// On-Surface:        #1B1C1A  (on-surface / text primary)
// On-Surface Var:    #5C403F  (on-surface-variant / muted text)
// Outline:           #906F6E  (outline)
// Tertiary Teal:     #005468  (tertiary)
// Tertiary Light:    #B5EAFF  (on-tertiary-container)

// ─── Container ────────────────────────────────────────────────────────────────
const Container = ({ children, className = '' }) => (
  <div className={`w-full px-5 sm:px-8 md:px-10 lg:px-16 xl:px-20 ${className}`}>
    {children}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [activeBloodGroup, setActiveBloodGroup] = useState('O+');
  const statsRef = useRef(null);

  const s1 = useCountUp(4800, 1400, statsVisible);
  const s2 = useCountUp(38, 1400, statsVisible);
  const s3 = useCountUp(12400, 1400, statsVisible);
  const s4 = useCountUp(98, 1400, statsVisible);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const services = [
    { label: 'Blood Availability', sublabel: 'Live stock across all centers', icon: 'water_drop', path: '/services?service=Blood+Stock+Availability' },
    { label: 'Camp Schedule', sublabel: 'Upcoming donation drives', icon: 'calendar_month', path: '/services?service=Camp+Schedule' },
    { label: 'Blood Bank Finder', sublabel: 'Locate nearest centers', icon: 'location_on', path: '/services?service=Blood+Center+Directory' },
  ];

  const navLinks = [
    { label: 'Services', href: '#services-section' },
    { label: 'For Citizens', href: '#process' },
    { label: 'For Hospitals', href: '#hospitals' },
    { label: 'Helpline', href: '#helpline' },
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const handleDonorSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
    setFormData({ name: '', phone: '', email: '' });
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: 'DM Sans, sans-serif', background: '#FAF8F5', color: '#1B1C1A' }}>
      <div className="noise-filter" />

      {/* ─────────────────────────────────────────────────────────────────────
          NAVBAR
      ───────────────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 w-full z-50 transition-all duration-300"
        style={{
          height: 64,
          background: navScrolled ? 'rgba(255,255,255,0.98)' : 'rgba(250,248,245,0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(26,18,16,0.09)',
          boxShadow: navScrolled ? '0 1px 16px rgba(26,18,16,0.06)' : 'none',
        }}
      >
        <Container className="flex justify-between items-center h-full">
          {/* Logo */}
          <a
            href="#"
            className="font-serif text-[22px] font-bold tracking-tight shrink-0"
            style={{ color: '#C8102E', fontFeatureSettings: '"liga" 0' }}
          >
            RaktSetu
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[13px] font-[500] transition-colors whitespace-nowrap"
                style={{ color: '#5C403F' }}
                onMouseEnter={e => e.target.style.color = '#C8102E'}
                onMouseLeave={e => e.target.style.color = '#5C403F'}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button type="button"
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-[13px] font-[600] rounded-full transition-all"
              style={{ color: '#C8102E' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,16,46,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Login
            </button>
            <button type="button"
              onClick={() => navigate('/register-donor')}
              className="px-5 py-2.5 text-[13px] font-[700] rounded-full transition-all"
              style={{ background: '#C8102E', color: '#ffffff' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#9E001F'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(200,16,46,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#C8102E'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              Donate Blood
            </button>
          </div>

          {/* Mobile: Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button type="button"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer border"
              style={{ borderColor: 'rgba(26,18,16,0.09)', background: 'transparent', color: '#1B1C1A' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined text-[20px]">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </Container>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────────
          MOBILE MENU DRAWER
      ───────────────────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(26,18,16,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="fixed top-[64px] left-0 right-0 z-50 md:hidden"
            style={{ background: '#ffffff', borderBottom: '1px solid rgba(26,18,16,0.09)', boxShadow: '0 8px 40px rgba(26,18,16,0.12)' }}
          >

            <div className="px-5 pt-4 pb-5 flex flex-col gap-1">
              {/* Services accordion */}
              <button type="button"
                className="flex justify-between items-center w-full py-3 text-[15px] font-[600] border-none bg-transparent cursor-pointer"
                style={{ color: '#1B1C1A' }}
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              >
                <span>Blood Services</span>
                <span
                  className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${mobileServicesOpen ? 'rotate-180' : ''}`}
                  style={{ color: '#C8102E' }}
                >keyboard_arrow_down</span>
              </button>
              {mobileServicesOpen && (
                <div className="pl-2 mb-2 space-y-1 rounded-2xl p-3" style={{ background: '#FAF8F5' }}>
                  {services.map(({ label, sublabel, icon, path }) => (
                    <button type="button"
                      key={label}
                      onClick={() => { navigate(path); setMobileMenuOpen(false); }}
                      className="w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all border-none bg-transparent"
                      style={{ color: '#1A1210' }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(200,16,46,0.10)' }}>
                        <span className="material-symbols-outlined text-[16px]" style={{ color: '#C8102E' }}>{icon}</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-[700]">{label}</p>
                        <p className="text-[11px]" style={{ color: '#5C403F' }}>{sublabel}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {navLinks.slice(1).map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-[14px] font-[500] block"
                  style={{ color: '#5C403F', borderTop: '1px solid #F0ECE8' }}
                >
                  {label}
                </a>
              ))}

              <div className="pt-4 mt-2 grid grid-cols-2 gap-3" style={{ borderTop: '1px solid rgba(26,18,16,0.09)' }}>
                <button type="button"
                  onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                  className="py-3 text-[13px] font-[700] rounded-2xl transition-all cursor-pointer border"
                  style={{ color: '#C8102E', borderColor: '#C8102E', background: 'transparent' }}
                >
                  Login
                </button>
                <button type="button"
                  onClick={() => { navigate('/register-donor'); setMobileMenuOpen(false); }}
                  className="py-3 text-[13px] font-[700] rounded-2xl transition-all cursor-pointer"
                  style={{ background: '#C8102E', color: '#ffffff', border: 'none' }}
                >
                  Donate Blood
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          HERO
      ───────────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden aceternity-grid"
        style={{ minHeight: 'calc(100svh - 64px)' }}
      >
        {/* Warm glow */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(200,16,46,0.07) 0%, transparent 70%)' }}
        />

        <Container className="relative z-10 flex flex-col justify-center py-14 sm:py-20" style={{ minHeight: 'calc(100svh - 64px)' }}>
          <div className="max-w-4xl mx-auto w-full text-center">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7 sm:mb-9"
              style={{ border: '1px solid rgba(200,16,46,0.22)', background: 'rgba(200,16,46,0.06)' }}
            >
              <span className="w-2 h-2 rounded-full pulse-dot shrink-0" style={{ background: '#22A06B' }} />
              <span className="text-[10px] sm:text-[11px] font-[700] uppercase tracking-widest" style={{ color: '#C8102E' }}>
                Ministry of Health — Official National Portal
              </span>
            </div>

            {/* Headline — Instrument Serif */}
            <h1
              className="font-serif mb-5 sm:mb-6"
              style={{
                fontSize: 'clamp(38px, 9vw, 90px)',
                lineHeight: 0.96,
                fontWeight: 400,
                letterSpacing: '-0.03em',
                color: '#1A1210',
                fontFeatureSettings: '"liga" 0',
              }}
            >
              India's Blood.{' '}
              <span style={{ color: '#C8102E', fontStyle: 'italic' }}>Every drop.</span>
              <br className="hidden sm:inline" />
              {' '}Every moment.
            </h1>

            {/* Subtext */}
            <p
              className="mx-auto mb-9 sm:mb-12 px-2"
              style={{
                fontSize: 'clamp(14px, 2.2vw, 18px)',
                fontWeight: 400,
                lineHeight: 1.7,
                maxWidth: 520,
                color: '#5C403F',
              }}
            >
              The unified digital platform connecting donors, blood banks, and hospitals across all 28 states and 8 Union Territories of India.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center mb-12 sm:mb-16 px-4 sm:px-0">
              <button type="button"
                onClick={() => navigate('/register-donor')}
                className="group flex items-center justify-center gap-2.5 rounded-full transition-all"
                style={{
                  background: '#C8102E',
                  color: '#ffffff',
                  fontSize: 'clamp(14px, 1.8vw, 16px)',
                  fontWeight: 700,
                  padding: '16px 32px',
                  minHeight: 56,
                  border: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#9E001F'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(200,16,46,0.38)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#C8102E'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
                Register as Donor
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <button type="button"
                onClick={() => navigate('/services?service=Blood+Stock+Availability')}
                className="flex items-center justify-center gap-2 rounded-full font-[600] transition-all"
                style={{
                  background: '#ffffff',
                  color: '#1B1C1A',
                  fontSize: 'clamp(14px, 1.8vw, 16px)',
                  padding: '16px 32px',
                  minHeight: 56,
                  border: '1.5px solid rgba(26,18,16,0.12)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,16,46,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(26,18,16,0.12)'; e.currentTarget.style.transform = 'none'; }}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ color: '#C8102E' }}>search</span>
                Find Blood Now
              </button>
            </div>

            {/* Quick Service Tiles */}
            <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto px-2 sm:px-0">
              {services.map(({ label, sublabel, icon, path }) => (
                <button type="button"
                  key={label}
                  onClick={() => navigate(path)}
                  className="group rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 transition-all cursor-pointer text-center border"
                  style={{
                    background: 'rgba(255,255,255,0.75)',
                    borderColor: 'rgba(26,18,16,0.09)',
                    backdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(200,16,46,0.25)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(26,18,16,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.75)'; e.currentTarget.style.borderColor = 'rgba(26,18,16,0.09)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,16,46,0.08)' }}>
                    <span className="material-symbols-outlined text-[18px] sm:text-[22px]" style={{ color: '#C8102E', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </div>
                  <div>
                    <p className="text-[11px] sm:text-[12px] font-[700] leading-tight" style={{ color: '#1A1210' }}>{label}</p>
                    <p className="text-[9px] sm:text-[10px] mt-0.5 leading-tight hidden sm:block" style={{ color: '#906F6E' }}>{sublabel}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Container>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5" style={{ opacity: 0.35 }}>
          <span className="text-[10px] font-[600] uppercase tracking-widest" style={{ color: '#5C403F' }}>Scroll</span>
          <div className="w-5 h-8 rounded-full flex items-start justify-center p-1" style={{ border: '1.5px solid #906F6E' }}>
            <div className="w-1 h-2 rounded-full animate-bounce" style={{ background: '#906F6E' }} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          EMERGENCY STRIP
      ───────────────────────────────────────────────────────────────────── */}
      <div style={{ background: '#1A1210', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Container className="py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 animate-pulse" style={{ background: '#C8102E' }}>
                <span className="material-symbols-outlined text-white text-[16px]">emergency</span>
              </div>
              <div>
                <p className="text-[13px] font-[700] text-white">Critical Blood Shortage — O- and AB- needed urgently across 7 states</p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Last updated: Today at 6:00 AM IST</p>
              </div>
            </div>
            <button type="button"
              onClick={() => navigate('/register-donor')}
              className="shrink-0 px-4 py-2 text-[12px] font-[700] rounded-full transition-all cursor-pointer whitespace-nowrap"
              style={{ background: '#C8102E', color: '#ffffff', border: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = '#9E001F'}
              onMouseLeave={e => e.currentTarget.style.background = '#C8102E'}
            >
              Respond &amp; Donate
            </button>
          </div>
        </Container>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          LIVE STATISTICS
      ───────────────────────────────────────────────────────────────────── */}
      <section
        className="py-14 sm:py-20 border-b"
        style={{ background: '#ffffff', borderColor: 'rgba(26,18,16,0.09)' }}
        ref={statsRef}
      >
        <Container>
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-[11px] font-[700] uppercase tracking-widest mb-2" style={{ color: '#C8102E' }}>Live Dashboard</p>
            <h2
              className="font-serif"
              style={{ fontSize: 'clamp(22px, 4vw, 40px)', fontWeight: 400, color: '#1A1210', fontFeatureSettings: '"liga" 0' }}
            >
              India's blood infrastructure,{' '}
              <span style={{ color: '#C8102E', fontStyle: 'italic' }}>in real time</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: s1, suffix: '+', label: 'Registered Blood Banks', sub: 'Across 28 states', icon: 'account_balance' },
              { value: s2, suffix: '', label: 'States Connected', sub: 'Full national coverage', icon: 'map' },
              { value: s3, suffix: '+', label: 'Units Available Today', sub: 'Real-time inventory', icon: 'inventory_2' },
              { value: s4, suffix: '%', label: 'Request Fulfillment Rate', sub: 'Within 2 hours', icon: 'check_circle' },
            ].map(({ value, suffix, label, sub, icon }, i) => (
              <div
                key={label}
                className="rounded-2xl p-5 sm:p-7 relative overflow-hidden transition-all duration-200"
                style={{ background: '#FAF8F5', border: '1px solid rgba(26,18,16,0.09)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #C8102E, #005468)' }} />
                <div className="flex justify-between items-start mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,16,46,0.08)' }}>
                    <span className="material-symbols-outlined text-[16px] sm:text-[20px]" style={{ color: '#C8102E', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-[700] px-2 py-0.5 rounded-full border whitespace-nowrap" style={{ color: '#22A06B', background: 'rgba(34,160,107,0.08)', borderColor: 'rgba(34,160,107,0.18)' }}>LIVE</span>
                </div>
                <div
                  className="font-serif leading-none mb-1"
                  style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 400, color: '#1A1210' }}
                >
                  {i === 2 ? `${(Math.round(value / 100) * 100).toLocaleString('en-IN')}` : Math.round(value)}{suffix}
                </div>
                <p className="text-[12px] sm:text-[13px] font-[600] mb-0.5" style={{ color: '#1B1C1A' }}>{label}</p>
                <p className="text-[11px]" style={{ color: '#906F6E' }}>{sub}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          QUICK BLOOD SEARCH
      ───────────────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20" id="services-section">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-[11px] font-[700] uppercase tracking-widest mb-2" style={{ color: '#C8102E' }}>Instant Search</p>
              <h2
                className="font-serif"
                style={{ fontSize: 'clamp(22px, 4vw, 42px)', fontWeight: 400, color: '#1A1210', fontFeatureSettings: '"liga" 0' }}
              >
                Find blood when it matters{' '}
                <span style={{ color: '#C8102E', fontStyle: 'italic' }}>most</span>
              </h2>
              <p className="text-[14px] sm:text-[16px] mt-3 max-w-md mx-auto leading-relaxed" style={{ color: '#5C403F' }}>
                Search real-time availability across 4,800+ registered blood banks in India.
              </p>
            </div>

            <div className="rounded-3xl p-5 sm:p-8 mb-5" style={{ background: '#ffffff', border: '1px solid rgba(26,18,16,0.09)', boxShadow: '0 1px 16px rgba(26,18,16,0.04)' }}>
              <p className="text-[11px] font-[700] uppercase tracking-widest mb-4" style={{ color: '#906F6E' }}>Select Blood Group</p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 mb-6">
                {bloodGroups.map((bg) => (
                  <button type="button"
                    key={bg}
                    onClick={() => setActiveBloodGroup(bg)}
                    className="h-12 rounded-xl text-[13px] font-[800] border transition-all cursor-pointer"
                    style={
                      activeBloodGroup === bg
                        ? { background: '#C8102E', borderColor: '#C8102E', color: '#ffffff', boxShadow: '0 4px 16px rgba(200,16,46,0.32)' }
                        : { background: '#FAF8F5', borderColor: 'rgba(26,18,16,0.09)', color: '#1A1210' }
                    }
                    onMouseEnter={e => { if (activeBloodGroup !== bg) { e.currentTarget.style.borderColor = 'rgba(200,16,46,0.35)'; e.currentTarget.style.background = 'rgba(200,16,46,0.05)'; } }}
                    onMouseLeave={e => { if (activeBloodGroup !== bg) { e.currentTarget.style.borderColor = 'rgba(26,18,16,0.09)'; e.currentTarget.style.background = '#FAF8F5'; } }}
                  >
                    {bg}
                  </button>
                ))}
              </div>
              <button type="button"
                onClick={() => navigate(`/services?service=Blood+Stock+Availability&group=${activeBloodGroup}`)}
                className="w-full h-12 sm:h-14 rounded-2xl font-[700] transition-all cursor-pointer flex items-center justify-center gap-2.5 border-none"
                style={{ background: '#C8102E', color: '#ffffff', fontSize: 15 }}
                onMouseEnter={e => { e.currentTarget.style.background = '#9E001F'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(200,16,46,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#C8102E'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
                Search {activeBloodGroup} Availability
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {services.map(({ label, sublabel, icon, path }) => (
                <button type="button"
                  key={label}
                  onClick={() => navigate(path)}
                  className="group rounded-2xl p-4 sm:p-5 flex items-center sm:flex-col sm:items-start gap-3 text-left transition-all cursor-pointer border"
                  style={{ background: '#ffffff', borderColor: 'rgba(26,18,16,0.09)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,16,46,0.25)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,18,16,0.07)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(26,18,16,0.09)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(200,16,46,0.08)' }}>
                    <span className="material-symbols-outlined text-[20px]" style={{ color: '#C8102E', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-[700]" style={{ color: '#1A1210' }}>{label}</p>
                    <p className="text-[11px] mt-0.5 leading-tight" style={{ color: '#906F6E' }}>{sublabel}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          MARQUEE
      ───────────────────────────────────────────────────────────────────── */}
      <div
        className="py-4 overflow-hidden flex"
        style={{ background: '#1A1210', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}
      >
        {[0, 1].map((k) => (
          <div key={k} className="flex animate-marquee gap-12 items-center shrink-0" style={{ paddingRight: 48 }}>
            {['BLOOD AVAILABILITY', 'CAMP SCHEDULE', 'DONOR REGISTRY', 'INTER-BANK TRANSFER', 'EMERGENCY DISPATCH', 'AI FORECASTING', 'NATIONAL COVERAGE'].map((t) => (
              <span key={t} className="text-[10px] font-[700] tracking-widest flex items-center gap-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {t}
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#C8102E' }} />
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          HOW IT WORKS — FOR CITIZENS
      ───────────────────────────────────────────────────────────────────── */}
      <section
        className="py-14 sm:py-24 border-b"
        style={{ background: '#ffffff', borderColor: 'rgba(26,18,16,0.09)' }}
        id="process"
      >
        <Container>
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-[11px] font-[700] uppercase tracking-widest mb-2" style={{ color: '#C8102E' }}>For Citizens</p>
            <h2
              className="font-serif"
              style={{ fontSize: 'clamp(22px, 4vw, 42px)', fontWeight: 400, color: '#1A1210', fontFeatureSettings: '"liga" 0' }}
            >
              Donate blood in{' '}
              <span style={{ color: '#C8102E', fontStyle: 'italic' }}>3 simple steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 relative">
            <div className="hidden sm:block absolute top-9 left-[20%] right-[20%] h-px" style={{ borderTop: '2px dashed rgba(26,18,16,0.10)' }} />
            {[
              { step: '01', icon: 'person_add', title: 'Register Online', desc: 'Create your digital donor profile in under 2 minutes. No paperwork required.' },
              { step: '02', icon: 'location_on', title: 'Find a Camp Near You', desc: 'Browse scheduled donation drives in your city, district, or pincode.' },
              { step: '03', icon: 'volunteer_activism', title: 'Donate & Save Lives', desc: 'Visit the camp, donate, and receive your digital donor certificate instantly.' },
            ].map(({ step, icon, title, desc }) => (
              <div
                key={step}
                className="relative z-10 rounded-2xl p-6 sm:p-7 flex flex-row sm:flex-col items-start gap-4 sm:gap-0 transition-all duration-200 border"
                style={{ background: '#FAF8F5', borderColor: 'rgba(26,18,16,0.09)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(26,18,16,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 relative"
                    style={{ background: 'rgba(200,16,46,0.08)' }}
                  >
                    <span className="material-symbols-outlined text-[24px]" style={{ color: '#C8102E', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                    <span
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-[800]"
                      style={{ background: '#1A1210', color: '#ffffff', border: '2px solid #FAF8F5' }}
                    >{step}</span>
                  </div>
                </div>
                <div>
                  <h5 className="font-[700] text-[15px] sm:text-[17px] mb-2" style={{ color: '#1B1C1A' }}>{title}</h5>
                  <p className="text-[13px] sm:text-[14px] leading-[1.65]" style={{ color: '#5C403F' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <button type="button"
              onClick={() => navigate('/register-donor')}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-[14px] font-[700] rounded-full transition-all cursor-pointer border-none"
              style={{ background: '#C8102E', color: '#ffffff' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#9E001F'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(200,16,46,0.32)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#C8102E'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span className="material-symbols-outlined text-[18px]">volunteer_activism</span>
              Register as Voluntary Donor
            </button>
          </div>
        </Container>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          FEATURES BENTO
      ───────────────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-24" id="features">
        <Container>
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-[11px] font-[700] uppercase tracking-widest mb-2" style={{ color: '#C8102E' }}>Platform Features</p>
            <h2
              className="font-serif"
              style={{ fontSize: 'clamp(22px, 4vw, 42px)', fontWeight: 400, color: '#1A1210', fontFeatureSettings: '"liga" 0' }}
            >
              Built for the scale of{' '}
              <span style={{ color: '#C8102E', fontStyle: 'italic' }}>1.4 billion</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Big dark card — charcoal (charcoal-card: #1A1210) */}
            <div
              className="rounded-2xl p-7 sm:p-8 sm:col-span-2 relative overflow-hidden flex flex-col justify-between"
              style={{ background: '#1A1210', minHeight: 280 }}
            >
              <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
                style={{ background: 'rgba(200,16,46,0.12)', filter: 'blur(40px)' }}
              />
              <div className="relative z-10">
                <span className="text-[10px] font-[700] uppercase tracking-widest mb-3 block" style={{ color: '#C8102E' }}>AI Forecasting Engine</span>
                <h3
                  className="font-serif text-[22px] sm:text-[28px] mb-3 leading-snug"
                  style={{ color: '#ffffff', fontWeight: 400, fontFeatureSettings: '"liga" 0' }}
                >
                  Predict. Prepare. Prevent shortages.
                </h3>
                <p className="text-[14px] leading-[1.7] max-w-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Our AI engine analyzes surgical trends, seasonal diseases, and regional demographics to forecast blood demand 5 days ahead — so no patient is ever turned away.
                </p>
              </div>
              {/* Mini bar chart */}
              <div className="mt-8 flex items-end gap-1.5 h-12">
                {[40, 65, 45, 80, 55, 90, 72, 95, 60, 85, 70, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t transition-colors"
                    style={{ height: `${h}%`, background: 'rgba(200,16,46,0.32)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,16,46,0.65)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(200,16,46,0.32)'}
                  />
                ))}
              </div>
            </div>

            {[
              { icon: 'local_shipping', title: 'Emergency Routing', desc: 'Real-time dispatch coordination between blood banks and hospitals within 90 minutes.' },
              { icon: 'verified_user', title: 'Full Audit Trail', desc: 'QR-based tracking of every unit from donor to recipient — NABH compliant.' },
              { icon: 'notifications_active', title: 'Smart Alerts', desc: 'Instant SMS and app alerts for rare blood group matches to pre-registered donors.' },
              { icon: 'analytics', title: 'State Dashboard', desc: 'District-level inventory analytics for health officers and administrators.' },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl p-6 transition-all duration-200 border"
                style={{ background: '#ffffff', borderColor: 'rgba(26,18,16,0.09)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(26,18,16,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: 'rgba(200,16,46,0.08)' }}>
                  <span className="material-symbols-outlined text-[22px]" style={{ color: '#C8102E' }}>{icon}</span>
                </div>
                <h4 className="font-[700] text-[15px] sm:text-[16px] mb-2" style={{ color: '#1B1C1A' }}>{title}</h4>
                <p className="text-[13px] leading-[1.65]" style={{ color: '#5C403F' }}>{desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          FOR HOSPITALS
      ───────────────────────────────────────────────────────────────────── */}
      <section
        className="py-14 sm:py-24 border-y"
        style={{ background: '#ffffff', borderColor: 'rgba(26,18,16,0.09)' }}
        id="hospitals"
      >
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 items-center">
            <div>
              <p className="text-[11px] font-[700] uppercase tracking-widest mb-3" style={{ color: '#C8102E' }}>For Hospitals &amp; Blood Banks</p>
              <h2
                className="font-serif mb-5 leading-tight"
                style={{ fontSize: 'clamp(22px, 4vw, 44px)', fontWeight: 400, color: '#1A1210', fontFeatureSettings: '"liga" 0' }}
              >
                Modern tools for the teams that{' '}
                <span style={{ color: '#C8102E', fontStyle: 'italic' }}>save lives</span>
              </h2>
              <ul className="space-y-4 mb-8">
                {[
                  { icon: 'inventory_2', text: 'Real-time inventory management with expiry alerts' },
                  { icon: 'swap_horiz', text: 'Peer-to-peer inter-bank transfer requests' },
                  { icon: 'person_search', text: 'Registered voluntary donor contact outreach' },
                  { icon: 'bar_chart', text: 'Compliance reports and audit-ready documentation' },
                  { icon: 'schedule', text: 'Surgical scheduling with blood reservation' },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(200,16,46,0.08)' }}>
                      <span className="material-symbols-outlined text-[16px]" style={{ color: '#C8102E' }}>{icon}</span>
                    </div>
                    <p className="text-[14px] sm:text-[15px] font-[500] leading-[1.6]" style={{ color: '#1B1C1A' }}>{text}</p>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 flex-wrap">
                <button type="button"
                  onClick={() => navigate('/admin/register')}
                  className="px-5 py-3 text-[13px] font-[700] rounded-full transition-all cursor-pointer border-none"
                  style={{ background: '#C8102E', color: '#ffffff' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#9E001F'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(200,16,46,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#C8102E'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  Register Hospital
                </button>
                <button type="button"
                  onClick={() => navigate('/login')}
                  className="px-5 py-3 text-[13px] font-[600] rounded-full transition-all cursor-pointer border"
                  style={{ background: 'transparent', color: '#1B1C1A', borderColor: 'rgba(26,18,16,0.15)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,16,46,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(26,18,16,0.15)'; }}
                >
                  Login to Dashboard
                </button>
              </div>
            </div>

            {/* Dashboard preview card */}
            <div className="relative">
              <div
                className="absolute -inset-4 rounded-full pointer-events-none"
                style={{ background: 'rgba(200,16,46,0.05)', filter: 'blur(60px)' }}
              />
              <div
                className="relative rounded-2xl overflow-hidden border"
                style={{ background: '#FAF8F5', borderColor: 'rgba(26,18,16,0.09)' }}
              >
                <div
                  className="px-5 py-4 flex items-center justify-between border-b"
                  style={{ background: '#ffffff', borderColor: 'rgba(26,18,16,0.09)' }}
                >
                  <div className="flex items-center gap-1.5">
                    {['#FF6058', '#FFBD2E', '#28C840'].map(c => (
                      <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                  <span className="text-[11px] font-[600]" style={{ color: '#906F6E' }}>Hospital Dashboard — Live Preview</span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{ color: '#22A06B', background: 'rgba(34,160,107,0.08)', borderColor: 'rgba(34,160,107,0.18)' }}
                  >LIVE</span>
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-[700] uppercase tracking-widest mb-3" style={{ color: '#906F6E' }}>Current Inventory — Apex Pune</p>
                  <div className="space-y-3">
                    {[
                      { group: 'O+', units: 142, pct: 80, status: 'Good', c: '#22A06B' },
                      { group: 'A-', units: 18, pct: 20, status: 'Critical', c: '#C8102E' },
                      { group: 'B+', units: 74, pct: 55, status: 'Moderate', c: '#E07B00' },
                      { group: 'AB-', units: 6, pct: 8, status: 'Critical', c: '#C8102E' },
                    ].map(({ group, units, pct, status, c }) => (
                      <div
                        key={group}
                        className="rounded-xl px-4 py-3 border"
                        style={{ background: '#ffffff', borderColor: 'rgba(26,18,16,0.09)' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-[800] text-[15px]" style={{ color: '#1A1210' }}>{group}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-[600]" style={{ color: '#5C403F' }}>{units} units</span>
                            <span
                              className="text-[10px] font-[700] px-2 py-0.5 rounded-full border"
                              style={{ color: c, background: `${c}14`, borderColor: `${c}30` }}
                            >{status}</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#EFEEEB' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          WHO USES IT
      ───────────────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-24" id="who">
        <Container>
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[11px] font-[700] uppercase tracking-widest mb-2" style={{ color: '#C8102E' }}>Designed For Everyone</p>
            <h2
              className="font-serif"
              style={{ fontSize: 'clamp(22px, 4vw, 42px)', fontWeight: 400, color: '#1A1210', fontFeatureSettings: '"liga" 0' }}
            >
              One platform.{' '}
              <span style={{ color: '#C8102E', fontStyle: 'italic' }}>Every stakeholder.</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {[
              { icon: 'volunteer_activism', role: 'Blood Donor', desc: 'Register, find camps, track your donation history and earn recognition badges.', cta: 'Register Now', path: '/register-donor' },
              { icon: 'medical_services', role: 'Hospital Staff', desc: 'Manage inventory, request transfers, schedule surgeries, and contact donors instantly.', cta: 'Hospital Login', path: '/login' },
              { icon: 'admin_panel_settings', role: 'Health Officer', desc: 'State and district-level dashboards, compliance reports, and crisis coordination tools.', cta: 'Admin Portal', path: '/login' },
              { icon: 'account_balance', role: 'Blood Bank Admin', desc: 'Full digital operations — from collection logging to inter-bank supply management.', cta: 'Get Access', path: '/admin/register' },
            ].map(({ icon, role, desc, cta, path }) => (
              <div
                key={role}
                className="rounded-2xl p-5 sm:p-7 transition-all duration-200 cursor-pointer flex flex-col border"
                style={{ background: '#ffffff', borderColor: 'rgba(26,18,16,0.09)' }}
                onClick={() => navigate(path)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(26,18,16,0.10)'; e.currentTarget.style.borderColor = 'rgba(200,16,46,0.22)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(26,18,16,0.09)'; }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 sm:mb-5" style={{ background: 'rgba(200,16,46,0.06)' }}>
                  <span className="material-symbols-outlined text-[24px]" style={{ color: '#C8102E', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <h6 className="font-[700] text-[13px] sm:text-[16px] mb-2" style={{ color: '#1B1C1A' }}>{role}</h6>
                <p className="text-[12px] sm:text-[14px] leading-[1.6] mb-5 flex-grow" style={{ color: '#5C403F' }}>{desc}</p>
                <div className="flex items-center gap-1 text-[11px] sm:text-[12px] font-[700] uppercase tracking-wider mt-auto" style={{ color: '#C8102E' }}>
                  {cta}
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          DONOR REGISTRATION + HELPLINE
      ───────────────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-24" style={{ background: '#1A1210' }} id="helpline">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 items-center">
            <div>
              <p className="text-[11px] font-[700] uppercase tracking-widest mb-4" style={{ color: '#C8102E' }}>Every Donor Counts</p>
              <h2
                className="font-serif mb-6 leading-snug"
                style={{ fontSize: 'clamp(26px, 4vw, 52px)', fontWeight: 400, color: '#ffffff', fontFeatureSettings: '"liga" 0' }}
              >
                One donation.<br />
                <span style={{ color: '#C8102E', fontStyle: 'italic' }}>Three lives saved.</span>
              </h2>
              <p className="text-[14px] sm:text-[16px] leading-[1.7] mb-8 max-w-md" style={{ color: 'rgba(255,255,255,0.45)' }}>
                India needs 14.6 million units of blood every year. Only 9 million are collected. Be part of the solution — it takes 10 minutes and costs nothing.
              </p>

              <div className="space-y-3">
                {[
                  { label: 'National Blood Helpline', number: '1800-180-0104', icon: 'call' },
                  { label: 'Emergency Blood Request', number: '104', icon: 'emergency' },
                  { label: 'SMS Blood Request', number: 'BLOOD to 51234', icon: 'sms' },
                ].map(({ label, number, icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(200,16,46,0.22)' }}>
                      <span className="material-symbols-outlined text-[18px]" style={{ color: '#C8102E' }}>{icon}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-[600] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
                      <p className="font-[700] text-[15px] text-white">{number}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="rounded-2xl p-7 sm:p-8" style={{ background: '#ffffff', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
                {formSubmitted ? (
                  <div className="text-center py-8">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border"
                      style={{ background: 'rgba(34,160,107,0.08)', borderColor: 'rgba(34,160,107,0.18)' }}
                    >
                      <span className="material-symbols-outlined text-[32px]" style={{ color: '#22A06B', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <h4 className="font-[700] text-[18px] mb-2" style={{ color: '#1B1C1A' }}>Registration Received!</h4>
                    <p className="text-[14px]" style={{ color: '#5C403F' }}>You'll receive a confirmation SMS within 24 hours with your Donor ID.</p>
                  </div>
                ) : (
                  <>
                    <h4
                      className="font-serif text-[22px] sm:text-[26px] mb-1"
                      style={{ color: '#1A1210', fontWeight: 400, fontFeatureSettings: '"liga" 0' }}
                    >
                      Become a Donor
                    </h4>
                    <p className="text-[13px] mb-6 leading-relaxed" style={{ color: '#5C403F' }}>Quick registration. Save up to 3 lives per donation.</p>
                    <form className="space-y-3.5" onSubmit={handleDonorSubmit}>
                      {[
                        { placeholder: 'Full Name', type: 'text', key: 'name' },
                        { placeholder: 'Mobile Number', type: 'tel', key: 'phone' },
                        { placeholder: 'Email Address (optional)', type: 'email', key: 'email' },
                      ].map(({ placeholder, type, key }) => (
                        <input
                          key={key}
                          className="input-field text-sm"
                          placeholder={placeholder}
                          type={type}
                          value={formData[key]}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                          required={key !== 'email'}
                          maxLength={key === 'phone' ? 10 : undefined}
                        />
                      ))}
                      <button
                        type="submit"
                        className="btn-primary w-full border-none cursor-pointer"
                        style={{ background: '#C8102E', color: '#ffffff', minHeight: 52, fontSize: 15, fontWeight: 700 }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#9E001F'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(200,16,46,0.38)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#C8102E'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        Register as Voluntary Donor
                      </button>
                    </form>
                    <p className="text-[11px] mt-4 text-center leading-relaxed" style={{ color: '#906F6E' }}>
                      Your data is protected under the National Health Data Policy.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          FOOTER
      ───────────────────────────────────────────────────────────────────── */}
      <footer
        className="pt-14 sm:pt-20 pb-24 sm:pb-14"
        style={{ background: '#30312F', borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <Container>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 mb-12">
            <div className="col-span-2">
              <a
                href="#"
                className="font-serif text-[22px] font-bold tracking-tight mb-4 block"
                style={{ color: '#ffffff', fontFeatureSettings: '"liga" 0' }}
              >
                RaktSetu
              </a>
              <p className="text-[13px] sm:text-[14px] leading-[1.7] max-w-xs mb-5" style={{ color: 'rgba(255,255,255,0.40)' }}>
                An initiative under the Ministry of Health &amp; Family Welfare, Government of India. Making blood available for every citizen, everywhere.
              </p>
              <div className="flex flex-col gap-1.5">
                {[
                  { icon: 'language', label: 'mohfw.gov.in' },
                  { icon: 'email', label: 'support@raktsetu.gov.in' },
                ].map(({ icon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    <span className="material-symbols-outlined text-[14px]">{icon}</span>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {[
              {
                title: 'Services',
                links: [
                  { label: 'Blood Availability', to: '/services?service=Blood+Stock+Availability' },
                  { label: 'Camp Schedule', to: '/services?service=Camp+Schedule' },
                  { label: 'Blood Bank Finder', to: '/services?service=Blood+Center+Directory' },
                  { label: 'Register as Donor', to: '/register-donor' },
                ]
              },
              {
                title: 'Information',
                links: [
                  { label: 'Privacy Policy', to: '/privacy' },
                  { label: 'Terms of Service', to: '/terms' },
                  { label: 'Accessibility', to: '#' },
                  { label: 'RTI (Right to Info)', to: '#' },
                ]
              }
            ].map(({ title, links }) => (
              <div key={title}>
                <h6 className="text-[10px] font-[700] uppercase tracking-widest mb-5" style={{ color: '#ffffff' }}>{title}</h6>
                <ul className="space-y-2.5">
                  {links.map(({ label, to }) => (
                    <li key={label}>
                      <Link to={to} className="text-[13px] transition-colors" style={{ color: 'rgba(255,255,255,0.38)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}
                      >{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-[12px] text-center sm:text-left" style={{ color: 'rgba(255,255,255,0.22)' }}>
              © 2024 RaktSetu · Ministry of Health &amp; Family Welfare · Government of India
            </span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#22A06B' }} />
              <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.22)' }}>All systems operational</span>
            </div>
          </div>
        </Container>
      </footer>

      {/* ─────────────────────────────────────────────────────────────────────
          MOBILE STICKY BOTTOM BAR
      ───────────────────────────────────────────────────────────────────── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-3 flex items-center gap-2"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(26,18,16,0.09)',
          boxShadow: '0 -4px 24px rgba(26,18,16,0.08)',
        }}
      >
        <a
          href="tel:18001800104"
          className="flex flex-col items-center justify-center h-[60px] gap-0.5 px-2 py-2 rounded-2xl flex-1 border border-solid transition-all active:scale-95"
          style={{ background: 'rgba(200,16,46,0.07)', borderColor: 'rgba(200,16,46,0.20)' }}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ color: '#C8102E' }}>call</span>
          <span className="text-[9px] font-[700] uppercase tracking-wider text-center" style={{ color: '#C8102E' }}>Emergency</span>
        </a>
        <button type="button"
          onClick={() => navigate('/services?service=Blood+Stock+Availability')}
          className="flex flex-col items-center justify-center h-[60px] gap-0.5 px-2 py-2 rounded-2xl flex-1 border border-solid cursor-pointer transition-all active:scale-95"
          style={{ background: '#FAF8F5', borderColor: 'rgba(26,18,16,0.09)' }}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ color: '#5C403F' }}>search</span>
          <span className="text-[9px] font-[700] uppercase tracking-wider text-center leading-tight" style={{ color: '#5C403F' }}>Find Blood</span>
        </button>
        <button type="button"
          onClick={() => navigate('/services?service=Camp+Schedule')}
          className="flex flex-col items-center justify-center h-[60px] gap-0.5 px-2 py-2 rounded-2xl flex-1 border border-solid cursor-pointer transition-all active:scale-95"
          style={{ background: '#FAF8F5', borderColor: 'rgba(26,18,16,0.09)' }}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ color: '#5C403F' }}>calendar_month</span>
          <span className="text-[9px] font-[700] uppercase tracking-wider text-center text-center" style={{ color: '#5C403F' }}>Camps</span>
        </button>
        <button type="button"
          onClick={() => navigate('/register-donor')}
          className="flex flex-col items-center justify-center h-[60px] gap-0.5 px-2 py-2 rounded-2xl flex-1 border border-solid cursor-pointer transition-all active:scale-95"
          style={{ background: '#C8102E', borderColor: '#C8102E' }}
        >
          <span className="material-symbols-outlined text-[20px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
          <span className="text-[9px] font-[700] uppercase tracking-wider text-white text-center">Donate</span>
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
