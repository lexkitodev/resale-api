import express from 'express';
import { CategoryController } from '../controllers/CategoryController';

const router = express.Router();

router.get('/', CategoryController.getAll);
router.get('/latest', CategoryController.getLatestItems);
router.get('/:slug/items', CategoryController.getItems);

export default router;
