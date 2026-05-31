import express from 'express';
import {
  createRepair, getRepairs, getRepair, updateRepairStatus, addRepairItem
} from '../controllers/repair.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, idParam, paginationQuery } from '../middleware/validation.js';

const router = express.Router();
router.use(authenticate);

router.post('/', authorize('REPAIRS:CREATE'), createRepair);
router.get('/', authorize('REPAIRS:READ'), validate(paginationQuery), getRepairs);
router.get('/:id', authorize('REPAIRS:READ'), validate([idParam]), getRepair);
router.put('/:id/status', authorize('REPAIRS:UPDATE'), validate([idParam]), updateRepairStatus);
router.post('/:repairId/items', authorize('REPAIRS:UPDATE'), validate([idParam]), addRepairItem);

export default router;
