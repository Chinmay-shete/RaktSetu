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
      // window.location.href = '/login'; // Optional: force redirect
    }
    return Promise.reject(error);
  }
);

export default api;
