import mongoose from 'mongoose';
import WebhookEvent from '../models/WebhookEvent.js';
import DeliveryAttempt from '../models/DeliveryAttempt.js';

// @desc    Get aggregate metrics (Total, Success Rate, Latency, Failed Last Hour)
// @route   GET /api/v1/analytics/overview
export const getAnalyticsOverview = async (req, res) => {
    try {
        const tenantId = new mongoose.Types.ObjectId(req.user.tenantId);
        const { period = '24h' } = req.query;

        let durationMs = 24 * 60 * 60 * 1000;
        if (period === '7d') durationMs = 7 * 24 * 60 * 60 * 1000;
        if (period === '30d') durationMs = 30 * 24 * 60 * 60 * 1000;

        const startDate = new Date(Date.now() - durationMs);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        // 1. Aggregate event stats scoped by tenantId & time period
        const eventStats = await WebhookEvent.aggregate([
            { $match: { tenantId, createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: null,
                    totalEvents: { $sum: 1 },
                    succeeded: {
                        $sum: { $cond: [{ $eq: ['$status', 'SUCCEEDED'] }, 1, 0] },
                    },
                    failed: {
                        $sum: { $cond: [{ $in: ['$status', ['FAILED', 'DEAD_LETTERED']] }, 1, 0] },
                    },
                    deadLettered: {
                        $sum: { $cond: [{ $eq: ['$status', 'DEAD_LETTERED'] }, 1, 0] },
                    },
                    queued: {
                        $sum: { $cond: [{ $in: ['$status', ['QUEUED', 'DELIVERING', 'RETRY_SCHEDULED']] }, 1, 0] },
                    },
                },
            },
        ]);

        // 2. Aggregate latency stats scoped by tenantId & time period
        const latencyStats = await DeliveryAttempt.aggregate([
            { $match: { tenantId, createdAt: { $gte: startDate }, latencyMs: { $ne: null } } },
            {
                $group: {
                    _id: null,
                    avgLatencyMs: { $avg: '$latencyMs' },
                    totalAttempts: { $sum: 1 },
                },
            },
        ]);

        // 3. Count failures in the last 1 hour
        const failedLastHour = await DeliveryAttempt.countDocuments({
            tenantId,
            status: 'FAILED',
            createdAt: { $gte: oneHourAgo },
        });

        const stats = eventStats[0] || {
            totalEvents: 0,
            succeeded: 0,
            failed: 0,
            deadLettered: 0,
            queued: 0,
        };

        const totalEvents = stats.totalEvents || 0;
        const succeeded = stats.succeeded || 0;
        const failed = stats.failed || 0;

        const hasLatencyData = latencyStats.length > 0 && latencyStats[0].totalAttempts > 0;
        const avgLatencyMs = hasLatencyData ? Math.round(latencyStats[0].avgLatencyMs) : null;

        const successRateNumber = totalEvents > 0 ? Number(((succeeded / totalEvents) * 100).toFixed(1)) : null;
        const failureRateNumber = totalEvents > 0 ? Number(((failed / totalEvents) * 100).toFixed(1)) : null;

        return res.status(200).json({
            success: true,
            data: {
                totalEvents,
                succeeded,
                failed,
                deadLettered: stats.deadLettered || 0,
                queued: stats.queued || 0,
                successRateNumber,
                failureRateNumber,
                avgLatencyMs,
                hasLatencyData,
                failedLastHour,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get event distribution for charts scoped by time period
// @route   GET /api/v1/analytics/timeseries
export const getTimeSeriesAnalytics = async (req, res) => {
    try {
        const tenantId = new mongoose.Types.ObjectId(req.user.tenantId);
        const { period = '24h' } = req.query;

        let durationMs = 24 * 60 * 60 * 1000;
        let format = '%Y-%m-%dT%H:00:00.000Z';
        if (period === '7d') {
            durationMs = 7 * 24 * 60 * 60 * 1000;
            format = '%Y-%m-%dT%H:00:00.000Z';
        } else if (period === '30d') {
            durationMs = 30 * 24 * 60 * 60 * 1000;
            format = '%Y-%m-%dT%H:00:00.000Z';
        }

        const startDate = new Date(Date.now() - durationMs);

        const timeSeries = await WebhookEvent.aggregate([
            { $match: { tenantId, createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format, date: '$createdAt' },
                    },
                    count: { $sum: 1 },
                    succeeded: {
                        $sum: { $cond: [{ $eq: ['$status', 'SUCCEEDED'] }, 1, 0] },
                    },
                    failed: {
                        $sum: { $cond: [{ $in: ['$status', ['FAILED', 'DEAD_LETTERED']] }, 1, 0] },
                    },
                    retrying: {
                        $sum: { $cond: [{ $in: ['$status', ['QUEUED', 'DELIVERING', 'RETRY_SCHEDULED']] }, 1, 0] },
                    },
                },
            },
            { $sort: { '_id': 1 } },
            { $limit: 50 },
        ]);

        return res.status(200).json({
            success: true,
            data: timeSeries,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};