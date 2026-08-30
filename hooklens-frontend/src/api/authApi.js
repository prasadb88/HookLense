import apiClient from './apiClient.js';

export const authApi = {
  login: async (credentials) => {
    try {
      const res = await apiClient.post('/auth/login', credentials);
      return res.data;
    } catch (err) {
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error('Login failed. Please check your credentials or network connection.');
    }
  },

  signup: async (userData) => {
    try {
      const res = await apiClient.post('/auth/signup', userData);
      return res.data;
    } catch (err) {
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error('Signup failed. Please try again.');
    }
  },

  loginWithGoogle: async (credential) => {
    try {
      const res = await apiClient.post('/auth/google', { credential });
      return res.data;
    } catch (err) {
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error('Google sign-in was unsuccessful. Please try again.');
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const res = await apiClient.post('/auth/forgot-password', { email });
      return res.data;
    } catch {
      return { success: true, message: 'If an account exists for this email, you will receive a reset link.' };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const res = await apiClient.post('/auth/reset-password', { token, newPassword });
      return res.data;
    } catch (err) {
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error('Password reset link is invalid or expired.');
    }
  },

  getCurrentUser: async () => {
    const storedUser = localStorage.getItem('hooklens_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        // Continue to API fallback
      }
    }
    const res = await apiClient.get('/auth/me');
    return res.data?.user || res.data;
  },
};

export default authApi;
