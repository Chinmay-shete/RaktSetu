import { useState } from 'react';
import { useSystemAdmin } from '../../context/SystemAdminContext';
import { Search, Shield, Ban, CheckCircle, UserCheck } from 'lucide-react';

export const UserManagement = () => {
  const { adminState, toggleUserStatus, changeUserRole, createStateAdmin } = useSystemAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', fullName: '', stateName: 'Maharashtra', designation: 'State Health Coordinator' });
  const [createResult, setCreateResult] = useState(null);
  const [createError, setCreateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateResult(null);
    setIsSubmitting(true);
    try {
      const res = await createStateAdmin(createForm);
      setCreateResult(res);
      setCreateForm({ email: '', fullName: '', stateName: 'Maharashtra', designation: 'State Health Coordinator' });
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create State Admin. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const users = adminState.users || [];

  // Filter users based on query and role
  const filteredUsers = users.filter(user => {
    const name = user.name || '';
    const email = user.email || '';
    const matchesSearch = 
      name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'sysadmin': return 'bg-slate-100 text-slate-700 border border-slate-200';
      case 'district': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'admin': return 'bg-green-50 text-green-700 border border-green-200';
      case 'staff': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'donor': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'badge-neutral';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'sysadmin': return 'System Admin';
      case 'district': return 'District Officer';
      case 'admin': return 'Hospital Admin';
      case 'staff': return 'Hospital Staff';
      case 'donor': return 'Blood Donor';
      default: return role;
    }
  };

  return (
    <div className="space-y-10 animate-page-enter">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="badge-sysadmin mb-2">User Registry</span>
          <h1 className="font-serif text-[36px] md:text-[56px] font-normal text-[#1A1210] leading-tight mb-2" style={{ fontFeatureSettings: '"liga" 0' }}>
            User Accounts. <span className="italic">Manage access.</span>
          </h1>
          <p className="text-[15px] text-[#5C403F] max-w-2xl">
            Directory of all system users. Update user roles, inspect last-active times, and manage status logs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 md:self-end px-5 py-3 text-sm shrink-0"
        >
          <UserCheck size={18} />
          <span>Create State Admin</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-[rgba(26,18,16,0.09)] rounded-2xl p-6 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md input-with-icon">
          <span className="absolute inset-y-0 left-4 flex items-center text-[#9A9A9A] input-icon">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="input-field !pl-12"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Role Filter */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <label htmlFor="filter-role-1" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] whitespace-nowrap">Filter Role:</label>
          <div className="relative w-full md:w-48">
            <select id="filter-role-1"
              className="input-field custom-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="sysadmin">System Admin</option>
              <option value="district">District Officer</option>
              <option value="admin">Hospital Admin</option>
              <option value="staff">Hospital Staff</option>
              <option value="donor">Blood Donor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-2xl p-8 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(26,18,16,0.09)] text-[10px] font-[700] uppercase tracking-widest text-[#9A9A9A]">
                <th className="py-3 pr-4">User Details</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Change Role</th>
                <th className="py-3 pl-4 text-right">Toggle Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(26,18,16,0.09)] text-xs text-[#5A5A5A]">
              {filteredUsers.map(user => (
                <tr key={user.id} className="table-row-hover">
                  
                  {/* Name and Email */}
                  <td className="py-4 pr-4">
                    <div className="font-serif text-[15px] font-bold text-[#1A1A1A] mb-0.5">{user.name}</div>
                    <div className="font-mono text-[11px] text-[#9A9A9A]">{user.email}</div>
                  </td>

                  {/* Role Badge */}
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${getRoleBadgeClass(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>

                  {/* Designation */}
                  <td className="py-4 px-4 font-medium text-[#1A1A1A]">
                    {user.designation}
                  </td>

                  {/* Last Active */}
                  <td className="py-4 px-4 text-[#9A9A9A]">
                    {user.lastActive}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    {user.status === 'Active' ? (
                      <span className="badge-success text-[10px]">Active</span>
                    ) : (
                      <span className="badge-danger text-[10px]">Suspended</span>
                    )}
                  </td>

                  {/* Change Role Dropdown */}
                  <td className="py-4 px-4">
                    <div className="relative w-36">
                      <select
                        className="input-field py-1 px-2.5 text-xs custom-select"
                        value={user.role}
                        onChange={(e) => changeUserRole(user.id, e.target.value)}
                        disabled={user.role === 'sysadmin'} // Prevent demoting final sysadmin
                        aria-label={`Change role for user ${user.name}`}
                      >
                        <option value="sysadmin">System Admin</option>
                        <option value="district">District Officer</option>
                        <option value="admin">Hospital Admin</option>
                        <option value="staff">Hospital Staff</option>
                        <option value="donor">Blood Donor</option>
                      </select>
                    </div>
                  </td>

                  {/* Toggle Status Button */}
                  <td className="py-4 pl-4 text-right">
                    {user.role === 'sysadmin' && user.email === 'admin@raktsetu.com' ? (
                      <span className="text-[#9A9A9A] text-[10px] italic">Superuser locked</span>
                    ) : (
                      <button type="button"
                        onClick={() => toggleUserStatus(user.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          user.status === 'Active'
                            ? 'bg-red-50 text-[#BE1F2E] border-[rgba(190,31,46,0.15)] hover:bg-red-100'
                            : 'bg-green-50 text-[#22A06B] border-[rgba(34,160,107,0.15)] hover:bg-green-100'
                        }`}
                      >
                        {user.status === 'Active' ? (
                          <>
                            <Ban size={14} />
                            <span>Suspend</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#9A9A9A]">
                    No users matching search filters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create State Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#EDE7E1] max-w-lg w-full p-8 shadow-2xl space-y-6 relative overflow-hidden animate-page-enter">
            <div className="flex justify-between items-center pb-4 border-b border-[rgba(26,18,16,0.09)]">
              <h3 className="font-serif text-[24px] italic text-[#1A1210]">Register New State Admin</h3>
              <button
                type="button"
                onClick={() => { setShowCreateModal(false); setCreateResult(null); setCreateError(''); }}
                className="text-[#9A9A9A] hover:text-[#BE1F2E] transition-colors cursor-pointer border-none bg-transparent"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {createError && (
              <div className="p-4 bg-red-50 border border-red-200 text-[#BE1F2E] text-xs font-semibold rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                <span>{createError}</span>
              </div>
            )}

            {createResult ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 text-[#22A06B] text-xs font-semibold rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>State Admin account registered successfully!</span>
                </div>

                <div className="bg-[#FAF8F5] border border-[#EDE7E1] rounded-xl p-5 font-sans space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#9A9A9A] tracking-wider block">Authorized Email</span>
                    <span className="text-sm font-semibold text-[#1A1A1A]">{createResult.user?.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#9A9A9A] tracking-wider block">State Jurisdiction</span>
                    <span className="text-sm font-semibold text-[#1A1A1A]">{createResult.user?.stateName}</span>
                  </div>
                  <div className="p-4 bg-[#fff6f5] border border-[#ffdad8] rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-[#BE1F2E] tracking-wider block mb-1">Temporary Login Password</span>
                    <span className="font-mono text-lg font-bold text-[#BE1F2E] tracking-wider">{createResult.tempPassword}</span>
                    <p className="text-[11px] text-[#737373] mt-2 leading-relaxed">
                      Please copy this password and share it with the administrator. They will be required to change it on their first login.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setCreateResult(null); }}
                  className="btn-primary w-full py-3"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs text-[#5A5A5A]">
                <div className="mb-2">
                  <label htmlFor="create-admin-name-1" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Full Name *</label>
                  <input id="create-admin-name-1"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Dr. Ramesh Gupta"
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm(p => ({ ...p, fullName: e.target.value }))}
                  />
                </div>

                <div className="mb-2">
                  <label htmlFor="create-admin-email-2" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Email Address *</label>
                  <input id="create-admin-email-2"
                    type="email"
                    required
                    className="input-field"
                    placeholder="e.g. ramesh.gupta@health.gov.in"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(p => ({ ...p, email: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="create-admin-state-3" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">State *</label>
                    <div className="relative">
                      <select id="create-admin-state-3"
                        className="input-field custom-select"
                        value={createForm.stateName}
                        onChange={(e) => setCreateForm(p => ({ ...p, stateName: e.target.value }))}
                      >
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Goa">Goa</option>
                        <option value="Karnataka">Karnataka</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="create-admin-desig-4" className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Designation *</label>
                    <input id="create-admin-desig-4"
                      type="text"
                      required
                      className="input-field"
                      placeholder="e.g. State Coordinator"
                      value={createForm.designation}
                      onChange={(e) => setCreateForm(p => ({ ...p, designation: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[rgba(26,18,16,0.09)] flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); setCreateError(''); }}
                    className="w-1/3 py-3 border border-[#D8D0CA] rounded-xl font-[600] text-sm text-[#5A5A5A] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 btn-primary py-3 flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Admin'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
