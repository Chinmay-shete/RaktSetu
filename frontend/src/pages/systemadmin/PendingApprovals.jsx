import { useState } from 'react';
import { useSystemAdmin } from '../../context/SystemAdminContext';
import { Building2, ShieldAlert, Award, FileText, ThumbsUp, ThumbsDown } from 'lucide-react';

export const PendingApprovals = () => {
  const { 
    adminState, 
    approveHospital, 
    rejectHospital, 
    approveOfficer, 
    rejectOfficer 
  } = useSystemAdmin();

  const [activeTab, setActiveTab] = useState('hospitals');

  const pendingHospitals = adminState.pendingHospitals || [];
  const pendingOfficers = adminState.pendingOfficers || [];

  return (
    <div className="space-y-10 animate-page-enter">
      {/* Editorial Header */}
      <div>
        <span className="badge-sysadmin mb-2">Security Gates</span>
        <h1 className="font-serif text-[36px] md:text-[56px] font-normal text-[#1A1210] leading-tight mb-2" style={{ fontFeatureSettings: '"liga" 0' }}>
          Registration Review. <span className="italic">Onboarding requests.</span>
        </h1>
        <p className="text-[15px] text-[#5C403F] max-w-2xl">
          Review and approve access applications from hospitals seeking blood network access, and verify district health officers.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-[rgba(26,18,16,0.09)]">
        <button
          onClick={() => setActiveTab('hospitals')}
          className={`pb-4 px-6 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'hospitals'
              ? 'border-[#C8102E] text-[#C8102E]'
              : 'border-transparent text-[#9A9A9A] hover:text-[#5A5A5A]'
          }`}
        >
          <Building2 size={16} />
          <span>Hospitals ({pendingHospitals.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('officers')}
          className={`pb-4 px-6 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'officers'
              ? 'border-[#C8102E] text-[#C8102E]'
              : 'border-transparent text-[#9A9A9A] hover:text-[#5A5A5A]'
          }`}
        >
          <Award size={16} />
          <span>District Officers ({pendingOfficers.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-2xl p-8 shadow-sm">
        {activeTab === 'hospitals' ? (
          <div>
            {pendingHospitals.length === 0 ? (
              <div className="text-center py-12 text-[#9A9A9A] flex flex-col items-center justify-center gap-3">
                <ThumbsUp size={36} className="text-slate-300" />
                <p className="text-sm font-medium">No pending hospital registrations.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[rgba(26,18,16,0.09)] text-[10px] font-[700] uppercase tracking-widest text-[#9A9A9A]">
                      <th className="py-3 pr-4">Hospital Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">License / Registration Number</th>
                      <th className="py-3 px-4">Area / Zone</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">Requested</th>
                      <th className="py-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(26,18,16,0.09)] text-xs text-[#5A5A5A]">
                    {pendingHospitals.map(hospital => (
                      <tr key={hospital.id} className="table-row-hover">
                        <td className="py-4 pr-4 font-serif text-[15px] font-bold text-[#1A1210]">{hospital.name}</td>
                        <td className="py-4 px-4 font-semibold">{hospital.type}</td>
                        <td className="py-4 px-4 font-mono text-[11px] text-[#9A9A9A]">{hospital.licenseNo}</td>
                        <td className="py-4 px-4">{hospital.city}, {hospital.state}</td>
                        <td className="py-4 px-4 font-mono">{hospital.contact}</td>
                        <td className="py-4 px-4 text-[#9A9A9A]">Recent</td>
                        <td className="py-4 pl-4 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => approveHospital(hospital.id)}
                            className="p-2 bg-green-50 border border-green-100 hover:bg-green-100 text-[#22A06B] rounded-lg transition-all cursor-pointer"
                            title="Approve Hospital"
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button
                            onClick={() => rejectHospital(hospital.id)}
                            className="p-2 bg-red-50 border border-red-100 hover:bg-red-100 text-[#C8102E] rounded-lg transition-all cursor-pointer"
                            title="Reject Hospital"
                          >
                            <ThumbsDown size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            {pendingOfficers.length === 0 ? (
              <div className="text-center py-12 text-[#9A9A9A] flex flex-col items-center justify-center gap-3">
                <ThumbsUp size={36} className="text-slate-300" />
                <p className="text-sm font-medium">No pending officer applications.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[rgba(26,18,16,0.09)] text-[10px] font-[700] uppercase tracking-widest text-[#9A9A9A]">
                      <th className="py-3 pr-4">Officer Name</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4">District jurisdiction</th>
                      <th className="py-3 px-4">Government Email</th>
                      <th className="py-3 px-4">Requested</th>
                      <th className="py-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(26,18,16,0.09)] text-xs text-[#5A5A5A]">
                    {pendingOfficers.map(officer => (
                      <tr key={officer.id} className="table-row-hover">
                        <td className="py-4 pr-4 font-serif text-[15px] font-bold text-[#1A1210]">{officer.name}</td>
                        <td className="py-4 px-4 font-semibold">{officer.designation}</td>
                        <td className="py-4 px-4">{officer.district} District</td>
                        <td className="py-4 px-4 font-mono text-slate-700 bg-slate-50 border border-[rgba(26,18,16,0.06)] rounded px-2 py-0.5">
                          {officer.email}
                        </td>
                        <td className="py-4 px-4 text-[#9A9A9A]">Recent</td>
                        <td className="py-4 pl-4 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => approveOfficer(officer.id)}
                            className="p-2 bg-green-50 border border-green-100 hover:bg-green-100 text-[#22A06B] rounded-lg transition-all cursor-pointer"
                            title="Approve User"
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button
                            onClick={() => rejectOfficer(officer.id)}
                            className="p-2 bg-red-50 border border-red-100 hover:bg-red-100 text-[#C8102E] rounded-lg transition-all cursor-pointer"
                            title="Suspend User"
                          >
                            <ThumbsDown size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
