import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../hooks/useToast';
import { Heart, Mail, Lock, Building2, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: localStorage.getItem('raktsetu_hospital_email') || '',
      rememberMe: !!localStorage.getItem('raktsetu_hospital_email')
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const success = login(data.email, data.password, data.rememberMe);
    
    if (success) {
      toast.success("Successfully authenticated. Welcome to RaktSetu.");
      navigate('/dashboard', { replace: true });
    } else {
      toast.error("Invalid credentials. Please check your email and password.");
    }
    setIsLoading(false);
  };

  const handleForgotPassword = () => {
      toast.warning("Password reset instructions have been sent to your registered email if it exists in our system.");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden select-none">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-rose-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/15 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8 gap-3">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="bg-rose-600 p-4 rounded-3xl text-white shadow-xl shadow-rose-600/35"
          >
            <Heart className="h-8 w-8 fill-current animate-pulse" />
          </motion.div>
          <div className="text-center mt-2">
            <h1 className="text-3xl font-extrabold font-outfit tracking-tight">
              Rakt<span className="text-rose-500">Setu</span> Hub
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              Secure Hospital Portal
            </p>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-[2rem] shadow-2xl border border-slate-700/50 relative overflow-hidden bg-slate-900/40">
          {/* Subtle top border gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-rose-400 to-blue-500 opacity-80" />

          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Authorized Login</h2>
            <p className="text-xs text-slate-400">Enter your credentials to access the inventory and SOS network.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider pl-1">Facility Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  placeholder="contact@citylifehospital.org"
                  {...register("email", { 
                      required: "Email is required",
                      pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email format"
                      }
                  })}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all"
                />
              </div>
              {errors.email && (
                <span className="text-[10px] text-rose-400 flex items-center gap-1 font-bold pl-1 mt-0.5">
                  <AlertCircle className="h-3 w-3" /> {errors.email.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider pl-1">Secure Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password", { required: "Password is required" })}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all"
                />
              </div>
              {errors.password && (
                <span className="text-[10px] text-rose-400 flex items-center gap-1 font-bold pl-1 mt-0.5">
                  <AlertCircle className="h-3 w-3" /> {errors.password.message}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      {...register("rememberMe")}
                      className="appearance-none w-4 h-4 rounded border border-slate-600 bg-slate-800/50 checked:bg-rose-500 checked:border-rose-500 transition-colors cursor-pointer"
                    />
                    <ShieldCheck className="h-3 w-3 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100" style={{ opacity: 0 }} />
                    <svg className="w-2.5 h-2.5 absolute pointer-events-none text-white hidden group-has-[:checked]:block" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <span className="text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors">Remember device</span>
              </label>

              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-rose-400 font-bold hover:text-rose-300 transition-colors cursor-pointer"
              >
                Lost access?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-sm font-bold shadow-lg shadow-rose-600/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4" />
                  Enter Dashboard
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
