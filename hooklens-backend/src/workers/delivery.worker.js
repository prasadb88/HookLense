import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { WEBHOOK_QUEUE_NAME } from '../queues/webhook.queue.js';
import { forwardWebhook } from '../utils/forwarder.js';
import WebhookEvent from '../models/WebhookEvent.js';
import DeliveryAttempt from '../models/DeliveryAttempt.js';
import WebhookEndpoint from '../models/WebhookEndpoint.js';

export const deliveryWorker = new Worker(
    WEBHOOK_QUEUE_NAME,
    async (job) => {
        const { eventId, endpointId, targetUrl, rawBody, headers, tenantId, isManualReplay } = job.data;
        let signingSecret = job.data.signingSecret;

        if (!signingSecret && endpointId) {
            const endpoint = await WebhookEndpoint.findOne({ token: endpointId }).select('+signingSecret');
            if (endpoint && endpoint.signingSecret) {
                signingSecret = endpoint.signingSecret;
            }
        }

        const rawBodyBuffer = Buffer.isBuffer(rawBody)
            ? rawBody
            : Buffer.from(rawBody?.data || rawBody || '');

        const deliveryResult = await forwardWebhook(targetUrl, rawBodyBuffer, headers, signingSecret);

        // Compute sequential attempt number based on existing database records
        const existingAttemptCount = await DeliveryAttempt.countDocuments({ eventId, tenantId });
        const attemptNumber = existingAttemptCount + 1;

        const attempt = await DeliveryAttempt.create({
            eventId,
            tenantId,
            targetUrl,
            attemptNumber,
            status: deliveryResult.status,
            httpStatus: deliveryResult.httpStatus,
            latencyMs: deliveryResult.latencyMs,
            responseBody: deliveryResult.responseBody,
            errorMessage: deliveryResult.errorMessage,
            isManualReplay: isManualReplay === true,
        });

        const event = await WebhookEvent.findById(eventId);
        const maxRetries = isManualReplay ? 1 : (job.opts?.attempts || 5);
        const isLastAttempt = (job.attemptsMade + 1) >= maxRetries;

        if (event) {
            if (deliveryResult.status === 'SUCCEEDED') {
                event.status = 'SUCCEEDED';
            } else {
                event.status = isLastAttempt ? 'DEAD_LETTERED' : 'RETRY_SCHEDULED';
            }
            await event.save();
        }

        console.log(
            `⚡ [Worker] Job ${job.id} | Event ${eventId} | Status: ${deliveryResult.status} (${deliveryResult.httpStatus || 'ERR'}) | Latency: ${deliveryResult.latencyMs}ms | Replay: ${isManualReplay === true}`
        );

        // Real-time Socket.IO emission
        if (deliveryResult.status === 'SUCCEEDED') {
            emitToTenant(tenantId, 'delivery.succeeded', {
                eventId: eventId.toString(),
                id: eventId.toString(),
                attemptNumber: attempt.attemptNumber,
                status: 'SUCCESS',
                httpStatus: attempt.httpStatus,
                latencyMs: attempt.latencyMs,
                isManualReplay: isManualReplay === true,
                createdAt: attempt.createdAt,
            });

            if (isManualReplay) {
                emitToTenant(tenantId, 'replay.completed', {
                    eventId: eventId.toString(),
                    id: eventId.toString(),
                    attemptNumber: attempt.attemptNumber,
                    status: 'SUCCESS',
                    httpStatus: attempt.httpStatus,
                    isManualReplay: true,
                    jobId: job.id,
                });
            }
        } else {
            const nextStatus = isLastAttempt ? 'DEAD_LETTERED' : 'RETRYING';
            emitToTenant(tenantId, 'delivery.failed', {
                eventId: eventId.toString(),
                id: eventId.toString(),
                attemptNumber: attempt.attemptNumber,
                status: nextStatus,
                httpStatus: attempt.httpStatus,
                latencyMs: attempt.latencyMs,
                errorMessage: attempt.errorMessage,
                isManualReplay: isManualReplay === true,
                createdAt: attempt.createdAt,
            });

            if (!isLastAttempt) {
                emitToTenant(tenantId, 'delivery.retry', {
                    eventId: eventId.toString(),
                    id: eventId.toString(),
                    attemptNumber: attempt.attemptNumber,
                    nextAttemptNumber: attempt.attemptNumber + 1,
                    status: 'RETRYING',
                });
            }

            if (isManualReplay) {
                emitToTenant(tenantId, 'replay.completed', {
                    eventId: eventId.toString(),
                    id: eventId.toString(),
                    attemptNumber: attempt.attemptNumber,
                    status: 'FAILED',
                    httpStatus: attempt.httpStatus,
                    errorMessage: attempt.errorMessage,
                    isManualReplay: true,
                    jobId: job.id,
                });
            }

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
