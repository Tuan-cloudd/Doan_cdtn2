import { Router } from 'express';
import { createCategory, deleteCategory, listCategories } from '../controllers/category.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(listCategories));
router.post('/', authenticate, requireRole('admin'), asyncHandler(createCategory));
router.delete('/:id', authenticate, requireRole('admin'), asyncHandler(deleteCategory));

export default router;
