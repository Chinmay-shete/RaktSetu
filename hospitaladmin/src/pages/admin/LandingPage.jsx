import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, Activity, Award, Heart, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      title: "Real-time Supply Management",
      description: "Instantly track blood bags, shelf life, and critical deficit indicators to avoid waste.",
      icon: Activity,
    },
    {
      title: "AI-Powered Forecasting",
      description: "Leverage smart predictive analytics to forecast demand surges based on seasons, events, and historical trends.",
      icon: Sparkles,
    },
    {
      title: "Compliance & Safety",
      description: "Digitized verifications and automated regulatory alerts keep your blood bank certified and audits clean.",
      icon: Shield,
    },
    {
      title: "Seamless Staff Coordination",
      description: "Easily invite medical officers, head nurses, and lab technicians under a single admin panel.",
      icon: Award,
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Radial Gradients */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 lg:px-16 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Heart className="text-red-500 fill-red-500 w-8 h-8" />
          <span className="font-extrabold text-2xl tracking-tight text-white">
            Rakt<span className="text-red-500">Setu</span>
          </span>
          <span className="bg-red-500/10 text-red-400 text-xs px-2.5 py-0.5 rounded-full border border-red-500/20 font-semibold uppercase">
            Hospitals
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-6 lg:px-16 pt-12 pb-24 flex flex-col items-center justify-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-white/10 text-xs font-semibold text-slate-300 mb-6">
            <Sparkles size={14} className="text-red-500" />
            Next-Gen Blood Supply Intelligence for India
          </span>
          
          <h1 className="font-extrabold text-4xl sm:text-6xl text-white tracking-tight leading-[1.15] mb-8">
            Digital Transformation for <br />
            <span className="bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
              Hospital Blood Banks
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            RaktSetu connects your hospital to the national blood registry network, automating demand forecasting, stock compliance, and staff operations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/admin/register')}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 hover:shadow-red-600/35 transition-all flex items-center gap-2 group w-full sm:w-auto justify-center text-base"
            >
              <span>Register Your Hospital</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/admin/login')}
              className="px-8 py-4 bg-slate-800/80 hover:bg-slate-800 text-white border border-white/10 font-bold rounded-xl hover:border-white/20 transition-all w-full sm:w-auto text-base"
            >
              Existing Admin Login
            </button>
          </div>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 w-full"
        >
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <div
                key={i}
                className="bg-slate-900/60 border border-white/10 backdrop-blur-md p-6 rounded-2xl hover:border-white/15 transition-all text-left flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 bg-red-600/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500 mb-6 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-slate-500 text-xs">
        <p>© 2026 RaktSetu. Developed under medical guidelines for blood storage and management.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
