import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#F5F0EB] flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 md:p-16 rounded-2xl border border-[#EDE7E1] shadow-sm max-w-lg w-full text-center relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#BE1F2E]/5 rounded-bl-[100px] pointer-events-none" />
        
        <div className="mx-auto w-20 h-20 bg-[rgba(190,31,46,0.08)] rounded-full flex items-center justify-center mb-6 text-[#BE1F2E]">
          <FileQuestion size={40} />
        </div>
        
        <h1 className="font-serif text-[48px] md:text-[64px] font-bold text-[#1A1210] leading-none mb-4 italic">
          404
        </h1>
        
        <h2 className="text-[20px] md:text-[24px] font-bold text-[#1A1210] mb-3">
          Page Not Found
        </h2>
        
        <p className="text-[#737373] text-[15px] leading-relaxed mb-8">
          The page you are looking for doesn't exist or has been moved. 
          Please check the URL or return to the homepage.
        </p>
        
        <Link 
          to="/" 
          className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-full"
        >
          <Home size={18} />
          <span>Back to Home</span>
        </Link>
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

export default NotFound;
