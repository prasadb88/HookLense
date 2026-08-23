import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const webhookEndpointSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
            default: () => nanoid(16),
        },
        targetUrl: {
            type: String,
            default: '',
            trim: true,
        },
        provider: {
            type: String,
            enum: ['RAZORPAY', 'STRIPE', 'WHATSAPP', 'CUSTOM'],
            default: 'RAZORPAY',
        },
        secret: {
            type: String,
            default: () => `sec_${nanoid(24)}`,
            select: false,
        },
        secretVersion: {
            type: Number,
            default: 1,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

webhookEndpointSchema.index({ tenantId: 1, createdAt: -1 });
webhookEndpointSchema.index({ tenantId: 1, token: 1 });

export default mongoose.model('WebhookEndpoint', webhookEndpointSchema);