import express from 'express';
import {
  createApiKey,
  getApiKeys,
  revokeApiKey,
} from '../controller/apiKey.controller.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = express.Router();

// Require tenant authentication for all API key management routes
router.use(requireAuth);

router.route('/')
  .post(createApiKey)
  .get(getApiKeys);

router.route('/:id')
  .delete(revokeApiKey);

export default router;
