import express from 'express';
import { ingestWebhook, getEndpointLogs } from '../controller/webhook.controller.js';

const router = express.Router();

router.all('/:token', ingestWebhook);

router.get('/:token/logs', getEndpointLogs);

export default router;
