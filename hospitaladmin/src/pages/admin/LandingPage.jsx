import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Route, LineChart } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bone text-ink font-sans relative overflow-x-hidden selection:bg-red/20">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(26, 18, 16, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(26, 18, 16, 0.04) 1px, transparent 1px)',
          backgroundSize: '4rem 4rem'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 px-6 lg:px-16 py-6 flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-serif text-3xl tracking-tight text-red">
            Rakt<span className="italic">Setu</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-ink-3 font-medium text-sm">
          <a href="#features" className="hover:text-red transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-red transition-colors">How it works</a>
          <a href="#who-uses-it" className="hover:text-red transition-colors">Who uses it</a>
          <a href="#pilot" className="hover:text-red transition-colors">Pilot</a>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/admin/login')}
            className="text-red font-medium text-sm hover:text-red-deep transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/admin/register')}
            className="bg-red hover:bg-red-deep text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all"
          >
            Register as Donor
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-24 pb-32 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-faint border border-red/10 text-red uppercase tracking-wider text-xs font-bold mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse"></span>
            Now Scaling in Maharashtra
          </div>
          
          <h1 className="font-serif text-6xl sm:text-8xl text-ink leading-[1.05] tracking-tight mb-8 max-w-4xl mx-auto">
            The smartest way to <br />
            manage <span className="italic text-red">blood</span> in India
          </h1>

          <p className="text-ink-2 text-lg sm:text-xl max-w-2xl mx-auto">
            AI-driven logistics layer for India's blood supply chain. Reducing wastage by 40%
          </p>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 py-24" id="features">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Dark Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#1c1412] text-bone rounded-[2rem] p-10 lg:p-14 flex flex-col justify-between overflow-hidden relative"
          >
            <div className="relative z-10">
              <span className="text-red uppercase tracking-widest text-xs font-bold mb-6 block">
                Central Intelligence
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl mb-6">
                Unified Supply Dashboard
              </h2>
              <p className="text-bone/70 text-lg max-w-md">
                Every unit tracked, from collection to transfusion. Zero blind spots in the national grid.
              </p>
            </div>
            
            {/* Mock Dashboard UI inside card */}
            <div className="mt-16 bg-[#251b19] border border-white/5 rounded-2xl p-6 relative z-10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-medium text-bone">Real-time Stock (Pune Cluster)</h3>
                <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded border border-green-500/20 font-bold tracking-wider">LIVE</span>
              </div>
              <div className="space-y-4">
                {[
                  { type: 'O+', count: '742u', percent: '80%', color: 'bg-red' },
                  { type: 'A-', count: '118u', percent: '30%', color: 'bg-yellow-500' },
                  { type: 'AB+', count: '340u', percent: '60%', color: 'bg-red' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-8 font-bold text-sm text-bone/80">{item.type}</span>
                    <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden">
                      <div className={h-full  + item.color +  rounded-full} style={{ width: item.percent }} />
                    </div>
                    <span className="w-10 text-right font-medium text-sm text-bone">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Feature List */}
          <div className="flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-ink/5 rounded-[2rem] p-10 flex-1 relative overflow-hidden group hover:shadow-xl hover:shadow-red/5 transition-all"
            >
              <div className="flex justify-between items-start mb-8">
                <span className="font-serif text-5xl text-red-faint group-hover:text-red/10 transition-colors">01</span>
                <div className="w-12 h-12 rounded-full bg-red-faint flex items-center justify-center text-red">
                  <LineChart size={20} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-ink mb-4">AI Forecasting</h3>
              <p className="text-ink-2 leading-relaxed">
                Predict demand surges based on historical events, weather, and hospital data.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-ink/5 rounded-[2rem] p-10 flex-1 relative overflow-hidden group hover:shadow-xl hover:shadow-red/5 transition-all"
            >
              <div className="flex justify-between items-start mb-8">
                <span className="font-serif text-5xl text-red-faint group-hover:text-red/10 transition-colors">02</span>
                <div className="w-12 h-12 rounded-full bg-red-faint flex items-center justify-center text-red">
                  <Route size={20} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-ink mb-4">Optimized Routing</h3>
              <p className="text-ink-2 leading-relaxed">
                Dynamic transit paths for life-saving units between banks and hospitals.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
