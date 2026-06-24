import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const StateAdminContext = createContext();

// 15 Maharashtra districts with realistic mock blood supply data
const MOCK_DISTRICTS = [
  {
    id: 1, name: 'Pune', officerName: 'Rajesh Patil', zone: 'Western', hospitals: 8,
    totalBags: 384, wastePercent: 4.2, status: 'Healthy',
    stock: { 'O+': 92, 'O-': 31, 'A+': 78, 'A-': 29, 'B+': 68, 'B-': 24, 'AB+': 42, 'AB-': 20 },
    lastUpdated: '2 mins ago', escalations: 1,
  },
  {
    id: 2, name: 'Mumbai', officerName: 'Priya Sharma', zone: 'Coastal', hospitals: 14,
    totalBags: 621, wastePercent: 3.8, status: 'Healthy',
    stock: { 'O+': 145, 'O-': 52, 'A+': 121, 'A-': 46, 'B+': 108, 'B-': 38, 'AB+': 71, 'AB-': 40 },
    lastUpdated: '5 mins ago', escalations: 0,
  },
  {
    id: 3, name: 'Nashik', officerName: 'Suresh Jadhav', zone: 'Northern', hospitals: 6,
    totalBags: 198, wastePercent: 6.9, status: 'Watch',
    stock: { 'O+': 48, 'O-': 14, 'A+': 39, 'A-': 12, 'B+': 33, 'B-': 11, 'AB+': 22, 'AB-': 19 },
    lastUpdated: '8 mins ago', escalations: 2,
  },
  {
    id: 4, name: 'Aurangabad', officerName: 'Meena Kulkarni', zone: 'Marathwada', hospitals: 5,
    totalBags: 143, wastePercent: 8.1, status: 'Critical',
    stock: { 'O+': 34, 'O-': 6, 'A+': 27, 'A-': 8, 'B+': 23, 'B-': 4, 'AB+': 14, 'AB-': 27 },
    lastUpdated: '12 mins ago', escalations: 3,
  },
  {
    id: 5, name: 'Nagpur', officerName: 'Anand Bhosale', zone: 'Vidarbha', hospitals: 7,
    totalBags: 267, wastePercent: 5.2, status: 'Watch',
    stock: { 'O+': 63, 'O-': 22, 'A+': 53, 'A-': 18, 'B+': 47, 'B-': 16, 'AB+': 30, 'AB-': 18 },
    lastUpdated: '3 mins ago', escalations: 1,
  },
  {
    id: 6, name: 'Kolhapur', officerName: 'Seema Patil', zone: 'Southern', hospitals: 4,
    totalBags: 121, wastePercent: 3.5, status: 'Healthy',
    stock: { 'O+': 28, 'O-': 12, 'A+': 23, 'A-': 9, 'B+': 20, 'B-': 8, 'AB+': 13, 'AB-': 8 },
    lastUpdated: '6 mins ago', escalations: 0,
  },
  {
    id: 7, name: 'Solapur', officerName: 'Rajan Desai', zone: 'Eastern', hospitals: 4,
    totalBags: 98, wastePercent: 9.4, status: 'Critical',
    stock: { 'O+': 22, 'O-': 4, 'A+': 19, 'A-': 5, 'B+': 16, 'B-': 3, 'AB+': 10, 'AB-': 19 },
    lastUpdated: '20 mins ago', escalations: 4,
  },
  {
    id: 8, name: 'Sangli', officerName: 'Kavita More', zone: 'Southern', hospitals: 3,
    totalBags: 87, wastePercent: 4.8, status: 'Healthy',
    stock: { 'O+': 21, 'O-': 9, 'A+': 17, 'A-': 7, 'B+': 14, 'B-': 6, 'AB+': 9, 'AB-': 4 },
    lastUpdated: '15 mins ago', escalations: 0,
  },
  {
    id: 9, name: 'Satara', officerName: 'Nilesh Kamble', zone: 'Western', hospitals: 3,
    totalBags: 76, wastePercent: 5.6, status: 'Watch',
    stock: { 'O+': 18, 'O-': 7, 'A+': 15, 'A-': 5, 'B+': 13, 'B-': 5, 'AB+': 8, 'AB-': 5 },
    lastUpdated: '9 mins ago', escalations: 1,
  },
  {
    id: 10, name: 'Latur', officerName: 'Deepa Shirke', zone: 'Marathwada', hospitals: 3,
    totalBags: 62, wastePercent: 11.2, status: 'Critical',
    stock: { 'O+': 14, 'O-': 3, 'A+': 12, 'A-': 4, 'B+': 10, 'B-': 2, 'AB+': 6, 'AB-': 11 },
    lastUpdated: '25 mins ago', escalations: 3,
  },
  {
    id: 11, name: 'Amravati', officerName: 'Vijay Wagh', zone: 'Vidarbha', hospitals: 4,
    totalBags: 112, wastePercent: 6.3, status: 'Watch',
    stock: { 'O+': 26, 'O-': 10, 'A+': 22, 'A-': 8, 'B+': 19, 'B-': 7, 'AB+': 12, 'AB-': 8 },
    lastUpdated: '11 mins ago', escalations: 1,
  },
  {
    id: 12, name: 'Jalgaon', officerName: 'Smita Nair', zone: 'Northern', hospitals: 3,
    totalBags: 89, wastePercent: 4.1, status: 'Healthy',
    stock: { 'O+': 21, 'O-': 9, 'A+': 18, 'A-': 6, 'B+': 15, 'B-': 6, 'AB+': 10, 'AB-': 4 },
    lastUpdated: '7 mins ago', escalations: 0,
  },
  {
    id: 13, name: 'Dhule', officerName: 'Ashok Chavan', zone: 'Northern', hospitals: 2,
    totalBags: 54, wastePercent: 7.8, status: 'Watch',
    stock: { 'O+': 13, 'O-': 5, 'A+': 11, 'A-': 4, 'B+': 9, 'B-': 3, 'AB+': 6, 'AB-': 3 },
    lastUpdated: '18 mins ago', escalations: 1,
  },
  {
    id: 14, name: 'Akola', officerName: 'Nanda Deshpande', zone: 'Vidarbha', hospitals: 2,
    totalBags: 47, wastePercent: 9.0, status: 'Critical',
    stock: { 'O+': 11, 'O-': 2, 'A+': 9, 'A-': 3, 'B+': 8, 'B-': 2, 'AB+': 5, 'AB-': 7 },
    lastUpdated: '30 mins ago', escalations: 2,
  },
  {
    id: 15, name: 'Buldhana', officerName: 'Santosh Pawar', zone: 'Vidarbha', hospitals: 2,
    totalBags: 41, wastePercent: 8.4, status: 'Watch',
    stock: { 'O+': 10, 'O-': 3, 'A+': 8, 'A-': 3, 'B+': 7, 'B-': 2, 'AB+': 5, 'AB-': 3 },
    lastUpdated: '22 mins ago', escalations: 1,
  },
];

const MOCK_TRANSFERS = [
  { id: 1, from: 'Pune', to: 'Aurangabad', bloodGroup: 'O-', units: 20, status: 'In Transit', initiatedBy: 'System AI', date: '2026-06-20', reason: 'Critical shortage alert' },
  { id: 2, from: 'Mumbai', to: 'Solapur', bloodGroup: 'B-', units: 15, status: 'Pending Approval', initiatedBy: 'Solapur DO', date: '2026-06-20', reason: 'Surgical demand spike' },
  { id: 3, from: 'Nashik', to: 'Latur', bloodGroup: 'AB-', units: 10, status: 'Completed', initiatedBy: 'District Officer', date: '2026-06-19', reason: 'Emergency escalation' },
  { id: 4, from: 'Nagpur', to: 'Akola', bloodGroup: 'O+', units: 30, status: 'Completed', initiatedBy: 'System AI', date: '2026-06-19', reason: 'Expiry risk at Nagpur' },
  { id: 5, from: 'Kolhapur', to: 'Satara', bloodGroup: 'A-', units: 12, status: 'In Transit', initiatedBy: 'State Admin', date: '2026-06-20', reason: 'Shortage prediction' },
  { id: 6, from: 'Mumbai', to: 'Nashik', bloodGroup: 'B+', units: 25, status: 'Pending Approval', initiatedBy: 'State Admin', date: '2026-06-20', reason: 'Waste redistribution' },
];

const MOCK_POLICY_ALERTS = [
  { id: 1, districtId: 7, district: 'Solapur', severity: 'Critical', type: 'Shortage Threshold Breach', message: 'O- stock dropped below state policy minimum (5 units) across 3 hospitals. Intervention required.', date: '2026-06-20T08:15:00', status: 'Active' },
  { id: 2, districtId: 4, district: 'Aurangabad', severity: 'Critical', type: 'Waste KPI Breach', message: 'Monthly waste at 8.1% — exceeds state target of 5%. Second consecutive month above threshold.', date: '2026-06-20T07:40:00', status: 'Active' },
  { id: 3, districtId: 10, district: 'Latur', severity: 'Critical', type: 'Multiple Escalations', message: '3 district officer escalations unresolved in 48 hours. Requires State Health Dept. intervention.', date: '2026-06-19T16:00:00', status: 'Active' },
  { id: 4, districtId: 3, district: 'Nashik', severity: 'Warning', type: 'Waste KPI Watch', message: 'Waste at 6.9%. If trend continues, will breach 7% threshold within 10 days.', date: '2026-06-20T09:00:00', status: 'Active' },
  { id: 5, districtId: 14, district: 'Akola', severity: 'Warning', type: 'Donor Density Low', message: 'Registered active donors per 10,000 population: 2.1 (state avg: 4.8). Camp funding recommended.', date: '2026-06-19T12:30:00', status: 'Active' },
  { id: 6, districtId: 1, district: 'Pune', severity: 'Resolved', type: 'Shortage Threshold Breach', message: 'AB- shortage resolved after cross-district transfer from Mumbai.', date: '2026-06-18T14:00:00', status: 'Resolved' },
];

const MOCK_ESCALATION_REPORTS = [
  { id: 1, districtId: 7, district: 'Solapur', officerName: 'Rajan Desai', severity: 'Critical', title: 'O- Critical Depletion — 3 Hospitals', summary: '3 hospitals in Solapur district have O- stock below 5 units each. District-level transfer requests declined by neighboring districts due to their own shortages. Requesting state-level intervention.', date: '2026-06-20T08:00:00', status: 'Pending Response', requestedAction: 'Inter-district transfer from Mumbai or Pune' },
  { id: 2, districtId: 10, district: 'Latur', officerName: 'Deepa Shirke', severity: 'Critical', title: 'AB- Stock at State-Level Low', summary: 'Latur district AB- aggregate: 11 units across all hospitals. Cannot sustain current surgical load. Two upcoming open-heart surgeries have been pushed. Emergency camp planned but requires state funding approval.', date: '2026-06-19T16:00:00', status: 'In Review', requestedAction: 'Camp funding authorization + Mumbai transfer' },
  { id: 3, districtId: 4, district: 'Aurangabad', officerName: 'Meena Kulkarni', severity: 'Warning', title: 'Waste Rate Exceeds Policy Threshold', summary: 'Aurangabad district waste percentage at 8.1% for June (target: <5%). Primary cause: poor demand forecasting at Govt Medical College blood bank. Requesting audit support and system upgrade.', date: '2026-06-18T10:30:00', status: 'Action Taken', requestedAction: 'System audit + inventory software upgrade' },
  { id: 4, districtId: 3, district: 'Nashik', officerName: 'Suresh Jadhav', severity: 'Warning', title: 'Donor Activation Rate Declining', summary: 'Nashik district saw 23% decline in donor activations in June vs May. Camp attendance at 62% of target. Requesting additional donor outreach budget.', date: '2026-06-17T14:00:00', status: 'Pending Response', requestedAction: 'Marketing budget approval (₹2.5L)' },
];

export const StateAdminProvider = ({ children }) => {
  const [appState, setAppState] = useState(() => {
    const saved = localStorage.getItem('raktsetu_state_admin');
    return saved ? JSON.parse(saved) : {
      status: 'idle',
      officialDetails: null,
      districts: MOCK_DISTRICTS,
      transfers: MOCK_TRANSFERS,
      policyAlerts: MOCK_POLICY_ALERTS,
      escalationReports: MOCK_ESCALATION_REPORTS,
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem('raktsetu_state_admin', JSON.stringify(appState));
  }, [appState]);

  const fetchStateData = useCallback(async () => {
    if (appState.status !== 'logged_in') return;
    setIsLoading(true);
    setError(null);
    try {
      const [dashRes, transfersRes, alertsRes] = await Promise.all([
        api.get('/state/dashboard'),
        api.get('/state/transfers'),
        api.get('/state/policy-alerts')
      ]);

      const mappedDistricts = (dashRes.data.districtBreakdown || []).map(d => ({
        id: d.id,
        name: d.name,
        zone: d.zone || 'Western',
        hospitals: d.hospitalsCount,
        totalBags: d.totalStock,
        wastePercent: 4.5,
        escalations: d.activeEmergenciesCount,
        status: d.activeEmergenciesCount > 0 ? 'Critical' : d.totalStock < 150 ? 'Watch' : 'Healthy',
        stock: d.stock || {}
      }));

      const mappedTransfers = (transfersRes.data || []).map(t => ({
        id: t.id,
        from: t.from_district_name || 'Mumbai',
        to: t.to_district_name || 'Solapur',
        bloodGroup: t.blood_group,
        units: t.units,
        status: t.status === 'pending' ? 'Pending Approval' : t.status === 'approved' ? 'Approved' : t.status,
        initiatedBy: t.initiatedBy || 'District Officer',
        date: t.created_at ? t.created_at.substring(0, 10) : '2026-06-24',
        reason: t.reason || 'Critical shortage alert'
      }));

      const mappedAlerts = (alertsRes.data || []).map(a => ({
        id: a.id,
        districtId: a.districtId || 1,
        district: a.district_name || 'Pune',
        severity: a.severity || 'Warning',
        type: a.type || 'Shortage Alert',
        message: a.message,
        date: a.timestamp || new Date().toISOString(),
        status: a.status || 'Active'
      }));

      setAppState(prev => ({
        ...prev,
        districts: mappedDistricts,
        transfers: mappedTransfers,
        policyAlerts: mappedAlerts,
        escalationReports: MOCK_ESCALATION_REPORTS,
      }));
    } catch (err) {
      console.error("Failed to fetch state data from API", err);
      setError("Failed to load state health oversight data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [appState.status]);

  useEffect(() => {
    if (appState.status === 'logged_in') {
      fetchStateData();
    }
  }, [appState.status, fetchStateData]);

  const loginStateAdmin = (details) => {
    setAppState(prev => ({
      ...prev,
      status: 'logged_in',
      officialDetails: details || {
        name: 'Dr. Anita Deshmukh',
        designation: 'Principal Secretary, Health',
        state: 'Maharashtra',
        email: 'admin@health.maharashtra.gov.in',
      },
    }));
  };

  const logoutStateAdmin = () => {
    setAppState(prev => ({ ...prev, status: 'idle', officialDetails: null }));
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('raktsetu_')) {
        localStorage.removeItem(key);
      }
    });
  };

  const approveTransfer = (transferId) => {
    setAppState(prev => ({
      ...prev,
      transfers: prev.transfers.map(t =>
        t.id === transferId ? { ...t, status: 'In Transit' } : t
      ),
    }));
  };

  const resolveAlert = (alertId) => {
    setAppState(prev => ({
      ...prev,
      policyAlerts: prev.policyAlerts.map(a =>
        a.id === alertId ? { ...a, status: 'Resolved' } : a
      ),
    }));
  };

  const updateEscalationStatus = (reportId, newStatus) => {
    setAppState(prev => ({
      ...prev,
      escalationReports: prev.escalationReports.map(r =>
        r.id === reportId ? { ...r, status: newStatus } : r
      ),
    }));
  };

  return (
    <StateAdminContext.Provider value={{
      appState,
      loginStateAdmin,
      logoutStateAdmin,
      approveTransfer,
      resolveAlert,
      updateEscalationStatus,
      isLoading,
      error,
      refetchData: fetchStateData,
    }}>
      {children}
    </StateAdminContext.Provider>
  );
};

export const useStateAdmin = () => {
  const context = useContext(StateAdminContext);
  if (!context) throw new Error('useStateAdmin must be used within a StateAdminProvider');
  return context;
};
