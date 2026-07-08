import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

/**
 * DonorNavbar — single unified navbar used by Dashboard, FindCamps & EditProfile.
 * - Active link detected from current route
 * - Profile image read from localStorage (shows initials fallback)
 * - Mobile hamburger menu
 * - Sign Out button
 * - NO Emergency Request button (removed per UX review)
 */
const DonorNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileRef = useRef(null);

  // Read donor profile from localStorage
  const [donorName, setDonorName] = useState('D');
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('raktsetu_donor_profile');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.fullName) setDonorName(data.fullName.charAt(0).toUpperCase());
      if (data.photoUrl) setProfilePhoto(data.photoUrl);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('raktsetu_')) localStorage.removeItem(key);
    });
    navigate('/');
  };

  const navLinks = [
    { to: '/find-camps', label: 'Find Camps' },
    { to: '/dashboard', label: 'My Impact' },
    { to: '/edit-profile', label: 'Profile' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          navScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-[#E0DAD4]'
            : 'bg-white/90 backdrop-blur-md border-b border-[#E0DAD4]'
        }`}
        style={{ height: 72 }}
      >
        <div className="flex justify-between items-center h-full w-full px-4 sm:px-6 md:px-10 lg:px-16">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="font-serif text-[22px] md:text-[24px] font-bold text-[#BE1F2E] tracking-tight shrink-0"
            style={{ fontFeatureSettings: '"liga" 0' }}
          >
            RaktSetu
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-[14px] whitespace-nowrap transition-colors ${
                  isActive(to)
                    ? 'font-[600] text-[#BE1F2E] border-b-2 border-[#BE1F2E] pb-1'
                    : 'font-[500] text-[#5A5A5A] hover:text-[#BE1F2E]'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-[13px] font-[600] text-[#5A5A5A] hover:bg-[rgba(26,18,16,0.06)] rounded-full transition-all whitespace-nowrap"
            >
              Sign Out
            </button>
            {/* Profile Avatar */}
            <div
              className="w-10 h-10 rounded-full bg-[#eae8e5] flex items-center justify-center border border-[rgba(26,18,16,0.09)] overflow-hidden cursor-pointer shrink-0 hover:scale-105 transition-transform"
              onClick={() => navigate('/edit-profile')}
              title="Edit Profile"
            >
              {profilePhoto ? (
                <img className="w-full h-full object-cover" src={profilePhoto} alt="Profile" />
              ) : (
                <span className="text-[16px] font-bold text-[#BE1F2E]">{donorName}</span>
              )}
            </div>
          </div>

          {/* Mobile: Avatar + Hamburger */}
          <div className="flex md:hidden items-center gap-3" ref={mobileRef}>
            <div
              className="w-9 h-9 rounded-full bg-[#eae8e5] flex items-center justify-center border border-[rgba(26,18,16,0.09)] overflow-hidden cursor-pointer shrink-0"
              onClick={() => navigate('/edit-profile')}
            >
              {profilePhoto ? (
                <img className="w-full h-full object-cover" src={profilePhoto} alt="Profile" />
              ) : (
                <span className="text-[14px] font-bold text-[#BE1F2E]">{donorName}</span>
              )}
            </div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-[#f5f0eb] transition-colors"
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 bg-[#1a1210] transition-all duration-200 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-[#1a1210] transition-all duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-[#1a1210] transition-all duration-200 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-[#E0DAD4] shadow-lg transition-all duration-200 overflow-hidden ${
            mobileOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center w-full px-4 py-3 rounded-xl text-[15px] font-[500] transition-colors ${
                  isActive(to)
                    ? 'bg-[rgba(190,31,46,0.06)] text-[#BE1F2E] font-[600]'
                    : 'text-[#1a1210] hover:bg-[#f5f0eb]'
                }`}
              >
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 rounded-xl text-[15px] font-[500] text-[#5A5A5A] hover:bg-[#f5f0eb] transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default DonorNavbar;
