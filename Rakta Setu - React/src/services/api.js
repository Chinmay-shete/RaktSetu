import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
if (!apiBaseUrl) {
  throw new Error('VITE_API_URL or VITE_API_BASE_URL is not set.');
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available (can be customized based on role)
    const token = localStorage.getItem('raktsetu_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access — redirect to the role-appropriate login page
      console.warn('Unauthorized access - redirecting to login');
      // Clear all raktsetu auth tokens
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('raktsetu_')) localStorage.removeItem(key);
      });
      // Derive correct login URL from current path prefix
      const path = window.location.pathname;
      let loginUrl = '/login'; // default: donor
      if (path.startsWith('/staff')) loginUrl = '/staff/login';
      else if (path.startsWith('/admin')) loginUrl = '/admin/login';
      else if (path.startsWith('/district')) loginUrl = '/district/login';
      else if (path.startsWith('/state')) loginUrl = '/state/login';
      else if (path.startsWith('/systemadmin')) loginUrl = '/systemadmin/login';
      window.location.href = loginUrl;
    }
    return Promise.reject(error);
  }
);

export const mockApi = {
  getInventory: () => api.get('/hospital/inventory').then(res => res.data),
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
};

export default api;
