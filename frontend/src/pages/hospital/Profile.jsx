import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { hospitalApi } from '../../services/api';
import { Loader } from '../../components/ui/Loader';
import { 
  User, 
  Building, 
  Lock, 
  Info, 
  RefreshCw 
} from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  const [hospitalProfile, setHospitalProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const fetchHospitalProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const data = await hospitalApi.getHospitalProfile();
      setHospitalProfile(data);
    } catch (e) {
      console.error('Failed to load hospital profile', e);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchHospitalProfile();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordSuccess("Password updated successfully!");
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const fieldLabel = "text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block mb-2";

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto animate-fade-in select-none" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Editorial Header */}
      <div className="border-b border-[#EDE7E1] pb-6 flex justify-between items-end">
        <div>
          <h1 className="font-serif text-[36px] md:text-[48px] italic leading-none mb-2 tracking-[-0.03em] text-[#1A1210]">
            Profile Settings
          </h1>
          <p className="text-[14px] text-[#5A5A5A]">
            Manage your personal credentials, view your hospital affiliation, and rotate security passwords.
          </p>
        </div>
        <button 
          onClick={fetchHospitalProfile}
          className="p-2.5 rounded-2xl bg-white border border-[#EDE7E1] shadow-sm text-[#5A5A5A] hover:text-[#BE1F2E] cursor-pointer transition-all active:scale-95"
          title="Refresh Profile"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Hand: Details bentos */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Personal Details */}
          <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-[#EDE7E1] space-y-6 font-sans">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#7A5F5F] flex items-center gap-2 pb-3 border-b border-[#EDE7E1]">
              <User className="h-4 w-4 text-[#BE1F2E]" />
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px]">
              <div>
                <span className="text-[#9A9A9A] block font-semibold text-[11px] uppercase tracking-wider mb-0.5">Full Name</span>
                <span className="font-bold text-[#1A1210] text-[15px]">{user?.name}</span>
              </div>
              <div>
                <span className="text-[#9A9A9A] block font-semibold text-[11px] uppercase tracking-wider mb-0.5">Designation / Role</span>
                <span className="font-bold text-[#1A1210] text-[15px]">{user?.designation} ({user?.role})</span>
              </div>
              <div>
                <span className="text-[#9A9A9A] block font-semibold text-[11px] uppercase tracking-wider mb-0.5">Email Address</span>
                <span className="font-bold text-[#1A1210] text-[15px]">{user?.email}</span>
              </div>
              <div>
                <span className="text-[#9A9A9A] block font-semibold text-[11px] uppercase tracking-wider mb-0.5">Phone Number</span>
                <span className="font-bold text-[#1A1210] text-[15px]">{user?.phone || 'Not Configured'}</span>
              </div>
            </div>
          </div>

          {/* Hospital Affiliation */}
          <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-[#EDE7E1] space-y-6 font-sans">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#7A5F5F] flex items-center gap-2 pb-3 border-b border-[#EDE7E1]">
              <Building className="h-4 w-4 text-[#BE1F2E]" />
              Hospital Affiliation
            </h3>
            
            {isLoadingProfile ? (
              <div className="flex items-center justify-center p-8 gap-2 text-xs text-[#7A5F5F]">
                <RefreshCw className="h-4 w-4 animate-spin text-[#BE1F2E]" />
                <span>Loading hospital details...</span>
              </div>
            ) : hospitalProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px]">
                <div className="md:col-span-2">
                  <span className="text-[#9A9A9A] block font-semibold text-[11px] uppercase tracking-wider mb-0.5">Hospital Name</span>
                  <span className="font-bold text-[#1A1210] text-[16px]">{hospitalProfile.name}</span>
                </div>
                <div>
                  <span className="text-[#9A9A9A] block font-semibold text-[11px] uppercase tracking-wider mb-0.5">Registration License</span>
                  <span className="font-mono font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 inline-block mt-1 text-[13px]">{hospitalProfile.license_no}</span>
                </div>
                <div>
                  <span className="text-[#9A9A9A] block font-semibold text-[11px] uppercase tracking-wider mb-0.5">Hospital Type</span>
                  <span className="font-bold text-[#1A1210] text-[15px]">{hospitalProfile.type}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-[#9A9A9A] block font-semibold text-[11px] uppercase tracking-wider mb-0.5">Address</span>
                  <span className="font-bold text-[#1A1210] text-[15px]">{hospitalProfile.address}, {hospitalProfile.city}, {hospitalProfile.state} - {hospitalProfile.pincode}</span>
                </div>
                <div>
                  <span className="text-[#9A9A9A] block font-semibold text-[11px] uppercase tracking-wider mb-0.5">Contact Line</span>
                  <span className="font-bold text-[#1A1210] text-[15px]">{hospitalProfile.contact}</span>
                </div>
                <div>
                  <span className="text-[#9A9A9A] block font-semibold text-[11px] uppercase tracking-wider mb-0.5">Verification status</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-green-600 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {hospitalProfile.verification_status ? hospitalProfile.verification_status.charAt(0).toUpperCase() + hospitalProfile.verification_status.slice(1) : 'Verified'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-[#BE1F2E]">
                Failed to fetch associated hospital specifications.
              </div>
            )}
          </div>

        </div>

        {/* Right Hand: Change password card */}
        <div className="lg:col-span-5">
          <form onSubmit={handlePasswordChange} className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-[#EDE7E1] space-y-6 font-sans">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#7A5F5F] flex items-center gap-2 pb-3 border-b border-[#EDE7E1]">
              <Lock className="h-4 w-4 text-[#BE1F2E]" />
              Rotate Credentials
            </h3>

            {passwordError && (
              <div className="p-3.5 bg-red-50 text-[#BE1F2E] text-xs font-semibold rounded-xl flex items-center gap-2">
                <Info size={14} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3.5 bg-green-50 text-green-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <Info size={14} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={fieldLabel}>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="input-field py-3 px-4 text-xs"
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div>
                <label className={fieldLabel}>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="input-field py-3 px-4 text-xs"
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>
              <div>
                <label className={fieldLabel}>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="input-field py-3 px-4 text-xs"
                  placeholder="Repeat new password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="btn-primary w-full py-3.5 rounded-full text-xs font-bold cursor-pointer transition-all active:scale-95 disabled:opacity-50 mt-4"
              style={{ minHeight: 48 }}
            >
              {isChangingPassword ? 'Rotating Password...' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
