import apiClient from './apiClient.js';

export const analyticsApi = {
  getOverview: async (period = '24h') => {
    const res = await apiClient.get('/analytics/overview', { params: { period } });
    const data = res.data?.data || res.data;
    
    return {
      totalEvents: data?.totalEvents || 0,
      succeeded: data?.succeeded || 0,
      failed: data?.failed || 0,
      deadLettered: data?.deadLettered || 0,
      queued: data?.queued || 0,
      successRateNumber: data?.successRateNumber !== undefined ? data.successRateNumber : null,
      failureRateNumber: data?.failureRateNumber !== undefined ? data.failureRateNumber : null,
      avgLatencyMs: data?.avgLatencyMs !== undefined ? data.avgLatencyMs : null,
      hasLatencyData: !!data?.hasLatencyData,
      failedLastHour: data?.failedLastHour || 0,
    };
  },

  getTimeSeries: async (period = '24h') => {
    const res = await apiClient.get('/analytics/timeseries', { params: { period } });
    const list = res.data?.data || res.data || [];
    
    if (Array.isArray(list) && list.length > 0) {
      return list.map((item) => ({
        time: item._id || '00:00',
        success: item.succeeded || 0,
        failed: item.failed || 0,
        retrying: item.retrying || 0,
      }));
    }
    
    // Return empty dataset if no events recorded yet
    const now = new Date();
    return [20, 16, 12, 8, 4, 0].map((hoursAgo) => {
      const d = new Date(now.getTime() - hoursAgo * 3600 * 1000);
      d.setMinutes(0, 0, 0);
      return {
        time: d.toISOString(),
        success: 0,
        failed: 0,
        retrying: 0,
      };
    });
  },
};

export default analyticsApi;
