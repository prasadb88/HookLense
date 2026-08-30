import apiClient from './apiClient.js';

const mapEvent = (evt) => {
  if (!evt) return null;
  const id = evt._id || evt.id;
  const normalizedStatus = evt.status === 'SUCCEEDED' ? 'SUCCESS' : evt.status === 'RETRY_SCHEDULED' ? 'RETRYING' : evt.status;
  
  const totalAttempts = evt.attemptsCount !== undefined 
    ? evt.attemptsCount 
    : (Array.isArray(evt.attempts) ? evt.attempts.length : 1);
  const initialAttempts = evt.initialAttemptsCount !== undefined 
    ? evt.initialAttemptsCount 
    : (totalAttempts > 0 ? totalAttempts : 1);
  const manualReplays = evt.manualReplaysCount || 0;
  
  return {
    id: id,
    _id: id,
    eventId: id,
    provider: evt.provider || 'CUSTOM',
    eventType: evt.eventType || evt.providerEventId || 'webhook.event',
    providerEventId: evt.providerEventId,
    endpointId: evt.endpointId,
    endpointName: evt.endpointName || (evt.endpointId ? `Endpoint ${evt.endpointId.substring(0, 8)}` : 'Webhook Endpoint'),
    status: normalizedStatus,
    rawStatus: evt.status,
    duplicate: evt.duplicate || false,
    signatureVerified: evt.signature?.verified !== undefined ? evt.signature.verified : true,
    signatureAlgorithm: evt.signature?.algorithm || 'HMAC-SHA256',
    receivedAt: evt.createdAt || new Date().toISOString(),
    createdAt: evt.createdAt || new Date().toISOString(),
    payloadHash: evt.payloadHash,
    headers: evt.headers || {},
    rawBody: evt.rawBody,
    attempts: totalAttempts,
    initialAttempts: initialAttempts,
    manualReplays: manualReplays,
    maxAttempts: 5,
    httpStatus: evt.lastHttpStatus !== undefined ? evt.lastHttpStatus : (evt.status === 'SUCCEEDED' ? 200 : null),
    latency: evt.lastLatencyMs || evt.latency || 0,
    lastError: evt.lastError || null,
    lastAttemptAt: evt.lastAttemptAt || evt.createdAt || new Date().toISOString(),
  };
};

const mapAttempt = (att) => {
  if (!att) return null;
  const normalizedStatus = att.status === 'SUCCEEDED' ? 'SUCCESS' : att.status;
  const createdAt = att.createdAt || new Date().toISOString();
  return {
    id: att._id || att.id,
    attemptNumber: att.attemptNumber,
    status: normalizedStatus,
    rawStatus: att.status,
    httpStatus: att.httpStatus,
    latency: att.latencyMs || att.latency || 0,
    targetUrl: att.targetUrl,
    errorMessage: att.errorMessage,
    error: att.errorMessage,
    responseBody: att.responseBody,
    createdAt: createdAt,
    timestamp: createdAt,
    isManualReplay: att.isManualReplay === true,
    type: att.isManualReplay === true ? 'REPLAY' : 'INITIAL',
  };
};

export const eventApi = {
  getEvents: async (params = {}) => {
    const queryParams = {};
    if (params.status) {
      if (params.status === 'FAILED') queryParams.status = 'FAILED';
      else if (params.status === 'SUCCESS') queryParams.status = 'SUCCEEDED';
      else if (params.status === 'RETRYING') queryParams.status = 'RETRY_SCHEDULED';
      else queryParams.status = params.status;
    }
    if (params.provider) {
      queryParams.provider = String(params.provider).toUpperCase();
    }
    if (params.endpointId) queryParams.endpointId = params.endpointId;
    if (params.search) queryParams.search = params.search;
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;

    const res = await apiClient.get('/events', { params: queryParams });
    const raw = res.data?.data !== undefined ? res.data.data : res.data;
    const list = Array.isArray(raw) ? raw : [];
    return list.map(mapEvent).filter(Boolean);
  },

  getEventById: async (id) => {
    const res = await apiClient.get(`/events/${id}`);
    const data = res.data?.data || res.data;
    if (!data) return null;

    const evt = mapEvent(data.event || data);
    const rawBodyStr = data.rawBodyString || (data.event?.rawBody ? (typeof data.event.rawBody === 'string' ? data.event.rawBody : JSON.stringify(data.event.rawBody)) : null);
    
    // Parse raw body string to JSON if possible
    let parsedBody = null;
    if (rawBodyStr) {
      try { parsedBody = JSON.parse(rawBodyStr); } catch { parsedBody = { raw: rawBodyStr }; }
    }

    const attempts = Array.isArray(data.attempts) ? data.attempts.map(mapAttempt) : [];
    const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;

    return {
      ...evt,
      payload: parsedBody || { event: evt.eventType, id: evt.providerEventId },
      rawBodyString: rawBodyStr,
      attempts,
      attemptCount: attempts.length,
      maxAttempts: 3,
      httpStatus: latestAttempt?.httpStatus || (evt.status === 'SUCCESS' ? 200 : null),
      latency: latestAttempt?.latency || 0,
      payloadSize: rawBodyStr ? rawBodyStr.length : 128,
      ipAddress: '127.0.0.1 (Ingress)',
    };
  },

  getEventAttempts: async (eventId) => {
    const eventDetails = await eventApi.getEventById(eventId);
    return eventDetails?.attempts || [];
  },
};

export default eventApi;
