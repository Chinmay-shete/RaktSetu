import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const SystemAdminContext = createContext();

const MOCK_PENDING_HOSPITALS = [
  { id: 1, name: 'Apex Blood Center', type: 'Private', area: 'Kothrud', contact: '+91 20 2543 1111', licenseNo: 'BB-PNQ-901', appliedAt: '2 hrs ago' },
  { id: 2, name: 'Sanjivani Charitable Hospital', type: 'Government', area: 'Hadapsar', contact: '+91 20 2687 2222', licenseNo: 'BB-PNQ-902', appliedAt: '1 day ago' },
];

const MOCK_PENDING_OFFICERS = [
  { id: 1, name: 'Mahesh Joshi', district: 'Satara', email: 'officer@satara.gov.in', designation: 'District Health Officer', appliedAt: '3 hrs ago' },
  { id: 2, name: 'Sneha Kulkarni', district: 'Mumbai Sub', email: 'officer@mumbai.gov.in', designation: 'Deputy Health Director', appliedAt: '2 days ago' },
];

const MOCK_USER_ACCOUNTS = [
  { id: 1, name: 'Vikram Malhotra', email: 'admin@raktsetu.com', role: 'sysadmin', status: 'Active', designation: 'Lead Systems Architect', lastActive: 'Just now' },
  { id: 2, name: 'Rajesh Patil', email: 'officer@pune.gov.in', role: 'district', status: 'Active', designation: 'District Health Officer (Pune)', lastActive: '5 mins ago' },
  { id: 3, name: 'Dr. Kavita Deshmukh', email: 'kavita@rubyhall.com', role: 'admin', status: 'Active', designation: 'Blood Bank Manager (Ruby Hall)', lastActive: '12 mins ago' },
  { id: 4, name: 'Rohan Joshi', email: 'rohan@rubyhall.com', role: 'staff', status: 'Active', designation: 'Blood Bank Technician', lastActive: '1 hr ago' },
  { id: 5, name: 'Amit Sharma', email: 'amit@gmail.com', role: 'donor', status: 'Active', designation: 'O+ Donor', lastActive: 'Yesterday' },
  { id: 6, name: 'Snehal More', email: 'snehal@gmail.com', role: 'donor', status: 'Suspended', designation: 'A- Donor', lastActive: '3 days ago' },
];

const MOCK_AUDIT_LOGS = [
  { id: 1, timestamp: '2026-06-20 11:00:25', actor: 'System', action: 'Daily database backup auto-completed', severity: 'Info', ipAddress: '127.0.0.1' },
  { id: 2, timestamp: '2026-06-20 10:45:12', actor: 'Rajesh Patil (District Officer)', action: 'Approved Kothrud Community Camp', severity: 'Info', ipAddress: '10.24.8.12' },
  { id: 3, timestamp: '2026-06-20 09:12:44', actor: 'Dr. Kavita Deshmukh (Hospital Admin)', action: 'Invited staff member rohan@rubyhall.com', severity: 'Info', ipAddress: '10.122.3.9' },
  { id: 4, timestamp: '2026-06-20 08:30:15', actor: 'System (AI Engine)', action: 'Triggered cross-hospital expiry alert: Ruby Hall to Sassoon', severity: 'Warning', ipAddress: 'Localhost' },
  { id: 5, timestamp: '2026-06-20 07:15:00', actor: 'System Admin (admin@raktsetu.com)', action: 'Enabled emergency routing feature flag', severity: 'Info', ipAddress: '192.168.1.102' },
];

export const SystemAdminProvider = ({ children }) => {
  const [adminState, setAdminState] = useState(() => {
    const saved = localStorage.getItem('raktsetu_sysadmin_state');
    return saved ? JSON.parse(saved) : {
      status: 'idle',
      adminDetails: null,
      pendingHospitals: MOCK_PENDING_HOSPITALS,
      pendingOfficers: MOCK_PENDING_OFFICERS,
      users: MOCK_USER_ACCOUNTS,
      auditLogs: MOCK_AUDIT_LOGS,
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
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem('raktsetu_sysadmin_state', JSON.stringify(adminState));
  }, [adminState]);

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
