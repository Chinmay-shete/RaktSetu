import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, UserPlus, Link as LinkIcon, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

export const InviteStaff = () => {
  const toast = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [inviteLink, setInviteLink] = useState(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setIsGenerating(true);
    setInviteLink(null);

    // Simulate API call to generate link
    setTimeout(() => {
      setIsGenerating(false);
      // Mock generated token link
      const token = Math.random().toString(36).substring(2, 10);
      const link = `${window.location.origin}/token/${token}`;
      setInviteLink(link);
      toast.success(`Secure invite successfully generated for ${data.email}`);
    }, 1500);
  };

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied to clipboard");
    }
  };

  const handleSendEmail = () => {
    toast.success("Invitation dispatched securely via Email!");
    setTimeout(() => {
      reset();
      setInviteLink(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto w-full select-none">
      
      {/* Editorial Header */}
      <section className="border-b border-[#EDE7E1] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[36px] md:text-[52px] italic leading-none mb-3 tracking-[-0.03em] text-[#1A1210]">
            Invite Hospital Staff
          </h1>
          <p className="text-[15px] text-[#5A5A5A] max-w-xl leading-[24px]">
            Generate secure access tokens and dispatch invitations to medical officers and inventory managers to grant them access to this hospital's dashboard.
          </p>
        </div>
        <div className="bg-red-50 text-[#BE1F2E] p-3 rounded-2xl border border-[#BE1F2E]/10 w-fit h-fit self-start md:self-center">
          <UserPlus className="h-6 w-6" />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {/* Left Column: Form */}
        <div className="bg-white border border-[#EDE7E1] p-8 rounded-2xl shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="text-[20px] font-medium text-[#1A1210] font-serif">Generate Invitation</h2>
            <p className="text-xs text-[#5A5A5A] mt-1">
              Enter the staff member's email address to create a unique enrollment link.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block mb-2">
                Staff Email Address
              </label>
              <div className="relative">
                <input
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
              </div>
              {errors.email && (
                <span className="text-[10px] text-[#BE1F2E] flex items-center gap-1 font-bold pl-1 mt-1.5">
                  <AlertCircle className="h-3 w-3" /> {errors.email.message}
                </span>
              )}
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
                  Generating Secure Token...
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4" />
                  Generate Link
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Result */}
        <div className="bg-[#FAF8F5] border border-[#EDE7E1] p-8 rounded-2xl flex flex-col justify-center items-center text-center min-h-[300px]">
          <AnimatePresence mode="wait">
            {!inviteLink ? (
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
                <p className="text-xs font-bold uppercase tracking-wider">Link will appear here once generated</p>
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
                  <p className="text-[11px] font-bold text-[#7A5F5F] uppercase tracking-wider mb-2">Unique Access Token Link</p>
                  <div 
                    onClick={copyToClipboard}
                    className="w-full p-4 bg-white border-2 border-[#BE1F2E]/20 rounded-xl text-xs text-[#BE1F2E] font-mono break-all cursor-pointer hover:border-[#BE1F2E] hover:bg-red-50/10 transition-all shadow-sm group relative"
                  >
                    {inviteLink}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/95 rounded-xl transition-opacity font-bold font-sans text-[#1A1210]">
                      Click to Copy Link
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSendEmail}
                  className="btn-primary w-full"
                  style={{ minHeight: 52 }}
                >
                  <Mail className="h-4 w-4" />
                  Dispatch Email Invitation
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default InviteStaff;
