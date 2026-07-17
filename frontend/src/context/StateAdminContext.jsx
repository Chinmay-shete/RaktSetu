import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const StateAdminContext = createContext();

// 15 Maharashtra districts with realistic mock blood supply data
export const StateAdminProvider = ({ children }) => {
  const [appState, setAppState] = useState(() => {
    const defaultState = {
      status: 'idle',
      officialDetails: null,
      districts: [],
      transfers: [],
      policyAlerts: [],
      escalationReports: [],
    };
    const saved = localStorage.getItem('raktsetu_state_admin');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultState, ...parsed };
      } catch (e) {
        return defaultState;
      }
    }
    return defaultState;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem('raktsetu_state_admin', JSON.stringify(appState));
  }, [appState]);

  // Sync state from localStorage in case user logged in via a different page (e.g. shared Login.jsx)
  useEffect(() => {
    if (appState.status === 'idle') {
      const saved = localStorage.getItem('raktsetu_state_admin');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.status === 'logged_in') {
            setAppState(prev => ({ ...prev, ...parsed }));
          }
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [appState.status]);

  const fetchStateData = useCallback(async () => {
    if (appState.status !== 'logged_in') return;
    setIsLoading(true);
    setError(null);
    try {
      // Fetch each endpoint independently so a single failure doesn't block the whole dashboard
      const safeGet = async (url, fallback) => {
        try {
          const res = await api.get(url);
          return res.data;
        } catch (err) {
          console.warn(`[StateAdmin] Failed to fetch ${url}:`, err?.response?.status, err?.message);
          return fallback;
        }
      };

      const [dashData, transfersData, alertsData] = await Promise.all([
        safeGet('/state/dashboard', { districtBreakdown: [] }),
        safeGet('/state/transfers', []),
        safeGet('/state/policy-alerts', [])
      ]);

      const mappedDistricts = (dashData.districtBreakdown || []).map(d => ({
        id: d.id,
        name: d.name,
        zone: d.zone || 'Western',
        hospitalsCount: d.hospitalsCount,
        hospitals: d.hospitalsCount,
        totalStock: d.totalStock,
        totalBags: d.totalStock,
        wastePercent: d.wastePercent || 4.5,
        escalations: d.activeEmergenciesCount || 0,
        status: d.status || 'Healthy',
        stock: d.stock || {},
        officerName: d.officerName || 'No Officer Assigned',
        officerEmail: d.officerEmail || '—',
        lat: d.lat ? parseFloat(d.lat) : null,
        lng: d.lng ? parseFloat(d.lng) : null
      }));

      const mappedTransfers = (Array.isArray(transfersData) ? transfersData : []).map(t => ({
        id: t.id,
        from: t.fromDistrictName || 'Mumbai',
        to: t.toDistrictName || 'Solapur',
        bloodGroup: t.bloodGroup || t.blood_group,
        units: t.units,
        status: t.status === 'pending' ? 'Pending Approval' : t.status === 'approved' ? 'Approved' : t.status,
        initiatedBy: t.initiatedBy || 'District Officer',
        date: t.date || '2026-06-24',
        reason: t.reason || 'Critical shortage alert'
      }));

      const mappedAlerts = (Array.isArray(alertsData) ? alertsData : []).map(a => ({
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
        escalationReports: [],
      }));
    } catch (err) {
      // Only show error if ALL requests failed completely
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

  const approveTransfer = async (transferId) => {
    try {
      await api.patch(`/state/transfers/${transferId}/approve`);
      setAppState(prev => ({
        ...prev,
        transfers: prev.transfers.map(t =>
          t.id === transferId ? { ...t, status: 'In Transit' } : t
        ),
      }));
    } catch (err) {
      console.error("Failed to approve transfer", err);
    }
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

  const syncState = useCallback(() => {
    const saved = localStorage.getItem('raktsetu_state_admin');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.status === 'logged_in') {
          setAppState(prev => {
            if (prev.status !== 'logged_in') {
              return { ...prev, ...parsed };
            }
            return prev;
          });
        }
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  const createDistrictOfficer = async (data) => {
    try {
      const response = await api.post('/state/district-officer', data);
      await fetchStateData();
      return response.data;
    } catch (err) {
      console.error("Failed to create district officer", err);
      throw err;
    }
  };

  return (
    <StateAdminContext.Provider value={{
      appState,
      loginStateAdmin,
      logoutStateAdmin,
      approveTransfer,
      resolveAlert,
      updateEscalationStatus,
      syncState,
      isLoading,
      error,
      refetchData: fetchStateData,
      createDistrictOfficer,
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
