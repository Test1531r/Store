import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        },
        branch: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    req.user = user;
    req.userPermissions = user.role.permissions.map(p => `${p.permission.module}:${p.permission.action}`);

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const authorize = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const hasPermission = permissions.some(perm => 
      req.userPermissions.includes(perm) || req.userPermissions.includes('*:*')
    );

    if (!hasPermission) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireBranchAccess = (req, res, next) => {
  const branchId = req.params.branchId || req.body.branchId || req.query.branchId;

  if (!branchId) {
    return next(); // No branch specified, allow (will be filtered by query)
  }

  // Super Admin can access all branches
  if (req.user.role.name === 'SUPER_ADMIN') {
    return next();
  }

  // Users can only access their assigned branch
  if (req.user.branchId && req.user.branchId !== branchId) {
    return res.status(403).json({ success: false, message: 'Access denied for this branch' });
  }

  next();
};
