import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
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
      // Handle unauthorized access (e.g., clear auth, redirect to login)
      console.warn('Unauthorized access - redirecting to login');
      // For now, we clear the token
      localStorage.removeItem('raktsetu_auth_token');
      window.location.href = '/login'; // Optional: force redirect
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
