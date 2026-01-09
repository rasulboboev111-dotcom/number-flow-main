import { Router } from 'express';
import * as SubscriberController from '../controllers/SubscriberController.js';
import * as ContractController from '../controllers/ContractController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/subscribers', SubscriberController.getSubscribers);
router.post('/subscribers', authMiddleware, SubscriberController.createSubscriber);
router.put('/subscribers/:id', authMiddleware, SubscriberController.updateSubscriber);
router.delete('/subscribers/:id', authMiddleware, SubscriberController.deleteSubscriber);

router.get('/contracts', ContractController.getContracts);
router.post('/contracts', authMiddleware, ContractController.createContract);
router.delete('/contracts/:id', authMiddleware, ContractController.terminateContract);
router.delete('/contracts/hard/:id', authMiddleware, ContractController.deleteContract);

export default router;
