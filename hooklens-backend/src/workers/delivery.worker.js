import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { WEBHOOK_QUEUE_NAME } from '../queues/webhook.queue.js';
import { forwardWebhook } from '../utils/forwarder.js';
import WebhookEvent from '../models/WebhookEvent.js';
import DeliveryAttempt from '../models/DeliveryAttempt.js';

export const deliveryWorker = new Worker(
    WEBHOOK_QUEUE_NAME,
    async (job) => {
        const { eventId, targetUrl, rawBody, headers, tenantId } = job.data;
        const rawBodyBuffer = Buffer.isBuffer(rawBody)
            ? rawBody
            : Buffer.from(rawBody?.data || rawBody || '');

        const deliveryResult = await forwardWebhook(targetUrl, rawBodyBuffer, headers);

        const attempt = await DeliveryAttempt.create({
            eventId,
            tenantId,
            targetUrl,
            attemptNumber: job.attemptsMade + 1,
            status: deliveryResult.status,
            httpStatus: deliveryResult.httpStatus,
            latencyMs: deliveryResult.latencyMs,
            responseBody: deliveryResult.responseBody,
            errorMessage: deliveryResult.errorMessage,
        });

        const event = await WebhookEvent.findById(eventId);
        if (event) {
            event.status = deliveryResult.status === 'SUCCEEDED' ? 'SUCCEEDED' : 'RETRY_SCHEDULED';
            await event.save();
        }

        console.log(
            `⚡ [Worker] Job ${job.id} | Event ${eventId} | Status: ${deliveryResult.status} (${deliveryResult.httpStatus || 'ERR'}) | Latency: ${deliveryResult.latencyMs}ms`
        );

        if (deliveryResult.status !== 'SUCCEEDED') {
            throw new Error(deliveryResult.errorMessage || `Delivery failed with HTTP ${deliveryResult.httpStatus}`);
        }

        return { attemptId: attempt._id, status: deliveryResult.status };
    },
    { connection: redisConnection }
);

deliveryWorker.on('completed', (job) => {
    console.log(`✅ [Worker] Job ${job.id} completed successfully`);
});

deliveryWorker.on('failed', (job, err) => {
    console.error(`❌ [Worker] Job ${job?.id} failed: ${err.message}`);
});
