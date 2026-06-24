import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../hooks/useToast';
import { Mail, Lock, Building2, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/staff/dashboard', { replace: true });
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
    
    const success = await login(data.email, data.password, data.rememberMe);
    
    if (success) {
      toast.success("Successfully authenticated. Welcome to RaktSetu.");
      navigate('/staff/dashboard', { replace: true });
    } else {
      toast.error("Invalid credentials. Please check your email and password.");
    }
    setIsLoading(false);
  };

  const handleForgotPassword = () => {
    toast.warning("Password reset instructions have been sent to your registered email if it exists in our system.");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans relative overflow-y-auto selection:bg-[#BE1F2E] selection:text-white">
      <div className="noise-filter" />

      {/* Auth Navbar */}
      <nav className="w-full bg-white border-b border-[#EDE7E1] sticky top-0 z-40">
        <div className="flex justify-between items-center h-16 px-6 md:px-10 lg:px-16 w-full">
          <Link to="/" className="font-serif text-[22px] font-bold text-[#BE1F2E]">
            RaktSetu
          </Link>
          <span className="text-[13px] text-[#7A5F5F] uppercase tracking-widest font-bold">
            Hospital Staff Portal
          </span>
        </div>
      </nav>

      {/* Main Content Card */}
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[500px] bg-white border border-[#EDE7E1] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-10 relative overflow-hidden"
        >
          {/* Header row */}
          <div className="flex justify-between items-center mb-8">
            <span className="font-serif text-[20px] font-bold text-[#BE1F2E] italic">RaktSetu</span>
            <span className="badge-neutral">Staff Access</span>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="font-serif mb-2 text-[32px] font-[700] text-[#1A1210] leading-[1.1]">
                Authorized Sign In
              </h1>
              <p className="text-[15px] text-[#5A5A5A] leading-[1.6]">
                Secure dashboard access for managing hospital blood inventories and transfer pipelines.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block mb-2">
                  Staff Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="name@citylifehospital.org"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email format"
                      }
                    })}
                    className={`input-field ${errors.email ? 'error' : ''}`}
                  />
                </div>
                {errors.email && (
                  <span className="text-[10px] text-[#BE1F2E] flex items-center gap-1 font-bold pl-1 mt-1.5">
                    <AlertCircle className="h-3 w-3" /> {errors.email.message}
                  </span>
                )}
              </div>

              <div>
                <label className="text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block mb-2">
                  Secure Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register("password", { required: "Password is required" })}
                    className={`input-field ${errors.password ? 'error' : ''}`}
                  />
                </div>
                {errors.password && (
                  <span className="text-[10px] text-[#BE1F2E] flex items-center gap-1 font-bold pl-1 mt-1.5">
                    <AlertCircle className="h-3 w-3" /> {errors.password.message}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    {...register("rememberMe")}
                    className="appearance-none w-4 h-4 rounded border border-[#D8D0CA] bg-white checked:bg-[#BE1F2E] checked:border-[#BE1F2E] transition-colors cursor-pointer"
                  />
                  <span className="text-xs text-[#5A5A5A] font-medium group-hover:text-[#1A1210] transition-colors">Remember device</span>
                </label>

                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-[#BE1F2E] font-bold hover:underline transition-colors cursor-pointer"
                >
                  Lost access?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full mt-2"
                style={{ minHeight: 52 }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying Credentials...
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

          <p className="text-center text-[11px] text-[#7A5F5F] leading-relaxed mt-8 px-4">
            Authorized hospital staff use only. Transactions are audited under institutional HIPAA agreements.
          </p>
        </motion.div>
      </main>

      <footer className="py-6 text-center text-[12px] text-[#7A5F5F] border-t border-[#EDE7E1]">
        © 2026 RaktSetu ·{' '}
        <a className="hover:text-[#BE1F2E] transition-colors" href="#">Privacy Policy</a> ·{' '}
        <a className="hover:text-[#BE1F2E] transition-colors" href="#">Terms of Service</a>
      </footer>
    </div>
  );
};

export default Login;
