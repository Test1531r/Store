import express from 'express';
import { body } from 'express-validator';
import {
  createSale,
  getSales,
  getSale,
  processReturn,
  getDailySummary
} from '../controllers/sale.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, idParam, paginationQuery } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);

const saleValidation = [
  body('items').isArray({ min: 1 }),
  body('items.*.productId').isUUID(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.unitPrice').isFloat({ min: 0 }),
  body('payments').isArray({ min: 1 }),
  body('payments.*.amount').isFloat({ min: 0 }),
  body('payments.*.method').isIn(['CASH', 'CARD', 'VODAFONE_CASH', 'INSTAPAY', 'STC_PAY', 'BANK_TRANSFER', 'CREDIT', 'MIXED'])
];

router.post('/', authorize('SALES:CREATE'), validate(saleValidation), createSale);
router.get('/', authorize('SALES:READ'), validate(paginationQuery), getSales);
router.get('/daily-summary', authorize('SALES:READ'), getDailySummary);
router.get('/:id', authorize('SALES:READ'), validate([idParam]), getSale);
router.post('/:id/return', authorize('SALES:UPDATE'), validate([idParam]), processReturn);

export default router;
