import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const DEFAULT_HOSPITAL = {
  name: "City Life Blood Bank & Hospital",
  email: "contact@citylifehospital.org",
  bloodBankId: "BB-90812-CL",
  licenseNumber: "LIC-7729-2026",
  address: "452 Healthcare Boulevard, Sector 4, New Delhi, 110001",
  contact: "+91 98765 43210",
  logo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&h=150&fit=crop&crop=faces"
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('raktsetu_hospital_profile');
    if (saved) return JSON.parse(saved);
    return DEFAULT_HOSPITAL;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('raktsetu_hospital_authenticated') === 'true';
  });

  const login = async (email, password, rememberMe) => {
    try {
      const response = await api.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password: password
      });
      const { token, user } = response.data;
      
      localStorage.setItem('raktsetu_auth_token', token);
      localStorage.setItem('raktsetu_hospital_authenticated', 'true');
      localStorage.setItem('raktsetu_hospital_profile', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);

      if (rememberMe) {
          localStorage.setItem('raktsetu_hospital_email', email);
      } else {
          localStorage.removeItem('raktsetu_hospital_email');
      }
      return true;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('raktsetu_')) {
        localStorage.removeItem(key);
      }
    });
  };

  const updateProfile = (profileData) => {
    const updated = { ...user, ...profileData };
    setUser(updated);
    localStorage.setItem('raktsetu_hospital_profile', JSON.stringify(updated));
  };

  const validateInviteToken = async (token) => {
    const res = await api.get(`/auth/validate-invite-token/${token}`);
    return res.data;
  };

  const setupPassword = async (token, password) => {
    const res = await api.post('/auth/set-password', { token, password });
    return res.data;
  };

  const syncAuth = () => {
    const saved = localStorage.getItem('raktsetu_hospital_profile');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
        setIsAuthenticated(localStorage.getItem('raktsetu_hospital_authenticated') === 'true');
      } catch (e) {
        console.warn('Failed to parse local storage profile:', e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateProfile, validateInviteToken, setupPassword, syncAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
