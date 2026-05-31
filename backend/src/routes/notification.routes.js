import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, idParam } from '../middleware/validation.js';

const router = express.Router();
router.use(authenticate);

router.get('/', getNotifications);
router.put('/:id/read', validate([idParam]), markAsRead);
router.put('/read-all', markAllAsRead);

export default router;
