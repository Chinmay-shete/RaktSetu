import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 md:p-16 rounded-2xl border border-[#EDE7E1] shadow-sm max-w-lg w-full text-center relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#BE1F2E]/5 rounded-bl-[100px] pointer-events-none" />
        
        <div className="mx-auto w-20 h-20 bg-[rgba(190,31,46,0.08)] rounded-full flex items-center justify-center mb-6 text-[#BE1F2E]">
          <ShieldAlert size={40} />
        </div>
        
        <h1 className="font-serif text-[48px] md:text-[64px] font-bold text-[#1A1210] leading-none mb-4 italic">
          403
        </h1>
        
        <h2 className="text-[20px] md:text-[24px] font-bold text-[#1A1210] mb-3">
          Access Denied
        </h2>
        
        <p className="text-[#737373] text-[15px] leading-relaxed mb-8">
          You don't have permission to access this portal or resource. 
          Please ensure you are logged in with the correct account privileges.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button type="button" 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#EDE7E1] text-[14px] font-bold text-[#5A5A5A] hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          
          <Link 
            to="/login" 
            className="btn-primary w-full sm:w-auto px-6 py-3 rounded-full flex items-center justify-center"
          >
            Switch Account
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="font-serif text-[24px] font-bold text-[#BE1F2E] tracking-tight mb-1">
          Rakt<span className="italic">Setu</span>
        </p>
        <p className="text-[#9A9A9A] text-[12px] uppercase tracking-widest font-semibold">
          Bridging the blood gap
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;
