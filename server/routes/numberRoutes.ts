import { Router } from 'express';
import * as NumberController from '../controllers/NumberController.js';
import * as BulkController from '../controllers/BulkController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', NumberController.getNumbers);
router.post('/', authMiddleware, NumberController.createNumber);
router.post('/bulk', authMiddleware, BulkController.bulkCreateNumbers);
router.put('/:id', authMiddleware, NumberController.updateNumber);
router.delete('/:id', authMiddleware, NumberController.deleteNumber);
router.get('/:id/history', authMiddleware, NumberController.getNumberHistory);

export default router;
