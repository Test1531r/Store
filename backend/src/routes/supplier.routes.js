import express from 'express';
import {
  createSupplier, getSuppliers, getSupplier, updateSupplier, deleteSupplier
} from '../controllers/supplier.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, idParam, paginationQuery } from '../middleware/validation.js';

const router = express.Router();
router.use(authenticate);

router.post('/', authorize('SUPPLIERS:CREATE'), createSupplier);
router.get('/', authorize('SUPPLIERS:READ'), validate(paginationQuery), getSuppliers);
router.get('/:id', authorize('SUPPLIERS:READ'), validate([idParam]), getSupplier);
router.put('/:id', authorize('SUPPLIERS:UPDATE'), validate([idParam]), updateSupplier);
router.delete('/:id', authorize('SUPPLIERS:DELETE'), validate([idParam]), deleteSupplier);

export default router;
