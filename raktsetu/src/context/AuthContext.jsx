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

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = (email, password) => {
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const updateProfile = (profileData) => {
    const updated = { ...user, ...profileData };
    setUser(updated);
    localStorage.setItem('raktsetu_hospital_profile', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
