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

export const addWebhookToQueue = async (eventData) => {
    return await webhookQueue.add('deliver-webhook', eventData, {
        jobId: `wh_${eventData.eventId}`,
    });
};