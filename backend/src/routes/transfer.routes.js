import express from 'express';
import {
  createTransfer, getTransfers, getTransfer, updateTransferStatus
} from '../controllers/transfer.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, idParam, paginationQuery } from '../middleware/validation.js';

const router = express.Router();
router.use(authenticate);

router.post('/', authorize('TRANSFERS:CREATE'), createTransfer);
router.get('/', authorize('TRANSFERS:READ'), validate(paginationQuery), getTransfers);
router.get('/:id', authorize('TRANSFERS:READ'), validate([idParam]), getTransfer);
router.put('/:id/status', authorize('TRANSFERS:UPDATE'), validate([idParam]), updateTransferStatus);

export default router;
