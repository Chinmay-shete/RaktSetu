import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const BloodCard = ({ group, units, reserved = 0 }) => {
  const maxUnits = 45;
  const available = units - reserved;
  const percentage = Math.min(Math.round((units / maxUnits) * 100), 100);

  let statusColor = "text-emerald-500 border-emerald-500/20 bg-emerald-500/10";
  let waveBg = "bg-emerald-500";
  let statusLabel = "Optimal Stock";
  let Icon = CheckCircle;

  if (available <= 3) {
    statusColor = "text-rose-500 border-rose-500/20 bg-rose-500/10";
    waveBg = "bg-rose-500";
    statusLabel = "Critical Shortage";
    Icon = AlertCircle;
  } else if (available <= 8) {
    statusColor = "text-amber-500 border-amber-500/20 bg-amber-500/10";
    waveBg = "bg-amber-500";
    statusLabel = "Low Stock";
    Icon = AlertCircle;
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-card p-6 rounded-3xl relative overflow-hidden flex items-center justify-between shadow-lg"
    >
      <div className="flex flex-col gap-1">
        <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 font-outfit">
          {group}
        </span>
        <div className="flex gap-4 mt-2">
          <div>
            <span className="text-xxs text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider">
              Available
            </span>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {available} <span className="text-xs font-normal text-slate-400">units</span>
            </span>
          </div>
          {reserved > 0 && (
            <div>
              <span className="text-xxs text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider">
                Reserved
              </span>
              <span className="text-lg font-bold text-blue-500 dark:text-blue-400">
                {reserved} <span className="text-xs font-normal text-slate-400">units</span>
              </span>
            </div>
          )}
        </div>

        <div className={`mt-3 self-start inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xxs font-semibold ${statusColor}`}>
          <Icon className="h-3 w-3" />
          {statusLabel}
        </div>
      </div>

      <div className="relative w-20 h-20 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner">
        <div
          className={`absolute bottom-0 left-0 right-0 w-full transition-all duration-1000 ${waveBg}`}
          style={{ height: `${percentage}%` }}
        >
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-36 h-36 rounded-[40%] bg-slate-50/20 dark:bg-slate-950/20 liquid-wave" />
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-34 h-34 rounded-[45%] bg-slate-50/30 dark:bg-slate-950/30 liquid-wave" style={{ animationDelay: '1.5s' }} />
        </div>
        <span className="relative z-10 text-lg font-extrabold text-slate-700 dark:text-slate-100 font-outfit">
          {percentage}%
        </span>
      </div>
    </motion.div>
  );
};
