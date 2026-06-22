import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldOff, ArrowLeft } from 'lucide-react';

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center p-6 relative overflow-hidden select-none">
      <div className="noise-filter" />

      <span className="absolute font-serif text-[300px] md:text-[400px] text-[#EDE7E1] select-none leading-none pointer-events-none z-0 opacity-60">
        403
      </span>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 text-center max-w-md"
      >
        <Link to="/" className="font-serif text-[22px] font-bold text-[#BE1F2E] block mb-12">
          RaktSetu
        </Link>

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#BE1F2E]/10 border border-[#BE1F2E]/20 mb-6">
          <ShieldOff className="h-8 w-8 text-[#BE1F2E]" />
        </div>

        <h1 className="font-serif text-[42px] italic leading-none tracking-[-0.03em] text-[#1A1210] mb-3">
          Access denied.
        </h1>

        <p className="text-sm text-[#5A5A5A] leading-relaxed mb-8">
          You don't have permission to view this page. This area is restricted to specific roles. Please log in with the correct credentials or contact your administrator.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#EDE7E1] bg-white text-sm font-bold text-[#5A5A5A] hover:text-[#1A1210] hover:border-[#BE1F2E]/30 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#BE1F2E] hover:bg-[#9E1825] text-white text-sm font-bold transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
