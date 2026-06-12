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
  HeartHandshake,
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
      expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 35 days from now
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
      navigate('/hospital/inventory');
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

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100">
          Update Stock / Add Bags
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Register new blood units received from donation camps, replacement donors, or peer lab transfers.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-3xl shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Blood Group & Units */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blood Group</label>
              <select
                {...register("bloodGroup", { required: "Blood group is required" })}
                className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs font-semibold text-slate-855 focus:ring-2 focus:ring-rose-500/20 focus:outline-none cursor-pointer"
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {errors.bloodGroup && (
                <span className="text-[10px] text-rose-500 flex items-center gap-1 font-bold mt-0.5">
                  <AlertCircle className="h-3 w-3" /> {errors.bloodGroup.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity (Units)</label>
              <input
                type="number"
                placeholder="10"
                {...register("units", {
                  required: "Quantity is required",
                  min: { value: 1, message: "Minimum quantity is 1 unit" }
                })}
                className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
              />
              {errors.units && (
                <span className="text-[10px] text-rose-500 flex items-center gap-1 font-bold mt-0.5">
                  <AlertCircle className="h-3 w-3" /> {errors.units.message}
                </span>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Collection Date</label>
              <div className="relative">
                <input
                  type="date"
                  {...register("collectionDate", {
                    required: "Collection date is required",
                    validate: val => new Date(val) <= new Date() || "Collection date cannot be in the future"
                  })}
                  className="px-4 py-3 pl-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500/20 focus:outline-none w-full"
                />
                <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
              {errors.collectionDate && (
                <span className="text-[10px] text-rose-500 flex items-center gap-1 font-bold mt-0.5">
                  <AlertCircle className="h-3 w-3" /> {errors.collectionDate.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry Date</label>
              <div className="relative">
                <input
                  type="date"
                  {...register("expiryDate", {
                    required: "Expiry date is required",
                    validate: val => new Date(val) > new Date(watchCollectionDate) || "Expiry date must be after the collection date"
                  })}
                  className="px-4 py-3 pl-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500/20 focus:outline-none w-full"
                />
                <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
              {errors.expiryDate && (
                <span className="text-[10px] text-rose-500 flex items-center gap-1 font-bold mt-0.5">
                  <AlertCircle className="h-3 w-3" /> {errors.expiryDate.message}
                </span>
              )}
            </div>
          </div>

          {/* Source */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Supply Source</label>
            <div className="relative">
              <select
                {...register("source", { required: "Supply source is required" })}
                className="px-4 py-3 pl-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500/20 focus:outline-none w-full cursor-pointer"
              >
                <option value="Voluntary Donation">Voluntary Donation</option>
                <option value="Replacement Donation">Replacement Donation</option>
                <option value="Apex Lab Transfer">Apex Lab Transfer</option>
                <option value="Emergency Camp">Emergency Camp</option>
              </select>
              <Layers className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
            {errors.source && (
              <span className="text-[10px] text-rose-500 flex items-center gap-1 font-bold mt-0.5">
                <AlertCircle className="h-3 w-3" /> {errors.source.message}
              </span>
            )}
          </div>

          {/* Remarks */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Batch Remarks (Optional)</label>
            <div className="relative">
              <textarea
                placeholder="E.g., cold chain validated, screened for typical infections, unique donor reference..."
                rows="3"
                {...register("remarks")}
                className="px-4 py-3 pl-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-rose-500/20 focus:outline-none w-full resize-none"
              />
              <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 mt-2 px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-all shadow-lg shadow-rose-600/10 cursor-pointer active:scale-98"
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
            <p className="text-xs text-slate-500 leading-relaxed text-center">
              Please double check the details below. Once confirmed, this blood batch will be added to the registry and visible immediately across search tables.
            </p>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl flex items-center justify-between">
              <span className="text-4xl font-extrabold text-rose-600 font-outfit">
                {formDataCache.bloodGroup}
              </span>
              <div className="text-right">
                <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Quantity</span>
                <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {formDataCache.units} Units
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-600">
              <div>
                <span className="text-slate-400 block mb-0.5">Collection Date</span>
                <span className="font-bold text-slate-850 dark:text-slate-200">{formDataCache.collectionDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Expiry Date</span>
                <span className="font-bold text-slate-850 dark:text-slate-200">{formDataCache.expiryDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Supply Source</span>
                <span className="font-bold text-slate-850 dark:text-slate-200">{formDataCache.source}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Days Shelf Life</span>
                <span className="font-bold text-emerald-600">
                  {Math.round((new Date(formDataCache.expiryDate) - new Date(formDataCache.collectionDate)) / (1000 * 60 * 60 * 24))} Days
                </span>
              </div>
            </div>

            {formDataCache.remarks && (
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-250/50 dark:border-slate-800/40 rounded-xl text-xs">
                <span className="text-slate-450 block mb-0.5 font-semibold">Remarks</span>
                <p className="font-normal text-slate-700 dark:text-slate-300 leading-normal">{formDataCache.remarks}</p>
              </div>
            )}

            <div className="flex gap-3 mt-4 border-t border-slate-100 dark:border-slate-800/50 pt-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-1/2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                disabled={addStockMutation.isPending}
                className="w-1/2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
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
