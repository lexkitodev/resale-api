import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';

const router = Router();

// Get all categories
router.get('/', CategoryController.getAll);

// Get latest items - Most specific route first
router.get('/latest', CategoryController.getLatestItems);

// Get items by category - More specific than :id
router.get('/:slug/items', CategoryController.getItems);

// Get single item - Least specific, must come last
router.get('/items/:id', CategoryController.getItem);

export default router;
