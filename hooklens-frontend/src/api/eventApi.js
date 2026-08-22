import apiClient from './apiClient.js';
import { MOCK_EVENTS, MOCK_ATTEMPTS } from '../utils/mockData.js';

let localEventsStore = [...MOCK_EVENTS];

export const eventApi = {
  getEvents: async (params = {}) => {
    try {
      const res = await apiClient.get('/events', { params });
      return res.data?.data || res.data || localEventsStore;
    } catch {
      let filtered = [...localEventsStore];
      if (params.status) {
        filtered = filtered.filter((e) => e.status === params.status);
      }
      if (params.provider) {
        filtered = filtered.filter((e) => e.provider === params.provider);
      }
      if (params.endpointId) {
        filtered = filtered.filter((e) => e.endpointId === params.endpointId);
      }
      if (params.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.eventType.toLowerCase().includes(query) ||
            e.id.toLowerCase().includes(query) ||
            e.provider.toLowerCase().includes(query)
        );
      }
      return filtered;
    }
  },

  getEventById: async (id) => {
    try {
      const res = await apiClient.get(`/events/${id}`);
      return res.data?.data || res.data;
    } catch {
      return localEventsStore.find((e) => e.id === id) || localEventsStore[0];
    }
  },

  getEventAttempts: async (eventId) => {
    try {
      const res = await apiClient.get(`/events/${eventId}/attempts`);
      return res.data?.data || res.data;
    } catch {
      return MOCK_ATTEMPTS;
    }
  },
};
