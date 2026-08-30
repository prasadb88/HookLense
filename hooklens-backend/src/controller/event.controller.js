import mongoose from 'mongoose';
import WebhookEvent from '../models/WebhookEvent.js';
import DeliveryAttempt from '../models/DeliveryAttempt.js';
import WebhookEndpoint from '../models/WebhookEndpoint.js';
import { addWebhookToQueue } from '../queues/webhook.queue.js';

export const getEvents = async (req, res) => {
    try {
        const { status, provider, eventType, endpointId, page = 1, limit = 20 } = req.query;
        const tenantId = req.user.tenantId;

        const filter = { tenantId };
        if (status) {
            if (status === 'FAILED' || status === 'DEAD_LETTERED') {
                filter.status = { $in: ['FAILED', 'DEAD_LETTERED'] };
            } else if (status === 'SUCCESS' || status === 'SUCCEEDED') {
                filter.status = { $in: ['SUCCEEDED', 'SUCCESS'] };
            } else if (status === 'RETRYING' || status === 'RETRY_SCHEDULED') {
                filter.status = { $in: ['RETRY_SCHEDULED', 'RETRYING'] };
            } else {
                filter.status = status;
            }
        }
        if (provider) filter.provider = provider;
        if (eventType) filter.eventType = eventType;
        if (endpointId) filter.endpointId = endpointId;

        const skip = (Number(page) - 1) * Number(limit);

        const [events, total] = await Promise.all([
            WebhookEvent.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .select('-rawBody')
                .lean(),
            WebhookEvent.countDocuments(filter),
        ]);

        const tenantObjId = new mongoose.Types.ObjectId(tenantId);
        const eventObjectIds = events.map((e) => new mongoose.Types.ObjectId(e._id));

        const attemptStats = eventObjectIds.length > 0 ? await DeliveryAttempt.aggregate([
            { $match: { eventId: { $in: eventObjectIds }, tenantId: tenantObjId } },
            { $sort: { createdAt: 1 } },
            {
                $group: {
                    _id: '$eventId',
                    totalAttempts: { $sum: 1 },
                    initialAttempts: {
                        $sum: { $cond: [{ $eq: ['$isManualReplay', true] }, 0, 1] }
                    },
                    manualReplays: {
                        $sum: { $cond: [{ $eq: ['$isManualReplay', true] }, 1, 0] }
                    },
                    lastError: { $last: '$errorMessage' },
                    lastHttpStatus: { $last: '$httpStatus' },
                    lastLatencyMs: { $last: '$latencyMs' },
                    lastAttemptAt: { $last: '$createdAt' },
                }
            }
        ]) : [];

        const statsMap = new Map();
        attemptStats.forEach((stat) => {
            statsMap.set(stat._id.toString(), stat);
        });

        const eventsWithStats = events.map((e) => {
            const stat = statsMap.get(e._id.toString());
            return {
                ...e,
                attemptsCount: stat?.totalAttempts || 0,
                initialAttemptsCount: stat?.initialAttempts || 0,
                manualReplaysCount: stat?.manualReplays || 0,
                lastHttpStatus: stat?.lastHttpStatus ?? null,
                lastLatencyMs: stat?.lastLatencyMs ?? 0,
                lastError: stat?.lastError ?? null,
                lastAttemptAt: stat?.lastAttemptAt ?? e.createdAt,
            };
        });

        return res.status(200).json({
            success: true,
            data: eventsWithStats,
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

export const getReplays = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const manualAttempts = await DeliveryAttempt.find({ tenantId, isManualReplay: true })
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('eventId', 'eventType providerEventId endpointId');

        const replayHistory = manualAttempts.map((att) => {
            const targetEvt = att.eventId;
            const eventIdStr = targetEvt ? (targetEvt._id || targetEvt).toString() : att.eventId?.toString();
            return {
                replayId: `rpl_${att._id.toString().substring(18)}`,
                eventId: eventIdStr,
                endpointName: targetEvt?.endpointId ? `Endpoint ${targetEvt.endpointId.substring(0, 8)}` : 'Webhook Endpoint',
                eventType: targetEvt?.eventType || targetEvt?.providerEventId || 'webhook.event',
                triggeredBy: 'Authenticated User (Manual)',
                status: att.status === 'SUCCEEDED' ? 'SUCCESS' : att.status,
                httpStatus: att.httpStatus,
                latency: att.latencyMs || 0,
                timestamp: att.createdAt,
            };
        });

        return res.status(200).json({
            success: true,
            data: replayHistory,
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

        const endpoint = await WebhookEndpoint.findOne({ token: event.endpointId, tenantId }).select('+signingSecret');
        if (!endpoint) {
            return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Target endpoint no longer exists' });
        }

        const lastAttempt = await DeliveryAttempt.findOne({ eventId: event._id, tenantId })
            .sort({ attemptNumber: -1 })
            .select('attemptNumber');
        const initialAttemptNumber = lastAttempt ? lastAttempt.attemptNumber : 0;

        event.status = 'QUEUED';
        await event.save();

        const job = await addWebhookToQueue(
            {
                eventId: event._id.toString(),
                endpointId: endpoint.token,
                targetUrl: endpoint.targetUrl,
                rawBody: event.rawBody,
                headers: event.headers,
                tenantId: event.tenantId.toString(),
                signingSecret: endpoint.signingSecret,
                isManualReplay: true,
                initialAttemptNumber,
            },
            { isManualReplay: true }
        );

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