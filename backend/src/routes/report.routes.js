import express from 'express';
import {
  getSalesReport, getInventoryReport, getProfitReport, getEmployeePerformance
} from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/sales', authorize('REPORTS:READ'), getSalesReport);
router.get('/inventory', authorize('REPORTS:READ'), getInventoryReport);
router.get('/profit', authorize('REPORTS:READ'), getProfitReport);
router.get('/employees', authorize('REPORTS:READ'), getEmployeePerformance);

export default router;
