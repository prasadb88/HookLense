import express from 'express';
import { ingestWebhook, getEndpointLogs } from '../controller/webhook.controller.js';

const router = express.Router();

// Catch-all POST/GET/PUT for incoming webhook events
router.all('/:token', ingestWebhook);

// Fetch logs for UI dashboard inspection
router.get('/:token/logs', getEndpointLogs);

export default router;
