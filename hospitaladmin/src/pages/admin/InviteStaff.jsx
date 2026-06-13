import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { UserPlus, Link2, Send, Check, AlertCircle, History, Mail } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 right-6 bg-emerald-500 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 z-50 border border-emerald-400/20"
          >
            <Check size={18} />
            <span className="font-semibold text-sm">Invitation Email Sent Successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Invite Staff</h1>
        <p className="text-slate-400 text-sm mt-1">Manage and provision credentials for your hospital staff.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Invitation Form Card */}
        <div className="lg:col-span-1 bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl h-fit">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <UserPlus className="text-red-500" size={18} />
            <span>Send New Invitation</span>
          </h2>

          <form onSubmit={handleInvite} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Staff Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Sarah Alvi"
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border text-white text-sm focus:outline-none focus:border-red-600 transition-colors ${
                  errors.name ? 'border-red-500/50' : 'border-white/10'
                }`}
              />
              {errors.name && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.name}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sarah.alvi@hospital.com"
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border text-white text-sm focus:outline-none focus:border-red-600 transition-colors ${
                  errors.email ? 'border-red-500/50' : 'border-white/10'
                }`}
              />
              {errors.email && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.email}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assign Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-sm focus:outline-none focus:border-red-600"
              >
                <option value="Medical Officer">Medical Officer</option>
                <option value="Head Nurse">Head Nurse</option>
                <option value="Lab Technician">Lab Technician</option>
                <option value="Blood Bank Operator">Blood Bank Operator</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/10 transition-all text-sm flex items-center justify-center gap-2 mt-2"
            >
              <Send size={16} />
              <span>Send Invitation Email</span>
            </button>
          </form>

          {/* Generated Link Alert Box */}
          {generatedLink && (
            <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-white/5 text-left">
              <p className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                <span>Copy Invite Link</span>
                {copiedId === 'invite' ? (
                  <span className="text-emerald-400 text-[10px] font-semibold uppercase">Copied!</span>
                ) : null}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="bg-slate-900 border border-white/10 text-slate-300 text-xs px-3 py-2 rounded-lg flex-1 outline-none truncate"
                />
                <button
                  onClick={() => copyToClipboard(generatedLink, 'invite')}
                  className="p-2 bg-slate-800 border border-white/10 hover:border-white/20 rounded-lg text-slate-300 hover:text-white"
                >
                  <Link2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <History className="text-red-500" size={18} />
              <span>Invitation History</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {appState.invitedStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white">{staff.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{staff.email}</div>
                      </td>
                      <td className="py-4 px-4 text-slate-300 font-medium">{staff.role}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          staff.status === 'Accepted' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : staff.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {staff.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {staff.status === 'Pending' ? (
                          <button
                            onClick={() => copyToClipboard(`https://raktsetu.org/invite/accept?t=${staff.id}`, staff.id)}
                            className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
                          >
                            <Link2 size={12} />
                            <span>{copiedId === staff.id ? 'Copied!' : 'Copy Link'}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
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
