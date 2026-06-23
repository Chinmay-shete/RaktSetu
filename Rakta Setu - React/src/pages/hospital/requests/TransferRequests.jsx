import { useState } from 'react';
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
  Clock
} from 'lucide-react';

export const TransferRequests = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Incoming');
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
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(`Request has been ${data.status === 'Approved' ? 'accepted and blood units reserved' : 'declined'}.`);
      setRejectId(null);
      setRejectionRemarks('');
    },
    onError: () => {
      toast.error("Failed to update transfer request.");
    }
  });

  const { register, handleSubmit, reset } = useForm({
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
        // TODO: Replace with PostGIS calculations using real hospital GPS coordinates
        distance: 5.0,
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
      case 'Critical': return 'bg-[#BE1F2E]/10 text-[#BE1F2E] border-[#BE1F2E]/15';
      case 'High': return 'bg-[#E07B00]/10 text-[#E07B00] border-[#E07B00]/15';
      default: return 'bg-blue-500/10 text-blue-600 border-blue-500/15';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#22A06B]">
            <CheckCircle2 className="h-4 w-4" /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#7A5F5F]">
            <XCircle className="h-4 w-4" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#E07B00] animate-pulse">
            <Clock className="h-4 w-4" /> Pending Approval
          </span>
        );
    }
  };

  const fieldLabel = "text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block mb-2";

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in select-none">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#EDE7E1] pb-6">
        <div>
          <h1 className="font-serif text-[36px] md:text-[48px] italic leading-none mb-2 tracking-[-0.03em] text-[#1A1210]">
            Transfer Pipeline
          </h1>
          <p className="text-[14px] text-[#5A5A5A]">
            Coordinate, review, and request stock transfers across nearest partner hospitals.
          </p>
        </div>
        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="btn-primary self-start sm:self-auto"
          style={{ minHeight: 42, minWidth: 'auto', padding: '10px 20px', fontSize: 13 }}
        >
          <Plus className="h-4 w-4" />
          Request Blood
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-[#EDE7E1] gap-6 text-sm font-bold select-none">
        {['Incoming', 'Outgoing'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3.5 relative transition-colors cursor-pointer ${
              activeTab === tab
                ? 'text-[#BE1F2E]'
                : 'text-[#7A5F5F] hover:text-[#1A1210]'
            }`}
          >
            {tab === 'Incoming' ? 'Incoming Requests' : 'My Requests (Outgoing)'}
            {activeTab === tab && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#BE1F2E]"
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
                className="bg-white p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm border border-[#EDE7E1] relative overflow-hidden"
              >
                {/* Status accent top bar */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${
                  req.status === 'Approved' ? 'bg-[#22A06B]' : req.status === 'Rejected' ? 'bg-[#7A5F5F]' : 'bg-[#E07B00]'
                }`} />

                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-[#1A1210] truncate max-w-[180px]">
                        {req.hospitalName}
                      </h4>
                      <p className="text-[10px] text-[#7A5F5F] flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {req.distance} km away
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getPriorityStyle(req.priority)}`}>
                      {req.priority}
                    </span>
                  </div>

                  {/* Core details bento */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE7E1] flex items-center justify-between mt-3.5">
                    <div>
                      <span className="text-[10px] text-[#7A5F5F] uppercase tracking-wider block font-bold">Required Type</span>
                      <span className="text-xl font-extrabold text-[#BE1F2E] font-serif">{req.bloodGroup}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#7A5F5F] uppercase tracking-wider block font-bold">Bags Required</span>
                      <span className="text-base font-bold text-[#1A1210]">{req.unitsRequired} Units</span>
                    </div>
                  </div>

                  {req.message && (
                    <p className="text-[10px] text-[#5A5A5A] italic mt-3 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EDE7E1]">
                      "{req.message}"
                    </p>
                  )}
                </div>

                {/* Status and Action Buttons */}
                <div className="flex items-center justify-between border-t border-[#EDE7E1] pt-4 mt-1">
                  <div>{getStatusBadge(req.status)}</div>

                  {req.status === 'Pending' && activeTab === 'Incoming' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRejectId(req.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#EDE7E1] text-xs font-bold text-[#5A5A5A] hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" /> Decline
                      </button>
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#22A06B] hover:bg-[#1B8459] text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" /> Approve
                      </button>
                    </div>
                  )}

                  {req.status === 'Pending' && activeTab === 'Outgoing' && (
                    <span className="text-[10px] text-[#7A5F5F] font-semibold italic">Broadcast active...</span>
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
          <p className="text-xs text-[#5A5A5A] leading-relaxed">
            Please enter a quick explanation. Rejection remarks will be appended to this transfer log and visible to the requesting hospital.
          </p>

          <textarea
            placeholder="E.g., insufficient stock level of O- units currently, reserved for ER standby..."
            rows="3"
            value={rejectionRemarks}
            onChange={(e) => setRejectionRemarks(e.target.value)}
            className="input-field resize-none"
          />

          <div className="flex gap-3 border-t border-[#EDE7E1] pt-4 mt-1">
            <button
              onClick={() => setRejectId(null)}
              className="w-1/2 px-4 py-2.5 rounded-full border border-[#EDE7E1] text-xs font-bold text-[#5A5A5A] hover:bg-[#FAF8F5] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectSubmit}
              className="w-1/2 px-4 py-2.5 rounded-full bg-[#BE1F2E] hover:bg-[#9E1825] text-white text-xs font-bold cursor-pointer transition-colors"
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
          <p className="text-xs text-[#5A5A5A] leading-relaxed">
            Specify stock quantities and priority. This request will be instantly pushed to partner hospital pipelines within a 15km radius.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel}>Target Bank</label>
            <select
              {...register("hospitalName", { required: true })}
              className="input-field custom-select"
            >
              <option value="Red Cross Blood Bank, East">Red Cross Blood Bank, East</option>
              <option value="Max Healthcare, South Delhi">Max Healthcare, South Delhi</option>
              <option value="St. Stephens Hospital">St. Stephens Hospital</option>
              <option value="Fortis Escorts Blood Bank">Fortis Escorts Blood Bank</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel}>Required Group</label>
              <select
                {...register("bloodGroup", { required: true })}
                className="input-field custom-select"
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel}>Units Required</label>
              <input
                type="number"
                {...register("unitsRequired", { required: true, min: 1 })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel}>Priority Level</label>
            <select
              {...register("priority", { required: true })}
              className="input-field custom-select"
            >
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Critical">Critical (Surgery Pending)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel}>Urgency Message</label>
            <textarea
              placeholder="Provide a quick note explaining request requirements..."
              rows="3"
              {...register("message")}
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3 border-t border-[#EDE7E1] pt-4 mt-2">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(false)}
              className="w-1/2 px-4 py-2.5 rounded-full border border-[#EDE7E1] text-xs font-bold text-[#5A5A5A] hover:bg-[#FAF8F5] cursor-pointer transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              className="w-1/2 px-4 py-2.5 rounded-full bg-[#BE1F2E] hover:bg-[#9E1825] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
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
