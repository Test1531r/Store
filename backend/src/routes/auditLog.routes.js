import express from 'express';
import { getAuditLogs } from '../controllers/auditLog.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, paginationQuery } from '../middleware/validation.js';

const router = express.Router();
router.use(authenticate);

router.get('/', authorize('AUDIT:READ'), validate(paginationQuery), getAuditLogs);

export default router;
