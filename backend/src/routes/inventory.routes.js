import express from 'express';
import { body } from 'express-validator';

import {
  getInventory,
  adjustStock,
  getInventoryLogs,
  stockCount
} from '../controllers/inventory.controller.js';

import { authenticate, authorize } from '../middleware/auth.js';
import { validate, idParam, paginationQuery } from '../middleware/validation.js';

const router = express.Router();

// ========================
// حماية كل الروتس
// ========================
router.use(authenticate);

// ========================
// GET INVENTORY
// ========================
router.get(
  '/',
  authorize('INVENTORY:READ'),
  validate(paginationQuery),
  getInventory
);

// ========================
// INVENTORY LOGS
// ========================
router.get(
  '/logs',
  authorize('INVENTORY:READ'),
  validate(paginationQuery),
  getInventoryLogs
);

// ========================
// ADJUST STOCK (IMPORTANT)
// ده هو اللي الفرونت لازم يناديه
// POST /inventory/:inventoryId/adjust
// ========================
router.post(
  '/:inventoryId/adjust',
  authorize('INVENTORY:UPDATE'),
  validate([
    idParam,
    body('quantity').isInt(),
    body('reason').optional().isString(),
    body('notes').optional().isString(),
  ]),
  adjustStock
);

// ========================
// STOCK COUNT (Audit / Physical Count)
// POST /inventory/:branchId/count
// ========================
router.post(
  '/:branchId/count',
  authorize('INVENTORY:UPDATE'),
  stockCount
);

export default router;