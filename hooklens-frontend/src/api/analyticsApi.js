import apiClient from './apiClient.js';
import { MOCK_VOLUME_SERIES } from '../utils/mockData.js';

export const analyticsApi = {
  getOverview: async () => {
    try {
      const res = await apiClient.get('/analytics/overview');
      return res.data?.data || res.data;
    } catch {
      return {
        totalEvents: 64420,
        successfulDeliveries: 63100,
        failedDeliveries: 1320,
        successRate: 97.95,
        avgLatency: 148,
        activeEndpoints: 4,
      };
    }
  },

  getTimeSeries: async (period = '24h') => {
    try {
      const res = await apiClient.get('/analytics/timeseries', { params: { period } });
      return res.data?.data || res.data || MOCK_VOLUME_SERIES;
    } catch {
      return MOCK_VOLUME_SERIES;
    }
  },
};
