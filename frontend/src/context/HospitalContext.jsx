import React, { createContext, useContext, useState, useEffect } from 'react';

const HospitalContext = createContext();

export const HospitalProvider = ({ children }) => {
  const [appState, setAppState] = useState(() => {
    const defaultState = {
      status: 'idle', // 'idle', 'pending', 'approved', 'logged_in'
      hospitalDetails: null,
      invitedStaff: [],
      alertThresholds: {
        minStock: 20,
        maxStock: 200,
        criticalUnits: 10,
        expiryDays: 5,
        emergencyAlerts: true
      }
    };
    const saved = localStorage.getItem('raktsetu_admin_app_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Explicitly deep-merge alertThresholds to prevent partial overrides
        return {
          ...defaultState,
          ...parsed,
          alertThresholds: {
            ...defaultState.alertThresholds,
            ...(parsed.alertThresholds || {})
          }
        };
      } catch (e) {
        return defaultState;
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('raktsetu_admin_app_state', JSON.stringify(appState));
  }, [appState]);

  const submitApplication = (details) => {
    setAppState(prev => ({
      ...prev,
      status: 'pending',
      hospitalDetails: details
    }));
  };

  const approveApplication = () => {
    setAppState(prev => ({
      ...prev,
      status: 'approved'
    }));
  };

  const loginAdmin = () => {
    setAppState(prev => ({
      ...prev,
      status: 'logged_in'
    }));
  };

  const logoutAdmin = () => {
    setAppState(prev => ({
      ...prev,
      status: 'approved' // transition back to approved (so they can log in again)
    }));
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('raktsetu_')) {
        localStorage.removeItem(key);
      }
    });
  };

  const inviteStaffMember = (staff) => {
    setAppState(prev => ({
      ...prev,
      invitedStaff: [
        {
          id: Date.now(),
          ...staff,
          status: 'Pending',
          date: new Date().toISOString().split('T')[0]
        },
        ...prev.invitedStaff
      ]
    }));
  };

  const updateAlertThresholds = (thresholds) => {
    setAppState(prev => ({
      ...prev,
      alertThresholds: thresholds
    }));
  };

  const resetAll = () => {
    setAppState({
      status: 'idle',
      hospitalDetails: null,
      invitedStaff: [],
      alertThresholds: {
        minStock: 20,
        maxStock: 200,
        criticalUnits: 10,
        expiryDays: 5,
        emergencyAlerts: true
      }
    });
  };

  return (
    <HospitalContext.Provider value={{
      appState,
      submitApplication,
      approveApplication,
      loginAdmin,
      logoutAdmin,
      inviteStaffMember,
      updateAlertThresholds,
      resetAll
    }}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};