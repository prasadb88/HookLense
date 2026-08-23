import express from 'express';
import { getAnalyticsOverview, getTimeSeriesAnalytics } from '../controller/analytics.controller.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = express.Router();

// All analytics routes require authentication & tenant context
router.use(requireAuth);

router.get('/overview', getAnalyticsOverview);
router.get('/timeseries', getTimeSeriesAnalytics);

export default router;