import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospital } from '../../context/HospitalContext';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useHospital();
  
  const [formData, setFormData] = useState({
    email: 'admin@raktsetu.org',
    password: 'admin123',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      if (formData.email === 'admin@raktsetu.org' && formData.password === 'admin123') {
        loginAdmin();
        navigate('/admin/dashboard');
      } else {
        setError('Invalid credentials. Use admin@raktsetu.org / admin123');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center font-sans py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="text-red-500 fill-red-500 w-8 h-8" />
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Rakt<span className="text-red-500">Setu</span>
            </span>
          </div>
          <h1 className="text-xl font-bold text-white">Hospital Admin Portal</h1>
          <p className="text-slate-400 text-xs mt-1">Authorized access only. Enter details to sign in.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2 mb-6 animate-shake">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                placeholder="admin@raktsetu.org"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="rounded border-white/10 bg-slate-950 text-red-600 focus:ring-0 focus:ring-offset-0"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => alert("Credentials are pre-filled for this demo: admin@raktsetu.org / admin123")}
              className="text-red-500 hover:text-red-400 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 hover:shadow-red-600/35 transition-all text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Login Authorized</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
