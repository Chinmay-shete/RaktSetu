import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDistrict } from '../../context/DistrictContext';

const DistrictLogin = () => {
  const navigate = useNavigate();
  const { loginOfficer } = useDistrict();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timeout;
    if (error) timeout = setTimeout(() => setError(''), 4000);
    return () => clearTimeout(timeout);
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (formData.email === 'officer@pune.gov.in' && formData.password === 'district123') {
        loginOfficer({
          name: 'Rajesh Patil',
          designation: 'District Health Officer',
          district: 'Pune',
          email: formData.email,
        });
        navigate('/district/dashboard');
      } else {
        setError('Invalid email or password. Use officer@pune.gov.in / district123');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex flex-col font-sans relative overflow-y-auto selection:bg-[#BE1F2E] selection:text-white">
      <div className="noise-filter" />

      {/* Auth Navbar */}
      <nav className="w-full bg-white border-b border-[#E0DAD4] sticky top-0 z-40">
        <div className="flex justify-between items-center h-16 px-6 md:px-10 lg:px-16 w-full">
          <Link to="/" className="font-serif text-[22px] font-bold text-[#BE1F2E]" style={{ fontFeatureSettings: '"liga" 0' }}>
            RaktSetu
          </Link>
          <span className="text-[13px] text-[#9A9A9A] uppercase tracking-widest font-bold">
            District Portal
          </span>
        </div>
      </nav>

      {/* Main Card */}
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-[500px] bg-white border border-[#EDE7E1] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-10 relative overflow-hidden">
          
          {/* Watermark */}
          <div className="absolute -top-8 -right-8 opacity-[0.03] pointer-events-none">
            <span className="material-symbols-outlined" style={{ fontSize: 200 }}>account_balance</span>
          </div>

          {/* Header Row */}
          <div className="flex justify-between items-center mb-10">
            <span className="font-serif text-[20px] font-bold text-[#BE1F2E] italic">RaktSetu</span>
            <span className="badge-neutral">District Login</span>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="font-serif mb-2 text-[32px] font-[700] text-[#1A0A0A] leading-[1.1]" style={{ fontFeatureSettings: '"liga" 0' }}>
                Sign in as District Officer
              </h1>
              <p className="text-[15px] text-[#9A9A9A] mb-8 leading-[1.6]">
                Government access for district-wide blood supply oversight and shortage management.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)] mb-4">
                <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                <p className="text-[13px] font-[600] text-[#BE1F2E]">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="mb-4">
                <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Government Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="officer@district.gov.in"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
                style={{ minHeight: 52 }}
              >
                {isLoading ? 'Verifying Credentials…' : 'Authorize Login'}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-[#5A5A5A]">
              Demo credentials:{' '}
              <span className="font-semibold text-[#1a1a1a]">officer@pune.gov.in / district123</span>
            </div>
          </div>

          <p className="text-center text-[11px] text-[#9A9A9A] leading-relaxed mt-8 px-4">
            Authorized use only. Unauthorized attempts will be logged and reported.
          </p>
        </div>
      </main>

      <footer className="py-6 text-center text-[12px] text-[#9A9A9A]">
        © 2024 RaktSetu ·{' '}
        <a className="hover:text-[#BE1F2E] transition-colors" href="#">Privacy Policy</a> ·{' '}
        <a className="hover:text-[#BE1F2E] transition-colors" href="#">Terms of Service</a>
      </footer>
    </div>
  );
};

export default DistrictLogin;
