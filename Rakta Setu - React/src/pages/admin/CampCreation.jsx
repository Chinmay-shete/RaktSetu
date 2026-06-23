import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Tent,
  Calendar,
  MapPin,
  Clock,
  Users,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';

export const CampCreation = () => {
  const toast = useToast();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formDataCache, setFormDataCache] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      campName: '',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      location: '',
      targetDonors: 100,
      description: ''
    }
  });

  const onSubmit = (data) => {
    setFormDataCache(data);
    setShowConfirmModal(true);
  };

  const confirmSubmit = () => {
    if (formDataCache) {
      toast.success("Blood donation camp registered successfully! Sent for district officer approval.");
      setShowConfirmModal(false);
      reset();
    }
  };

  const fieldLabel = "text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block mb-2";
  const errorMsg = "text-[10px] text-[#BE1F2E] flex items-center gap-1 font-bold pl-1 mt-1.5";

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto animate-fade-in select-none">
      <div className="border-b border-[#EDE7E1] pb-6">
        <h1 className="font-serif text-[36px] md:text-[48px] italic leading-none mb-2 tracking-[-0.03em] text-[#1A1210]">
          Create Donation Camp
        </h1>
        <p className="text-[14px] text-[#5A5A5A]">
          Organize and register a new blood donation drive. Requires district officer approval.
        </p>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-[#EDE7E1]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel}>Camp Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Mega Blood Drive at Connaught Place"
                {...register("campName", { required: "Camp name is required" })}
                className={`input-field !pl-10 ${errors.campName ? 'error' : ''}`}
              />
              <Tent className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
            </div>
            {errors.campName && (
              <span className={errorMsg}>
                <AlertCircle className="h-3 w-3" /> {errors.campName.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel}>Date</label>
              <div className="relative">
                <input
                  type="date"
                  {...register("date", { required: "Date is required" })}
                  className={`input-field !pl-10 ${errors.date ? 'error' : ''}`}
                />
                <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
              </div>
              {errors.date && (
                <span className={errorMsg}>
                  <AlertCircle className="h-3 w-3" /> {errors.date.message}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={fieldLabel}>Start Time</label>
                <div className="relative">
                  <input
                    type="time"
                    {...register("startTime", { required: "Start time required" })}
                    className={`input-field !pl-10 ${errors.startTime ? 'error' : ''}`}
                  />
                  <Clock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={fieldLabel}>End Time</label>
                <div className="relative">
                  <input
                    type="time"
                    {...register("endTime", { required: "End time required" })}
                    className={`input-field !pl-10 ${errors.endTime ? 'error' : ''}`}
                  />
                  <Clock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel}>Location Address</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Full address of the venue"
                  {...register("location", { required: "Location is required" })}
                  className={`input-field !pl-10 ${errors.location ? 'error' : ''}`}
                />
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
              </div>
              {errors.location && (
                <span className={errorMsg}>
                  <AlertCircle className="h-3 w-3" /> {errors.location.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel}>Target Donors</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="100"
                  {...register("targetDonors", { 
                    required: "Target is required",
                    min: { value: 10, message: "Minimum 10 donors target" }
                  })}
                  className={`input-field !pl-10 ${errors.targetDonors ? 'error' : ''}`}
                />
                <Users className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
              </div>
              {errors.targetDonors && (
                <span className={errorMsg}>
                  <AlertCircle className="h-3 w-3" /> {errors.targetDonors.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel}>Description / Instructions (Optional)</label>
            <div className="relative">
              <textarea
                placeholder="Additional instructions for donors or volunteers..."
                rows="4"
                {...register("description")}
                className="input-field !pl-10 resize-none"
              />
              <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
            </div>
          </div>

          <button type="submit" className="btn-primary mt-4 w-full md:w-auto self-end" style={{ minHeight: 48, paddingLeft: '2rem', paddingRight: '2rem' }}>
            Submit for Approval
          </button>
        </form>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Camp Creation"
      >
        {formDataCache && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-[#5A5A5A] leading-relaxed text-center">
              Please double check the details below. This will be sent to the District Officer for final approval before being listed publicly.
            </p>

            <div className="bg-[#FAF8F5] p-4 border border-[#EDE7E1] rounded-2xl">
              <h3 className="font-bold text-[#1A1210] text-[16px] mb-1">{formDataCache.campName}</h3>
              <p className="text-[13px] text-[#5A5A5A] flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {formDataCache.location}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-[#3D2B2B]">
              <div>
                <span className="text-[#7A5F5F] block mb-0.5">Date</span>
                <span className="font-bold text-[#1A1210]">{formDataCache.date}</span>
              </div>
              <div>
                <span className="text-[#7A5F5F] block mb-0.5">Time</span>
                <span className="font-bold text-[#1A1210]">{formDataCache.startTime} - {formDataCache.endTime}</span>
              </div>
              <div>
                <span className="text-[#7A5F5F] block mb-0.5">Target Donors</span>
                <span className="font-bold text-[#BE1F2E]">{formDataCache.targetDonors}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-4 border-t border-[#EDE7E1] pt-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-1/2 px-4 py-2.5 rounded-full border border-[#EDE7E1] text-xs font-bold text-[#5A5A5A] hover:bg-[#FAF8F5] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="w-1/2 px-4 py-2.5 rounded-full bg-[#BE1F2E] hover:bg-[#9E1825] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Yes, Create Camp
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default CampCreation;
