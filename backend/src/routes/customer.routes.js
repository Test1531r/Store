import express from 'express';
import {
  createCustomer, getCustomers, getCustomer, updateCustomer, deleteCustomer
} from '../controllers/customer.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, idParam, paginationQuery } from '../middleware/validation.js';

const router = express.Router();
router.use(authenticate);

router.post('/', authorize('CUSTOMERS:CREATE'), createCustomer);
router.get('/', authorize('CUSTOMERS:READ'), validate(paginationQuery), getCustomers);
router.get('/:id', authorize('CUSTOMERS:READ'), validate([idParam]), getCustomer);
router.put('/:id', authorize('CUSTOMERS:UPDATE'), validate([idParam]), updateCustomer);
router.delete('/:id', authorize('CUSTOMERS:DELETE'), validate([idParam]), deleteCustomer);

export default router;
