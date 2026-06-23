import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Building,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export const HospitalProfile = () => {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      hospitalName: 'Apex City Hospital',
      licenseNumber: 'LIC-2024-9876',
      address: '123 Health Avenue, Central District, New Delhi',
      contactPhone: '+91 98765 43210',
      contactEmail: 'admin@apexcity.hospital',
      emergencyContact: '+91 98765 00000',
    }
  });

  const onSubmit = (data) => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Hospital profile updated successfully.");
    }, 1000);
  };

  const fieldLabel = "text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block mb-2";
  const errorMsg = "text-[10px] text-[#BE1F2E] flex items-center gap-1 font-bold pl-1 mt-1.5";

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto animate-fade-in select-none">
      <div className="border-b border-[#EDE7E1] pb-6">
        <h1 className="font-serif text-[36px] md:text-[48px] italic leading-none mb-2 tracking-[-0.03em] text-[#1A1210]">
          Hospital Settings
        </h1>
        <p className="text-[14px] text-[#5A5A5A]">
          Manage hospital profile, licensing details, and primary contact information.
        </p>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-[#EDE7E1]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel}>Hospital Name</label>
              <div className="relative">
                <input
                  type="text"
                  {...register("hospitalName", { required: "Hospital name is required" })}
                  className={`input-field !pl-10 ${errors.hospitalName ? 'error' : ''}`}
                />
                <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
              </div>
              {errors.hospitalName && (
                <span className={errorMsg}>
                  <AlertCircle className="h-3 w-3" /> {errors.hospitalName.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel}>License Number</label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  {...register("licenseNumber")}
                  className="input-field !pl-10 bg-[#FAF8F5] text-[#5A5A5A]"
                />
                <ShieldCheck className="absolute left-3.5 top-3.5 h-4 w-4 text-[#22A06B]" />
              </div>
              <p className="text-[10px] text-[#7A5F5F] ml-1 mt-1">Requires state admin approval to change.</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel}>Complete Address</label>
            <div className="relative">
              <input
                type="text"
                {...register("address", { required: "Address is required" })}
                className={`input-field !pl-10 ${errors.address ? 'error' : ''}`}
              />
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
            </div>
            {errors.address && (
              <span className={errorMsg}>
                <AlertCircle className="h-3 w-3" /> {errors.address.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel}>Contact Email</label>
              <div className="relative">
                <input
                  type="email"
                  {...register("contactEmail", { required: "Email is required" })}
                  className={`input-field !pl-10 ${errors.contactEmail ? 'error' : ''}`}
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
              </div>
              {errors.contactEmail && (
                <span className={errorMsg}>
                  <AlertCircle className="h-3 w-3" /> {errors.contactEmail.message}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={fieldLabel}>Primary Phone</label>
                <div className="relative">
                  <input
                    type="text"
                    {...register("contactPhone", { required: "Phone is required" })}
                    className={`input-field !pl-10 ${errors.contactPhone ? 'error' : ''}`}
                  />
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={fieldLabel}>Emergency Helpline</label>
                <div className="relative">
                  <input
                    type="text"
                    {...register("emergencyContact", { required: "Emergency number required" })}
                    className={`input-field !pl-10 ${errors.emergencyContact ? 'error' : ''}`}
                  />
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-[#BE1F2E]" />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="btn-primary mt-4 w-full md:w-auto self-end" 
            style={{ minHeight: 48, paddingLeft: '2rem', paddingRight: '2rem' }}
          >
            {isSaving ? "Saving Changes..." : "Save Profile Settings"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default HospitalProfile;
