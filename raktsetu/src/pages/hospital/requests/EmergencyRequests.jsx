import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi } from '../../../services/mockApi';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../../components/ui/Loader';
import { ErrorState } from '../../../components/ui/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  AlertOctagon,
  MapPin,
  Clock,
  Truck,
  Heart,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  PhoneCall
} from 'lucide-react';

// Live Countdown Timer Sub-Component
const CountdownTimer = ({ targetTimestamp, status, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (status !== 'Pending') return;

    const calculateTime = () => {
      const difference = targetTimestamp - Date.now();
      if (difference <= 0) {
        setTimeLeft(0);
        if (onExpire) onExpire();
        return;
      }
      setTimeLeft(Math.floor(difference / 1000));
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp, status]);

  if (status !== 'Pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xxs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/15">
        <CheckCircle className="h-3.5 w-3.5" /> Dispatch Complete
      </span>
    );
  }

  if (timeLeft <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xxs font-bold bg-rose-500/15 text-rose-600 border border-rose-500/20">
        <AlertTriangle className="h-3.5 w-3.5" /> Timeout Critical
      </span>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 300; // < 5 mins

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xxs font-black border uppercase tracking-wider animate-pulse ${
      isUrgent 
        ? 'bg-red-500 text-white border-red-650' 
        : 'bg-rose-500/10 text-rose-600 dark:text-rose-455 border-rose-500/20'
    }`}>
      <Clock className="h-3.5 w-3.5" /> 
      Response window: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </span>
  );
};

export const EmergencyRequests = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedMapping, setSelectedMapping] = useState(null);

  const { data: emergencies = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['emergencies'],
    queryFn: mockApi.getEmergencyRequests,
    refetchInterval: 5000 // Poll every 5s for emergency changes
  });

  const acceptMutation = useMutation({
    mutationFn: (id) => mockApi.updateEmergencyStatus(id, 'Accepted'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] }); // Deduct inventory
      toast.success(`SOS Alert Accepted! Blood units dispatched to ${data.hospitalName}. Courier coordinates transmitted.`);
    },
    onError: () => {
      toast.error("Failed to accept SOS emergency.");
    }
  });

  const declineMutation = useMutation({
    mutationFn: (id) => mockApi.updateEmergencyStatus(id, 'Rejected'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
      toast.success("Emergency request declined. Regional backup banks have been flagged.");
    },
    onError: () => {
      toast.error("Failed to decline SOS request.");
    }
  });

  if (isLoading) return <Loader message="Accessing secure SOS dashboard..." />;
  if (isError) return <ErrorState message="SOS connection lost." onRetry={refetch} />;

  const activeEmergencies = emergencies.filter(e => e.status === 'Pending' || e.status === 'Accepted');

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* SOS Glowing Banner Header */}
      <div className="relative p-6 rounded-3xl overflow-hidden border border-rose-500/25 bg-rose-500/5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Animated radar rings */}
        <div className="absolute right-[-40px] top-[-40px] w-64 h-64 rounded-full border border-rose-500/10 animate-ping pointer-events-none" />
        <div className="absolute right-[-20px] top-[-20px] w-48 h-48 rounded-full border border-rose-500/20 animate-pulse pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="bg-rose-600 text-white p-3.5 rounded-2xl shadow-lg shadow-rose-600/30 animate-bounce">
            <Flame className="h-7 w-7 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-black font-outfit text-slate-800 dark:text-slate-100 flex items-center gap-2">
              SOS Regional Emergency Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immediate response panel for severe hemorrhagic shocks, trauma cases, and urgent surgeries in nearby hospitals.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-600 text-white font-extrabold text-xs shadow-md">
          <AlertOctagon className="h-4 w-4" /> Live Tracking Active
        </span>
      </div>

      {activeEmergencies.length === 0 ? (
        <EmptyState
          title="SOS Channel Clear"
          description="Zero active emergency SOS requests detected in your immediate sector. Systems nominal."
          icon={CheckCircle}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {activeEmergencies.map(req => {
              const isPending = req.status === 'Pending';
              
              return (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-6 rounded-3xl border flex flex-col md:flex-row justify-between gap-6 items-start md:items-center shadow-xl backdrop-blur-md transition-all ${
                    isPending 
                      ? 'bg-rose-50/10 dark:bg-rose-950/10 border-rose-500/30 shadow-rose-500/5' 
                      : 'bg-emerald-50/10 dark:bg-emerald-950/10 border-emerald-500/25 shadow-emerald-500/5'
                  }`}
                >
                  <div className="flex flex-col gap-3 flex-grow max-w-xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border uppercase ${
                        isPending 
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}>
                        {req.status === 'Pending' ? 'Active Alarm' : 'Dispatched'}
                      </span>

                      <CountdownTimer 
                        targetTimestamp={req.targetTimestamp} 
                        status={req.status} 
                      />

                      <span className="text-xxs text-slate-400 font-semibold flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" /> {req.distance} km away
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-outfit">
                        {req.hospitalName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                        {req.message}
                      </p>
                    </div>
                  </div>

                  {/* Right hand layout containing Blood detail box & Accept dispatch triggers */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 w-full md:w-auto border-t md:border-t-0 border-slate-200/50 dark:border-slate-800/40 pt-4 md:pt-0">
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 min-w-[150px]">
                      <div className="bg-rose-600 text-white font-extrabold text-3xl h-12 w-12 rounded-xl flex items-center justify-center font-outfit">
                        {req.bloodGroup}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">SOS Allocation</span>
                        <span className="text-base font-bold text-slate-800 dark:text-slate-100">{req.unitsRequired} Units</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => declineMutation.mutate(req.id)}
                            className="px-4 py-2.5 rounded-2xl border border-slate-250 dark:border-slate-800 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => acceptMutation.mutate(req.id)}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/20 cursor-pointer active:scale-95"
                          >
                            <UserCheck className="h-4 w-4" /> Accept SOS Dispatch
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setSelectedMapping(req)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
                        >
                          <Truck className="h-4 w-4" /> View Dispatch Route
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Dispatch Simulation Route Modal */}
      <Modal
        isOpen={!!selectedMapping}
        onClose={() => setSelectedMapping(null)}
        title={selectedMapping ? `Tracking Courier: SOS-${selectedBagId(selectedMapping.id)}` : ''}
      >
        {selectedMapping && (
          <div className="flex flex-col gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/15 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-xs">
              <Truck className="h-6 w-6 animate-pulse" />
              <div>
                <p className="font-bold">Courier Dispatched & En Route</p>
                <p className="text-[10px] text-emerald-500/80">Estimated Time of Arrival: {Math.round(selectedMapping.distance * 2)} minutes</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-medium text-slate-550 border-b border-slate-100 dark:border-slate-800/40 pb-2">
                <span>Destination Hospital</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{selectedMapping.hospitalName}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-medium text-slate-550 border-b border-slate-100 dark:border-slate-800/40 pb-2">
                <span>Dispatch Cargo</span>
                <span className="font-bold text-slate-800 dark:text-slate-105">{selectedMapping.unitsRequired} units of {selectedMapping.bloodGroup}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-medium text-slate-550">
                <span>Distance Route</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{selectedMapping.distance} km (Radial Path)</span>
              </div>
            </div>

            {/* Courier driver details mock */}
            <div className="border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl flex items-center justify-between gap-4 bg-white dark:bg-slate-900/10 text-xs">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 dark:bg-slate-850 p-2.5 rounded-full text-slate-500">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 font-outfit">Officer Amit Kumar</p>
                  <p className="text-[10px] text-slate-450">Mobile Dispatch Unit #14</p>
                </div>
              </div>
              <a
                href="tel:+919876543211"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-200 hover:text-slate-800 transition-colors font-bold"
              >
                <PhoneCall className="h-3.5 w-3.5" /> Call Dispatch
              </a>
            </div>
            
            <button
              onClick={() => setSelectedMapping(null)}
              className="w-full mt-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer"
            >
              Close Tracker
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Quick helper to hash number to code
const selectedBagId = (id) => {
  if (!id) return '';
  return id.split('-')[1] || id;
};
export default EmergencyRequests;
