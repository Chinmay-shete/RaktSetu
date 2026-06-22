/**
 * RaktSetu — ProtectedRoute Component
 *
 * Prevents unauthenticated or unauthorized users from accessing
 * role-specific pages. Wraps any protected route in App.jsx.
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute allowedRoles={['staff', 'admin']} redirectTo="/staff/login" />}>
 *     <Route path="/staff/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 * NOTE: Currently works with the mock auth system (localStorage flags).
 * When the real backend is ready, replace the auth check with a real
 * JWT validation call using the api.js service.
 */

import { Navigate, Outlet } from 'react-router-dom';

/**
 * @param {string[]} allowedRoles - Array of roles that can access this route.
 *   Possible values: 'donor', 'staff', 'admin', 'district', 'state', 'sysadmin'
 * @param {string} redirectTo - Path to redirect to if user is not authenticated.
 * @param {boolean} isAuthenticated - Whether the user is currently authenticated.
 * @param {string} currentRole - The current user's role string.
 */
export const ProtectedRoute = ({
  allowedRoles = [],
  redirectTo = '/',
  isAuthenticated = false,
  currentRole = null,
}) => {
  // Not authenticated at all → redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Authenticated but wrong role → redirect to unauthorized
  if (allowedRoles.length > 0 && currentRole && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authenticated and correct role → render child routes
  return <Outlet />;
};

export default ProtectedRoute;
