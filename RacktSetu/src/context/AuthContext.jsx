import React, { createContext, useContext, useState } from 'react';

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

  const login = (email, password, rememberMe) => {
    // Mock login logic
    const savedPassword = localStorage.getItem('raktsetu_hospital_password');
    
    // Allow login if password matches saved password, OR if they use 'admin123' as a master fallback
    if ((savedPassword && password === savedPassword) || password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('raktsetu_hospital_authenticated', 'true');
      if (rememberMe) {
          localStorage.setItem('raktsetu_hospital_email', email);
      } else {
          localStorage.removeItem('raktsetu_hospital_email');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('raktsetu_hospital_authenticated');
  };

  const updateProfile = (profileData) => {
    const updated = { ...user, ...profileData };
    setUser(updated);
    localStorage.setItem('raktsetu_hospital_profile', JSON.stringify(updated));
  };

  const validateInviteToken = async (token) => {
      // Simulate API call
      return new Promise((resolve) => {
          setTimeout(() => {
              if (token === 'token-sjh') {
                  resolve({ name: "St. Jude Memorial Hospital" });
              } else {
                  resolve({ name: "City Life Blood Bank & Hospital" });
              }
          }, 1500);
      });
  };

  const setupPassword = async (token, password) => {
      // Simulate API call
      return new Promise((resolve) => {
          setTimeout(() => {
              localStorage.setItem('raktsetu_hospital_password', password);
              resolve(true);
          }, 1000);
      });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateProfile, validateInviteToken, setupPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
