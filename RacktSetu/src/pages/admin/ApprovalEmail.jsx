import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, Lock, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const ApprovalEmail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center font-sans py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-10 shadow-2xl relative z-10 text-center"
      >
        <div className="inline-flex p-3 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 mb-6">
          <CheckCircle2 size={32} />
        </div>
        
        <h1 className="text-2xl font-extrabold text-white">Application Approved!</h1>
        <p className="text-slate-400 text-sm mt-3">
          Your hospital is now registered on the RaktSetu registry network.
        </p>

        <div className="my-8 p-4 rounded-xl bg-slate-950/60 border border-white/5 text-left space-y-4">
          <div className="flex gap-3">
            <Mail className="text-red-500 mt-0.5 shrink-0" size={16} />
            <div>
              <p className="text-xs font-semibold text-white uppercase tracking-wider">Account Credentials</p>
              <p className="text-slate-400 text-xs mt-0.5">We have dispatched login credentials to your authorized email address.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Lock className="text-red-500 mt-0.5 shrink-0" size={16} />
            <div>
              <p className="text-xs font-semibold text-white uppercase tracking-wider">Default Security Password</p>
              <p className="text-slate-400 text-xs mt-0.5">You will be required to change your password upon your first login.</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/admin/login')}
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 hover:shadow-red-600/35 transition-all text-base flex items-center justify-center gap-2 group"
        >
          <span>Go To Login Portal</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Home logo link */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <Heart className="text-red-500 fill-red-500" size={12} />
          <span>RaktSetu Blood Registry System</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ApprovalEmail;
