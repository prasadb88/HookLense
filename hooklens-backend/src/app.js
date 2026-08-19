import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import webhookRoutes from './routes/webhook.routes.js';
import endpointRoutes from './routes/endpoint.routes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));

// ⚠️ महत्त्वाचे: Webhook ingestion साठी Raw Buffer Body Parser वापरणे
app.use('/api/v1/wh', express.raw({ type: '*/*', limit: '5mb' }));

// बाकीच्या ॲप REST APIs साठी Standard JSON Parser
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Routes
app.use('/api/v1/wh', webhookRoutes);
app.use('/api/v1/endpoints', endpointRoutes);

export default app;