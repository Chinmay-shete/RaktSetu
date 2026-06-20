import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useHospital } from '../../context/HospitalContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useHospital();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timeout;
    if (error) {
      timeout = setTimeout(() => {
        setError('');
      }, 4000);
    }
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

    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      const expectedEmail = import.meta.env.VITE_ADMIN_EMAIL || "admin@raktsetu.org";
      const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

      if (formData.email === expectedEmail && formData.password === expectedPassword) {
        loginAdmin();
        navigate('/admin/dashboard');
      } else {
        setError('Invalid email or password.');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex flex-col font-sans relative overflow-y-auto selection:bg-[#BE1F2E] selection:text-white">
      <div className="noise-filter" />

      {/* ── SIMPLIFIED AUTH NAVBAR ─────────────────────────────────────── */}
      <nav className="w-full bg-white border-b border-[#E0DAD4] sticky top-0 z-40">
        <div className="flex justify-between items-center h-16 px-6 md:px-10 lg:px-16 w-full">
          <Link to="/" className="font-serif text-[22px] font-bold text-[#BE1F2E]" style={{ fontFeatureSettings: '"liga" 0' }}>
            RaktSetu
          </Link>
          <span className="text-[13px] text-[#9A9A9A] uppercase tracking-widest font-bold">
            Hospital Portal
          </span>
        </div>
      </nav>

      {/* ── MAIN CARD ──────────────────────────────────────────────────── */}
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-[500px] bg-white border border-[#EDE7E1] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-10 relative overflow-hidden">
          
          {/* Watermark */}
          <div className="absolute -top-8 -right-8 opacity-[0.03] pointer-events-none">
            <span className="material-symbols-outlined text-[200px]" style={{ fontSize: 200 }}>medical_services</span>
          </div>

          {/* Header Row */}
          <div className="flex justify-between items-center mb-10">
            <span className="font-serif text-[20px] font-bold text-[#BE1F2E] italic">RaktSetu</span>
            <span className="badge-neutral">Hospital Login</span>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="font-serif mb-2 text-[32px] font-[700] text-[#1A0A0A] leading-[1.1]" style={{ fontFeatureSettings: '"liga" 0' }}>
                Sign in to command center
              </h1>
              <p className="text-[15px] text-[#9A9A9A] mb-8 leading-[1.6]">
                Authorized access to RaktSetu clinical supply logistics dashboard.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)] mb-4">
                <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                <p className="text-[13px] font-[600] text-[#BE1F2E]">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="mb-4">
                <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="Enter authorized email"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            {/* Quick Link to Register */}
            <div className="mt-8 text-center text-xs text-[#5A5A5A]">
              Need credentials?{' '}
              <Link to="/admin/register" className="text-link font-semibold">
                Register Hospital
              </Link>
            </div>
          </div>

          {/* Legal */}
          <p className="text-center text-[11px] text-[#9A9A9A] leading-relaxed mt-8 px-4">
            Authorized use only. Unauthorized attempts will be logged and reported.
          </p>
        </div>
      </main>

      {/* ── MINIMAL AUTH FOOTER ────────────────────────────────────────── */}
      <footer className="py-6 text-center text-[12px] text-[#9A9A9A]">
        © 2024 RaktSetu ·{' '}
        <a className="hover:text-[#BE1F2E] transition-colors" href="#">Privacy Policy</a> ·{' '}
        <a className="hover:text-[#BE1F2E] transition-colors" href="#">Terms of Service</a>
      </footer>
    </div>
  );
};

export default AdminLogin;
