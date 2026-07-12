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
import { useAuth } from '../../../context/AuthContext';
import {
  ArrowLeftRight,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Truck
} from 'lucide-react';

export const TransferRequests = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Incoming');
  const [rejectId, setRejectId] = useState(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const { data: transfers = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['transfers'],
    queryFn: hospitalApi.getTransferRequests
  });

  const { data: hospitalsList = [] } = useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const res = await api.get('/landing/hospitals');
      return res.data || [];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => hospitalApi.updateTransferStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      
      const s = data.status || '';
      if (s === 'accepted') {
        toast.success("Request approved and blood units reserved for transit.");
      } else if (s === 'completed') {
        toast.success("Delivery confirmed! Blood inventory synchronized successfully.");
      } else if (s === 'cancelled') {
        toast.success("Transfer request cancelled and reservation released.");
      } else {
        toast.success("Transfer request declined.");
      }
      
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
      fromHospitalId: '',
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

  const filteredTransfers = transfers.filter(t => {
    if (activeTab === 'Transit') {
      return t.status?.toLowerCase() === 'accepted' || t.status?.toLowerCase() === 'completed';
    }
    return t.type?.toLowerCase() === activeTab.toLowerCase() && t.status?.toLowerCase() !== 'accepted' && t.status?.toLowerCase() !== 'completed';
  });

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
    if (!data.fromHospitalId) {
      toast.warning("Please select a target hospital");
      return;
    }
    createRequestMutation.mutate({
      fromHospitalId: parseInt(data.fromHospitalId, 10),
      bloodGroup: data.bloodGroup,
      units: parseInt(data.units, 10),
      priority: data.priority.toLowerCase(),
      message: data.message
    });
  };

  const getPriorityStyle = (priority) => {
    const p = priority?.toLowerCase();
    switch (p) {
      case 'critical': return 'bg-[#BE1F2E]/10 text-[#BE1F2E] border-[#BE1F2E]/15';
      case 'high': return 'bg-[#E07B00]/10 text-[#E07B00] border-[#E07B00]/15';
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
        {['Incoming', 'Outgoing', 'Transit'].map(tab => (
          <button type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3.5 relative transition-colors cursor-pointer ${
              activeTab === tab
                ? 'text-[#BE1F2E]'
                : 'text-[#7A5F5F] hover:text-[#1A1210]'
            }`}
          >
            {tab === 'Incoming' ? 'Incoming Requests' : tab === 'Outgoing' ? 'My Requests (Outgoing)' : 'Transit Tracker'}
            {activeTab === tab && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#BE1F2E]"
              />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'Transit' ? (
        filteredTransfers.length === 0 ? (
          <EmptyState
            title="No Active Transits"
            description="There are currently no blood transfer requests in transit or recently completed."
            icon={ArrowLeftRight}
          />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredTransfers.map(req => {
              const transitTimeMins = Math.max(10, Math.round(req.distance * 1.2)); // 50km/h average speed (1.2 mins per km)
              const isSender = req.type === 'incoming'; // if incoming, current hospital is target (from_hospital)
              const isCompleted = req.status?.toLowerCase() === 'completed';
              
              const formatTime = (isoString) => {
                if (!isoString) return '';
                try {
                  const d = new Date(isoString);
                  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } catch {
                  return '';
                }
              };

              // Timeline milestones
              const milestones = [
                { title: 'Request Placed', desc: `Submitted on ${req.date} ${formatTime(req.createdAt)}`, done: true },
                { title: 'Approved & Dispatched', desc: `Approved by supplying hospital`, done: req.status !== 'pending' },
                { title: 'In Transit', desc: `Ambulance traveling ${req.distance} km · Est. ${transitTimeMins} mins`, done: isCompleted, active: req.status === 'accepted' },
                { title: 'Delivered & Received', desc: isCompleted ? 'Verified and added to inventory' : 'Awaiting receipt confirmation', done: isCompleted }
              ];

              return (
                <div key={req.id} className="bg-white rounded-3xl p-6 border border-[#EDE7E1] shadow-sm flex flex-col gap-6 hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start border-b border-[#EDE7E1] pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#BE1F2E]/10 text-[#BE1F2E]">
                          {req.bloodGroup}
                        </span>
                        <span className="text-xs font-bold text-[#5A5A5A]">
                          {req.unitsRequired} Bags
                        </span>
                        {req.priority && (
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getPriorityStyle(req.priority)}`}>
                            {req.priority}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#1A1210]">
                        {isSender ? `To: ${req.hospitalName}` : `From: ${req.hospitalName}`}
                      </h3>
                      <p className="text-xs text-[#7A5F5F] flex items-center gap-1 mt-1 font-semibold">
                        <MapPin className="h-3 w-3" /> Distance: {req.distance} km
                      </p>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      isCompleted 
                        ? 'bg-[#22A06B]/10 text-[#22A06B]' 
                        : 'bg-[#E07B00]/10 text-[#E07B00] animate-pulse'
                    }`}>
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                        </>
                      ) : (
                        <>
                          <Clock className="h-3.5 w-3.5" /> In Transit
                        </>
                      )}
                    </span>
                  </div>

                  {/* Amazon style vertical timeline */}
                  <div className="flex flex-col gap-5 relative pl-8 border-l border-[#EDE7E1] ml-4">
                    {milestones.map((ms, index) => {
                      const isActive = ms.active;
                      const isDone = ms.done;
                      
                      return (
                        <div key={index} className="relative">
                          {/* Circle Marker */}
                          <div className={`absolute -left-[41px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isDone 
                              ? 'bg-[#22A06B] border-[#22A06B] text-white shadow-sm'
                              : isActive
                                ? 'bg-white border-[#E07B00] text-[#E07B00] shadow-sm animate-pulse'
                                : 'bg-white border-[#EDE7E1] text-[#A8A0A0]'
                          }`}>
                            {isDone ? (
                              <svg className="w-3.5 h-3.5 animate-fade-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : index === 2 ? (
                              <Truck className="h-3.5 w-3.5" />
                            ) : (
                              <span className="text-[10px] font-bold">{index + 1}</span>
                            )}
                          </div>

                          <div className="flex flex-col">
                            <span className={`text-xs font-bold ${
                              isDone ? 'text-[#1A1210]' : isActive ? 'text-[#E07B00]' : 'text-[#A8A0A0]'
                            }`}>
                              {ms.title}
                            </span>
                            <span className="text-[11px] text-[#7A5F5F] mt-0.5 leading-relaxed">
                              {ms.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Ambulance progress bar */}
                  {!isCompleted && (
                    <div className="bg-[#FAF8F5] border border-[#EDE7E1] rounded-2xl p-4 flex flex-col gap-3 shadow-inner">
                      <div className="flex justify-between items-center text-xxs font-extrabold text-[#7A5F5F] uppercase tracking-wider">
                        <span>Ambulance Dispatched (50 km/h)</span>
                        <span>Est. arrival: {transitTimeMins} mins</span>
                      </div>
                      <div className="relative w-full h-2 bg-[#EDE7E1] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "20%" }}
                          animate={{ width: "65%" }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                          className="absolute top-0 bottom-0 left-0 bg-[#E07B00] rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action button */}
                  {!isCompleted && !isSender && (
                    <button type="button"
                      onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'completed' })}
                      className="w-full btn-primary bg-[#22A06B] hover:bg-[#1B8459] border-[#22A06B] flex items-center justify-center gap-1.5 shadow-sm text-white"
                      style={{ minHeight: 40, fontSize: 13, cursor: 'pointer' }}
                    >
                      <CheckCircle2 className="h-4 w-4" /> Confirm Receipt & Update Inventory
                    </button>
                  )}
                  
                  {!isCompleted && isSender && (
                    <div className="p-3 bg-[#FAF8F5] border border-dashed border-[#EDE7E1] rounded-2xl text-center text-xs font-semibold text-[#7A5F5F]">
                      Ambulance courier is currently en route.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        filteredTransfers.length === 0 ? (
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
                          <span className="text-[11px] text-[#7A5F5F] font-semibold italic animate-pulse">Broadcast active...</span>
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
        )
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
              <option value="">— Select Target Bank —</option>
              {hospitalsList
                .filter(h => String(h.id) !== String(user?.hospital_id || user?.hospitalId))
                .map(h => (
                  <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
                ))}
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
