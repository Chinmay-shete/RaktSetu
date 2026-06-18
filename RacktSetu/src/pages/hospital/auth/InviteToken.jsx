import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../hooks/useToast';
import { 
  Building2, 
  ShieldCheck, 
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
          navigate('/staff/login', { replace: true });
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
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center p-6 relative overflow-hidden select-none">
      <div className="noise-filter" />

      {/* Auth Navbar */}
      <nav className="w-full bg-white border-b border-[#EDE7E1] absolute top-0 left-0 right-0 z-40">
        <div className="flex justify-between items-center h-16 px-6 md:px-10 lg:px-16 w-full">
          <Link to="/" className="font-serif text-[22px] font-bold text-[#BE1F2E]">
            RaktSetu
          </Link>
          <span className="text-[13px] text-[#7A5F5F] uppercase tracking-widest font-bold">
            Hospital Staff Portal
          </span>
        </div>
      </nav>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10 mt-16"
      >
        <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#EDE7E1] relative overflow-hidden min-h-[360px] flex flex-col justify-center">
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
                  <div className="absolute inset-0 border-2 border-[#BE1F2E]/30 rounded-full animate-ping" />
                  <div className="bg-[#FAF8F5] p-5 rounded-full border border-[#EDE7E1] relative z-10">
                    <ScanLine className="h-10 w-10 text-[#BE1F2E] animate-pulse" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1A1210] mb-2 font-serif">Verifying Identity</h2>
                  <p className="text-xs text-[#5A5A5A] max-w-[250px] mx-auto leading-relaxed">
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
                <div className="inline-flex items-center justify-center p-3 bg-[#22A06B]/10 text-[#22A06B] rounded-2xl mb-4 border border-[#22A06B]/20">
                  <Building2 className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-[#1A1210] mb-1 font-serif leading-tight">
                  Welcome, <span className="text-[#22A06B]">{hospitalInfo?.name}</span>
                </h2>
                <p className="text-xs text-[#5A5A5A] max-w-[280px] leading-relaxed mb-6">
                  Your invitation token has been verified. You can now proceed to set up your master secure password.
                </p>

                <div className="w-full flex items-center gap-2 justify-center py-2 px-3 bg-[#22A06B]/5 border border-[#22A06B]/20 rounded-xl mb-6 text-xxs font-bold text-[#22A06B] tracking-wider uppercase">
                  <ShieldCheck className="h-4 w-4" /> Secure verification complete
                </div>

                <button
                  onClick={handleContinue}
                  className="btn-primary w-full"
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

export default InviteToken;
