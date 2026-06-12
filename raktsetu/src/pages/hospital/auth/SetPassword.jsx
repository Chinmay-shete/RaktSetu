import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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
      } catch (error) {
        if (isMounted) {
          toast.error("Invalid token session. Please verify link again.");
          navigate('/login', { replace: true });
        }
      }
    };

    checkToken();
    return () => { isMounted = false; };
  }, [token, validateInviteToken, navigate, toast]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await setupPassword(token, data.password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (error) {
      toast.error("Failed to setup credentials. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Basic password strength logic
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'None', color: 'bg-slate-700', width: 'w-0' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    switch (score) {
      case 1: return { label: 'Weak', color: 'bg-rose-500', width: 'w-1/4' };
      case 2: return { label: 'Fair', color: 'bg-amber-500', width: 'w-2/4' };
      case 3: return { label: 'Good', color: 'bg-blue-500', width: 'w-3/4' };
      case 4: return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
      default: return { label: 'Weak', color: 'bg-rose-500', width: 'w-1/4' };
    }
  };

  const strength = getPasswordStrength(password);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

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
        <div className="glass-panel p-8 rounded-[2rem] shadow-2xl border border-slate-700/50 relative overflow-hidden bg-slate-900/40 min-h-[420px] flex flex-col justify-center">
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
                  <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl mb-4 border border-emerald-500/20 shadow-inner">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1 font-outfit leading-tight">
                    Set Password for <span className="text-emerald-400">{hospitalInfo?.name}</span>
                  </h2>
                  <p className="text-xs text-slate-400">Create your secure access password to finalize account initialization.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider pl-1">New Secure Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        type="password"
                        placeholder="••••••••"
                        {...register("password", { 
                          required: "Password is required",
                          minLength: { value: 8, message: "Must be at least 8 characters" }
                        })}
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                      />
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-2 pl-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-slate-400">Password Strength:</span>
                          <span className="text-[10px] font-bold text-slate-300">{strength.label}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                        </div>
                      </div>
                    )}

                    {errors.password && (
                      <span className="text-[10px] text-rose-400 flex items-center gap-1 font-bold pl-1">
                        <AlertCircle className="h-3 w-3" /> {errors.password.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider pl-1">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ShieldCheck className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        type="password"
                        placeholder="••••••••"
                        {...register("confirmPassword", { 
                          required: "Please confirm your password",
                          validate: value => value === password || "Passwords do not match"
                        })}
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <span className="text-[10px] text-rose-400 flex items-center gap-1 font-bold pl-1">
                        <AlertCircle className="h-3 w-3" /> {errors.confirmPassword.message}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
                <div className="bg-emerald-500/20 p-4 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="h-16 w-16 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 font-outfit">Credentials Secured</h2>
                  <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                    Your password has been successfully configured. Redirecting to login gateway...
                  </p>
                </div>
                <Loader2 className="h-5 w-5 text-emerald-500 animate-spin mt-4" />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
