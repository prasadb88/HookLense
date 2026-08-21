import express from 'express';
import { getAnalyticsOverview, getTimeSeriesAnalytics } from '../controller/analytics.controller.js';

const router = express.Router();

router.get('/overview', getAnalyticsOverview);
router.get('/timeseries', getTimeSeriesAnalytics);

export default router;