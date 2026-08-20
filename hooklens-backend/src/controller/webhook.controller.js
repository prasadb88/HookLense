import crypto from 'crypto';
import WebhookEndpoint from '../models/WebhookEndpoint.js';
import WebhookEvent from '../models/WebhookEvent.js';
import { RazorpayAdapter } from '../adapter/razorpay.adapter.js';
import { addWebhookToQueue } from '../queues/webhook.queue.js';

export const ingestWebhook = async (req, res) => {
    try {
        const token = req.params.token || req.params.endpointId;
        const rawBodyBuffer = req.body;

        if (!rawBodyBuffer || rawBodyBuffer.length === 0) {
            return res.status(400).json({ success: false, error: 'Empty payload received' });
        }

        const endpoint = await WebhookEndpoint.findOne({ token, isActive: true });
        if (!endpoint) {
            return res.status(404).json({ success: false, error: 'Endpoint not found or disabled' });
        }

        const signatureHeader = req.headers['x-razorpay-signature'];
        const sigResult = RazorpayAdapter.verifySignature(
            rawBodyBuffer,
            signatureHeader,
            endpoint.secret
        );

        const { providerEventId, eventType } = RazorpayAdapter.extractMetadata(rawBodyBuffer);
        const payloadHash = crypto.createHash('sha256').update(rawBodyBuffer).digest('hex');

        const event = await WebhookEvent.create({
            tenantId: endpoint.tenantId,
            endpointId: endpoint.token,
            provider: endpoint.provider,
            providerEventId,
            eventType,
            method: req.method,
            headers: req.headers,
            payloadHash,
            rawBody: rawBodyBuffer,
            payloadSize: rawBodyBuffer.length,
            ipAddress: req.ip || req.socket.remoteAddress,
            signature: {
                verified: sigResult.verified,
                algorithm: sigResult.algorithm || 'HMAC-SHA256',
                keyVersion: endpoint.secretVersion,
            },
            status: sigResult.verified ? 'QUEUED' : 'AUTHENTICATED',
        });

        if (!sigResult.verified) {
            return res.status(401).json({
                success: false,
                error: 'INVALID_SIGNATURE',
                message: sigResult.reason,
                eventId: event._id,
            });
        }

        await addWebhookToQueue({
            eventId: event._id.toString(),
            targetUrl: endpoint.targetUrl,
            rawBody: rawBodyBuffer,
            headers: req.headers,
            tenantId: endpoint.tenantId,
        });

        return res.status(202).json({
            success: true,
            message: 'Webhook received, authenticated, and queued for delivery',
            eventId: event._id,
            status: 'QUEUED',
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(200).json({
                success: true,
                message: 'Duplicate event ignored (Idempotent delivery)',
            });
        }
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const getEndpointLogs = async (req, res) => {
    try {
        const token = req.params.token || req.params.endpointId;
        const events = await WebhookEvent.find({ endpointId: token }).sort({ createdAt: -1 }).limit(50);
        return res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};