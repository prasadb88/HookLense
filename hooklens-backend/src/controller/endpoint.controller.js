import mongoose from 'mongoose';
import WebhookEndpoint from '../models/WebhookEndpoint.js';
import WebhookEvent from '../models/WebhookEvent.js';
import DeliveryAttempt from '../models/DeliveryAttempt.js';
import { validateTargetUrl } from '../utils/ssrfGuard.js';

const attachEndpointStats = async (tenantId, endpoints) => {
    if (!endpoints || endpoints.length === 0) return [];

    const tenantObjId = new mongoose.Types.ObjectId(tenantId);
    const endpointMapKeys = [];

    endpoints.forEach((ep) => {
        const epObj = ep.toObject ? ep.toObject() : ep;
        if (epObj.token) endpointMapKeys.push(epObj.token);
        if (epObj._id) endpointMapKeys.push(epObj._id.toString());
    });

    const eventStats = await WebhookEvent.aggregate([
        { $match: { tenantId: tenantObjId, endpointId: { $in: endpointMapKeys } } },
        {
            $lookup: {
                from: 'deliveryattempts',
                localField: '_id',
                foreignField: 'eventId',
                as: 'attempts'
            }
        },
        {
            $unwind: {
                path: '$attempts',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: '$endpointId',
                totalEventsSet: { $addToSet: '$_id' },
                succeededEventsSet: {
                    $addToSet: {
                        $cond: [{ $eq: ['$status', 'SUCCEEDED'] }, '$_id', '$$REMOVE']
                    }
                },
                totalLatency: { $sum: { $ifNull: ['$attempts.latencyMs', 0] } },
                latencyCount: {
                    $sum: { $cond: [{ $ne: ['$attempts.latencyMs', null] }, 1, 0] }
                }
            }
        }
    ]);

    const statsMap = new Map();
    eventStats.forEach((stat) => {
        const total = stat.totalEventsSet ? stat.totalEventsSet.length : 0;
        const succeeded = stat.succeededEventsSet ? stat.succeededEventsSet.length : 0;
        const avgLat = stat.latencyCount > 0 ? Math.round(stat.totalLatency / stat.latencyCount) : 0;
        const successPct = total > 0 ? Number(((succeeded / total) * 100).toFixed(1)) : 0;

        statsMap.set(stat._id.toString(), {
            totalEvents: total,
            successRate: successPct,
            avgLatency: avgLat,
        });
    });

    return endpoints.map((ep) => {
        const epObj = ep.toObject ? ep.toObject() : ep;
        const tokenStats = statsMap.get(epObj.token);
        const idStats = statsMap.get(epObj._id?.toString());
        const stats = tokenStats || idStats || { totalEvents: 0, successRate: 0, avgLatency: 0 };

        return {
            ...epObj,
            totalEvents: stats.totalEvents,
            successRate: stats.successRate,
            avgLatency: stats.avgLatency,
        };
    });
};

export const createEndpoint = async (req, res) => {
    try {
        const { name, provider, secret } = req.body;
        const rawTargetUrl = req.body.targetUrl || req.body.target_url || req.body.url || req.body.targetURL;
        const tenantId = req.user.tenantId;

        const finalProvider = provider ? String(provider).toUpperCase() : 'RAZORPAY';

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, error: 'INVALID_INPUT', message: 'Name is required' });
        }

        if (finalProvider === 'RAZORPAY') {
            if (!secret || !String(secret).trim()) {
                return res.status(400).json({
                    success: false,
                    error: 'VALIDATION_ERROR',
                    message: 'Razorpay Webhook Secret is required.',
                });
            }
        }

        if (!rawTargetUrl || !String(rawTargetUrl).trim()) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_TARGET_URL',
                message: 'The target URL is not allowed.',
            });
        }

        const ssrfResult = await validateTargetUrl(String(rawTargetUrl).trim());

        if (!ssrfResult.safe) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_TARGET_URL',
                message: 'The target URL is not allowed.',
            });
        }

        const endpoint = await WebhookEndpoint.create({
            tenantId,
            name: name.trim(),
            targetUrl: ssrfResult.normalizedUrl,
            provider: finalProvider,
            secret: secret ? String(secret).trim() : undefined,
        });

        const endpointObj = endpoint.toObject();
        endpointObj.signingSecret = endpoint.signingSecret;

        return res.status(201).json({
            success: true,
            message: 'Endpoint created successfully',
            data: endpointObj,
        });
    } catch (error) {
        console.error('[SSRF LOG] Exception in createEndpoint:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const getAllEndpoints = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const endpoints = await WebhookEndpoint.find({ tenantId }).sort({ createdAt: -1 });
        const endpointsWithStats = await attachEndpointStats(tenantId, endpoints);
        return res.status(200).json({
            success: true,
            count: endpointsWithStats.length,
            data: endpointsWithStats,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const getEndpointByToken = async (req, res) => {
    try {
        const { token } = req.params;
        const tenantId = req.user.tenantId;

        const isObjectId = mongoose.Types.ObjectId.isValid(token);
        const query = {
            tenantId,
            $or: [{ token }, ...(isObjectId ? [{ _id: token }] : [])],
        };

        const endpoint = await WebhookEndpoint.findOne(query);

        if (!endpoint) {
            return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Endpoint not found' });
        }

        const [endpointWithStats] = await attachEndpointStats(tenantId, [endpoint]);

        return res.status(200).json({ success: true, data: endpointWithStats });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const updateEndpoint = async (req, res) => {
    try {
        const { token } = req.params;
        const tenantId = req.user.tenantId;

        // Prevent client from altering tenantId
        const updateData = { ...req.body };
        delete updateData.tenantId;

        if (updateData.provider) {
            updateData.provider = String(updateData.provider).toUpperCase();
        }

        if (updateData.secret !== undefined) {
            if (typeof updateData.secret === 'string' && updateData.secret.trim()) {
                updateData.secret = updateData.secret.trim();
            } else {
                delete updateData.secret;
            }
        }

        if (updateData.isActive !== undefined) {
            updateData.isActive = Boolean(updateData.isActive);
        } else if (updateData.status !== undefined) {
            updateData.isActive = updateData.status === 'ACTIVE' || updateData.status === 'ENABLED';
        }

        const rawTargetUrl = updateData.targetUrl || updateData.target_url || updateData.url || updateData.targetURL;

        if (rawTargetUrl !== undefined && rawTargetUrl !== null) {
            const trimmedUrl = String(rawTargetUrl).trim();
            if (!trimmedUrl) {
                return res.status(400).json({
                    success: false,
                    error: 'INVALID_TARGET_URL',
                    message: 'The target URL is not allowed.',
                });
            }

            const ssrfResult = await validateTargetUrl(trimmedUrl);

            if (!ssrfResult.safe) {
                return res.status(400).json({
                    success: false,
                    error: 'INVALID_TARGET_URL',
                    message: 'The target URL is not allowed.',
                });
            }
            updateData.targetUrl = ssrfResult.normalizedUrl;
        }

        const isObjectId = mongoose.Types.ObjectId.isValid(token);
        const query = {
            tenantId,
            $or: [{ token }, ...(isObjectId ? [{ _id: token }] : [])],
        };

        const endpoint = await WebhookEndpoint.findOneAndUpdate(
            query,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!endpoint) {
            return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Endpoint not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Endpoint updated successfully',
            data: endpoint,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteEndpoint = async (req, res) => {
    try {
        const { token } = req.params;
        const tenantId = req.user.tenantId;

        const isObjectId = mongoose.Types.ObjectId.isValid(token);
        const query = {
            tenantId,
            $or: [{ token }, ...(isObjectId ? [{ _id: token }] : [])],
        };

        const endpoint = await WebhookEndpoint.findOneAndDelete(query);

        if (!endpoint) {
            return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Endpoint not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Endpoint deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
