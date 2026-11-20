import { Router } from 'express';
import { forgotPassword, getCurrentUser, login, register, resetPassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));
router.get('/me', authenticate, asyncHandler(getCurrentUser));

export default router;
