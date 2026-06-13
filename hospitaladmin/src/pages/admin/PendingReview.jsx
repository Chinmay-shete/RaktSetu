import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospital } from '../../context/HospitalContext';
import { Clock, CheckCircle2, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const PendingReview = () => {
  const navigate = useNavigate();
  const { appState, approveApplication } = useHospital();
  const [progress, setProgress] = useState(35);

  useEffect(() => {
    // Increment progress slightly for animation effect
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 65) {
          clearInterval(interval);
          return 65;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleMockApprove = () => {
    approveApplication();
    navigate('/admin/approved');
  };

  const steps = [
    { title: 'Application Received', desc: 'Securely uploaded and registered in registry queue.', status: 'completed' },
    { title: 'Verification Running', desc: 'Automated lookup on state regulatory license databases.', status: 'current' },
    { title: 'Manual Verification', desc: 'Registry supervisor check on signature and seal.', status: 'pending' },
    { title: 'Approval Pending', desc: 'Issuing cryptographically signed API key credentials.', status: 'pending' }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center font-sans py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 mb-4 animate-pulse">
            <Clock size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Application Under Review</h1>
          <p className="text-slate-400 text-sm mt-2">
            Verification usually takes around <span className="text-red-400 font-semibold">48 Hours</span>.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wide">
            <span>Overall Verification</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-white/5 p-[1px]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full"
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6 mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-4 relative">
              {index !== steps.length - 1 && (
                <div className="absolute left-3 top-7 bottom-0 w-[2px] bg-slate-800" />
              )}
              
              <div className="z-10 mt-1">
                {step.status === 'completed' ? (
                  <div className="w-6 h-6 rounded-full bg-red-600/20 border border-red-500 text-red-500 flex items-center justify-center">
                    <CheckCircle2 size={14} className="fill-red-600/10" />
                  </div>
                ) : step.status === 'current' ? (
                  <div className="w-6 h-6 rounded-full bg-red-600/20 border border-red-500 text-red-500 flex items-center justify-center">
                    <Loader2 size={12} className="animate-spin" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-950 border border-white/10 text-slate-600 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                )}
              </div>

              <div>
                <h3 className={`text-sm font-bold ${
                  step.status === 'completed' ? 'text-white' : 
                  step.status === 'current' ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Debug Approval Trigger */}
        <div className="pt-6 border-t border-white/5 flex flex-col items-center gap-3">
          <p className="text-xs text-slate-500 text-center">
            For evaluation purposes, click below to simulate instant registry approval.
          </p>
          <button
            onClick={handleMockApprove}
            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-white/10 hover:border-white/20 transition-all text-sm flex items-center justify-center gap-2"
          >
            <ShieldCheck className="text-red-500" size={16} />
            <span>Simulate Approval</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PendingReview;
