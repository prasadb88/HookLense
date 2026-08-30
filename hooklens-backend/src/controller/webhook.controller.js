import crypto from 'crypto';
import WebhookEndpoint from '../models/WebhookEndpoint.js';
import WebhookEvent from '../models/WebhookEvent.js';
import { verifyWebhookSignature, extractWebhookMetadata } from '../services/webhookVerification/index.js';
import { addWebhookToQueue } from '../queues/webhook.queue.js';
import { emitToTenant } from '../socket/socket.js';

const SENSITIVE_HEADERS = new Set(['authorization', 'cookie', 'x-api-key', 'secret', 'proxy-authorization']);

const sanitizeHeaders = (headers = {}) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_HEADERS.has(lowerKey)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

export const ingestWebhook = async (req, res) => {
  try {
    const token = req.params.token || req.params.endpointId;
    const rawBodyBuffer = req.body;

    if (!rawBodyBuffer || rawBodyBuffer.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PAYLOAD',
        message: 'Empty request payload received',
      });
    }

    // 1. Find endpoint by public token (never trust client-supplied tenantId)
    const endpoint = await WebhookEndpoint.findOne({ token, isActive: true }).select('+secret +signingSecret');
    if (!endpoint) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Webhook endpoint not found',
      });
    }

    // 2. Verify provider signature
    const sigResult = verifyWebhookSignature(
      endpoint.provider,
      rawBodyBuffer,
      req.headers,
      endpoint.secret
    );

    if (!sigResult.verified) {
      // If signature is invalid, reject request immediately without queuing
      return res.status(401).json({
        success: false,
        error: 'INVALID_SIGNATURE',
        message: 'Webhook signature verification failed.',
      });
    }

    // 3. Extract metadata & calculate payload hash
    const { providerEventId, eventType } = extractWebhookMetadata(endpoint.provider, rawBodyBuffer);
    const payloadHash = crypto.createHash('sha256').update(rawBodyBuffer).digest('hex');
    const sanitizedHeaders = sanitizeHeaders(req.headers);
    const clientIp = req.ip || req.socket?.remoteAddress || null;

    // 4. Persist original WebhookEvent using endpoint.tenantId
    const event = await WebhookEvent.create({
      tenantId: endpoint.tenantId,
      endpointId: endpoint.token,
      provider: endpoint.provider,
      providerEventId,
      eventType,
      method: req.method,
      headers: sanitizedHeaders,
      payloadHash,
      rawBody: rawBodyBuffer,
      payloadSize: rawBodyBuffer.length,
      ipAddress: clientIp,
      signature: {
        verified: sigResult.verified,
        algorithm: sigResult.algorithm || 'HMAC-SHA256',
        keyVersion: endpoint.secretVersion || 1,
      },
      status: 'QUEUED',
    });

    // 5. Enqueue BullMQ job after successful persistence
    await addWebhookToQueue({
      eventId: event._id.toString(),
      tenantId: endpoint.tenantId.toString(),
      endpointId: endpoint.token,
      targetUrl: endpoint.targetUrl,
      rawBody: rawBodyBuffer,
      headers: sanitizedHeaders,
      signingSecret: endpoint.signingSecret,
    });

    // Emit real-time webhook.received event to tenant room
    emitToTenant(endpoint.tenantId, 'webhook.received', {
      eventId: event._id.toString(),
      id: event._id.toString(),
      endpointId: endpoint.token,
      provider: endpoint.provider,
      providerEventId: event.providerEventId,
      eventType: event.eventType,
      status: 'QUEUED',
      duplicate: false,
      createdAt: event.createdAt,
      receivedAt: event.createdAt,
    });

    // 6. Return 202 Accepted immediately
    return res.status(202).json({
      success: true,
      message: 'Webhook received',
      eventId: event._id,
    });
  } catch (error) {
    // 7. Idempotency handling for duplicate providerEventId
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Duplicate event ignored (Idempotent delivery)',
      });
    }
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to ingest webhook',
    });
  }
};

export const getEndpointLogs = async (req, res) => {
  try {
    const token = req.params.token || req.params.endpointId;
    const tenantId = req.user.tenantId;

    const events = await WebhookEvent.find({ endpointId: token, tenantId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-rawBody');

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message,
    });
  }
};