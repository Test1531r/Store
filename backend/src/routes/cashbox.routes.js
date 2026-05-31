import express from 'express';
import {
  createCashbox, getCashboxes, getCashbox, createTransaction
} from '../controllers/cashbox.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, idParam } from '../middleware/validation.js';

const router = express.Router();
router.use(authenticate);

router.post('/', authorize('FINANCE:CREATE'), createCashbox);
router.get('/', authorize('FINANCE:READ'), getCashboxes);
router.get('/:id', authorize('FINANCE:READ'), validate([idParam]), getCashbox);
router.post('/:id/transactions', authorize('FINANCE:CREATE'), validate([idParam]), createTransaction);

export default router;
