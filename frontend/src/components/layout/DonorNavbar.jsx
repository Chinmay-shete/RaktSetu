import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, MapPin, User, LogOut } from 'lucide-react';

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

  const isActive = (path) => location.pathname === path;  return (
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
            className="font-serif text-[22px] md:text-[24px] font-bold text-[#C8102E] tracking-tight shrink-0"
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
                    ? 'font-[600] text-[#C8102E] border-b-2 border-[#C8102E] pb-1'
                    : 'font-[500] text-[#5A5A5A] hover:text-[#C8102E]'
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
              className="px-4 py-2 text-[13px] font-[600] text-[#5A5A5A] hover:bg-[rgba(26,18,16,0.06)] rounded-full transition-all whitespace-nowrap cursor-pointer"
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
                <span className="text-[16px] font-bold text-[#C8102E]">{donorName}</span>
              )}
            </div>
          </div>

          {/* Mobile: Avatar + Logout */}
          <div className="flex md:hidden items-center gap-3">
            <div
              className="w-8 h-8 rounded-full bg-[#eae8e5] flex items-center justify-center border border-[rgba(26,18,16,0.09)] overflow-hidden cursor-pointer shrink-0 shadow-sm"
              onClick={() => navigate('/edit-profile')}
            >
              {profilePhoto ? (
                <img className="w-full h-full object-cover" src={profilePhoto} alt="Profile" />
              ) : (
                <span className="text-[13px] font-bold text-[#C8102E]">{donorName}</span>
              )}
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-xl bg-red-50/60 border border-[rgba(200,16,46,0.15)] text-[#C8102E] hover:bg-red-50 cursor-pointer shadow-sm transition-all"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────────
          MOBILE STICKY BOTTOM BAR (matching landing page styling)
      ───────────────────────────────────────────────────────────────────── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-2 py-2 flex items-center justify-around"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(26,18,16,0.09)',
          boxShadow: '0 -4px 24px rgba(26,18,16,0.08)',
        }}
      >
        {[
          { name: 'Home', path: '/dashboard', icon: Home },
          { name: 'Camps', path: '/find-camps', icon: Heart },
          { name: 'Map', path: '/location', icon: MapPin },
          { name: 'Profile', path: '/edit-profile', icon: User }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl flex-1 transition-all"
              style={{
                color: isActive ? '#C8102E' : '#5C403F',
                background: isActive ? 'rgba(200,16,46,0.06)' : 'transparent',
              }}
            >
              <Icon size={20} style={{ strokeWidth: isActive ? 2.5 : 2 }} />
              <span className="text-[9px] font-[700] uppercase tracking-wider text-center" style={{ fontSize: '9px' }}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default DonorNavbar;
