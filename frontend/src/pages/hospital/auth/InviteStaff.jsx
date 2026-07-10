import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, UserPlus, ShieldAlert, CheckCircle2, Loader2, AlertCircle, Copy } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import api from '../../../services/api';

export const InviteStaff = () => {
  const toast = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);
  const [apiError, setApiError] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      role: 'staff'
    }
  });

  const onSubmit = async (data) => {
    setTempPassword(null);
    setIsGenerating(true);
    setApiError('');

    try {
      const response = await api.post('/hospital/staff', {
        name: data.name,
        email: data.email,
        role: data.role
      });
      
      setTempPassword(response.data.tempPassword);
      toast.success(`Staff user created successfully!`);
      reset();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create staff member.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPasswordToClipboard = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      toast.success("Temporary password copied to clipboard");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto w-full select-none">
      
      <section className="border-b border-[#EDE7E1] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[36px] md:text-[52px] italic leading-none mb-3 tracking-[-0.03em] text-[#1A1210]">
            Create Hospital Staff
          </h1>
          <p className="text-[15px] text-[#5A5A5A] max-w-xl leading-[24px]">
            Directly create staff accounts for medical officers and inventory managers, generating a secure temporary password.
          </p>
        </div>
        <div className="bg-red-50 text-[#BE1F2E] p-3 rounded-2xl border border-[#BE1F2E]/10 w-fit h-fit self-start md:self-center">
          <UserPlus className="h-6 w-6" />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {/* Left Column: Form */}
        <div className="bg-white border border-[#EDE7E1] p-5 sm:p-8 rounded-2xl shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="text-[20px] font-medium text-[#1A1210] font-serif">Staff Details</h2>
            <p className="text-xs text-[#5A5A5A] mt-1">
              Enter details to register the new user inside your hospital unit.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {apiError && (
              <div className="p-3 bg-red-50 text-[#BE1F2E] text-xs font-semibold rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="full-name-1" className="text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block">
                  Full Name
                </label>
              <input id="full-name-1"
                type="text"
                placeholder="Dr. Rajesh Kumar"
                {...register("name", { required: "Full name is required" })}
                className={`input-field ${errors.name ? 'error' : ''}`}
              />
              {errors.name && (
                <span className="text-[10px] text-[#BE1F2E] flex items-center gap-1 font-bold pl-1">
                  <AlertCircle className="h-3 w-3" /> {errors.name.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="staff-email-address-2" className="text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block">
                  Staff Email Address
                </label>
              <input id="staff-email-address-2"
                type="email"
                placeholder="doctor@hospital.org"
                {...register("email", { 
                  required: "Email address is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format"
                  }
                })}
                className={`input-field ${errors.email ? 'error' : ''}`}
              />
              {errors.email && (
                <span className="text-[10px] text-[#BE1F2E] flex items-center gap-1 font-bold pl-1">
                  <AlertCircle className="h-3 w-3" /> {errors.email.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="role-assignment-3" className="text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block">
                  Role Assignment
                </label>
              <select id="role-assignment-3"
                {...register("role", { required: "Role is required" })}
                className="input-field select-field"
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
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Result */}
        <div className="bg-[#FAF8F5] border border-[#EDE7E1] p-8 rounded-2xl flex flex-col justify-center items-center text-center min-h-[300px]">
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
                className="flex flex-col items-center gap-6 w-full"
              >
                <div className="bg-[#22A06B]/10 p-3 rounded-full border border-[#22A06B]/20">
                  <CheckCircle2 className="h-10 w-10 text-[#22A06B]" />
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
                      Click to Copy Password
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
