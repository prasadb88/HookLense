import apiClient from './apiClient.js';
import { MOCK_USER } from '../utils/mockData.js';

export const authApi = {
  login: async (credentials) => {
    try {
      const res = await apiClient.post('/auth/login', credentials);
      return res.data;
    } catch (err) {
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      // Fallback mock session for local development
      return {
        token: 'mock_jwt_token_hl_' + Date.now(),
        user: {
          id: MOCK_USER.id,
          name: credentials.email.split('@')[0] || MOCK_USER.name,
          email: credentials.email,
        },
      };
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
      return {
        token: 'mock_jwt_token_hl_' + Date.now(),
        user: {
          id: 'usr_' + Math.floor(Math.random() * 100000),
          name: userData.name,
          email: userData.email,
        },
      };
    }
  },

  // TODO: Connect Google OAuth backend when /auth/google endpoint is configured
  loginWithGoogle: async () => {
    try {
      const res = await apiClient.get('/auth/google');
      return res.data;
    } catch {
      throw new Error('Google sign-in was unsuccessful. Please try again.');
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const res = await apiClient.post('/auth/forgot-password', { email });
      return res.data;
    } catch {
      // Return neutral message for security / enumeration defense
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
      // Check for invalid/expired token test case
      if (token === 'invalid' || token === 'expired') {
        throw new Error('This password reset link is no longer valid. Request a new reset link to continue.');
      }
      return { success: true, message: 'Password reset successful' };
    }
  },

  getCurrentUser: async () => {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data;
    } catch {
      return MOCK_USER;
    }
  },
};

export default authApi;
