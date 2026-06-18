import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { UserPlus, Link2, Send, Check, AlertCircle, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InviteStaff = () => {
  const { appState, inviteStaffMember } = useHospital();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Medical Officer'
  });

  const [errors, setErrors] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

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

  const handleInvite = (e) => {
    e.preventDefault();
    if (validate()) {
      inviteStaffMember(formData);
      
      // Simulate sending email
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Generate a mock invite link
      const randomToken = Math.random().toString(36).substring(7);
      setGeneratedLink(`https://raktsetu.org/invite/accept?t=${randomToken}`);

      setFormData({
        name: '',
        email: '',
        role: 'Medical Officer'
      });
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 right-6 bg-[#22A06B] text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 z-50"
          >
            <Check size={18} />
            <span className="font-semibold text-sm">Invitation Email Sent Successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div>
        <h1 className="font-serif text-[48px] italic leading-none mb-2 text-[#1a1a1a]">Invite Staff</h1>
        <p className="text-[15px] text-[#737373]">Manage and provision credentials for your hospital staff.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Invitation Form Card */}
        <div className="lg:col-span-1 bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-8 shadow-sm h-fit">
          <h2 className="text-[20px] font-[500] text-[#1a1a1a] mb-6 flex items-center gap-2 italic font-serif">
            <UserPlus className="text-[#BE1F2E]" size={20} />
            <span>Send New Invitation</span>
          </h2>

          <form onSubmit={handleInvite} className="space-y-5">
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
                <option value="Medical Officer">Medical Officer</option>
                <option value="Head Nurse">Head Nurse</option>
                <option value="Lab Technician">Lab Technician</option>
                <option value="Blood Bank Operator">Blood Bank Operator</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-2"
              style={{ minHeight: 52 }}
            >
              <Send size={16} />
              <span>Send Invitation Email</span>
            </button>
          </form>

          {/* Generated Link Alert Box */}
          {generatedLink && (
            <div className="mt-6 p-5 rounded-xl bg-[#f5f3f0] border border-[rgba(26,18,16,0.09)] text-left">
              <p className="text-xs font-bold text-[#1A1A1A] mb-2 flex items-center justify-between">
                <span>Copy Invite Link</span>
                {copiedId === 'invite' ? (
                  <span className="text-[#22A06B] text-[10px] font-bold uppercase tracking-wider">Copied!</span>
                ) : null}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="bg-white border border-[#D8D0CA] text-[#5A5A5A] text-xs px-3 py-2 rounded-lg flex-1 outline-none truncate"
                />
                <button
                  onClick={() => copyToClipboard(generatedLink, 'invite')}
                  className="p-2 bg-white border border-[#D8D0CA] hover:border-[#BE1F2E] rounded-lg text-[#5A5A5A] hover:text-[#BE1F2E] transition-all"
                >
                  <Link2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-[20px] font-[500] text-[#1a1a1a] mb-6 flex items-center gap-2 italic font-serif">
              <History className="text-[#BE1F2E]" size={20} />
              <span>Invitation History</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f5f3f0] border-b border-[rgba(26,18,16,0.09)]">
                    <th className="py-4 px-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Staff Member</th>
                    <th className="py-4 px-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Assigned Role</th>
                    <th className="py-4 px-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Status</th>
                    <th className="py-4 px-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(26,18,16,0.09)]">
                  {appState.invitedStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-[#1A1A1A]">{staff.name}</div>
                        <div className="text-xs text-[#9A9A9A] mt-0.5">{staff.email}</div>
                      </td>
                      <td className="py-4 px-4 text-[#5A5A5A] font-medium">{staff.role}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          staff.status === 'Accepted' 
                            ? 'bg-[rgba(34,160,107,0.1)] text-[#22A06B]' 
                            : staff.status === 'Pending'
                            ? 'bg-[rgba(224,123,0,0.1)] text-[#E07B00]'
                            : 'bg-[#F0EBE5] text-[#5A5A5A]'
                        }`}>
                          {staff.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {staff.status === 'Pending' ? (
                          <button
                            onClick={() => copyToClipboard(`https://raktsetu.org/invite/accept?t=${staff.id}`, staff.id)}
                            className="text-xs text-[#BE1F2E] hover:underline font-bold flex items-center gap-1"
                          >
                            <Link2 size={12} />
                            <span>{copiedId === staff.id ? 'Copied!' : 'Copy Link'}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-[#9A9A9A]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteStaff;
