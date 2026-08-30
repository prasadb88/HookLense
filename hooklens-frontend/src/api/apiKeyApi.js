import apiClient from './apiClient.js';

export const apiKeyApi = {
  getApiKeys: async () => {
    const response = await apiClient.get('/api-keys');
    return response.data;
  },

  createApiKey: async (name, type = 'Live') => {
    const response = await apiClient.post('/api-keys', { name, type });
    return response.data;
  },

  revokeApiKey: async (id) => {
    const response = await apiClient.delete(`/api-keys/${id}`);
    return response.data;
  },
};

export default apiKeyApi;
