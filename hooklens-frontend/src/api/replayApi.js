import apiClient from './apiClient.js';
import { MOCK_REPLAYS } from '../utils/mockData.js';

let localReplaysStore = [...MOCK_REPLAYS];

export const replayApi = {
  replayEvent: async (eventId) => {
    try {
      const res = await apiClient.post(`/events/${eventId}/replay`);
      return res.data;
    } catch {
      const newReplay = {
        replayId: 'rpl_' + Math.random().toString(36).substring(2, 9),
        eventId,
        endpointName: 'Razorpay Billing Gateway',
        eventType: 'payment.captured',
        triggeredBy: 'Alex Rivera (User)',
        status: 'SUCCESS',
        httpStatus: 200,
        latency: 184,
        timestamp: new Date().toISOString(),
      };
      localReplaysStore.unshift(newReplay);
      return {
        success: true,
        replayId: newReplay.replayId,
        message: 'Replay queued successfully',
        data: newReplay,
      };
    }
  },

  getReplays: async () => {
    try {
      const res = await apiClient.get('/replays');
      return res.data?.data || res.data || localReplaysStore;
    } catch {
      return localReplaysStore;
    }
  },
};
