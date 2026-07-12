import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const DistrictContext = createContext();

export const DistrictProvider = ({ children }) => {
  const [appState, setAppState] = useState(() => {
    const defaultState = {
      status: 'idle',
      officerDetails: null,
      hospitals: [],
      alerts: [],
      camps: [],
    };
    const saved = localStorage.getItem('raktsetu_district_state');
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
    localStorage.setItem('raktsetu_district_state', JSON.stringify(appState));
  }, [appState]);

  // Sync state from localStorage in case user logged in via a different page (e.g. shared Login.jsx)
  useEffect(() => {
    if (appState.status === 'idle') {
      const saved = localStorage.getItem('raktsetu_district_state');
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

  const fetchDistrictData = useCallback(async () => {
    if (appState.status !== 'logged_in') return;
    setIsLoading(true);
    setError(null);
    try {
      const [hospRes, alertsRes, campsRes, pendingHospRes] = await Promise.all([
        api.get('/district/hospitals'),
        api.get('/district/alerts'),
        api.get('/district/camps'),
        api.get('/district/pending-hospitals')
      ]);

      const mappedCamps = (campsRes.data || []).map(camp => {
        let mappedStatus = 'Pending';
        if (camp.status === 'upcoming') {
          mappedStatus = 'Approved';
        } else if (camp.status === 'active') {
          mappedStatus = 'Pending';
        } else if (camp.status === 'cancelled') {
          mappedStatus = 'Rejected';
        } else if (camp.status === 'completed') {
          mappedStatus = 'Completed';
        }
        return {
          ...camp,
          status: mappedStatus
        };
      });

      setAppState(prev => ({
        ...prev,
        hospitals: hospRes.data || [],
        alerts: alertsRes.data || [],
        camps: mappedCamps,
        pendingHospitals: pendingHospRes.data || []
      }));
    } catch (err) {
      console.error("Failed to fetch district data from API", err);
      setError("Failed to load district data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [appState.status]);

  const approveHospital = async (id) => {
    try {
      await api.patch(`/district/hospitals/${id}/approve`);
      await fetchDistrictData();
    } catch (err) {
      console.error("Failed to approve hospital", err);
      throw err;
    }
  };

  const rejectHospital = async (id) => {
    try {
      await api.patch(`/district/hospitals/${id}/reject`);
      await fetchDistrictData();
    } catch (err) {
      console.error("Failed to reject hospital", err);
      throw err;
    }
  };

  useEffect(() => {
    if (appState.status === 'logged_in') {
      fetchDistrictData();
    }
  }, [appState.status, fetchDistrictData]);

  const loginOfficer = (details) => {
    setAppState(prev => ({
      ...prev,
      status: 'logged_in',
      officerDetails: details || {
        name: 'Rajesh Patil',
        designation: 'District Health Officer',
        district: 'Pune',
        email: 'officer@pune.gov.in',
      },
    }));
  };

  const logoutOfficer = () => {
    setAppState(prev => ({ ...prev, status: 'idle', officerDetails: null }));
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('raktsetu_')) {
        localStorage.removeItem(key);
      }
    });
  };

  const approveCamp = async (campId) => {
    try {
      await api.patch(`/district/camps/${campId}/status`, { status: 'upcoming' });
      setAppState(prev => ({
        ...prev,
        camps: prev.camps.map(c => c.id === campId ? { ...c, status: 'Approved' } : c),
      }));
    } catch (err) {
      console.error("Failed to approve camp", err);
    }
  };

  const rejectCamp = async (campId) => {
    try {
      await api.patch(`/district/camps/${campId}/status`, { status: 'cancelled' });
      setAppState(prev => ({
        ...prev,
        camps: prev.camps.map(c => c.id === campId ? { ...c, status: 'Rejected' } : c),
      }));
    } catch (err) {
      console.error("Failed to reject camp", err);
    }
  };

  const addCamp = async (camp) => {
    try {
      const payload = {
        name: camp.name,
        campDate: camp.date,
        address: camp.location,
        lat: 18.5204,
        lng: 73.8567,
        organizer: camp.organizer,
        capacity: camp.capacity,
        expectedDonors: camp.expectedDonors
      };
      const response = await api.post('/district/camps', payload);
      const created = response.data;
      
      let mappedStatus = 'Pending';
      if (created.status === 'upcoming') {
        mappedStatus = 'Approved';
      } else if (created.status === 'active') {
        mappedStatus = 'Pending';
      } else if (created.status === 'cancelled') {
        mappedStatus = 'Rejected';
      } else if (created.status === 'completed') {
        mappedStatus = 'Completed';
      }

      setAppState(prev => ({
        ...prev,
        camps: [{ ...created, status: mappedStatus }, ...prev.camps],
      }));
    } catch (err) {
      console.error("Failed to add camp", err);
    }
  };

  const resolveAlert = (alertId) => {
    setAppState(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === alertId ? { ...a, status: 'Resolved' } : a),
    }));
  };

  const syncState = useCallback(() => {
    const saved = localStorage.getItem('raktsetu_district_state');
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

  return (
    <DistrictContext.Provider value={{
      appState,
      loginOfficer,
      logoutOfficer,
      approveCamp,
      rejectCamp,
      addCamp,
      resolveAlert,
      syncState,
      isLoading,
      error,
      refetchData: fetchDistrictData,
      approveHospital,
      rejectHospital,
    }}>
      {children}
    </DistrictContext.Provider>
  );
};

export const useDistrict = () => {
  const context = useContext(DistrictContext);
  if (!context) throw new Error('useDistrict must be used within a DistrictProvider');
  return context;
};
