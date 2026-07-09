import React, { useState, useEffect } from 'react';
import { hospitalApi } from '../../services/api';
import { Loader } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/ErrorState';
import { 
  Users, 
  Mail, 
  Phone, 
  UserCheck, 
  Shield, 
  Clock, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await hospitalApi.getStaffList();
      setStaff(data);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve staff members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  if (isLoading) {
    return <Loader message="Loading hospital staff list..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchStaff} />;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto animate-fade-in select-none" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Editorial Header */}
      <div className="flex justify-between items-end border-b border-[#EDE7E1] pb-6">
        <div>
          <h1 className="font-serif text-[36px] md:text-[48px] italic leading-none mb-2 tracking-[-0.03em] text-[#1A1210]">
            Staff Registry
          </h1>
          <p className="text-[14px] text-[#5A5A5A]">
            Overview of medical officers and laboratory staff registered for your hospital.
          </p>
        </div>
        <button 
          onClick={fetchStaff}
          className="p-2.5 rounded-2xl bg-white border border-[#EDE7E1] shadow-sm text-[#5A5A5A] hover:text-[#BE1F2E] cursor-pointer transition-all active:scale-95"
          title="Refresh List"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#EDE7E1] overflow-hidden">
        <div className="p-6 border-b border-[#EDE7E1] bg-[#FAF8F5] flex justify-between items-center">
          <div>
            <h3 className="text-[18px] font-[600] text-[#1A1210]">Active Staff Profiles</h3>
            <p className="text-[13px] text-[#7A5F5F] mt-1">Total {staff.length} staff members associated with this hospital.</p>
          </div>
        </div>

        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EDE7E1]">
                <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Name & Designation</th>
                <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Email</th>
                <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Phone</th>
                <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Status</th>
                <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Last Login</th>
                <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] text-right">Role</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(member => (
                <tr key={member.id} className="border-b border-[#EDE7E1] hover:bg-[#FAF8F5] transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E0DAD4] flex items-center justify-center text-[#5A5A5A]">
                        <UserCheck className="w-4 h-4 text-[#BE1F2E]" />
                      </div>
                      <div>
                        <p className="text-[13px] font-[600] text-[#1A1210]">{member.name}</p>
                        <p className="text-[11px] text-[#7A5F5F] mt-0.5">{member.designation || 'Medical Staff'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[13px] text-[#5A5A5A]">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-[#9A9A9A]" />
                      <span>{member.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[13px] text-[#5A5A5A]">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-[#9A9A9A]" />
                      <span>{member.phone || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {member.status === 'Active' ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-[600] text-[#22A06B]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22A06B]"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[12px] font-[600] text-[#E07B00]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E07B00]"></span>
                        {member.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-[12px] text-[#5A5A5A]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#9A9A9A]" />
                      <span>{member.last_login ? new Date(member.last_login).toLocaleString() : 'Never Logged In'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 bg-[#BE1F2E]/10 text-[#BE1F2E] text-[10px] font-[700] rounded-full uppercase tracking-wider">
                      {member.role}
                    </span>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-[#7A5F5F] text-[13px]">
                    No staff members found. Go to "Invite Staff" to add new medical staff members.
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

export default StaffList;
