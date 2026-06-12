import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../hooks/useToast';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileBadge,
  ShieldCheck,
  Edit2,
  Save,
  X,
  AlertCircle
} from 'lucide-react';

export const HospitalProfile = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [isEditMode, setIsEditMode] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      address: user.address,
      contact: user.contact,
      licenseNumber: user.licenseNumber
    }
  });

  const onSubmit = (data) => {
    updateProfile(data);
    setIsEditMode(false);
    toast.success("Hospital profile credentials updated successfully.");
  };

  const handleCancel = () => {
    reset();
    setIsEditMode(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100">
            Hospital Profile & Credentials
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your registered medical license, contact channels, and system coordinates.
          </p>
        </div>
        
        {!isEditMode && (
          <button
            onClick={() => setIsEditMode(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5" /> Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Logo Card */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col items-center text-center shadow-sm border border-slate-200/50 dark:border-slate-800/40">
          <div className="relative mb-4">
            <img
              src={user.logo}
              alt={user.name}
              className="w-28 h-28 rounded-3xl object-cover border-2 border-rose-500/20 shadow-md"
            />
            <span className="absolute bottom-[-6px] right-[-6px] bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow" title="Verified Registration">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>

          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 font-outfit leading-tight mb-1">
            {user.name}
          </h3>
          <span className="text-[10px] font-bold text-rose-650 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/15 uppercase">
            Blood Bank System Active
          </span>

          <div className="w-full border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-4 text-left flex flex-col gap-2">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Registration ID</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 select-all font-mono">{user.bloodBankId}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Security Level</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Regional Node #4</span>
            </div>
          </div>
        </div>

        {/* Right Column: Form Credentials Card */}
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/40">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full justify-between gap-5">
            <div className="flex flex-col gap-4">
              {/* Field 1: Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xxs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" /> Hospital Registered Name
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    {...register("name", { required: "Hospital name is required" })}
                    className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                ) : (
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-205 pl-1">{user.name}</span>
                )}
                {errors.name && <span className="text-[10px] text-rose-500 flex items-center gap-1 font-bold"><AlertCircle className="h-3 w-3" /> {errors.name.message}</span>}
              </div>

              {/* Field 2: Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xxs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> Primary Email Address
                </label>
                {isEditMode ? (
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                ) : (
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 pl-1">{user.email}</span>
                )}
                {errors.email && <span className="text-[10px] text-rose-500 flex items-center gap-1 font-bold"><AlertCircle className="h-3 w-3" /> {errors.email.message}</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Field 3: License */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xxs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1">
                    <FileBadge className="h-3.5 w-3.5 text-slate-400" /> Medical License Number
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      {...register("licenseNumber", { required: "License number is required" })}
                      className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs font-semibold text-slate-800 focus:outline-none"
                    />
                  ) : (
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 pl-1">{user.licenseNumber}</span>
                  )}
                  {errors.licenseNumber && <span className="text-[10px] text-rose-500 flex items-center gap-1 font-bold"><AlertCircle className="h-3 w-3" /> {errors.licenseNumber.message}</span>}
                </div>

                {/* Field 4: Contact */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xxs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> Dispatch Hotline
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      {...register("contact", { required: "Contact number is required" })}
                      className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs font-semibold text-slate-800 focus:outline-none"
                    />
                  ) : (
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 pl-1">{user.contact}</span>
                  )}
                  {errors.contact && <span className="text-[10px] text-rose-500 flex items-center gap-1 font-bold"><AlertCircle className="h-3 w-3" /> {errors.contact.message}</span>}
                </div>
              </div>

              {/* Field 5: Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xxs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> Physical Address
                </label>
                {isEditMode ? (
                  <textarea
                    rows="2"
                    {...register("address", { required: "Address is required" })}
                    className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs font-semibold text-slate-800 focus:outline-none resize-none"
                  />
                ) : (
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 pl-1 leading-relaxed">{user.address}</span>
                )}
                {errors.address && <span className="text-[10px] text-rose-500 flex items-center gap-1 font-bold"><AlertCircle className="h-3 w-3" /> {errors.address.message}</span>}
              </div>
            </div>

            {isEditMode && (
              <div className="flex gap-3 border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-1/2 px-4 py-2.5 rounded-2xl border border-slate-205 dark:border-slate-800 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/10"
                >
                  <Save className="h-3.5 w-3.5" /> Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
export default HospitalProfile;
