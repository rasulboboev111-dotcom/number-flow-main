import { Router } from 'express';
import { getOperators, createOperator, deleteOperator } from '../controllers/OperatorController.js';
import { getCategories, createCategory, deleteCategory } from '../controllers/CategoryController.js';
import { getStats } from '../controllers/CommonController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/stats', getStats);
router.get('/operators', getOperators);
router.post('/operators', authMiddleware, createOperator);
router.put('/operators/:id', authMiddleware, (req, res, next) => {
    import('../controllers/OperatorController.js').then(c => c.updateOperator(req, res)).catch(next);
});
router.delete('/operators/:id', authMiddleware, deleteOperator);

router.get('/categories', getCategories);
router.post('/categories', authMiddleware, createCategory);
router.put('/categories/:id', authMiddleware, (req, res, next) => {
    import('../controllers/CategoryController.js').then(c => c.updateCategory(req, res)).catch(next);
});
router.delete('/categories/:id', authMiddleware, deleteCategory);

export default router;
