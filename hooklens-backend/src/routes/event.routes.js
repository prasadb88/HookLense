import express from 'express';
import { getEvents, getEventById, replayEvent } from '../controller/event.controller.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = express.Router();

// All event management routes require authentication & tenant context
router.use(requireAuth);

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/:id/replay', replayEvent);

export default router;