import express from 'express';
import { getDashboardStats, getChartData } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/charts', getChartData);

export default router;
