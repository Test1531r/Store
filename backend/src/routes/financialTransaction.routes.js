import express from 'express';
import {
  createTransaction, getTransactions, getDailyReport
} from '../controllers/financialTransaction.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, paginationQuery } from '../middleware/validation.js';

const router = express.Router();
router.use(authenticate);

router.post('/', authorize('FINANCE:CREATE'), createTransaction);
router.get('/', authorize('FINANCE:READ'), validate(paginationQuery), getTransactions);
router.get('/daily-report', authorize('FINANCE:READ'), getDailyReport);

export default router;
