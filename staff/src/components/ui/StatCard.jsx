import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

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

  const colorStyles = {
    red: {
      bg: 'gradient-card-red',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      glow: 'shadow-rose-500/5'
    },
    blue: {
      bg: 'gradient-card-blue',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      glow: 'shadow-blue-500/5'
    },
    green: {
      bg: 'gradient-card-green',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      glow: 'shadow-emerald-500/5'
    },
    amber: {
      bg: 'bg-amber-500/5 border border-amber-500/15 dark:bg-amber-500/10 dark:border-amber-500/20',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      glow: 'shadow-amber-500/5'
    },
    slate: {
      bg: 'glass-card',
      iconBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
      glow: 'shadow-slate-500/5'
    }
  };

  const style = colorStyles[color] || colorStyles.slate;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`relative p-6 rounded-3xl overflow-hidden shadow-lg backdrop-blur-md transition-shadow hover:shadow-xl ${style.bg} ${style.glow}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <h4 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-outfit mt-1">
            {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
          </h4>
        </div>
        <div className={`p-3 rounded-2xl ${style.iconBg} shadow-inner`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {trend !== undefined && (
          <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-lg ${
            trend >= 0 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
          }`}>
            {trend >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
            {Math.abs(trend)}%
          </span>
        )}
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {description || "vs past month"}
        </span>
      </div>
    </motion.div>
  );
};
