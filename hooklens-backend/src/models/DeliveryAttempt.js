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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
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

deliveryAttemptSchema.index({ tenantId: 1, createdAt: -1 });
deliveryAttemptSchema.index({ tenantId: 1, eventId: 1 });

export default mongoose.model('DeliveryAttempt', deliveryAttemptSchema);