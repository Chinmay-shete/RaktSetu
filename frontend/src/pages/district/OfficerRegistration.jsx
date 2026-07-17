import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import api from '../../services/api';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
];

const DESIGNATIONS = [
  'District Health Officer',
  'Chief Medical Officer',
  'District Collector',
  'Additional Collector (Health)',
  'Deputy Director of Health Services',
  'District Programme Officer',
  'District Immunization Officer',
  'Blood Bank Administrator',
];

const OfficerRegistration = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    districtName: '',
    state: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (Object.values(form).some((v) => !v.trim())) {
      setError('Please fill in all fields before submitting.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/register', { role: 'district', ...form });
      setSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Success Screen ─────────────────────────────────────────────── */
  if (success) {
    return (
      <div className="min-h-screen bg-[#fbf9f6] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-[#E0DAD4] rounded-2xl shadow-2xl p-12 max-w-lg w-full text-center"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#1A1A1A] mb-3">
            Application Submitted
          </h2>
          <p className="text-[#5A5A5A] text-[15px] leading-relaxed mb-8">
            Your District Officer access application has been sent to the
            System Administrator for review. Once approved, you will receive
            a temporary login password to your registered government email.
          </p>
          <Link
            to="/district/login"
            className="inline-flex items-center gap-2 btn-primary px-8 py-3 rounded-xl text-sm font-bold"
          >
            Go to Login <ChevronRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ── Registration Form ──────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a] flex flex-col font-sans">
      <div className="noise-filter" />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 border-b border-[#E0DAD4] backdrop-blur-md px-6 md:px-16 py-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-[24px] font-bold text-[#C8102E] tracking-tight">
          Rakt<span className="italic">Setu</span>
        </Link>
        <Link
          to="/district/login"
          className="text-[12px] font-bold uppercase tracking-wider text-[#5A5A5A] hover:text-[#C8102E] transition-colors"
        >
          Already registered? Login →
        </Link>
      </nav>

      <main className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="mb-8">
            <span className="inline-block bg-[rgba(200,16,46,0.06)] border border-[rgba(200,16,46,0.15)] text-[#C8102E] text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-4">
              District Officer Portal
            </span>
            <h1 className="font-serif text-[36px] font-bold text-[#1A1A1A] leading-tight mb-2">
              Request Portal Access
            </h1>
            <p className="text-[#5A5A5A] text-[14px] leading-relaxed">
              Submit your access application. The System Administrator will
              review and approve your request within 24 hours.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white border border-[#E0DAD4] rounded-2xl shadow-lg p-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(190,31,46,0.05)] border border-[rgba(190,31,46,0.15)] mb-6"
                >
                  <AlertCircle size={16} className="text-[#BE1F2E] shrink-0" />
                  <p className="text-[13px] font-semibold text-[#BE1F2E]">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="full-name-1" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">
                  Full Name
                </label>
                <input id="full-name-1"
                  type="text"
                  value={form.fullName}
                  onChange={set('fullName')}
                  className="input-field"
                  placeholder="Dr. Rajendra Patil"
                  required
                />
              </div>

              {/* Designation */}
              <div>
                <label htmlFor="designation-2" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">
                  Designation
                </label>
                <select id="designation-2"
                  value={form.designation}
                  onChange={set('designation')}
                  className="input-field"
                  required
                >
                  <option value="">Select designation…</option>
                  {DESIGNATIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="government-email-address-3" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">
                  Government Email Address
                </label>
                <input id="government-email-address-3"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  className="input-field"
                  placeholder="officer@district.gov.in"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="mobile-number-4" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">
                  Mobile Number
                </label>
                <input id="mobile-number-4"
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  className="input-field"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
              </div>

              {/* State + District in 2-col grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="state-5" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">
                  State
                </label>
                  <select id="state-5"
                    value={form.state}
                    onChange={set('state')}
                    className="input-field"
                    required
                  >
                    <option value="">Select state…</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="district-6" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">
                  District
                </label>
                  <input id="district-6"
                    type="text"
                    value={form.districtName}
                    onChange={set('districtName')}
                    className="input-field"
                    placeholder="e.g. Pune"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full mt-2"
                style={{ minHeight: 52 }}
              >
                {isLoading ? 'Submitting Application…' : 'Submit Access Application'}
              </button>
            </form>
          </div>

          {/* Info note */}
          <p className="text-center text-[11px] text-[#9A9A9A] leading-relaxed mt-6 px-4">
            Authorized government personnel only. All applications are verified
            against official district records before approval.
          </p>
        </div>
      </main>
    </div>
  );
};

export default OfficerRegistration;
