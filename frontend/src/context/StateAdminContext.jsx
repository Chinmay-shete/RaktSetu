import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
        escalationReports: [],
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
