import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/SettingsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, getSettings);
router.post('/', authMiddleware, updateSettings);

export default router;
