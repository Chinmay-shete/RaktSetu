import { useState } from 'react';
import api from '../../services/api';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-[#EDE7E1] max-w-md w-full p-8 shadow-2xl space-y-6 relative overflow-hidden animate-page-enter">
        <div className="flex justify-between items-center pb-4 border-b border-[rgba(26,18,16,0.09)]">
          <h3 className="font-serif text-[22px] font-bold text-[#1A1210] italic">Change Password</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9A9A9A] hover:text-[#BE1F2E] transition-colors cursor-pointer border-none bg-transparent"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-[#BE1F2E] text-xs font-semibold rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-5 bg-green-50 border border-green-200 text-[#22A06B] rounded-2xl flex flex-col items-center gap-3 text-center font-sans">
            <span className="material-symbols-outlined text-[48px] animate-bounce">check_circle</span>
            <h4 className="font-bold text-sm text-[#1A1A1A]">Password Updated!</h4>
            <p className="text-xs text-[#5A5A5A]">Your password has been changed successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs text-[#5A5A5A]">
            <div>
              <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Current Password *</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">New Secure Password *</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Confirm New Password *</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-[rgba(26,18,16,0.06)]">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 border border-[#EDE7E1] rounded-xl font-[600] text-sm text-[#5A5A5A] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 btn-primary py-2.5 text-sm cursor-pointer"
                style={{ backgroundColor: 'var(--state, #BE1F2E)', borderColor: 'var(--state, #BE1F2E)' }}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
