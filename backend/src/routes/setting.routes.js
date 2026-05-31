import express from 'express';
import { getSettings, getSetting, updateSetting } from '../controllers/setting.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, idParam } from '../middleware/validation.js';

const router = express.Router();
router.use(authenticate);

router.get('/', authorize('SETTINGS:READ'), getSettings);
router.get('/:id', authorize('SETTINGS:READ'), validate([idParam]), getSetting);
router.put('/:id', authorize('SETTINGS:UPDATE'), validate([idParam]), updateSetting);

export default router;
