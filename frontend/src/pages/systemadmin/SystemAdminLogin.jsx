import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSystemAdmin } from '../../context/SystemAdminContext';
import api from '../../services/api';

const SystemAdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useSystemAdmin();

  const [formData, setFormData] = useState({ email: '', password: '', mfaCode: '' });
  const [step, setStep] = useState('credentials'); // 'credentials' | 'mfa'
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timeout;
    if (error) timeout = setTimeout(() => setError(''), 4000);
    return () => clearTimeout(timeout);
  }, [error]);

  const handleSubmitCredentials = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });

      const { token, user } = response.data;
      if (user.role !== 'sysadmin') {
        throw new Error('Access denied: You are not authorized as a system admin.');
      }

      localStorage.setItem('raktsetu_auth_token', token);
      localStorage.setItem('raktsetu_sysadmin_state_temp', JSON.stringify({ status: 'logged_in', user }));

      setStep('mfa');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMFA = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.mfaCode.length < 6) {
      setError('Please enter a valid 6-digit TOTP code.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/verify-mfa', { code: formData.mfaCode });

      const temp = localStorage.getItem('raktsetu_sysadmin_state_temp');
      if (temp) {
        localStorage.setItem('raktsetu_sysadmin_state', temp);
        localStorage.removeItem('raktsetu_sysadmin_state_temp');
        const parsed = JSON.parse(temp);
        loginAdmin({
          name: parsed.user.full_name,
          designation: 'Lead Systems Architect',
          email: parsed.user.email,
        });
      }
      navigate('/systemadmin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid MFA code. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            System Admin Console
          </span>
        </div>
      </nav>

      {/* Main Card */}
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-[500px] bg-white border border-[#EDE7E1] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-10 relative overflow-hidden">
          
          {/* Watermark */}
          <div className="absolute -top-8 -right-8 opacity-[0.03] pointer-events-none">
            <span className="material-symbols-outlined" style={{ fontSize: 200 }}>settings</span>
          </div>

          {/* Header Row */}
          <div className="flex justify-between items-center mb-10">
            <span className="font-serif text-[20px] font-bold text-[#BE1F2E] italic">RaktSetu</span>
            <span className="badge-sysadmin">SysAdmin Portal</span>
          </div>

          <div className="space-y-6">
            {step === 'credentials' ? (
              <>
                <div>
                  <h1 className="font-serif mb-2 text-[32px] font-[700] text-[#1A0A0A] leading-[1.1]" style={{ fontFeatureSettings: '"liga" 0' }}>
                    Sign in to Admin Console
                  </h1>
                  <p className="text-[15px] text-[#9A9A9A] mb-8 leading-[1.6]">
                    Root administrative access for user roles, feature flags, approvals, and platform backups.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)] mb-4">
                    <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                    <p className="text-[13px] font-[600] text-[#BE1F2E]">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmitCredentials} className="space-y-5">
                  <div className="mb-4">
                    <label htmlFor="administrator-email-1" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Administrator Email</label>
                    <input id="administrator-email-1"
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                      placeholder="admin@raktsetu.com"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="password-2" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Password</label>
                    <input id="password-2"
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
                    className="btn-primary w-full bg-[#BE1F2E] hover:bg-[#991B1B] hover:shadow-[0_8px_24px_rgba(190,31,46,0.35)]"
                    style={{ minHeight: 52 }}
                  >
                    {isLoading ? 'Verifying Admin Credentials…' : 'Authenticate Session'}
                  </button>
                </form>

              </>
            ) : (
              <>
                <div>
                  <h1 className="font-serif mb-2 text-[32px] font-[700] text-[#1A0A0A] leading-[1.1]" style={{ fontFeatureSettings: '"liga" 0' }}>
                    Two-Factor Authentication
                  </h1>
                  <p className="text-[15px] text-[#9A9A9A] mb-8 leading-[1.6]">
                    Enter the 6-digit TOTP code from your authenticator app to verify your identity.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)] mb-4">
                    <span className="material-symbols-outlined text-[#BE1F2E] text-[18px]">error</span>
                    <p className="text-[13px] font-[600] text-[#BE1F2E]">{error}</p>
                  </div>
                )}

                <form onSubmit={handleVerifyMFA} className="space-y-5">
                  <div className="mb-6">
                    <label htmlFor="authenticator-code-3" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Authenticator Code</label>
                    <input id="authenticator-code-3"
                      type="text"
                      maxLength="6"
                      value={formData.mfaCode}
                      onChange={e => setFormData({ ...formData, mfaCode: e.target.value.replace(/\D/g, '') })}
                      className="input-field tracking-[0.5em] text-center font-mono text-xl"
                      placeholder="••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full bg-[#22A06B] hover:bg-[#1A7B52] hover:shadow-[0_8px_24px_rgba(34,160,107,0.35)] text-white"
                    style={{ minHeight: 52 }}
                  >
                    {isLoading ? 'Verifying Token…' : 'Complete Sign In'}
                  </button>
                  <button type="button"
                    
                    onClick={() => setStep('credentials')}
                    className="w-full text-center text-xs font-semibold text-[#5A5A5A] hover:text-[#BE1F2E] mt-4 transition-colors"
                  >
                    &larr; Back to login
                  </button>
                </form>

              </>
            )}
          </div>

          <p className="text-center text-[11px] text-[#9A9A9A] leading-relaxed mt-8 px-4">
            Security Notice: Multi-factor authentication & device validation are required for production environments. All operations are logged.
          </p>
        </div>
      </main>

      <footer className="py-6 text-center text-[12px] text-[#9A9A9A]">
        © 2024 RaktSetu ·{' '}
        <a className="hover:text-[#BE1F2E] transition-colors" href="#">Security Policy</a> ·{' '}
        <a className="hover:text-[#BE1F2E] transition-colors" href="#">System Status</a>
      </footer>
    </div>
  );
};

export default SystemAdminLogin;
