import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api, { hospitalApi } from '../../../services/api';
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
    queryFn: hospitalApi.getTransferRequests
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => hospitalApi.updateTransferStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(`Request has been ${data.status === 'Approved' ? 'accepted and blood units reserved' : 'declined'}.`);
      setRejectId(null);
      setRejectionRemarks('');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Failed to update transfer request.";
      toast.error(msg);
    }
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      fromHospitalId: '2',
      bloodGroup: 'O-',
      units: 5,
      priority: 'High',
      message: ''
    }
  });

  const createRequestMutation = useMutation({
    mutationFn: async (newReq) => {
      const key = `idemp-${Date.now()}-${crypto.randomUUID()}`;
      const response = await api.post('/hospital/transfers', newReq, {
        headers: { 'Idempotency-Key': key }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      toast.success("Blood transfer request broadcasted to peer network.");
      setIsRequestModalOpen(false);
      reset();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to submit transfer request.");
    }
  });

  if (isLoading) return <Loader message="Fetching transfer registry..." />;
  if (isError) return <ErrorState message="Could not load transfer request database." onRetry={refetch} />;

  const filteredTransfers = transfers.filter(t => 
    t.type?.toLowerCase() === activeTab.toLowerCase()
  );

  const handleApprove = (id) => {
    updateStatusMutation.mutate({ id, status: 'accepted' });
  };

  const handleRejectSubmit = () => {
    if (!rejectionRemarks.trim()) {
      toast.warning("Please specify remarks for rejection");
      return;
    }
    updateStatusMutation.mutate({ id: rejectId, status: 'rejected' });
  };

  const onReqSubmit = (data) => {
    createRequestMutation.mutate({
      fromHospitalId: parseInt(data.fromHospitalId, 10),
      bloodGroup: data.bloodGroup,
      units: parseInt(data.units, 10),
      priority: data.priority.toLowerCase(),
      message: data.message
    });
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-[#BE1F2E]/10 text-[#BE1F2E] border-[#BE1F2E]/15';
      case 'High': return 'bg-[#E07B00]/10 text-[#E07B00] border-[#E07B00]/15';
      default: return 'bg-blue-500/10 text-blue-600 border-blue-500/15';
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'approved':
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#22A06B]">
            <CheckCircle2 className="h-4 w-4" /> Approved
          </span>
        );
      case 'rejected':
      case 'declined':
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
        <button type="button"
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
          <button type="button"
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
        <div className="bg-white rounded-2xl shadow-sm border border-[#EDE7E1] overflow-hidden">
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EDE7E1]">
                  <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Hospital</th>
                  <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Blood Group</th>
                  <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Bags</th>
                  <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Distance</th>
                  <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Priority</th>
                  <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Status</th>
                  <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.map(req => (
                  <tr key={req.id} className="border-b border-[#EDE7E1] hover:bg-[#FAF8F5] transition-colors text-[13px]">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-[600] text-[#1A1210]">{req.hospitalName}</p>
                        {req.message && <p className="text-[10px] text-[#7A5F5F] italic mt-0.5">"{req.message}"</p>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 bg-[#BE1F2E]/10 text-[#BE1F2E] text-[11px] font-[700] rounded uppercase tracking-wider">
                        {req.bloodGroup}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#5A5A5A] font-semibold">{req.unitsRequired} Units</td>
                    <td className="px-4 py-4 text-[#5A5A5A]">{req.distance} km</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getPriorityStyle(req.priority)}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(req.status)}</td>
                    <td className="px-4 py-4 text-right">
                      {req.status?.toLowerCase() === 'pending' && activeTab.toLowerCase() === 'incoming' && (
                        <div className="flex gap-2 justify-end">
                          <button type="button"
                            onClick={() => setRejectId(req.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1  rounded-full border border-[#EDE7E1] text-[11px] font-bold text-[#5A5A5A] hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                          >
                            <ThumbsDown className="h-3 w-3" /> Decline
                          </button>
                          <button type="button"
                            onClick={() => handleApprove(req.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1  rounded-full bg-[#22A06B] hover:bg-[#1B8459] text-white text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            <ThumbsUp className="h-3 w-3" /> Approve
                          </button>
                        </div>
                      )}
                      {req.status?.toLowerCase() === 'pending' && activeTab.toLowerCase() === 'outgoing' && (
                        <span className="text-[11px] text-[#7A5F5F] font-semibold italic">Broadcast active...</span>
                      )}
                      {req.status?.toLowerCase() !== 'pending' && (
                        <span className="text-[11px] text-[#9A9A9A]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            <button type="button"
              onClick={() => setRejectId(null)}
              className="w-1/2 px-4 py-2.5 rounded-full border border-[#EDE7E1] text-xs font-bold text-[#5A5A5A] hover:bg-[#FAF8F5] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button type="button"
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
            <label htmlFor="target-bank-1" className={fieldLabel}>Target Bank</label>
            <select id="target-bank-1"
              {...register("fromHospitalId", { required: true })}
              className="input-field custom-select"
            >
              <option value="2">Pune Life Care Hospital</option>
              <option value="3">Mumbai General Hospital</option>
              <option value="4">Surat Municipal Hospital</option>
              <option value="1">Koregaon Park City Life Hospital</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="required-group-2" className={fieldLabel}>Required Group</label>
              <select id="required-group-2"
                {...register("bloodGroup", { required: true })}
                className="input-field custom-select"
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="units-required-3" className={fieldLabel}>Units Required</label>
              <input id="units-required-3"
                type="number"
                {...register("units", { required: true, min: 1 })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="priority-level-4" className={fieldLabel}>Priority Level</label>
            <select id="priority-level-4"
              {...register("priority", { required: true })}
              className="input-field custom-select"
            >
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Critical">Critical (Surgery Pending)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="urgency-message-5" className={fieldLabel}>Urgency Message</label>
            <textarea id="urgency-message-5"
              placeholder="Provide a quick note explaining request requirements..."
              rows="3"
              {...register("message")}
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3 border-t border-[#EDE7E1] pt-4 mt-2">
            <button type="button"
              
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
