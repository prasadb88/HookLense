import express from 'express';
import { ingestWebhook, getEndpointLogs } from '../controller/webhook.controller.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected log inspection endpoint
router.get('/:token/logs', requireAuth, getEndpointLogs);

// Public webhook ingestion endpoint (Unauthenticated)
router.all('/:token', ingestWebhook);

export default router;
