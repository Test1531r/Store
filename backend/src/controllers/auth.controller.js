import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
  { id: userId },
  process.env.JWT_SECRET,
  {
    expiresIn:
      process.env.JWT_EXPIRES_IN || '15m',
  }
);

const refreshToken = jwt.sign(
  { id: userId },
  process.env.JWT_REFRESH_SECRET,
  {
    expiresIn:
      process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  }
);
  return { accessToken, refreshToken };
};

// Register (Super Admin only)
export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, roleId, branchId } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        roleId,
        branchId
      },
      include: {
        role: true,
        branch: true
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'USER_REGISTERED',
        module: 'AUTH',
        description: `New user registered: ${email}`,
        userId: req.user?.id || user.id,
        ipAddress: req.ip
      }
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        branch: user.branch?.name
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password, device } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
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
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.session.create({
      data: {
        token: accessToken,
        refreshToken,
        device: device || 'Unknown',
        ipAddress: req.ip,
        expiresAt,
        userId: user.id
      }
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'USER_LOGIN',
        module: 'AUTH',
        description: `User logged in from ${device || 'Unknown'}`,
        userId: user.id,
        ipAddress: req.ip
      }
    });

    const permissions = user.role.permissions.map(p => ({
      module: p.permission.module,
      action: p.permission.action
    }));

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          avatar: user.avatar,
          role: {
            id: user.role.id,
            name: user.role.name
          },
          branch: user.branch ? {
            id: user.branch.id,
            name: user.branch.name
          } : null,
          permissions
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 900 // 15 minutes in seconds
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh Token
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 401);
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const tokens = generateTokens(session.userId);

    // Update session
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: newExpiresAt
      }
    });

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 900
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      await prisma.session.deleteMany({
        where: { token }
      });
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// Logout All Sessions
export const logoutAll = async (req, res, next) => {
  try {
    await prisma.session.deleteMany({
      where: { userId: req.user.id }
    });

    res.json({ success: true, message: 'All sessions logged out' });
  } catch (error) {
    next(error);
  }
};

// Get Current User
export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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

    const permissions = user.role.permissions.map(p => ({
      module: p.permission.module,
      action: p.permission.action
    }));

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        role: {
          id: user.role.id,
          name: user.role.name
        },
        branch: user.branch ? {
          id: user.branch.id,
          name: user.branch.name
        } : null,
        permissions,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
};

// Change Password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'PASSWORD_CHANGED',
        module: 'AUTH',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// Get Login History
export const getLoginHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          device: true,
          ipAddress: true,
          createdAt: true,
          expiresAt: true
        }
      }),
      prisma.session.count({ where: { userId: req.user.id } })
    ]);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};
