import WebhookEvent from '../models/WebhookEvent.js';
import DeliveryAttempt from '../models/DeliveryAttempt.js';
import WebhookEndpoint from '../models/WebhookEndpoint.js';

// @desc    Get aggregate metrics (Total, Success Rate, Latency, Dead Lettered)
// @route   GET /api/v1/analytics/overview
export const getAnalyticsOverview = async (req, res) => {
    try {
        const { tenantId = 'default_tenant' } = req.query;

        // १. WebhookEvent वरून एकूण आणि स्टेटसचे आकडे काढणे
        const eventStats = await WebhookEvent.aggregate([
            { $match: { tenantId } },
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

        // २. DeliveryAttempt वरून सरासरी लेटन्सी (Avg Latency) काढणे
        const latencyStats = await DeliveryAttempt.aggregate([
            { $match: { tenantId, latencyMs: { $ne: null } } },
            {
                $group: {
                    _id: null,
                    avgLatencyMs: { $avg: '$latencyMs' },
                    totalAttempts: { $sum: 1 },
                },
            },
        ]);

        const stats = eventStats[0] || {
            totalEvents: 0,
            succeeded: 0,
            failed: 0,
            deadLettered: 0,
            queued: 0,
        };

        const avgLatency = latencyStats[0] ? Math.round(latencyStats[0].avgLatencyMs) : 0;
        const successRate = stats.totalEvents > 0
            ? Number(((stats.succeeded / stats.totalEvents) * 100).toFixed(2))
            : 100.0;

        return res.status(200).json({
            success: true,
            data: {
                totalEvents: stats.totalEvents,
                successRate: `${successRate}%`,
                successRateNumber: successRate,
                avgLatencyMs: avgLatency,
                deadLettered: stats.deadLettered,
                failed: stats.failed,
                queued: stats.queued,
                succeeded: stats.succeeded,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get hourly event distribution for charts
// @route   GET /api/v1/analytics/timeseries
export const getTimeSeriesAnalytics = async (req, res) => {
    try {
        const { tenantId = 'default_tenant' } = req.query;

        const timeSeries = await WebhookEvent.aggregate([
            { $match: { tenantId } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d %H:00', date: '$createdAt' },
                    },
                    count: { $sum: 1 },
                    succeeded: {
                        $sum: { $cond: [{ $eq: ['$status', 'SUCCEEDED'] }, 1, 0] },
                    },
                    failed: {
                        $sum: { $cond: [{ $in: ['$status', ['FAILED', 'DEAD_LETTERED']] }, 1, 0] },
                    },
                },
            },
            { $sort: { '_id': 1 } },
            { $limit: 24 },
        ]);

        return res.status(200).json({
            success: true,
            data: timeSeries,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};