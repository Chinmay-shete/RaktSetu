import React from 'react';
import { Database } from 'lucide-react';

export const EmptyState = ({ 
  title = "No records found", 
  description = "Try adjusting your search filters or adding new items.", 
  icon: Icon = Database 
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/20 backdrop-blur-md">
      <div className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 p-4 rounded-2xl mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{description}</p>
    </div>
  );
};
