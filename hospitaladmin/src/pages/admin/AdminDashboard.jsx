import React, { useState } from 'react';
import { MapPin, Heart, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [availableForEmergencies, setAvailableForEmergencies] = useState(true);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans p-6 lg:p-12 selection:bg-red-500/20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Welcome back, Rahul</h1>
          <p className="text-slate-400">Your dashboard to save lives.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-2">
          <span className="text-sm font-medium text-emerald-400">Available for Emergencies</span>
          <div 
            onClick={() => setAvailableForEmergencies(!availableForEmergencies)}
            className="w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors"
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1e293b]/70 border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center row-span-2 relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 blur-[50px] rounded-full pointer-events-none" />
          
          <div className="w-24 h-24 bg-gradient-to-b from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20 mb-6 relative">
            <span className="text-3xl font-bold text-white">O+</span>
            {/* Map pin tail (simplified) */}
            <div className="absolute -bottom-2 w-4 h-4 bg-red-600 rotate-45" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Rahul Sharma</h2>
          <p className="text-slate-400 text-sm mb-6">Male, 28 years</p>
          
          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-full border border-white/5">
            <MapPin size={14} className="text-slate-400" />
            <span className="text-sm text-slate-300">Pune, 411014</span>
          </div>
        </motion.div>

        {/* Ready to Donate Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1e293b]/70 border border-white/5 rounded-3xl p-8 lg:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <Heart size={24} className="fill-emerald-500/20" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-1">Ready to Donate</h3>
              <p className="text-slate-400 text-sm">It's been 120 days since your last donation.</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl font-medium transition-all text-sm shrink-0">
            Book Appointment
          </button>
        </motion.div>

        {/* Your Impact Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1e293b]/70 border border-white/5 rounded-3xl p-8"
        >
          <div className="flex items-center gap-2 text-white mb-6">
            <Heart size={18} className="text-blue-400" />
            <span className="font-bold">Your Impact</span>
          </div>
          
          <div className="flex items-end gap-3 mb-6">
            <span className="text-5xl font-bold text-blue-400">12</span>
            <span className="text-slate-400 text-sm pb-1 leading-tight">Potential<br/>lives saved</span>
          </div>
          
          <p className="text-xs text-slate-500">Based on 4 successful whole blood donations.</p>
        </motion.div>

        {/* Urgent Local Requests */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-red-950/40 to-[#1e293b]/70 border border-red-900/30 rounded-3xl p-8 lg:col-span-2 row-span-2"
        >
          <div className="flex items-center gap-2 mb-6 text-white">
            <AlertCircle size={18} className="text-red-500" />
            <span className="font-bold">Urgent Local Requests (O+)</span>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0f172a]/80 border border-red-500/20 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">High Priority</span>
                <h4 className="text-white font-bold mb-1">Ruby Hall Clinic</h4>
                <p className="text-slate-400 text-xs">3.2 km away • Needed within 4 hours</p>
              </div>
              <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors w-full sm:w-auto">
                Respond
              </button>
            </div>

            <div className="bg-[#0f172a]/50 border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">Medium Priority</span>
                <h4 className="text-white font-bold mb-1">Jehangir Hospital</h4>
                <p className="text-slate-400 text-xs">5.1 km away • Needed by tomorrow</p>
              </div>
              <button className="bg-slate-800 hover:bg-slate-700 text-white border border-white/10 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors w-full sm:w-auto">
                View Details
              </button>
            </div>
          </div>
        </motion.div>

        {/* Nearby Camps */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1e293b]/70 border border-white/5 rounded-3xl p-8"
        >
          <div className="flex items-center gap-2 text-white mb-6">
            <Calendar size={18} className="text-purple-400" />
            <span className="font-bold">Nearby Camps</span>
          </div>

          <div className="space-y-5">
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <h4 className="text-white font-medium text-sm mb-1">Lions Club Mega Drive</h4>
                <p className="text-slate-400 text-xs">Kalyani Nagar (2 km)</p>
              </div>
              <div className="text-right">
                <span className="text-white text-sm font-medium block">Oct 12</span>
                <span className="text-slate-400 text-xs">9 AM - 2 PM</span>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-white font-medium text-sm mb-1">TechPark Blood Camp</h4>
                <p className="text-slate-400 text-xs">Magarpatta (4.5 km)</p>
              </div>
              <div className="text-right">
                <span className="text-white text-sm font-medium block">Oct 15</span>
                <span className="text-slate-400 text-xs">10 AM - 4 PM</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminDashboard;
