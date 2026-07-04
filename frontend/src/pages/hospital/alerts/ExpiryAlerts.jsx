
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hospitalApi } from '../../../services/api';
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
    queryFn: hospitalApi.getInventory
  });

  const disposeMutation = useMutation({
    mutationFn: hospitalApi.deleteInventory,
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
  const alerts = (Array.isArray(inventory) ? inventory : [])
    .filter(item => item.status === 'Expired' || item.status === 'Expiring Soon')
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto animate-fade-in select-none">
      {/* Editorial Header */}
      <div className="border-b border-[#EDE7E1] pb-6">
        <h1 className="font-serif text-[36px] md:text-[48px] italic leading-none mb-2 tracking-[-0.03em] text-[#1A1210]">
          Expiry Alerts
        </h1>
        <p className="text-[14px] text-[#5A5A5A]">
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
        <div className="relative border-l-2 border-[#EDE7E1] pl-6 ml-3 flex flex-col gap-6">
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
                  className={`relative p-5 rounded-2xl border shadow-sm transition-shadow hover:shadow-md ${
                    isExpired
                      ? 'bg-red-50/50 border-[#BE1F2E]/15'
                      : 'bg-amber-50/50 border-[#E07B00]/15'
                  }`}
                >
                  {/* Timeline bullet dot */}
                  <div className={`absolute left-[-31px] top-7 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                    isExpired ? 'border-[#BE1F2E]' : 'border-[#E07B00]'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${isExpired ? 'bg-[#BE1F2E] animate-pulse' : 'bg-[#E07B00]'}`} />
                  </div>

                  {/* Card content */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      {/* Big group text */}
                      <span className={`text-4xl font-extrabold font-serif ${isExpired ? 'text-[#BE1F2E]' : 'text-[#E07B00]'}`}>
                        {item.bloodGroup}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#1A1210]">
                            {item.units} Units
                          </span>
                          <span className="text-[10px] text-[#7A5F5F] font-semibold uppercase">
                            Batch: {item.id}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#5A5A5A] mt-1">
                          <span className="flex items-center gap-1">
                            <Layers className="h-3.5 w-3.5" /> Source: {item.source}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> Expiry: {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-[#EDE7E1] pt-3 md:pt-0">
                      <div>
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#BE1F2E]/10 text-[#BE1F2E] border border-[#BE1F2E]/15">
                            <AlertTriangle className="h-3 w-3" />
                            Expired {Math.abs(item.daysRemaining)} days ago
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E07B00]/10 text-[#E07B00] border border-[#E07B00]/15">
                            <Clock className="h-3 w-3" />
                            {item.daysRemaining} days remaining
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleNotifyAdmin(item.id, item.bloodGroup)}
                          className="p-2 rounded-xl bg-white border border-[#EDE7E1] text-[#5A5A5A] hover:text-[#BE1F2E] hover:border-[#BE1F2E]/20 transition-colors cursor-pointer"
                          title="Notify Administrator"
                        >
                          <BellRing className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => disposeMutation.mutate(item.id)}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                            isExpired
                              ? 'bg-[#BE1F2E] hover:bg-[#9E1825] text-white border-[#BE1F2E]'
                              : 'bg-white hover:bg-[#FAF8F5] border-[#EDE7E1] text-[#5A5A5A]'
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
