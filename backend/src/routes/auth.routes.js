import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getMe,
  changePassword,
  getLoginHistory
} from '../controllers/auth.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('roleId').isUUID()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const passwordValidation = [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
];

// Public routes
router.post('/register', authenticate, authorize('USERS:CREATE'), validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAll);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, validate(passwordValidation), changePassword);
router.get('/login-history', authenticate, getLoginHistory);

export default router;
