import { Router } from 'express';
import {
  addComment, createDocument, downloadDocument, getDocument, listDocuments, previewDocument, rateDocument, toggleFavorite
} from '../controllers/document.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';
import { uploadDocument } from '../middleware/upload.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(listDocuments));
router.get('/:id/file', asyncHandler(previewDocument));
router.post('/', authenticate, (req, res, next) => {
  uploadDocument(req, res, (error) => {
    if (error) {
      error.status = 400;
      return next(error);
    }
    next();
  });
}, asyncHandler(createDocument));
router.get('/:id/download', optionalAuthenticate, asyncHandler(downloadDocument));
router.get('/:id', optionalAuthenticate, asyncHandler(getDocument));
router.post('/:id/comments', authenticate, asyncHandler(addComment));
router.put('/:id/rating', authenticate, asyncHandler(rateDocument));
router.post('/:id/favorite', authenticate, asyncHandler(toggleFavorite));

export default router;
