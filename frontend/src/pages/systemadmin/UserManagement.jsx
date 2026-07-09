import { useState } from 'react';
import { useSystemAdmin } from '../../context/SystemAdminContext';
import { Search, Shield, Ban, CheckCircle, UserCheck } from 'lucide-react';

export const UserManagement = () => {
  const { adminState, toggleUserStatus, changeUserRole } = useSystemAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

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
      <div>
        <span className="badge-sysadmin mb-2">User Registry</span>
        <h1 className="font-serif text-[44px] md:text-[56px] font-[700] text-[#1A0A0A] leading-tight mb-2" style={{ fontFeatureSettings: '"liga" 0' }}>
          User Accounts. <span className="italic font-normal">Manage access.</span>
        </h1>
        <p className="text-[15px] text-[#5A5A5A] max-w-2xl">
          Directory of all system users. Update user roles, inspect last-active times, and manage status logs.
        </p>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-[#EDE7E1] rounded-2xl p-6 shadow-sm">
        
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
          <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] whitespace-nowrap">Filter Role:</label>
          <div className="relative w-full md:w-48">
            <select
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
      <div className="bg-white border border-[#EDE7E1] rounded-2xl p-8 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EDE7E1] text-[10px] font-[700] uppercase tracking-widest text-[#9A9A9A]">
                <th className="py-3 pr-4">User Details</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Change Role</th>
                <th className="py-3 pl-4 text-right">Toggle Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE7E1] text-xs text-[#5A5A5A]">
              {filteredUsers.map(user => (
                <tr key={user.id} className="table-row-hover">
                  
                  {/* Name and Email */}
                  <td className="py-4 pr-4">
                    <div className="font-serif text-[15px] font-bold text-[#1A1A1A] mb-0.5">{user.name}</div>
                    <div className="font-mono text-[11px] text-[#9A9A9A]">{user.email}</div>
                  </td>

                  {/* Role Badge */}
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getRoleBadgeClass(user.role)}`}>
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
                      <button
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
    </div>
  );
};
