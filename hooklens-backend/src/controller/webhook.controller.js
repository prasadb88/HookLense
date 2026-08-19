import crypto from 'crypto';
import WebhookEndpoint from '../models/WebhookEndpoint.js';
import WebhookEvent from '../models/WebhookEvent.js';
import DeliveryAttempt from '../models/DeliveryAttempt.js';
import { RazorpayAdapter } from '../adapter/razorpay.adapter.js';
import { forwardWebhook } from '../utils/forwarder.js';

// @desc    Ingest raw webhook, verify HMAC, record WebhookEvent & forward
// @route   POST /api/v1/wh/:token
export const ingestWebhook = async (req, res) => {
    try {
        const token = req.params.token || req.params.endpointId;
        const rawBodyBuffer = req.body; // express.raw ने दिलेला Buffer

        if (!rawBodyBuffer || rawBodyBuffer.length === 0) {
            return res.status(400).json({ success: false, error: 'Empty payload received' });
        }

        // 1. Endpoint शोधा
        const endpoint = await WebhookEndpoint.findOne({ token, isActive: true });
        if (!endpoint) {
            return res.status(404).json({ success: false, error: 'Endpoint not found or disabled' });
        }

        // 2. Razorpay Signature तपासा
        const signatureHeader = req.headers['x-razorpay-signature'];
        const sigResult = RazorpayAdapter.verifySignature(
            rawBodyBuffer,
            signatureHeader,
            endpoint.secret
        );

        // 3. Metadata Parse करा आणि Hash काढा
        const { providerEventId, eventType } = RazorpayAdapter.extractMetadata(rawBodyBuffer);
        const payloadHash = crypto.createHash('sha256').update(rawBodyBuffer).digest('hex');

        // 4. Source of Truth: WebhookEvent तयार करा
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
            status: sigResult.verified ? 'DELIVERING' : 'AUTHENTICATED',
        });

        // 5. जर स्वाक्षरी अमान्य असेल तर तात्काळ 401 द्या
        if (!sigResult.verified) {
            return res.status(401).json({
                success: false,
                error: 'INVALID_SIGNATURE',
                message: sigResult.reason,
                eventId: event._id,
            });
        }

        // 6. Target URL वर फॉरवर्ड करा (Day 2 Delivery Step)
        const deliveryResult = await forwardWebhook(
            endpoint.targetUrl,
            rawBodyBuffer,
            req.headers
        );

        // 7. स्वतंत्र DeliveryAttempt रेकॉर्ड तयार करा
        const attempt = await DeliveryAttempt.create({
            eventId: event._id,
            tenantId: endpoint.tenantId,
            targetUrl: endpoint.targetUrl,
            attemptNumber: 1,
            status: deliveryResult.status,
            httpStatus: deliveryResult.httpStatus,
            latencyMs: deliveryResult.latencyMs,
            responseBody: deliveryResult.responseBody,
            errorMessage: deliveryResult.errorMessage,
        });

        // 8. Event चा स्टेटस अपडेट करा
        event.status = deliveryResult.status === 'SUCCEEDED' ? 'SUCCEEDED' : 'RETRY_SCHEDULED';
        await event.save();

        console.log(
            `⚡ [Delivery] Event: ${eventType} | Status: ${deliveryResult.status} (${deliveryResult.httpStatus || 'ERR'}) | Latency: ${deliveryResult.latencyMs}ms`
        );

        return res.status(202).json({
            success: true,
            message: 'Webhook ingested and processed',
            eventId: event._id,
            attemptId: attempt._id,
            delivery: {
                status: deliveryResult.status,
                httpStatus: deliveryResult.httpStatus,
                latencyMs: deliveryResult.latencyMs,
            },
        });
    } catch (error) {
        // Idempotency: Duplicate providerEventId पकडणे
        if (error.code === 11000) {
            return res.status(200).json({
                success: true,
                message: 'Duplicate event ignored (Idempotent delivery)',
            });
        }
        return res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Fetch webhook logs for a given endpoint token
// @route   GET /api/v1/wh/:token/logs
export const getEndpointLogs = async (req, res) => {
    try {
        const token = req.params.token || req.params.endpointId;
        const events = await WebhookEvent.find({ endpointId: token }).sort({ createdAt: -1 }).limit(50);
        return res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};