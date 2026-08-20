import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import webhookRoutes from './routes/webhook.routes.js';
import endpointRoutes from './routes/endpoint.routes.js';

const app = express();

app.use(cors());
app.use(morgan('dev'));

app.use('/api/v1/wh', express.raw({ type: '*/*', limit: '5mb' }));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/v1/wh', webhookRoutes);
app.use('/api/v1/endpoints', endpointRoutes);

export default app;