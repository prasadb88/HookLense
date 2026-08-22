import apiClient from './apiClient.js';
import { MOCK_SECURITY_STATS } from '../utils/mockData.js';

export const securityApi = {
  getSecurityOverview: async () => {
    try {
      const res = await apiClient.get('/security/overview');
      return res.data?.data || res.data || MOCK_SECURITY_STATS;
    } catch {
      return MOCK_SECURITY_STATS;
    }
  },

  getSecurityEvents: async () => {
    try {
      const res = await apiClient.get('/security/events');
      return res.data?.data || res.data || MOCK_SECURITY_STATS.recentSecurityEvents;
    } catch {
      return MOCK_SECURITY_STATS.recentSecurityEvents;
    }
  },
};
