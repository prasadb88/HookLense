import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const webhookEndpointSchema = new mongoose.Schema(
    {
        tenantId: {
            type: String,
            required: true,
            default: 'default_tenant',
            index: true,
        },
        name: {
            type: String,
            required: true,
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
        },
        provider: {
            type: String,
            enum: ['RAZORPAY', 'STRIPE', 'WHATSAPP', 'CUSTOM'],
            default: 'RAZORPAY',
        },
        secret: {
            type: String,
            default: 'rzp_test_secret_key_123',
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

export default mongoose.model('WebhookEndpoint', webhookEndpointSchema);