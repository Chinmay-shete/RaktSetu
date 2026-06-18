import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const ChartCard = ({ title, children }) => {
  return (
    <div className="glass-panel p-6 rounded-3xl shadow-lg flex flex-col h-full w-full">
      <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 font-outfit mb-4">
        {title}
      </h3>
      <div className="flex-grow relative w-full h-[220px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
