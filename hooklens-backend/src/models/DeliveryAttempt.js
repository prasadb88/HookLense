import mongoose from 'mongoose';

const deliveryAttemptSchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WebhookEvent',
            required: true,
            index: true,
        },
        tenantId: {
            type: String,
            required: true,
            index: true,
        },
        targetUrl: {
            type: String,
            required: true,
        },
        attemptNumber: {
            type: Number,
            required: true,
            default: 1,
        },
        status: {
            type: String,
            enum: ['SUCCEEDED', 'FAILED', 'BLOCKED_SSRF'],
            required: true,
        },
        httpStatus: {
            type: Number,
            default: null,
        },
        latencyMs: {
            type: Number,
            default: 0,
        },
        responseBody: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        errorMessage: {
            type: String,
            default: null,
        },
        isManualReplay: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model('DeliveryAttempt', deliveryAttemptSchema);