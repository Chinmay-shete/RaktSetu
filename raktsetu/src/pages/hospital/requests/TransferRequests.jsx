import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { mockApi } from '../../../services/mockApi';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../../components/ui/Loader';
import { ErrorState } from '../../../components/ui/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftRight,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

export const TransferRequests = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Incoming'); // Incoming or Outgoing
  const [rejectId, setRejectId] = useState(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const { data: transfers = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['transfers'],
    queryFn: mockApi.getTransferRequests
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => mockApi.updateTransferStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] }); // Update reserved state
      toast.success(`Request has been ${data.status === 'Approved' ? 'accepted and blood units reserved' : 'declined'}.`);
      setRejectId(null);
      setRejectionRemarks('');
    },
    onError: () => {
      toast.error("Failed to update transfer request.");
    }
  });

  // Outgoing Request Form
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      hospitalName: 'Red Cross Blood Bank, East',
      bloodGroup: 'O-',
      unitsRequired: 5,
      priority: 'High',
      message: ''
    }
  });

  const createRequestMutation = useMutation({
    mutationFn: async (newReq) => {
      const list = JSON.parse(localStorage.getItem('raktsetu_db_transfers') || '[]');
      const req = {
        ...newReq,
        id: "tr-" + Date.now(),
        distance: parseFloat((Math.random() * 8 + 2).toFixed(1)),
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        type: 'Outgoing'
      };
      list.unshift(req);
      localStorage.setItem('raktsetu_db_transfers', JSON.stringify(list));
      return req;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      toast.success("Blood transfer request broadcasted to peer network.");
      setIsRequestModalOpen(false);
      reset();
    }
  });

  if (isLoading) return <Loader message="Fetching transfer registry..." />;
  if (isError) return <ErrorState message="Could not load transfer request database." onRetry={refetch} />;

  const filteredTransfers = transfers.filter(t => t.type === activeTab);

  const handleApprove = (id) => {
    updateStatusMutation.mutate({ id, status: 'Approved' });
  };

  const handleRejectSubmit = () => {
    if (!rejectionRemarks.trim()) {
      toast.warning("Please specify remarks for rejection");
      return;
    }
    updateStatusMutation.mutate({ id: rejectId, status: 'Rejected' });
  };

  const onReqSubmit = (data) => {
    createRequestMutation.mutate(data);
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/15';
      case 'High': return 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/15';
      default: return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/15';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
            <XCircle className="h-4 w-4" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 animate-pulse">
            <Clock className="h-4 w-4" /> Pending Approval
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100">
            Blood Transfer Pipeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Coordinate, review, and request stock transfers across nearest partner hospitals.
          </p>
        </div>
        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/10 hover:shadow-rose-600/20 cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Request Blood
        </button>
      </div>

      {/* Navigation tabs & content */}
      <div className="flex border-b border-slate-200/50 dark:border-slate-850 gap-6 text-sm font-bold select-none mb-2">
        {['Incoming', 'Outgoing'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3.5 relative transition-colors cursor-pointer ${
              activeTab === tab 
                ? 'text-rose-600' 
                : 'text-slate-400 hover:text-slate-655 dark:hover:text-slate-200'
            }`}
          >
            {tab === 'Incoming' ? 'Incoming Requests' : 'My Requests (Outgoing)'}
            {activeTab === tab && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-650"
              />
            )}
          </button>
        ))}
      </div>

      {filteredTransfers.length === 0 ? (
        <EmptyState
          title={`No ${activeTab.toLowerCase()} transfers`}
          description={
            activeTab === 'Incoming' 
              ? 'No external hospitals are currently requesting stock allocations from your bank.'
              : 'You have not broadcasted any request notices to external banks yet.'
          }
          icon={ArrowLeftRight}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTransfers.map((req) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-5 rounded-3xl flex flex-col justify-between gap-4 shadow-sm border border-slate-200/50 dark:border-slate-800/40 relative overflow-hidden"
              >
                {/* Visual Status Indicator Line */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  req.status === 'Approved' ? 'bg-emerald-500' : req.status === 'Rejected' ? 'bg-slate-400' : 'bg-amber-500 animate-pulse'
                }`} />

                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-250 truncate max-w-[180px]">
                        {req.hospitalName}
                      </h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {req.distance} km away
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-lg text-xxs font-extrabold border ${getPriorityStyle(req.priority)}`}>
                      {req.priority}
                    </span>
                  </div>

                  {/* Core details */}
                  <div className="bg-slate-100/40 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800/30 flex items-center justify-between mt-3.5">
                    <div>
                      <span className="text-xxs text-slate-400 uppercase tracking-wider block font-bold">Required Type</span>
                      <span className="text-xl font-extrabold text-rose-650 font-outfit">{req.bloodGroup}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xxs text-slate-400 uppercase tracking-wider block font-bold">Bags Required</span>
                      <span className="text-base font-bold text-slate-800 dark:text-slate-200">{req.unitsRequired} Units</span>
                    </div>
                  </div>

                  {req.message && (
                    <p className="text-xxs text-slate-500 dark:text-slate-400 italic mt-3 bg-slate-50/50 dark:bg-slate-900/10 p-2.5 rounded-xl border border-slate-150/40 dark:border-slate-850/40">
                      "{req.message}"
                    </p>
                  )}
                </div>

                {/* Status and Action Buttons */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-1">
                  <div>{getStatusBadge(req.status)}</div>

                  {req.status === 'Pending' && activeTab === 'Incoming' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRejectId(req.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-250 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" /> Decline
                      </button>
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-md shadow-emerald-600/10"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" /> Approve
                      </button>
                    </div>
                  )}

                  {req.status === 'Pending' && activeTab === 'Outgoing' && (
                    <span className="text-[10px] text-slate-400 font-semibold italic">Broadcast active...</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Decline Remarks Modal */}
      <Modal
        isOpen={!!rejectId}
        onClose={() => setRejectId(null)}
        title="Specify Decline Remarks"
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Please enter a quick explanation. Rejection remarks will be appended to this transfer log and visible to the requesting hospital.
          </p>

          <textarea
            placeholder="E.g., insufficient stock level of O- units currently, reserved for ER standby..."
            rows="3"
            value={rejectionRemarks}
            onChange={(e) => setRejectionRemarks(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-rose-500/20 focus:outline-none resize-none"
          />

          <div className="flex gap-3 border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-1">
            <button
              onClick={() => setRejectId(null)}
              className="w-1/2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectSubmit}
              className="w-1/2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
            >
              Confirm Decline
            </button>
          </div>
        </div>
      </Modal>

      {/* Request Stock Modal Form */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Broadcast Transfer Request"
      >
        <form onSubmit={handleSubmit(onReqSubmit)} className="flex flex-col gap-4">
          <p className="text-xs text-slate-550 leading-relaxed">
            Specify stock quantities and priority. This request will be instantly pushed to partner hospital pipelines within a 15km radius.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Bank</label>
            <select
              {...register("hospitalName", { required: true })}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Red Cross Blood Bank, East">Red Cross Blood Bank, East</option>
              <option value="Max Healthcare, South Delhi">Max Healthcare, South Delhi</option>
              <option value="St. Stephens Hospital">St. Stephens Hospital</option>
              <option value="Fortis Escorts Blood Bank">Fortis Escorts Blood Bank</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Required Group</label>
              <select
                {...register("bloodGroup", { required: true })}
                className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Units Required</label>
              <input
                type="number"
                {...register("unitsRequired", { required: true, min: 1 })}
                className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority Level</label>
            <select
              {...register("priority", { required: true })}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Critical">Critical (Surgery Pending)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Urgency Message</label>
            <textarea
              placeholder="Provide a quick note explaining request requirements..."
              rows="3"
              {...register("message")}
              className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-2">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(false)}
              className="w-1/2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              className="w-1/2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/10"
            >
              <Send className="h-3.5 w-3.5" /> Send Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default TransferRequests;
