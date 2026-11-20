import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createCollection, createReport, deleteCollection, downloadHistory, listCollections,
  listNotifications, markAllNotificationsRead, markNotificationRead, toggleCollectionDocument,
  updateCollection
} from '../controllers/feature.controller.js';

const router = Router();
router.use(authenticate);
router.get('/notifications', asyncHandler(listNotifications));
router.patch('/notifications/read-all', asyncHandler(markAllNotificationsRead));
router.patch('/notifications/:id/read', asyncHandler(markNotificationRead));
router.post('/documents/:id/reports', asyncHandler(createReport));
router.get('/collections', asyncHandler(listCollections));
router.post('/collections', asyncHandler(createCollection));
router.put('/collections/:id', asyncHandler(updateCollection));
router.delete('/collections/:id', asyncHandler(deleteCollection));
router.post('/collections/:id/documents/:documentId', asyncHandler(toggleCollectionDocument));
router.get('/history/downloads', asyncHandler(downloadHistory));

export default router;
