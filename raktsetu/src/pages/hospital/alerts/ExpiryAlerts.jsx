import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi } from '../../../services/mockApi';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../../components/ui/Loader';
import { ErrorState } from '../../../components/ui/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Clock,
  Trash2,
  BellRing,
  CheckCircle,
  Calendar,
  Layers
} from 'lucide-react';

export const ExpiryAlerts = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: inventory = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['inventory'],
    queryFn: mockApi.getInventory
  });

  const disposeMutation = useMutation({
    mutationFn: mockApi.deleteInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("Expired batch has been safely disposed and logged.");
    },
    onError: () => {
      toast.error("Failed to execute disposal.");
    }
  });

  const handleNotifyAdmin = (bagId, bloodGroup) => {
    toast.success(`Central administration notified about expiring ${bloodGroup} (Batch: ${bagId}).`);
  };

  if (isLoading) return <Loader message="Retrieving safety alerts..." />;
  if (isError) return <ErrorState message="Could not fetch inventory safety logs." onRetry={refetch} />;

  // Filter for alert states: Expired or Expiring Soon (<30 days remaining)
  const alerts = inventory
    .filter(item => item.status === 'Expired' || item.status === 'Expiring Soon')
    .sort((a, b) => a.daysRemaining - b.daysRemaining); // Sort critical first (negative/low numbers first)

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100">
          Expiry Alerts & Disposals
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Monitor blood batches nearing shelf-life threshold. Safely dispose of expired lots or request immediate transfer dispatch.
        </p>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          title="All stocks secure"
          description="Congratulations! No active blood batches are expired or nearing expiry limits."
          icon={CheckCircle}
        />
      ) : (
        <div className="relative border-l border-slate-200/60 dark:border-slate-800/80 pl-6 ml-3 flex flex-col gap-6">
          <AnimatePresence>
            {alerts.map((item, index) => {
              const isExpired = item.status === 'Expired';
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative p-5 rounded-3xl border shadow-sm backdrop-blur-md transition-shadow hover:shadow-md ${
                    isExpired 
                      ? 'bg-rose-50/15 border-rose-500/25 shadow-rose-500/5' 
                      : 'bg-amber-50/15 border-amber-500/25 shadow-amber-500/5'
                  }`}
                >
                  {/* Timeline bullet dot */}
                  <div className={`absolute left-[-31px] top-7 w-4.5 h-4.5 rounded-full border-2 bg-slate-50 dark:bg-slate-950 flex items-center justify-center ${
                    isExpired ? 'border-rose-500 text-rose-500 animate-pulse' : 'border-amber-500 text-amber-500'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${isExpired ? 'bg-rose-550' : 'bg-amber-500'}`} />
                  </div>

                  {/* Card content */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      {/* Big group text */}
                      <span className={`text-4xl font-extrabold font-outfit ${isExpired ? 'text-rose-600' : 'text-amber-550'}`}>
                        {item.bloodGroup}
                      </span>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                            {item.units} Units
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">
                            Batch: {item.id}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xxs text-slate-450 dark:text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Layers className="h-3.5 w-3.5" /> Source: {item.source}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> Expiry: {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline right details / actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-100 dark:border-slate-800/50 pt-3 md:pt-0">
                      <div>
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xxs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/15">
                            Expired {Math.abs(item.daysRemaining)} days ago
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xxs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/15">
                            {item.daysRemaining} days remaining
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleNotifyAdmin(item.id, item.bloodGroup)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-550 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          title="Notify Administrator"
                        >
                          <BellRing className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => disposeMutation.mutate(item.id)}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                            isExpired 
                              ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-650' 
                              : 'bg-white hover:bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-450'
                          }`}
                          title={isExpired ? "Dispose Lot" : "Mark Resolved"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
export default ExpiryAlerts;
