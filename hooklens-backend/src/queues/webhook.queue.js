import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

export const WEBHOOK_QUEUE_NAME = 'webhook-delivery-queue';

export const webhookQueue = new Queue(WEBHOOK_QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
    },
});

export const addWebhookToQueue = async (eventData, options = {}) => {
    const isReplay = eventData.isManualReplay === true || options.isManualReplay === true;
    const defaultJobId = isReplay
        ? `replay_${eventData.eventId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        : `wh_${eventData.eventId}`;

    return await webhookQueue.add('deliver-webhook', eventData, {
        jobId: options.jobId || defaultJobId,
    });
};