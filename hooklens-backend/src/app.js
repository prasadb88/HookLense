import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import endpointRoutes from './routes/endpoint.routes.js';
import eventRoutes from './routes/event.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

const app = express();

app.use(cors());
app.use(morgan('dev'));

// Public raw body ingestion route for webhooks
app.use('/api/v1/wh', express.raw({ type: '*/*', limit: '5mb' }));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Mounted Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/wh', webhookRoutes);
app.use('/api/v1/endpoints', endpointRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

export default app;