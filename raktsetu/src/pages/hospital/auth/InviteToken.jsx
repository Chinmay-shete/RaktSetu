import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../hooks/useToast';
import { 
  Building2, 
  ShieldCheck, 
  Loader2, 
  ScanLine,
  ArrowRight
} from 'lucide-react';

export const InviteToken = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { validateInviteToken } = useAuth();
  
  const [isValidating, setIsValidating] = useState(true);
  const [hospitalInfo, setHospitalInfo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const verifyToken = async () => {
      try {
        const data = await validateInviteToken(token);
        if (isMounted) {
          setHospitalInfo(data);
          setIsValidating(false);
          toast.success("Secure invitation link verified successfully.");
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Invalid or expired invitation link.");
          navigate('/login', { replace: true });
        }
      }
    };

    verifyToken();
    
    return () => { isMounted = false; };
  }, [token, validateInviteToken, navigate, toast]);

  const handleContinue = () => {
    navigate(`/set-password/${token}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden select-none">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-panel p-8 rounded-[2rem] shadow-2xl border border-slate-700/50 relative overflow-hidden bg-slate-900/40 min-h-[360px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* Validating Token */}
            {isValidating ? (
              <motion.div 
                key="validating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center gap-6 text-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 border-2 border-rose-500/30 rounded-full animate-ping" />
                  <div className="bg-slate-800/80 p-5 rounded-full border border-slate-700 relative z-10">
                    <ScanLine className="h-10 w-10 text-rose-500 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2 font-outfit">Verifying Identity</h2>
                  <p className="text-xs text-slate-400 max-w-[250px] mx-auto leading-relaxed">
                    Establishing secure handshake and verifying your cryptographic invitation token.
                  </p>
                </div>
              </motion.div>
            ) : (
              /* Verified Screen */
              <motion.div 
                key="verified"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col h-full items-center text-center"
              >
                <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl mb-4 border border-emerald-500/20 shadow-inner">
                  <Building2 className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1 font-outfit leading-tight">
                  Welcome, <span className="text-emerald-400">{hospitalInfo?.name}</span>
                </h2>
                <p className="text-xs text-slate-400 max-w-[280px] leading-relaxed mb-6">
                  Your invitation token has been verified. You can now proceed to set up your master secure password.
                </p>

                <div className="w-full flex items-center gap-2 justify-center py-2 px-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl mb-6 text-xxs font-bold text-emerald-400 tracking-wider uppercase">
                  <ShieldCheck className="h-4 w-4" /> Secure verification complete
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  Continue to Setup
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
