import apiClient from './apiClient.js';

export const replayApi = {
  replayEvent: async (eventId) => {
    const res = await apiClient.post(`/events/${eventId}/replay`);
    return res.data;
  },

  getReplays: async () => {
    try {
      const res = await apiClient.get('/events/replays/history');
      if (res.data?.data) {
        return res.data.data;
      }
      const events = res.data?.data || res.data || [];
      return Array.isArray(events) ? events : [];
    } catch {
      // Fallback if endpoint fails
      try {
        const res = await apiClient.get('/events', { params: { limit: 100 } });
        const events = res.data?.data || [];
        const replayHistory = [];
        for (const evt of events) {
          try {
            const detailRes = await apiClient.get(`/events/${evt._id}`);
            const attempts = detailRes.data?.data?.attempts || [];
            const manualAttempts = attempts.filter((a) => a.isManualReplay === true);
            manualAttempts.forEach((att) => {
              replayHistory.push({
                replayId: `rpl_${att._id.toString().substring(18)}`,
                eventId: evt._id,
                endpointName: evt.endpointId ? `Endpoint ${evt.endpointId.substring(0, 8)}` : 'Webhook Endpoint',
                eventType: evt.providerEventId || 'webhook.event',
                triggeredBy: 'Authenticated User (Manual)',
                status: att.status === 'SUCCEEDED' ? 'SUCCESS' : att.status,
                httpStatus: att.httpStatus,
                latency: att.latencyMs || 0,
                timestamp: att.createdAt || evt.createdAt,
              });
            });
          } catch {
            // Skip item
          }
        }
        return replayHistory;
      } catch {
        return [];
      }
    }
  },
};

export default replayApi;
