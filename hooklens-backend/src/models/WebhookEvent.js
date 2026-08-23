import mongoose from 'mongoose';

const webhookEventSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            index: true,
        },
        endpointId: {
            type: String,
            required: true,
            index: true,
        },
        provider: {
            type: String,
            required: true,
            enum: ['RAZORPAY', 'STRIPE', 'WHATSAPP', 'CUSTOM'],
            index: true,
        },
        providerEventId: {
            type: String,
            default: null,
        },
        eventType: {
            type: String,
            default: 'unknown',
            index: true,
        },
        method: {
            type: String,
            required: true,
            default: 'POST',
        },
        headers: {
            type: Map,
            of: String,
            default: {},
        },
        payloadHash: {
            type: String,
            required: true,
            index: true,
        },
        rawBody: {
            type: Buffer,
            required: true,
        },
        payloadSize: {
            type: Number,
            required: true,
        },
        ipAddress: {
            type: String,
            default: null,
        },
        signature: {
            verified: { type: Boolean, default: false },
            algorithm: { type: String, default: 'HMAC-SHA256' },
            keyVersion: { type: Number, default: 1 },
        },
        freshness: {
            verified: { type: Boolean, default: false },
            providerTimestamp: { type: Date, default: null },
            ageMs: { type: Number, default: null },
        },
        duplicate: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: [
                'RECEIVED',
                'AUTHENTICATED',
                'QUEUED',
                'DELIVERING',
                'SUCCEEDED',
                'RETRY_SCHEDULED',
                'DEAD_LETTERED',
                'CANCELLED',
            ],
            default: 'RECEIVED',
            index: true,
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
    },
    { timestamps: true }
);

webhookEventSchema.index({ tenantId: 1, createdAt: -1 });
webhookEventSchema.index({ tenantId: 1, endpointId: 1 });
webhookEventSchema.index({ tenantId: 1, status: 1 });
webhookEventSchema.index({ tenantId: 1, provider: 1 });

webhookEventSchema.index(
    { tenantId: 1, provider: 1, providerEventId: 1 },
    {
        unique: true,
        partialFilterExpression: { providerEventId: { $type: 'string' } },
    }
);

webhookEventSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('WebhookEvent', webhookEventSchema);