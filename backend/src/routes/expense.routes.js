import express from 'express';
import {
  createExpense, getExpenses, getExpenseCategories, createExpenseCategory
} from '../controllers/expense.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, paginationQuery } from '../middleware/validation.js';

const router = express.Router();
router.use(authenticate);

router.post('/', authorize('EXPENSES:CREATE'), createExpense);
router.get('/', authorize('EXPENSES:READ'), validate(paginationQuery), getExpenses);
router.get('/categories', authorize('EXPENSES:READ'), getExpenseCategories);
router.post('/categories', authorize('EXPENSES:CREATE'), createExpenseCategory);

export default router;
