import WebhookEvent from '../models/WebhookEvent.js';
import DeliveryAttempt from '../models/DeliveryAttempt.js';
import WebhookEndpoint from '../models/WebhookEndpoint.js';
import { addWebhookToQueue } from '../queues/webhook.queue.js';

export const getEvents = async (req, res) => {
    try {
        const { status, provider, eventType, endpointId, page = 1, limit = 20 } = req.query;
        const tenantId = req.user.tenantId;

        const filter = { tenantId };
        if (status) filter.status = status;
        if (provider) filter.provider = provider;
        if (eventType) filter.eventType = eventType;
        if (endpointId) filter.endpointId = endpointId;

        const skip = (Number(page) - 1) * Number(limit);

        const [events, total] = await Promise.all([
            WebhookEvent.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .select('-rawBody'),
            WebhookEvent.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: events,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit)),
                limit: Number(limit),
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user.tenantId;

        const event = await WebhookEvent.findOne({ _id: id, tenantId });
        if (!event) {
            return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Event not found' });
        }

        const attempts = await DeliveryAttempt.find({ eventId: id, tenantId }).sort({ attemptNumber: 1 });

        return res.status(200).json({
            success: true,
            data: {
                event,
                rawBodyString: event.rawBody ? event.rawBody.toString('utf-8') : null,
                attempts,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const replayEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user.tenantId;

        const event = await WebhookEvent.findOne({ _id: id, tenantId });
        if (!event) {
            return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Event not found' });
        }

        const endpoint = await WebhookEndpoint.findOne({ token: event.endpointId, tenantId });
        if (!endpoint) {
            return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Target endpoint no longer exists' });
        }

        const lastAttempt = await DeliveryAttempt.findOne({ eventId: event._id, tenantId })
            .sort({ attemptNumber: -1 })
            .select('attemptNumber');
        const initialAttemptNumber = lastAttempt ? lastAttempt.attemptNumber : 0;

        event.status = 'QUEUED';
        await event.save();

        const job = await addWebhookToQueue({
            eventId: event._id.toString(),
            targetUrl: endpoint.targetUrl,
            rawBody: event.rawBody,
            headers: event.headers,
            tenantId: event.tenantId.toString(),
            isManualReplay: true,
            initialAttemptNumber,
        });

        return res.status(202).json({
            success: true,
            message: 'Event successfully queued for manual replay',
            eventId: event._id,
            jobId: job.id,
            status: 'QUEUED',
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};