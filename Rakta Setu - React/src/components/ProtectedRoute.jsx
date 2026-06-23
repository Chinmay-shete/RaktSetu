import React from 'react';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children, storageKey, redirectPath }) => {
  let isAuthenticated = false;
  const storedData = localStorage.getItem(storageKey);

  if (storedData) {
    // If it's a simple boolean string
    if (storedData === 'true') {
      isAuthenticated = true;
    } else {
      // If it's a JSON object state
      try {
        const parsed = JSON.parse(storedData);
        if (parsed && parsed.status === 'logged_in') {
          isAuthenticated = true;
        }
      } catch (e) {
        // Invalid JSON, default to false
      }
    }
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
