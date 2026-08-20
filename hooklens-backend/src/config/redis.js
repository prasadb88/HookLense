import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let lastLoggedError = 0;

const redisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
        return Math.min(times * 1000, 10000);
    },
};

const createRedisConnection = () => {
    if (process.env.REDIS_URI) {
        return new IORedis(process.env.REDIS_URI.replace(/"/g, ''), redisOptions);
    }

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const host = process.env.UPSTASH_REDIS_REST_URL.replace(/https?:\/\//, '').replace(/"/g, '').replace(/\/.*/, '');
        const password = process.env.UPSTASH_REDIS_REST_TOKEN.replace(/"/g, '');
        return new IORedis({
            host,
            port: 6379,
            password,
            tls: {},
            ...redisOptions,
        });
    }

    return new IORedis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        ...redisOptions,
    });
};

export const redisConnection = createRedisConnection();

redisConnection.on('connect', () => {
    console.log('✅ Redis Connected (BullMQ Engine Ready)');
});

redisConnection.on('error', (err) => {
    const now = Date.now();
    if (now - lastLoggedError > 10000) {
        console.error('❌ Redis Connection Error:', err.message);
        console.error('⚠️  Ensure Redis is running or check REDIS_URI / UPSTASH credentials in .env');
        lastLoggedError = now;
    }
});