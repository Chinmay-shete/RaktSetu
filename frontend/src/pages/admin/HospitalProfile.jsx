import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Building,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  AlertCircle,
  Key
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';

export const HospitalProfile = () => {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      hospitalName: '',
      licenseNumber: '',
      address: '',
      contactPhone: '',
      emergencyContact: '',
    }
  });

  const {
    register: registerPass,
    handleSubmit: handleSubmitPass,
    reset: resetPass,
    watch,
    formState: { errors: passErrors }
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  // Fetch live profile details on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/hospital/profile');
        const data = response.data;
        reset({
          hospitalName: data.name || '',
          licenseNumber: data.license_no || '',
          address: data.address || '',
          contactPhone: data.contact || '',
          emergencyContact: data.contact || '',
        });
      } catch (err) {
        toast.error("Failed to load hospital profile details.");
      }
    };
    fetchProfile();
  }, [reset, toast]);

  const onSubmitProfile = async (data) => {
    setIsSaving(true);
    try {
      await api.put('/hospital/profile', {
        name: data.hospitalName,
        address: data.address,
        contact: data.contactPhone
      });
      toast.success("Hospital profile updated successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmitPassword = async (data) => {
    setIsChangingPass(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success("Password changed successfully! Please log in again.");
      resetPass();
      // Auto logout to enforce sign in with new password
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/admin/login';
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setIsChangingPass(false);
    }
  };

  const fieldLabel = "text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block mb-2";
  const errorMsg = "text-[10px] text-[#BE1F2E] flex items-center gap-1 font-bold pl-1 mt-1.5";

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto animate-fade-in select-none" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="border-b border-[#EDE7E1] pb-6">
        <h1 className="font-serif text-[36px] md:text-[48px] italic leading-none mb-2 tracking-[-0.03em] text-[#1A1210]">
          Hospital Settings
        </h1>
        <p className="text-[14px] text-[#5A5A5A]">
          Manage hospital profile, licensing details, and primary contact information.
        </p>
      </div>

      {/* Profile Settings Card */}
      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-[#EDE7E1]">
        <h2 className="font-serif text-[22px] italic text-[#1A1210] mb-6">Profile Settings</h2>
        <form onSubmit={handleSubmit(onSubmitProfile)} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="hospital-name-1" className={fieldLabel}>Hospital Name</label>
              <div className="relative">
                <input id="hospital-name-1"
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
              <label htmlFor="license-number-2" className={fieldLabel}>License Number</label>
              <div className="relative">
                <input id="license-number-2"
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
            <label htmlFor="complete-address-3" className={fieldLabel}>Complete Address</label>
            <div className="relative">
              <input id="complete-address-3"
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
              <label htmlFor="primary-phone-5" className={fieldLabel}>Primary Phone</label>
              <div className="relative">
                <input id="primary-phone-5"
                  type="text"
                  {...register("contactPhone", { required: "Phone is required" })}
                  className={`input-field !pl-10 ${errors.contactPhone ? 'error' : ''}`}
                />
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
              </div>
              {errors.contactPhone && (
                <span className={errorMsg}>
                  <AlertCircle className="h-3 w-3" /> {errors.contactPhone.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="emergency-helpline-6" className={fieldLabel}>Emergency Helpline</label>
              <div className="relative">
                <input id="emergency-helpline-6"
                  type="text"
                  {...register("emergencyContact", { required: "Emergency number required" })}
                  className={`input-field !pl-10 ${errors.emergencyContact ? 'error' : ''}`}
                />
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-[#BE1F2E]" />
              </div>
              {errors.emergencyContact && (
                <span className={errorMsg}>
                  <AlertCircle className="h-3 w-3" /> {errors.emergencyContact.message}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary mt-4 w-full md:w-auto self-end animate-press"
            style={{ minHeight: 48, paddingLeft: '2rem', paddingRight: '2rem' }}
          >
            {isSaving ? "Saving Changes..." : "Save Profile Settings"}
          </button>
        </form>
      </div>

      {/* Password Rotation Card */}
      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-[#EDE7E1] mb-12">
        <h2 className="font-serif text-[22px] italic text-[#1A1210] mb-6 flex items-center gap-2">
          <Key className="text-[#BE1F2E]" size={22} />
          <span>Security & Password Rotation</span>
        </h2>
        <p className="text-[13px] text-[#737373] mb-6">
          Rotate your account password regularly to keep patient and blood bank data secure.
        </p>

        <form onSubmit={handleSubmitPass(onSubmitPassword)} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="current-password-7" className={fieldLabel}>Current Password</label>
              <input id="current-password-7"
                type="password"
                {...registerPass("currentPassword", { required: "Current password is required" })}
                placeholder="••••••••"
                className={`input-field ${passErrors.currentPassword ? 'error' : ''}`}
              />
              {passErrors.currentPassword && (
                <span className={errorMsg}>
                  <AlertCircle className="h-3 w-3" /> {passErrors.currentPassword.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="new-password-8" className={fieldLabel}>New Password</label>
              <input id="new-password-8"
                type="password"
                {...registerPass("newPassword", {
                  required: "New password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" }
                })}
                placeholder="••••••••"
                className={`input-field ${passErrors.newPassword ? 'error' : ''}`}
              />
              {passErrors.newPassword && (
                <span className={errorMsg}>
                  <AlertCircle className="h-3 w-3" /> {passErrors.newPassword.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm-new-password-9" className={fieldLabel}>Confirm New Password</label>
              <input id="confirm-new-password-9"
                type="password"
                {...registerPass("confirmPassword", {
                  required: "Please confirm your new password",
                  validate: (val) => val === watch('newPassword') || "Passwords do not match"
                })}
                placeholder="••••••••"
                className={`input-field ${passErrors.confirmPassword ? 'error' : ''}`}
              />
              {passErrors.confirmPassword && (
                <span className={errorMsg}>
                  <AlertCircle className="h-3 w-3" /> {passErrors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPass}
            className="btn-primary mt-4 w-full md:w-auto self-end animate-press"
            style={{ minHeight: 48, paddingLeft: '2rem', paddingRight: '2rem' }}
          >
            {isChangingPass ? "Rotating Password..." : "Rotate Account Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HospitalProfile;
