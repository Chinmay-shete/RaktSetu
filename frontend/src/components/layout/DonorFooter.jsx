import React from 'react';
import { Link } from 'react-router-dom';

/**
 * DonorFooter — single unified footer for all donor-facing pages.
 * Donor Guidelines and Contact Medical Team link to real pages.
 */
const DonorFooter = () => {
  return (
    <footer className="bg-[#1a1210] border-t border-white/10 w-full py-16 md:py-24">
      <div className="flex flex-col md:flex-row justify-between items-start w-full px-4 sm:px-6 md:px-10 lg:px-16 gap-12 md:gap-0">
        {/* Brand */}
        <div className="space-y-4">
          <div className="font-serif text-[48px] md:text-[60px] text-white italic leading-none">RaktSetu</div>
          <p className="text-[#737373] text-[14px] md:text-[16px] max-w-xs leading-relaxed">
            © 2026 RaktSetu. Clinical Excellence in Blood Logistics.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-4">
          <Link
            className="text-[#737373] hover:text-white transition-colors text-[15px] md:text-[16px]"
            to="/privacy"
          >
            Privacy Policy
          </Link>
          <Link
            className="text-[#737373] hover:text-white transition-colors text-[15px] md:text-[16px]"
            to="/terms"
          >
            Terms of Service
          </Link>
          <Link
            className="text-[#737373] hover:text-white transition-colors text-[15px] md:text-[16px]"
            to="/donor-guidelines"
          >
            Donor Guidelines
          </Link>
          <Link
            className="text-[#737373] hover:text-white transition-colors text-[15px] md:text-[16px]"
            to="/contact"
          >
            Contact Medical Team
          </Link>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <div className="text-white text-[12px] font-[600] uppercase tracking-widest opacity-50">
            Operational Status
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white text-[15px] md:text-[16px]">Live Logistics Network</span>
          </div>
          <div className="text-[#737373] text-[13px] mt-2">
            24/7 Emergency Blood Coordination
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DonorFooter;
