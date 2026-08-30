import apiClient from './apiClient.js';

const getBaseHost = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api/v1';
  return envUrl.replace(/\/api\/v1\/?$/, '');
};

const mapEndpoint = (ep) => {
  if (!ep) return null;
  const token = ep.token || ep._id || ep.id;
  const baseHost = getBaseHost();
  const isActive = ep.isActive !== false;
  
  return {
    id: token,
    _id: ep._id,
    token: token,
    name: ep.name,
    provider: ep.provider || 'CUSTOM',
    targetUrl: ep.targetUrl,
    webhookSecret: ep.secret || null,
    secret: ep.secret,
    signingSecret: ep.signingSecret || null,
    hooklensUrl: `${baseHost}/api/v1/wh/${token}`,
    isActive: isActive,
    status: ep.status || (isActive ? 'ACTIVE' : 'INACTIVE'),
    totalEvents: ep.totalEvents || 0,
    successRate: ep.successRate !== undefined ? ep.successRate : 100,
    avgLatency: ep.avgLatency !== undefined ? ep.avgLatency : 0,
    createdAt: ep.createdAt || new Date().toISOString(),
  };
};

export const endpointApi = {
  getEndpoints: async () => {
    const res = await apiClient.get('/endpoints');
    const raw = res.data?.data !== undefined ? res.data.data : res.data;
    const list = Array.isArray(raw) ? raw : [];
    return list.map(mapEndpoint).filter(Boolean);
  },

  getEndpointById: async (idOrToken) => {
    const res = await apiClient.get(`/endpoints/${idOrToken}`);
    const ep = (res.data?.data && typeof res.data.data === 'object' && !Array.isArray(res.data.data))
      ? res.data.data
      : (res.data && typeof res.data === 'object' && !Array.isArray(res.data) ? res.data : null);
    return mapEndpoint(ep);
  },

  createEndpoint: async (payload) => {
    const body = {
      name: payload.name,
      targetUrl: payload.targetUrl,
      provider: payload.provider ? String(payload.provider).toUpperCase() : 'CUSTOM',
      secret: payload.secret || payload.webhookSecret,
    };
    const res = await apiClient.post('/endpoints', body);
    const created = res.data?.data || res.data;
    return mapEndpoint(created);
  },

  updateEndpoint: async (idOrToken, payload) => {
    const body = { ...payload };
    if (payload.status !== undefined && payload.isActive === undefined) {
      body.isActive = payload.status === 'ACTIVE' || payload.status === 'ENABLED';
    }
    const res = await apiClient.patch(`/endpoints/${idOrToken}`, body);
    const updated = res.data?.data || res.data;
    return mapEndpoint(updated);
  },

  deleteEndpoint: async (idOrToken) => {
    const res = await apiClient.delete(`/endpoints/${idOrToken}`);
    return res.data;
  },

  testEndpoint: async (idOrToken) => {
    const ep = await endpointApi.getEndpointById(idOrToken);
    if (!ep || !ep.token) {
      throw new Error('Endpoint token not found for testing');
    }
    const baseHost = getBaseHost();
    const testPayload = {
      event: 'ping.test',
      id: `evt_ping_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const res = await fetch(`${baseHost}/api/v1/wh/${ep.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });
    const data = await res.json();
    if (res.status === 202) {
      return { success: true, message: `Test webhook delivered cleanly to ingestion queue (Event ID: ${data.eventId})` };
    }
    throw new Error(data.message || 'Failed to deliver test webhook payload');
  },
};

export default endpointApi;
