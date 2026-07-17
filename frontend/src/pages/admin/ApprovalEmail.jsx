import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, Lock, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const ApprovalEmail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1210] flex flex-col items-center justify-center font-sans py-12 px-4 relative overflow-hidden select-none">
      {/* Noise filter */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%\' height=\'100%\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' 
        }} 
      />
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#BE1F2E]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#22A06B]/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white border border-[#EDE7E1] rounded-3xl p-8 sm:p-10 shadow-lg relative z-10 text-center"
      >
        <div className="inline-flex p-3 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 mb-6">
          <CheckCircle2 size={32} />
        </div>
        
        <h1 className="font-serif text-[32px] sm:text-[40px] italic leading-none tracking-[-0.03em] text-[#1A1210]">
          Application Approved!
        </h1>
        <p className="text-[#737373] text-sm mt-3 font-medium">
          Your hospital is now registered on the RaktSetu registry network.
        </p>

        <div className="my-8 p-5 rounded-2xl bg-[#FAF8F5] border border-[#EDE7E1] text-left space-y-4">
          <div className="flex gap-3">
            <Mail className="text-[#BE1F2E] mt-0.5 shrink-0" size={16} />
            <div>
              <p className="text-xs font-bold text-[#1A1210] uppercase tracking-wider">Account Credentials</p>
              <p className="text-[#737373] text-xs mt-0.5 font-medium leading-normal">
                We have dispatched login credentials to your authorized email address.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Lock className="text-[#BE1F2E] mt-0.5 shrink-0" size={16} />
            <div>
              <p className="text-xs font-bold text-[#1A1210] uppercase tracking-wider">Default Security Password</p>
              <p className="text-[#737373] text-xs mt-0.5 font-medium leading-normal">
                You will be required to change your password upon your first login.
              </p>
            </div>
          </div>
        </div>

        <button type="button"
          onClick={() => navigate('/admin/login')}
          className="w-full py-3.5 bg-[#BE1F2E] hover:bg-[#9E1825] text-white font-bold rounded-full transition-all text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:-translate-y-0.5 active:translate-y-0 group"
        >
          <span>Go To Login Portal</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Home logo link */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-[#7A5F5F] font-semibold">
          <Heart className="text-[#BE1F2E] fill-[#BE1F2E]" size={12} />
          <span>RaktSetu Blood Registry System</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ApprovalEmail;
