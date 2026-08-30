import express from 'express';
import {
  signup,
  login,
  googleAuth,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controller/auth.controller.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', requireAuth, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
