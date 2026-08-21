import express from 'express';
import { getEvents, getEventById, replayEvent } from '../controller/event.controller.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/:id/replay', replayEvent);

export default router;