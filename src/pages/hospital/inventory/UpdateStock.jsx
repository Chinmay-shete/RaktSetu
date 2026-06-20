import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '../../../services/mockApi';
import { useToast } from '../../../hooks/useToast';
import { Modal } from '../../../components/ui/Modal';
import {
  PlusCircle,
  Calendar,
  Layers,
  FileText,
  AlertCircle
} from 'lucide-react';

export const UpdateStock = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formDataCache, setFormDataCache] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      bloodGroup: 'O-',
      units: 10,
      collectionDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      source: 'Voluntary Donation',
      remarks: ''
    }
  });

  const watchCollectionDate = watch('collectionDate');

  const addStockMutation = useMutation({
    mutationFn: mockApi.addInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("New blood stock successfully added to inventory!");
      setShowConfirmModal(false);
      reset();
      navigate('/staff/inventory');
    },
    onError: () => {
      toast.error("An error occurred. Failed to register stock.");
    }
  });

  const onSubmit = (data) => {
    setFormDataCache(data);
    setShowConfirmModal(true);
  };

  const confirmSubmit = () => {
    if (formDataCache) {
      addStockMutation.mutate(formDataCache);
    }
  };

  const fieldLabel = "text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block mb-2";
  const errorMsg = "text-[10px] text-[#BE1F2E] flex items-center gap-1 font-bold pl-1 mt-1.5";

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto animate-fade-in select-none">
      {/* Editorial Header */}
      <div className="border-b border-[#EDE7E1] pb-6">
        <h1 className="font-serif text-[36px] md:text-[48px] italic leading-none mb-2 tracking-[-0.03em] text-[#1A1210]">
          Update Stock
        </h1>
        <p className="text-[14px] text-[#5A5A5A]">
          Register new blood units received from donation camps, replacement donors, or peer lab transfers.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#EDE7E1]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Blood Group & Units */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className={fieldLabel}>Quantity (Units)</label>
              <input
                type="number"
                placeholder="10"
                {...register("units", {
                  required: "Quantity is required",
                  min: { value: 1, message: "Minimum quantity is 1 unit" }
                })}
                className={`input-field ${errors.units ? 'error' : ''}`}
              />
              {errors.units && (
                <span className={errorMsg}>
                  <AlertCircle className="h-3 w-3" /> {errors.units.message}
                </span>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel}>Collection Date</label>
              <div className="relative">
                <input
                  type="date"
                  {...register("collectionDate", {
                    required: "Collection date is required",
                    validate: val => new Date(val) <= new Date() || "Collection date cannot be in the future"
                  })}
                  className={`input-field pl-10 ${errors.collectionDate ? 'error' : ''}`}
                />
                <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
              </div>
              {errors.collectionDate && (
                <span className={errorMsg}>
                  <AlertCircle className="h-3 w-3" /> {errors.collectionDate.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel}>Expiry Date</label>
              <div className="relative">
                <input
                  type="date"
                  {...register("expiryDate", {
                    required: "Expiry date is required",
                    validate: val => new Date(val) > new Date(watchCollectionDate) || "Expiry date must be after the collection date"
                  })}
                  className={`input-field pl-10 ${errors.expiryDate ? 'error' : ''}`}
                />
                <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
              </div>
              {errors.expiryDate && (
                <span className={errorMsg}>
                  <AlertCircle className="h-3 w-3" /> {errors.expiryDate.message}
                </span>
              )}
            </div>
          </div>

          {/* Source */}
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel}>Supply Source</label>
            <div className="relative">
              <select
                {...register("source", { required: "Supply source is required" })}
                className="input-field custom-select pl-10"
              >
                <option value="Voluntary Donation">Voluntary Donation</option>
                <option value="Replacement Donation">Replacement Donation</option>
                <option value="Apex Lab Transfer">Apex Lab Transfer</option>
                <option value="Emergency Camp">Emergency Camp</option>
              </select>
              <Layers className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F] pointer-events-none" />
            </div>
            {errors.source && (
              <span className={errorMsg}>
                <AlertCircle className="h-3 w-3" /> {errors.source.message}
              </span>
            )}
          </div>

          {/* Remarks */}
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel}>Batch Remarks (Optional)</label>
            <div className="relative">
              <textarea
                placeholder="E.g., cold chain validated, screened for typical infections, unique donor reference..."
                rows="3"
                {...register("remarks")}
                className="input-field pl-10 resize-none"
              />
              <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary mt-2 w-full"
            style={{ minHeight: 52 }}
          >
            <PlusCircle className="h-4 w-4" />
            Register Stock Batch
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Stock Entry"
      >
        {formDataCache && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-[#5A5A5A] leading-relaxed text-center">
              Please double check the details below. Once confirmed, this blood batch will be added to the registry and visible immediately across search tables.
            </p>

            <div className="bg-[#FAF8F5] p-4 border border-[#EDE7E1] rounded-2xl flex items-center justify-between">
              <span className="text-4xl font-extrabold text-[#BE1F2E] font-serif">
                {formDataCache.bloodGroup}
              </span>
              <div className="text-right">
                <span className="text-[11px] text-[#7A5F5F] block uppercase font-bold tracking-wider">Quantity</span>
                <span className="text-xl font-bold text-[#1A1210]">
                  {formDataCache.units} Units
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-[#3D2B2B]">
              <div>
                <span className="text-[#7A5F5F] block mb-0.5">Collection Date</span>
                <span className="font-bold text-[#1A1210]">{formDataCache.collectionDate}</span>
              </div>
              <div>
                <span className="text-[#7A5F5F] block mb-0.5">Expiry Date</span>
                <span className="font-bold text-[#1A1210]">{formDataCache.expiryDate}</span>
              </div>
              <div>
                <span className="text-[#7A5F5F] block mb-0.5">Supply Source</span>
                <span className="font-bold text-[#1A1210]">{formDataCache.source}</span>
              </div>
              <div>
                <span className="text-[#7A5F5F] block mb-0.5">Days Shelf Life</span>
                <span className="font-bold text-[#22A06B]">
                  {Math.round((new Date(formDataCache.expiryDate) - new Date(formDataCache.collectionDate)) / (1000 * 60 * 60 * 24))} Days
                </span>
              </div>
            </div>

            {formDataCache.remarks && (
              <div className="p-3 bg-white border border-[#EDE7E1] rounded-xl text-xs">
                <span className="text-[#7A5F5F] block mb-0.5 font-semibold">Remarks</span>
                <p className="font-normal text-[#3D2B2B] leading-normal">{formDataCache.remarks}</p>
              </div>
            )}

            <div className="flex gap-3 mt-4 border-t border-[#EDE7E1] pt-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-1/2 px-4 py-2.5 rounded-full border border-[#EDE7E1] text-xs font-bold text-[#5A5A5A] hover:bg-[#FAF8F5] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                disabled={addStockMutation.isPending}
                className="w-1/2 px-4 py-2.5 rounded-full bg-[#BE1F2E] hover:bg-[#9E1825] disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                {addStockMutation.isPending ? "Submitting..." : "Yes, Register"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default UpdateStock;
