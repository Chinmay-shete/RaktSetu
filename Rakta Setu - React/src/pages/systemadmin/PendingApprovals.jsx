import React, { useState } from 'react';
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

  const pendingHospitals = adminState.pendingHospitals;
  const pendingOfficers = adminState.pendingOfficers;

  return (
    <div className="space-y-10 animate-page-enter">
      {/* Editorial Header */}
      <div>
        <span className="badge-sysadmin mb-2">Security Gates</span>
        <h1 className="font-serif text-[44px] md:text-[56px] font-[700] text-[#1A0A0A] leading-tight mb-2" style={{ fontFeatureSettings: '"liga" 0' }}>
          Registration Review. <span className="italic font-normal">Onboarding requests.</span>
        </h1>
        <p className="text-[15px] text-[#5A5A5A] max-w-2xl">
          Review and approve access applications from hospitals seeking blood network access, and verify district health officers.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-[#E0DAD4]">
        <button
          onClick={() => setActiveTab('hospitals')}
          className={`pb-4 px-6 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'hospitals'
              ? 'border-[#475569] text-[#475569]'
              : 'border-transparent text-[#9A9A9A] hover:text-[#5A5A5A]'
          }`}
        >
          <Building2 size={16} />
          <span>Hospitals ({pendingHospitals.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('officers')}
          className={`pb-4 px-6 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'officers'
              ? 'border-[#475569] text-[#475569]'
              : 'border-transparent text-[#9A9A9A] hover:text-[#5A5A5A]'
          }`}
        >
          <Award size={16} />
          <span>District Officers ({pendingOfficers.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-[#EDE7E1] rounded-2xl p-8 shadow-sm">
        {activeTab === 'hospitals' ? (
          <div>
            {pendingHospitals.length === 0 ? (
              <div className="text-center py-12 text-[#9A9A9A] flex flex-col items-center justify-center gap-3">
                <ThumbsUp size={36} className="text-slate-300" />
                <p className="text-sm font-medium">No pending hospital registrations.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#EDE7E1] text-[10px] font-[700] uppercase tracking-widest text-[#9A9A9A]">
                      <th className="py-3 pr-4">Hospital Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">License / Registration Number</th>
                      <th className="py-3 px-4">Area / Zone</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">Requested</th>
                      <th className="py-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE7E1] text-xs text-[#5A5A5A]">
                    {pendingHospitals.map(hospital => (
                      <tr key={hospital.id} className="table-row-hover">
                        <td className="py-4 pr-4 font-serif text-[15px] font-bold text-[#1A1A1A]">{hospital.name}</td>
                        <td className="py-4 px-4 font-semibold">{hospital.type}</td>
                        <td className="py-4 px-4 font-mono font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded px-2.5 py-1 inline-block mt-2">
                          {hospital.licenseNo}
                        </td>
                        <td className="py-4 px-4">{hospital.area}</td>
                        <td className="py-4 px-4">{hospital.contact}</td>
                        <td className="py-4 px-4 text-[#9A9A9A]">{hospital.appliedAt}</td>
                        <td className="py-4 pl-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => approveHospital(hospital.id)}
                              className="p-2 rounded-lg bg-green-50 text-[#22A06B] hover:bg-green-100 transition-colors flex items-center justify-center"
                              title="Approve Hospital"
                            >
                              <ThumbsUp size={16} />
                            </button>
                            <button 
                              onClick={() => rejectHospital(hospital.id)}
                              className="p-2 rounded-lg bg-red-50 text-[#BE1F2E] hover:bg-red-100 transition-colors flex items-center justify-center"
                              title="Reject Application"
                            >
                              <ThumbsDown size={16} />
                            </button>
                          </div>
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
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#EDE7E1] text-[10px] font-[700] uppercase tracking-widest text-[#9A9A9A]">
                      <th className="py-3 pr-4">Officer Name</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4">District jurisdiction</th>
                      <th className="py-3 px-4">Government Email</th>
                      <th className="py-3 px-4">Requested</th>
                      <th className="py-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE7E1] text-xs text-[#5A5A5A]">
                    {pendingOfficers.map(officer => (
                      <tr key={officer.id} className="table-row-hover">
                        <td className="py-4 pr-4 font-serif text-[15px] font-bold text-[#1A1A1A]">{officer.name}</td>
                        <td className="py-4 px-4 font-semibold">{officer.designation}</td>
                        <td className="py-4 px-4">{officer.district} District</td>
                        <td className="py-4 px-4 font-mono text-slate-700 bg-slate-50 border border-slate-100 rounded px-2 py-0.5">
                          {officer.email}
                        </td>
                        <td className="py-4 px-4 text-[#9A9A9A]">{officer.appliedAt}</td>
                        <td className="py-4 pl-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => approveOfficer(officer.id)}
                              className="p-2 rounded-lg bg-green-50 text-[#22A06B] hover:bg-green-100 transition-colors flex items-center justify-center"
                              title="Approve Officer"
                            >
                              <ThumbsUp size={16} />
                            </button>
                            <button 
                              onClick={() => rejectOfficer(officer.id)}
                              className="p-2 rounded-lg bg-red-50 text-[#BE1F2E] hover:bg-red-100 transition-colors flex items-center justify-center"
                              title="Reject Application"
                            >
                              <ThumbsDown size={16} />
                            </button>
                          </div>
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
