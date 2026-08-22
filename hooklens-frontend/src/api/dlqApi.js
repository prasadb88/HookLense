import apiClient from './apiClient.js';
import { MOCK_EVENTS } from '../utils/mockData.js';

let dlqItemsStore = MOCK_EVENTS.filter((e) => e.status === 'DEAD_LETTERED' || e.status === 'FAILED');

export const dlqApi = {
  getDlqEvents: async () => {
    try {
      const res = await apiClient.get('/dlq');
      return res.data?.data || res.data || dlqItemsStore;
    } catch {
      return dlqItemsStore;
    }
  },

  archiveDlqEvent: async (id) => {
    try {
      const res = await apiClient.post(`/dlq/${id}/archive`);
      return res.data;
    } catch {
      dlqItemsStore = dlqItemsStore.filter((item) => item.id !== id);
      return { success: true, id };
    }
  },
};
