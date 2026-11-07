import { Router } from 'express';
import {
  dashboard, deleteComment, deleteDocument, listComments, listPendingDocuments, listUsers, moderateDocument, setUserStatus
} from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate, requireRole('admin'));
router.get('/dashboard', asyncHandler(dashboard));
router.get('/users', asyncHandler(listUsers));
router.patch('/users/:id/status', asyncHandler(setUserStatus));
router.get('/documents/pending', asyncHandler(listPendingDocuments));
router.get('/comments', asyncHandler(listComments));
router.patch('/documents/:id/moderate', asyncHandler(moderateDocument));
router.delete('/documents/:id', asyncHandler(deleteDocument));
router.delete('/comments/:commentId', asyncHandler(deleteComment));

export default router;
