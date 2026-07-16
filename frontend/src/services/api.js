import axios from 'axios';

const rawApiBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
if (!rawApiBaseUrl) {
  throw new Error('VITE_API_URL or VITE_API_BASE_URL is not set.');
}

// Safety normalization:
// 1. Strip any trailing slashes from the configured URL
// 2. If the URL does not end with /api/v1, append it automatically
//    This prevents a 404 if the env var was set to /v1 instead of /api/v1 on Vercel
let apiBaseUrl = rawApiBaseUrl.replace(/\/+$/, ''); // strip trailing slash
if (!apiBaseUrl.endsWith('/api/v1')) {
  // If it ends with /v1 (missing the /api prefix) → fix it
  if (apiBaseUrl.endsWith('/v1')) {
    apiBaseUrl = apiBaseUrl.replace(/\/v1$/, '/api/v1');
    console.warn('[API] VITE_API_URL was missing the /api prefix. Auto-corrected to:', apiBaseUrl);
  } else if (!apiBaseUrl.includes('/api/v1')) {
    apiBaseUrl = `${apiBaseUrl}/api/v1`;
    console.warn('[API] VITE_API_URL did not include /api/v1. Auto-appended. Result:', apiBaseUrl);
  }
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request Interceptor — attach JWT to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('raktsetu_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor — on 401, attempt silent refresh; clear only on final failure
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 and haven't already retried, try refreshing the access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('raktsetu_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call the refresh endpoint with ONLY the JSON body (no extra headers)
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken = data.token;
        if (newAccessToken) {
          localStorage.setItem('raktsetu_auth_token', newAccessToken);
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed — clear all auth state and redirect to login
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('raktsetu_')) localStorage.removeItem(key);
        });
        const path = window.location.pathname;
        let loginUrl = '/login';
        if (path.startsWith('/staff')) loginUrl = '/staff/login';
        else if (path.startsWith('/admin')) loginUrl = '/admin/login';
        else if (path.startsWith('/district')) loginUrl = '/district/login';
        else if (path.startsWith('/state')) loginUrl = '/state/login';
        else if (path.startsWith('/systemadmin')) loginUrl = '/systemadmin/login';
        window.location.href = loginUrl;
        return Promise.reject(refreshError);
      }
    }

    // Non-401 or already-retried — propagate the error to the caller
    return Promise.reject(error);
  }
);

// ─── Hospital Portal API helpers ─────────────────────────────────────────────
// These replace the old mockApi named export. All calls go through the real backend.

export const hospitalApi = {
  getInventory: () => api.get('/hospital/inventory').then(res => res.data.data || res.data),
  addInventory: (item) => api.post('/hospital/inventory', item).then(res => res.data),
  updateInventory: (id, fields) => api.put(`/hospital/inventory/${id}`, fields).then(res => res.data),
  deleteInventory: (id) => api.delete(`/hospital/inventory/${id}`).then(res => res.data),
  getTransferRequests: () => api.get('/hospital/transfers').then(res => res.data),
  updateTransferStatus: (id, status) => api.patch(`/hospital/transfers/${id}/status`, { status }).then(res => res.data),
  getEmergencyRequests: () => api.get('/hospital/emergencies').then(res => res.data),
  updateEmergencyStatus: (id, status) => api.patch(`/hospital/emergencies/${id}/status`, { status }).then(res => res.data),
  getNotifications: () => api.get('/hospital/notifications').then(res => res.data),
  markNotificationRead: (id) => api.patch(`/hospital/notifications/${id}/read`).then(res => res.data),
  markAllNotificationsRead: () => api.patch('/hospital/notifications/read-all').then(res => res.data),
  getAnalytics: () => api.get('/admin/waste-analytics').then(res => res.data),
  searchDonors: (params) => api.get('/hospital/donors/search', { params }).then(res => res.data),
  getSurgicalSchedules: () => api.get('/hospital/surgical-schedule').then(res => res.data),
  createSurgicalSchedule: (data) => api.post('/hospital/surgical-schedule', data).then(res => res.data),
  getForecast: () => api.get('/admin/forecast').then(res => res.data),
  getHospitalProfile: () => api.get('/hospital/profile').then(res => res.data),
  getStaffList: () => api.get('/hospital/staff').then(res => res.data),
  contactDonor: (id, data) => api.post(`/hospital/donors/${id}/contact`, data).then(res => res.data),
};

export default api;
