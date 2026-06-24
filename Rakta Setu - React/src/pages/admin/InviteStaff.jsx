import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { UserPlus, Copy, ShieldAlert, Check, AlertCircle, History, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const InviteStaff = () => {
  const { appState } = useHospital();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff'
  });

  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);
  const [invitedUser, setInvitedUser] = useState(null);
  const [copied, setCopied] = useState(false);

  const validate = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Staff name is required";
    if (!formData.email.trim()) {
      tempErrors.email = "Staff email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Enter a valid email address";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setTempPassword(null);
    setInvitedUser(null);
    setIsGenerating(true);

    try {
      const response = await api.post('/hospital/staff', {
        name: formData.name,
        email: formData.email,
        role: formData.role
      });
      
      setTempPassword(response.data.tempPassword);
      setInvitedUser(response.data);
      
      setFormData({
        name: '',
        email: '',
        role: 'staff'
      });
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Failed to create staff member.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPasswordToClipboard = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-[48px] italic leading-none mb-2 text-[#1a1a1a]">Create Staff</h1>
        <p className="text-[15px] text-[#737373]">Provision credentials for medical officers and inventory staff.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Invitation Form Card */}
        <div className="lg:col-span-1 bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-8 shadow-sm h-fit">
          <h2 className="text-[20px] font-[500] text-[#1a1a1a] mb-6 flex items-center gap-2 italic font-serif">
            <UserPlus className="text-[#BE1F2E]" size={20} />
            <span>Create New Account</span>
          </h2>

          <form onSubmit={handleInvite} className="space-y-5">
            {errors.api && (
              <div className="p-3 bg-red-50 text-[#BE1F2E] text-xs font-semibold rounded-lg flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{errors.api}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1">Staff Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Sarah Alvi"
                className={`input-field ${errors.name ? 'error' : ''}`}
              />
              {errors.name && <span className="text-[#BE1F2E] text-xs flex items-center gap-1 font-semibold"><AlertCircle size={12} /> {errors.name}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sarah.alvi@hospital.com"
                className={`input-field ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <span className="text-[#BE1F2E] text-xs flex items-center gap-1 font-semibold"><AlertCircle size={12} /> {errors.email}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1">Assign Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input-field custom-select"
              >
                <option value="staff">Hospital Staff</option>
                <option value="admin">Hospital Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="btn-primary w-full mt-2"
              style={{ minHeight: 52 }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Staff Account...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-2 bg-[#FAF8F5] border border-[rgba(26,18,16,0.09)] p-8 rounded-2xl flex flex-col justify-center items-center text-center min-h-[300px]">
          <AnimatePresence mode="wait">
            {!tempPassword ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 text-[#7A5F5F]"
              >
                <div className="p-4 rounded-full bg-white border border-[#EDE7E1]">
                  <UserPlus className="h-8 w-8 text-[#7A5F5F]" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider">Account password will appear here upon creation</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6 w-full max-w-md"
              >
                <div className="bg-[#22A06B]/10 p-3 rounded-full border border-[#22A06B]/20">
                  <Check className="h-10 w-10 text-[#22A06B]" />
                </div>
                
                <div className="w-full">
                  <p className="text-[11px] font-bold text-[#7A5F5F] uppercase tracking-wider mb-2">Temporary Access Password</p>
                  <div 
                    onClick={copyPasswordToClipboard}
                    className="w-full p-4 bg-white border-2 border-[#BE1F2E]/20 rounded-xl text-lg text-[#BE1F2E] font-mono break-all cursor-pointer hover:border-[#BE1F2E] hover:bg-red-50/10 transition-all shadow-sm group relative flex items-center justify-between"
                  >
                    <span>{tempPassword}</span>
                    <Copy className="h-4 w-4 text-[#BE1F2E] cursor-pointer ml-2" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/95 rounded-xl transition-opacity font-bold font-sans text-[#1A1210] text-sm">
                      {copied ? 'Copied!' : 'Click to Copy Password'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3.5 text-xs text-left">
                  <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">CRITICAL WARNING:</span> Relayed to admin only ONCE. Please record or copy this password immediately.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default InviteStaff;
