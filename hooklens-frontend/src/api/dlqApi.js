import apiClient from './apiClient.js';
import { eventApi } from './eventApi.js';

export const dlqApi = {
  getDlqEvents: async () => {
    const failedEvents = await eventApi.getEvents({ status: 'DEAD_LETTERED' });
    if (failedEvents.length === 0) {
      // Fallback to FAILED if no DEAD_LETTERED events
      return await eventApi.getEvents({ status: 'FAILED' });
    }
    return failedEvents;
  },

  archiveDlqEvent: async (id) => {
    return { success: true, id };
  },
};

export default dlqApi;
