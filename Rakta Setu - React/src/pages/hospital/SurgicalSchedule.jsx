import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { hospitalApi } from '../../services/api';
import { Loader } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  Calendar,
  Layers,
  AlertCircle,
  Stethoscope,
  Heart
} from 'lucide-react';

export const SurgicalSchedule = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formDataCache, setFormDataCache] = useState(null);

  const { data: schedules = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['surgicalSchedules'],
    queryFn: hospitalApi.getSurgicalSchedules
  });

  const createMutation = useMutation({
    mutationFn: hospitalApi.createSurgicalSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surgicalSchedules'] });
      toast.success("Surgical surgery logged successfully!");
      setShowConfirmModal(false);
      reset();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to log surgery schedule.';
      toast.error(msg);
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      surgeryDate: '',
      surgeryType: '',
      bloodGroup: 'O+',
      units: 2,
    }
  });

  React.useEffect(() => {
    const now = Date.now();
    reset({
      surgeryDate: new Date(now + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      surgeryType: '',
      bloodGroup: 'O+',
      units: 2,
    });
  }, [reset]);

  const onSubmit = (data) => {
    setFormDataCache(data);
    setShowConfirmModal(true);
  };

  const confirmSubmit = () => {
    if (formDataCache) {
      createMutation.mutate({
        surgeryDate: formDataCache.surgeryDate,
        surgeryType: formDataCache.surgeryType,
        bloodGroup: formDataCache.bloodGroup,
        units: parseInt(formDataCache.units, 10)
      });
    }
  };

  const fieldLabel = "text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block mb-2";
  const errorMsg = "text-[10px] text-[#BE1F2E] flex items-center gap-1 font-bold pl-1 mt-1.5";

  if (isLoading) {
    return <Loader message="Loading surgical schedules..." />;
  }

  if (isError) {
    return <ErrorState message="Failed to load surgical schedules." onRetry={refetch} />;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto animate-fade-in select-none">
      {/* Editorial Header */}
      <div className="border-b border-[#EDE7E1] pb-6">
        <h1 className="font-serif text-[36px] md:text-[48px] italic leading-none mb-2 tracking-[-0.03em] text-[#1A1210]">
          Surgical Schedule
        </h1>
        <p className="text-[14px] text-[#5A5A5A]">
          Log upcoming surgeries to feed the AI demand forecasting model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#EDE7E1]">
            <h3 className="text-[18px] font-[600] text-[#1A1210] mb-6">Log New Surgery</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className={fieldLabel}>Surgery Date</label>
                <div className="relative">
                  <input
                    type="date"
                    {...register("surgeryDate", {
                      required: "Surgery date is required",
                      validate: val => new Date(val) >= new Date(new Date().setHours(0,0,0,0)) || "Cannot schedule in the past"
                    })}
                    className={`input-field !pl-10 ${errors.surgeryDate ? 'error' : ''}`}
                  />
                  <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
                </div>
                {errors.surgeryDate && (
                  <span className={errorMsg}>
                    <AlertCircle className="h-3 w-3" /> {errors.surgeryDate.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={fieldLabel}>Surgery Type</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Cardiovascular"
                    {...register("surgeryType", { required: "Surgery type is required" })}
                    className={`input-field !pl-10 ${errors.surgeryType ? 'error' : ''}`}
                  />
                  <Stethoscope className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
                </div>
                {errors.surgeryType && (
                  <span className={errorMsg}>
                    <AlertCircle className="h-3 w-3" /> {errors.surgeryType.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={fieldLabel}>Blood Group</label>
                <select
                  {...register("bloodGroup", { required: "Blood group is required" })}
                  className="input-field custom-select"
                >
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.bloodGroup && (
                  <span className={errorMsg}>
                    <AlertCircle className="h-3 w-3" /> {errors.bloodGroup.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={fieldLabel}>Expected Blood Units</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="2"
                    {...register("units", {
                      required: "Quantity is required",
                      min: { value: 1, message: "Minimum quantity is 1 unit" }
                    })}
                    className={`input-field !pl-10 ${errors.units ? 'error' : ''}`}
                  />
                  <Layers className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
                </div>
                {errors.units && (
                  <span className={errorMsg}>
                    <AlertCircle className="h-3 w-3" /> {errors.units.message}
                  </span>
                )}
              </div>

              <button type="submit" className="btn-primary mt-2 w-full" style={{ minHeight: 48 }}>
                <Calendar className="h-4 w-4" />
                Schedule
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-[#EDE7E1] overflow-hidden">
            <div className="p-6 border-b border-[#EDE7E1] bg-[#FAF8F5]">
              <h3 className="text-[18px] font-[600] text-[#1A1210]">Scheduled Surgeries</h3>
              <p className="text-[13px] text-[#7A5F5F] mt-1">Upcoming operations requiring blood stock.</p>
            </div>
            <div className="overflow-x-auto p-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EDE7E1]">
                    <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Date</th>
                    <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Type</th>
                    <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Blood Group</th>
                    <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] text-right">Units Needed</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map(schedule => (
                    <tr key={schedule.id} className="border-b border-[#EDE7E1] hover:bg-[#FAF8F5] transition-colors">
                      <td className="px-4 py-4 text-[13px] font-[500] text-[#1A1210]">{schedule.surgeryDate}</td>
                      <td className="px-4 py-4 text-[13px] text-[#5A5A5A]">{schedule.surgeryType}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center justify-center px-2 py-1 bg-[#BE1F2E]/10 text-[#BE1F2E] text-[11px] font-[700] rounded uppercase tracking-wider">
                          {schedule.bloodGroup}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[13px] font-[600] text-[#1A1210] text-right">{schedule.units}</td>
                    </tr>
                  ))}
                  {schedules.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-12 text-center text-[#7A5F5F] text-[13px]">
                        No upcoming surgeries scheduled.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Surgery Schedule"
      >
        {formDataCache && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-[#5A5A5A] leading-relaxed text-center">
              Please double check the details below. This data will be used to improve AI blood demand forecasting.
            </p>

            <div className="bg-[#FAF8F5] p-4 border border-[#EDE7E1] rounded-2xl flex items-center justify-between">
              <span className="text-4xl font-extrabold text-[#BE1F2E] font-serif">
                {formDataCache.bloodGroup}
              </span>
              <div className="text-right">
                <span className="text-[11px] text-[#7A5F5F] block uppercase font-bold tracking-wider">Expected Units</span>
                <span className="text-xl font-bold text-[#1A1210]">
                  {formDataCache.units} Units
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-[#3D2B2B]">
              <div>
                <span className="text-[#7A5F5F] block mb-0.5">Surgery Date</span>
                <span className="font-bold text-[#1A1210]">{formDataCache.surgeryDate}</span>
              </div>
              <div>
                <span className="text-[#7A5F5F] block mb-0.5">Type</span>
                <span className="font-bold text-[#1A1210]">{formDataCache.surgeryType}</span>
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
                Yes, Schedule
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default SurgicalSchedule;
