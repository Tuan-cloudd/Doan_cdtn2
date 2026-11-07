import { Router } from 'express';
import { changePassword, deleteMyDocument, myDocuments, myFavorites, updateProfile } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate);
router.put('/profile', asyncHandler(updateProfile));
router.put('/password', asyncHandler(changePassword));
router.get('/documents', asyncHandler(myDocuments));
router.delete('/documents/:id', asyncHandler(deleteMyDocument));
router.get('/favorites', asyncHandler(myFavorites));

export default router;
