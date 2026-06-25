import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const DistrictContext = createContext();

const MOCK_HOSPITALS = [
  {
    id: 1, name: 'Sassoon General Hospital', type: 'Government', area: 'Pune Camp',
    contact: '+91 20 2612 7777', licenseNo: 'BB-PNQ-001', status: 'Active',
    lastUpdated: '2 mins ago',
    stock: { 'O+': 42, 'O-': 6, 'A+': 35, 'A-': 18, 'B+': 28, 'B-': 9, 'AB+': 22, 'AB-': 4 }
  },
  {
    id: 2, name: 'Ruby Hall Clinic', type: 'Private', area: 'Wanowrie',
    contact: '+91 20 6645 5555', licenseNo: 'BB-PNQ-002', status: 'Active',
    lastUpdated: '5 mins ago',
    stock: { 'O+': 68, 'O-': 14, 'A+': 54, 'A-': 22, 'B+': 47, 'B-': 19, 'AB+': 31, 'AB-': 8 }
  },
  {
    id: 3, name: 'KEM Hospital', type: 'Government', area: 'Rasta Peth',
    contact: '+91 20 2612 8000', licenseNo: 'BB-PNQ-003', status: 'Active',
    lastUpdated: '12 mins ago',
    stock: { 'O+': 21, 'O-': 3, 'A+': 18, 'A-': 7, 'B+': 15, 'B-': 5, 'AB+': 11, 'AB-': 2 }
  },
  {
    id: 4, name: 'Jehangir Hospital', type: 'Private', area: 'Shivajinagar',
    contact: '+91 20 6681 5555', licenseNo: 'BB-PNQ-004', status: 'Active',
    lastUpdated: '8 mins ago',
    stock: { 'O+': 55, 'O-': 11, 'A+': 43, 'A-': 15, 'B+': 39, 'B-': 12, 'AB+': 24, 'AB-': 6 }
  },
  {
    id: 5, name: 'Deenanath Mangeshkar Hospital', type: 'Private', area: 'Erandwane',
    contact: '+91 20 4015 1000', licenseNo: 'BB-PNQ-005', status: 'Active',
    lastUpdated: '3 mins ago',
    stock: { 'O+': 79, 'O-': 17, 'A+': 61, 'A-': 24, 'B+': 53, 'B-': 21, 'AB+': 34, 'AB-': 9 }
  },
  {
    id: 6, name: 'Poona Hospital', type: 'Government', area: 'Sadashiv Peth',
    contact: '+91 20 2443 5678', licenseNo: 'BB-PNQ-006', status: 'Active',
    lastUpdated: '20 mins ago',
    stock: { 'O+': 14, 'O-': 2, 'A+': 10, 'A-': 4, 'B+': 9, 'B-': 3, 'AB+': 7, 'AB-': 1 }
  },
  {
    id: 7, name: 'Noble Hospital', type: 'Private', area: 'Hadapsar',
    contact: '+91 20 6763 5555', licenseNo: 'BB-PNQ-007', status: 'Active',
    lastUpdated: '15 mins ago',
    stock: { 'O+': 38, 'O-': 8, 'A+': 31, 'A-': 12, 'B+': 26, 'B-': 8, 'AB+': 18, 'AB-': 5 }
  },
  {
    id: 8, name: 'Symbiosis Hospital', type: 'Private', area: 'Viman Nagar',
    contact: '+91 20 6761 4444', licenseNo: 'BB-PNQ-008', status: 'Active',
    lastUpdated: '6 mins ago',
    stock: { 'O+': 47, 'O-': 10, 'A+': 38, 'A-': 14, 'B+': 33, 'B-': 11, 'AB+': 20, 'AB-': 6 }
  },
];

const MOCK_ALERTS = [
  { id: 1, hospitalId: 3, hospitalName: 'KEM Hospital', bloodGroup: 'O-', units: 3, severity: 'Critical', predictedDepleted: 'Tomorrow', status: 'Active', time: '10 mins ago' },
  { id: 2, hospitalId: 6, hospitalName: 'Poona Hospital', bloodGroup: 'AB-', units: 1, severity: 'Critical', predictedDepleted: 'Today by 6 PM', status: 'Active', time: '25 mins ago' },
  { id: 3, hospitalId: 1, hospitalName: 'Sassoon General', bloodGroup: 'O-', units: 6, severity: 'Warning', predictedDepleted: 'In 2 days', status: 'Active', time: '1 hr ago' },
  { id: 4, hospitalId: 6, hospitalName: 'Poona Hospital', bloodGroup: 'B-', units: 3, severity: 'Warning', predictedDepleted: 'In 3 days', status: 'Active', time: '2 hrs ago' },
  { id: 5, hospitalId: 3, hospitalName: 'KEM Hospital', bloodGroup: 'AB+', units: 11, severity: 'Watch', predictedDepleted: 'In 5 days', status: 'Active', time: '3 hrs ago' },
  { id: 6, hospitalId: 7, hospitalName: 'Noble Hospital', bloodGroup: 'O+', units: 38, severity: 'Resolved', predictedDepleted: 'N/A', status: 'Resolved', time: 'Yesterday' },
];

const MOCK_CAMPS = [
  { id: 1, name: 'Kothrud Community Camp', location: 'Kothrud Community Hall, Pune', date: '2026-06-25', organizer: 'Deenanath Mangeshkar', capacity: 200, status: 'Pending', bloodGroups: ['O-', 'AB-'], expectedDonors: 150 },
  { id: 2, name: 'Hadapsar IT Park Drive', location: 'Magarpatta City, Hadapsar', date: '2026-06-28', organizer: 'Noble Hospital', capacity: 300, status: 'Pending', bloodGroups: ['O+', 'B+'], expectedDonors: 220 },
  { id: 3, name: 'Shivajinagar Monthly Camp', location: 'FC Road, Shivajinagar', date: '2026-07-02', organizer: 'Jehangir Hospital', capacity: 150, status: 'Approved', bloodGroups: ['All'], expectedDonors: 120 },
  { id: 4, name: 'Camp Erandwane', location: 'Karve Road, Erandwane', date: '2026-07-05', organizer: 'Poona Hospital', capacity: 100, status: 'Approved', bloodGroups: ['O-', 'B-'], expectedDonors: 80 },
];

export const DistrictProvider = ({ children }) => {
  const [appState, setAppState] = useState(() => {
    const saved = localStorage.getItem('raktsetu_district_state');
    return saved ? JSON.parse(saved) : {
      status: 'idle',
      officerDetails: null,
      hospitals: MOCK_HOSPITALS,
      alerts: MOCK_ALERTS,
      camps: MOCK_CAMPS,
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem('raktsetu_district_state', JSON.stringify(appState));
  }, [appState]);

  const fetchDistrictData = useCallback(async () => {
    if (appState.status !== 'logged_in') return;
    setIsLoading(true);
    setError(null);
    try {
      const [hospRes, alertsRes, campsRes] = await Promise.all([
        api.get('/district/hospitals'),
        api.get('/district/alerts'),
        api.get('/district/camps')
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
      }));
    } catch (err) {
      console.error("Failed to fetch district data from API", err);
      setError("Failed to load district data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [appState.status]);

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

  return (
    <DistrictContext.Provider value={{
      appState,
      loginOfficer,
      logoutOfficer,
      approveCamp,
      rejectCamp,
      addCamp,
      resolveAlert,
      isLoading,
      error,
      refetchData: fetchDistrictData,
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
