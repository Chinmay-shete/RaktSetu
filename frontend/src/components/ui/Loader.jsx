import { Heart } from 'lucide-react';

export const Loader = ({ message = "Loading dashboard..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
      <div className="relative flex items-center justify-center mb-4">
        <div className="absolute w-16 h-16 rounded-full bg-rose-500/20 animate-ping" />
        <div className="absolute w-12 h-12 rounded-full bg-rose-500/30 animate-pulse" />
        <div className="relative bg-rose-600 p-3 rounded-full text-white shadow-lg">
          <Heart className="h-6 w-6 fill-current" />
        </div>
      </div>
      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm animate-pulse">
        {message}
      </p>
    </div>
  );
};
