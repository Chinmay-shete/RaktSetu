/**
 * RaktSetu — Axios API Service
 * 
 * Central HTTP client for all real backend calls.
 * - Reads base URL from VITE_API_BASE_URL environment variable
 * - Automatically attaches JWT token to every request
 * - Handles 401 Unauthorized globally (clears token, redirects to appropriate login)
 * 
 * Usage:
 *   import api from '../services/api';
 *   const data = await api.get('/hospitals/123/inventory');
 *   const result = await api.post('/auth/login', { email, password });
 * 
 * NOTE: This file is ready for backend integration. While the app uses
 * mockApi.js for local development, replace those calls with api.js
 * calls once the backend is running.
 */

import axios from 'axios';

// --- Axios instance ---
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request interceptor: attach JWT token ---
api.interceptors.request.use(
  (config) => {
    // Try each role-specific token key
    const token =
      localStorage.getItem('raktsetu_token') ||
      localStorage.getItem('raktsetu_donor_token') ||
      localStorage.getItem('raktsetu_hospital_token') ||
      localStorage.getItem('raktsetu_district_token') ||
      localStorage.getItem('raktsetu_state_token') ||
      localStorage.getItem('raktsetu_sysadmin_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response interceptor: handle global errors ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token expired or invalid — clear all tokens and redirect
      const tokenKeys = [
        'raktsetu_token',
        'raktsetu_donor_token',
        'raktsetu_hospital_token',
        'raktsetu_hospital_authenticated',
        'raktsetu_district_token',
        'raktsetu_state_token',
        'raktsetu_sysadmin_token',
      ];
      tokenKeys.forEach((key) => localStorage.removeItem(key));

      // Redirect to the correct login page based on current path
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/staff')) {
        window.location.href = '/staff/login';
      } else if (currentPath.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else if (currentPath.startsWith('/district')) {
        window.location.href = '/district/login';
      } else if (currentPath.startsWith('/state')) {
        window.location.href = '/state/login';
      } else if (currentPath.startsWith('/systemadmin')) {
        window.location.href = '/systemadmin/login';
      } else {
        window.location.href = '/';
      }
    }

    if (status === 403) {
      console.error('RaktSetu API: Access forbidden. Insufficient role permissions.');
    }

    if (status === 429) {
      console.warn('RaktSetu API: Rate limit exceeded. Slow down requests.');
    }

    return Promise.reject(error);
  }
);

export default api;

/**
 * Helper: Extract error message from API response
 * Usage: toast.error(getApiError(err))
 */
export const getApiError = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
};
