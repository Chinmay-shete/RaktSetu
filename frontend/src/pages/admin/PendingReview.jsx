import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospital } from '../../context/HospitalContext';
import { Clock, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const PendingReview = () => {
  const navigate = useNavigate();
  const { approveApplication } = useHospital();
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
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1210] flex flex-col items-center justify-center font-sans py-12 px-4 relative overflow-hidden select-none">
      {/* Noise filter */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%\' height=\'100%\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' 
        }} 
      />
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#BE1F2E]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E07B00]/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl w-full bg-white border border-[#EDE7E1] rounded-3xl p-8 sm:p-10 shadow-lg relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-[#BE1F2E]/10 border border-[#BE1F2E]/20 text-[#BE1F2E] mb-4 animate-pulse">
            <Clock size={28} />
          </div>
          <h1 className="font-serif text-[32px] sm:text-[40px] italic leading-none tracking-[-0.03em] text-[#1A1210]">
            Application Under Review
          </h1>
          <p className="text-[#737373] text-sm mt-3 font-medium">
            Verification usually takes around <span className="text-[#BE1F2E] font-bold">48 Hours</span>.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between text-xs text-[#7A5F5F] font-bold mb-2 uppercase tracking-widest">
            <span>Overall Verification</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-[#FAF8F5] h-3 rounded-full overflow-hidden border border-[#EDE7E1] p-[1px]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-[#BE1F2E] to-[#E07B00] rounded-full"
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6 mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-4 relative">
              {index !== steps.length - 1 && (
                <div className="absolute left-3 top-7 bottom-0 w-[2px] bg-[#EDE7E1]" />
              )}
              
              <div className="z-10 mt-1">
                {step.status === 'completed' ? (
                  <div className="w-6 h-6 rounded-full bg-[#BE1F2E]/10 border border-[#BE1F2E] text-[#BE1F2E] flex items-center justify-center">
                    <CheckCircle2 size={14} className="fill-[#BE1F2E]/10" />
                  </div>
                ) : step.status === 'current' ? (
                  <div className="w-6 h-6 rounded-full bg-[#BE1F2E]/10 border border-[#BE1F2E] text-[#BE1F2E] flex items-center justify-center">
                    <Loader2 size={12} className="animate-spin" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#FAF8F5] border border-[#EDE7E1] text-[#A8A0A0] flex items-center justify-center text-xs font-extrabold">
                    {index + 1}
                  </div>
                )}
              </div>

              <div>
                <h3 className={`text-sm font-bold ${
                  step.status === 'completed' ? 'text-[#1A1210]' : 
                  step.status === 'current' ? 'text-[#BE1F2E]' : 'text-[#A8A0A0]'
                }`}>
                  {step.title}
                </h3>
                <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Debug Approval Trigger */}
        <div className="pt-6 border-t border-[#EDE7E1] flex flex-col items-center gap-3">
          <p className="text-xs text-[#7A5F5F] text-center font-medium leading-normal max-w-sm">
            For evaluation purposes, click below to simulate instant registry approval.
          </p>
          <button
            onClick={handleMockApprove}
            className="w-full py-3.5 bg-[#BE1F2E] hover:bg-[#9E1825] text-white font-bold rounded-full transition-all text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            <ShieldCheck size={16} />
            <span>Simulate Approval</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PendingReview;
