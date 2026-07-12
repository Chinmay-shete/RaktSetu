import { useState } from 'react';
import { Navigate } from 'react-router-dom';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const ProtectedRoute = ({ children, storageKey, redirectPath }) => {
  const [isAuthenticated] = useState(() => {
    const token = localStorage.getItem('raktsetu_auth_token');
    let authenticated = false;

    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
        authenticated = true;
      }
    }

    // Fallback to legacy localStorage key if token check fails or is not present (graceful migration)
    if (!authenticated) {
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        if (storedData === 'true') {
          authenticated = true;
        } else {
          try {
            const parsed = JSON.parse(storedData);
            if (parsed && parsed.status === 'logged_in') {
              authenticated = true;
            }
          } catch (e) {
            // Invalid JSON
          }
        }
      }
    }
    return authenticated;
  });

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
