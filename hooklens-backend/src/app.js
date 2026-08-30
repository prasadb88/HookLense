import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import endpointRoutes from './routes/endpoint.routes.js';
import eventRoutes from './routes/event.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import apiKeyRoutes from './routes/apiKey.routes.js';

const app = express();

// Configurable production CORS origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server webhook producers)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('CORS policy rejection: Origin not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Razorpay-Signature',
      'Stripe-Signature',
      'X-Hub-Signature-256',
      'X-HookLens-Signature',
      'X-HookLens-Key',
    ],
  })
);

app.use(morgan('dev'));

// Rate Limiting for Public Webhook Ingestion API (600 requests per minute per IP)
const webhookIngestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_WEBHOOK_MAX || '600', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Rate limit exceeded for webhook ingestion. Please retry after 60 seconds.',
  },
});

// Public raw body ingestion route for webhooks with rate limiting
app.use('/api/v1/wh', webhookIngestLimiter, express.raw({ type: '*/*', limit: '5mb' }));
app.use('/wh', webhookIngestLimiter, express.raw({ type: '*/*', limit: '5mb' }));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mounted API Routes (supports both /api/v1/... and legacy/direct /... routes)
app.use('/api/v1/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/v1/wh', webhookRoutes);
app.use('/wh', webhookRoutes);

app.use('/api/v1/endpoints', endpointRoutes);
app.use('/endpoints', endpointRoutes);

app.use('/api/v1/events', eventRoutes);
app.use('/events', eventRoutes);

app.use('/api/v1/analytics', analyticsRoutes);
app.use('/analytics', analyticsRoutes);

app.use('/api/v1/api-keys', apiKeyRoutes);
app.use('/api-keys', apiKeyRoutes);

export default app;