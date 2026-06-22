import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { useForm, useWatch } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../hooks/useToast';
import { 
  Building2, 
  Lock, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

export const SetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { validateInviteToken, setupPassword } = useAuth();
  
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const checkToken = async () => {
      try {
        const data = await validateInviteToken(token);
        if (isMounted) {
          setHospitalInfo(data);
          setIsValidating(false);
        }
      } catch (_err) {
        if (isMounted) {
          toast.error("Invalid token session. Please verify link again.");
          navigate('/staff/login', { replace: true });
        }
      }
    };

    checkToken();
    return () => { isMounted = false; };
  }, [token, validateInviteToken, navigate, toast]);

  const { register, handleSubmit, control, formState: { errors } } = useForm();
  const password = useWatch({ control, name: 'password' });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await setupPassword(token, data.password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/staff/login', { replace: true });
      }, 3000);
    } catch (_err) {
      toast.error("Failed to setup credentials. Please try again.");
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'None', color: 'bg-[#EDE7E1]', width: 'w-0' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    switch (score) {
      case 1: return { label: 'Weak', color: 'bg-[#BE1F2E]', width: 'w-1/4' };
      case 2: return { label: 'Fair', color: 'bg-[#E07B00]', width: 'w-2/4' };
      case 3: return { label: 'Good', color: 'bg-blue-500', width: 'w-3/4' };
      case 4: return { label: 'Strong', color: 'bg-[#22A06B]', width: 'w-full' };
      default: return { label: 'Weak', color: 'bg-[#BE1F2E]', width: 'w-1/4' };
    }
  };

  const strength = getPasswordStrength(password);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center p-6 relative overflow-hidden">
        <div className="noise-filter" />
        <Loader2 className="h-10 w-10 text-[#BE1F2E] animate-spin" />
      </div>
    );
  }

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
        className="w-full max-w-[500px] z-10 mt-16"
      >
        <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#EDE7E1] relative overflow-hidden min-h-[420px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {!isSuccess ? (
              <motion.div 
                key="setup-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col h-full"
              >
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center justify-center p-3 bg-red-50 text-[#BE1F2E] rounded-2xl mb-4 border border-[#BE1F2E]/10">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1A1210] mb-1 font-serif leading-tight">
                    Set Password for <span className="text-[#BE1F2E]">{hospitalInfo?.name}</span>
                  </h2>
                  <p className="text-xs text-[#5A5A5A]">Create your secure access password to finalize account initialization.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block mb-2">
                      New Secure Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="••••••••"
                        {...register("password", { 
                          required: "Password is required",
                          minLength: { value: 8, message: "Must be at least 8 characters" }
                        })}
                        className={`input-field ${errors.password ? 'error' : ''}`}
                      />
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-2 pl-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-[#5A5A5A]">Password Strength:</span>
                          <span className="text-[10px] font-bold text-[#1A1210]">{strength.label}</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#EDE7E1]">
                          <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                        </div>
                      </div>
                    )}

                    {errors.password && (
                      <span className="text-[10px] text-[#BE1F2E] flex items-center gap-1 font-bold pl-1 mt-1.5">
                        <AlertCircle className="h-3 w-3" /> {errors.password.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="••••••••"
                        {...register("confirmPassword", { 
                          required: "Please confirm your password",
                          validate: value => value === password || "Passwords do not match"
                        })}
                        className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <span className="text-[10px] text-[#BE1F2E] flex items-center gap-1 font-bold pl-1 mt-1.5">
                        <AlertCircle className="h-3 w-3" /> {errors.confirmPassword.message}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full mt-4"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating Keys...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              /* Success Screen */
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center h-full gap-4"
              >
                <div className="bg-[#22A06B]/10 p-4 rounded-full border border-[#22A06B]/20">
                  <CheckCircle2 className="h-16 w-16 text-[#22A06B]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1210] mb-2 font-serif">Credentials Secured</h2>
                  <p className="text-xs text-[#5A5A5A] max-w-[280px] mx-auto leading-relaxed">
                    Your password has been successfully configured. Redirecting to login gateway...
                  </p>
                </div>
                <Loader2 className="h-5 w-5 text-[#BE1F2E] animate-spin mt-4" />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default SetPassword;
