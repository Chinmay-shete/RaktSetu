import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const SystemAdminContext = createContext();

export const SystemAdminProvider = ({ children }) => {
  const [adminState, setAdminState] = useState(() => {
    const defaultState = {
      status: 'idle',
      adminDetails: null,
      pendingHospitals: [],
      pendingOfficers: [],
      users: [],
      auditLogs: [],
      featureFlags: {
        emergencyRouting: true,
        aiDemandForecasting: true,
        crossHospitalExpiryAutoTransfer: true,
      },
      systemHealth: {
        uptime: '99.98%',
        dbStatus: 'Connected',
        latency: '84ms',
        sentryErrors: 2,
        integrations: {
          firebase: 'Connected',
          twilio: 'Connected',
          maps: 'Connected',
        }
      }
    };
    const saved = localStorage.getItem('raktsetu_sysadmin_state');
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
    localStorage.setItem('raktsetu_sysadmin_state', JSON.stringify(adminState));
  }, [adminState]);

  // Sync state from localStorage in case user logged in via a different page (e.g. shared Login.jsx)
  useEffect(() => {
    if (adminState.status === 'idle') {
      const saved = localStorage.getItem('raktsetu_sysadmin_state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.status === 'logged_in') {
            setAdminState(prev => ({ ...prev, ...parsed }));
          }
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [adminState.status]);

  const fetchAdminData = useCallback(async () => {
    if (adminState.status !== 'logged_in') return;
    setIsLoading(true);
    setError(null);
    try {
      const [dashRes, approvalsRes, usersRes, logsRes] = await Promise.all([
        api.get('/systemadmin/dashboard'),
        api.get('/systemadmin/pending-approvals'),
        api.get('/systemadmin/users'),
        api.get('/systemadmin/audit-logs')
      ]);

      setAdminState(prev => ({
        ...prev,
        pendingHospitals: approvalsRes.data.pendingHospitals || [],
        pendingOfficers: approvalsRes.data.pendingOfficers || [],
        users: usersRes.data || [],
        auditLogs: logsRes.data || [],
        systemHealth: {
          uptime: dashRes.data.uptime || '99.98%',
          dbStatus: dashRes.data.dbStatus || 'Connected',
          latency: dashRes.data.latency || '84ms',
          sentryErrors: 2,
          integrations: {
            firebase: 'Connected',
            twilio: 'Connected',
            maps: 'Connected',
          }
        }
      }));
    } catch (err) {
      console.error("Failed to fetch system admin data", err);
      setError("Failed to load system administration data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [adminState.status]);

  useEffect(() => {
    if (adminState.status === 'logged_in') {
      fetchAdminData();
    }
  }, [adminState.status, fetchAdminData]);

  const loginAdmin = (details) => {
    setAdminState(prev => ({
      ...prev,
      status: 'logged_in',
      adminDetails: details || {
        name: 'Vikram Malhotra',
        designation: 'Lead Systems Architect',
        email: 'admin@raktsetu.com',
      },
      auditLogs: [
        {
          id: Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actor: 'System Admin (admin@raktsetu.com)',
          action: 'Authorized system console login session',
          severity: 'Info',
          ipAddress: '192.168.1.102'
        },
        ...prev.auditLogs
      ]
    }));
  };

  const logoutAdmin = () => {
    setAdminState(prev => ({
      ...prev,
      status: 'idle',
      adminDetails: null,
      auditLogs: [
        {
          id: Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actor: 'System Admin (admin@raktsetu.com)',
          action: 'Terminated system console login session',
          severity: 'Info',
          ipAddress: '192.168.1.102'
        },
        ...prev.auditLogs
      ]
    }));
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('raktsetu_')) {
        localStorage.removeItem(key);
      }
    });
  };

  const approveHospital = async (id) => {
    try {
      await api.patch(`/systemadmin/hospitals/${id}/approve`, { status: 'verified' });
      fetchAdminData();
    } catch (err) {
      console.error("Failed to approve hospital", err);
    }
  };

  const rejectHospital = async (id) => {
    try {
      await api.patch(`/systemadmin/hospitals/${id}/approve`, { status: 'rejected' });
      fetchAdminData();
    } catch (err) {
      console.error("Failed to reject hospital", err);
    }
  };

  const approveOfficer = async (id) => {
    try {
      await api.patch(`/systemadmin/users/${id}`, { status: 'Active' });
      fetchAdminData();
    } catch (err) {
      console.error("Failed to approve officer", err);
    }
  };

  const rejectOfficer = async (id) => {
    try {
      await api.patch(`/systemadmin/users/${id}`, { status: 'Suspended' });
      fetchAdminData();
    } catch (err) {
      console.error("Failed to reject officer", err);
    }
  };

  const toggleUserStatus = async (id) => {
    const user = adminState.users.find(u => u.id === id);
    if (!user) return;
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await api.patch(`/systemadmin/users/${id}`, { status: newStatus });
      fetchAdminData();
    } catch (err) {
      console.error("Failed to toggle user status", err);
    }
  };

  const changeUserRole = async (id, newRole) => {
    try {
      await api.patch(`/systemadmin/users/${id}`, { role: newRole });
      fetchAdminData();
    } catch (err) {
      console.error("Failed to change user role", err);
    }
  };

  const toggleFeatureFlag = (flagName) => {
    setAdminState(prev => {
      const newVal = !prev.featureFlags[flagName];
      return {
        ...prev,
        featureFlags: {
          ...prev.featureFlags,
          [flagName]: newVal
        },
        auditLogs: [
          {
            id: Date.now(),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            actor: 'System Admin (admin@raktsetu.com)',
            action: `Toggled feature flag '${flagName}' to ${newVal ? 'ENABLED' : 'DISABLED'}`,
            severity: 'Info',
            ipAddress: '192.168.1.102'
          },
          ...prev.auditLogs
        ]
      };
    });
  };

  const triggerBackup = () => {
    // Generate JSON download for backup demo
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(adminState));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `raktsetu_system_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setAdminState(prev => ({
      ...prev,
      auditLogs: [
        {
          id: Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actor: 'System Admin (admin@raktsetu.com)',
          action: 'Manually triggered full database backup',
          severity: 'Info',
          ipAddress: '192.168.1.102'
        },
        ...prev.auditLogs
      ]
    }));
  };

  const testIntegration = (key) => {
    setAdminState(prev => {
      const statuses = { ...prev.systemHealth.integrations };
      statuses[key] = 'Testing...';
      return {
        ...prev,
        systemHealth: {
          ...prev.systemHealth,
          integrations: statuses
        }
      };
    });

    setTimeout(() => {
      setAdminState(prev => {
        const statuses = { ...prev.systemHealth.integrations };
        statuses[key] = 'Connected';
        return {
          ...prev,
          systemHealth: {
            ...prev.systemHealth,
            integrations: statuses
          },
          auditLogs: [
            {
              id: Date.now(),
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
              actor: 'System Admin (admin@raktsetu.com)',
              action: `Completed integration ping check for: ${key}`,
              severity: 'Info',
              ipAddress: '192.168.1.102'
            },
            ...prev.auditLogs
          ]
        };
      });
    }, 1000);
  };

  return (
    <SystemAdminContext.Provider value={{
      adminState,
      loginAdmin,
      logoutAdmin,
      approveHospital,
      rejectHospital,
      approveOfficer,
      rejectOfficer,
      toggleUserStatus,
      changeUserRole,
      toggleFeatureFlag,
      triggerBackup,
      testIntegration,
      isLoading,
      error,
      refetchData: fetchAdminData
    }}>
      {children}
    </SystemAdminContext.Provider>
  );
};

export const useSystemAdmin = () => {
  const context = useContext(SystemAdminContext);
  if (!context) throw new Error('useSystemAdmin must be used within a SystemAdminProvider');
  return context;
};
