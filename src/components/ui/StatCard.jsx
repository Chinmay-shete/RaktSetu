import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({ title, value, icon: Icon, trend, color = 'blue', description }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numericValue = typeof value === 'number' ? value : parseInt(value, 10);
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = numericValue;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 800; // 0.8s animation
    const stepTime = Math.max(Math.floor(duration / end), 12);
    const increment = Math.ceil(end / 30);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="bg-white p-6 rounded-2xl border border-[#EDE7E1] relative overflow-hidden group shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.05em] text-[#7A5F5F] uppercase">
            {title}
          </p>
          <div className="flex items-end gap-1.5 mt-2">
            <h4 className="font-serif text-[44px] leading-none text-[#BE1F2E] font-medium">
              {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
            </h4>
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-red-50 text-[#BE1F2E]">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-[#5A5A5A] italic">
          {description || "Gross storage count"}
        </span>
      </div>
    </motion.div>
  );
};

export default StatCard;
