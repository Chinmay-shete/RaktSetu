import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export const ErrorState = ({ 
  message = "An error occurred while loading data.", 
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-red-200/40 dark:border-rose-900/20 bg-rose-50/20 dark:bg-rose-950/10 backdrop-blur-md">
      <div className="bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 p-4 rounded-2xl mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">System Error</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-all shadow-lg shadow-rose-600/20 cursor-pointer active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          Retry Request
        </button>
      )}
    </div>
  );
};
