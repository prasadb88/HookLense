import axios from 'axios';

// Central API Client configured for HookLens Gateway
const getApiBaseUrl = () => {
  let raw = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api/v1';
  raw = raw.trim().replace(/\/+$/, '');
  if (!raw.endsWith('/api/v1')) {
    raw = `${raw}/api/v1`;
  }
  return raw;
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor to add Authorization Token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hooklens_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and dispatch global unauthorized event to reset AuthContext
      localStorage.removeItem('hooklens_token');
      localStorage.removeItem('hooklens_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
