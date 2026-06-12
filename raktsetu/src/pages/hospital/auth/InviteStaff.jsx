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
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto w-full">
      <div className="relative p-8 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white dark:border-slate-800 border">
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl -z-10" />
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-500/20 p-2.5 rounded-2xl">
              <UserPlus className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-outfit">Invite Hospital Staff</h1>
          </div>
          <p className="text-sm text-slate-400 max-w-xl">
            Generate secure access tokens and dispatch invitations to medical officers and inventory managers to grant them access to this hospital's dashboard.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {/* Left Column: Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white font-outfit">Generate Invitation</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter the staff member's email address to create a unique enrollment link.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xxs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
                Staff Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
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
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner"
                />
              </div>
              {errors.email && (
                <span className="text-[10px] text-rose-500 flex items-center gap-1 font-bold pl-1 mt-0.5">
                  <AlertCircle className="h-3 w-3" /> {errors.email.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 mt-2 rounded-2xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-sm font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl flex flex-col justify-center items-center text-center min-h-[300px]">
          <AnimatePresence mode="wait">
            {!inviteLink ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 text-slate-400"
              >
                <div className="p-4 rounded-full bg-slate-200/50 dark:bg-slate-800/50">
                  <UserPlus className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm font-medium">Link will appear here once generated.</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6 w-full"
              >
                <div className="bg-emerald-500/20 p-3 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                
                <div className="w-full">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Unique Access Token</p>
                  <div 
                    onClick={copyToClipboard}
                    className="w-full p-4 bg-white dark:bg-slate-950 border-2 border-emerald-500/30 rounded-2xl text-xs text-slate-800 dark:text-emerald-400 font-mono break-all cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all shadow-sm group relative"
                  >
                    {inviteLink}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/80 dark:bg-slate-950/80 rounded-xl transition-opacity font-bold font-sans">
                      Click to Copy
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSendEmail}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
