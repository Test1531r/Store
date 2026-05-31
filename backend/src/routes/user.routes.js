import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  createRole,
  getPermissions
} from '../controllers/user.controller.js';

import { authenticate, authorize } from '../middleware/auth.js';
import {
  validate,
  idParam,
  paginationQuery
} from '../middleware/validation.js';

const router = express.Router();

// لازم يكون مسجل دخول
router.use(authenticate);


/* ================= ROLES ================= */

router.get(
  '/roles',
  authorize('USERS:READ'),
  getRoles
);

router.post(
  '/roles',
  authorize('USERS:CREATE'),
  createRole
);

/* ================= USERS ================= */

router.get(
  '/',
  authorize('USERS:READ'),
  validate(paginationQuery),
  getUsers
);

router.post(
  '/',
  authorize('USERS:CREATE'),
  createUser
);

router.get(
  '/:id',
  authorize('USERS:READ'),
  validate([idParam]),
  getUser
);

router.put(
  '/:id',
  authorize('USERS:UPDATE'),
  validate([idParam]),
  updateUser
);

router.delete(
  '/:id',
  authorize('USERS:DELETE'),
  validate([idParam]),
  deleteUser
);



/* ================= PERMISSIONS ================= */

router.get(
  '/permissions',
  authorize('USERS:READ'),
  getPermissions
);

export default router;