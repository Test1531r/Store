import { prisma } from '../config/database.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, userId, module, action, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (userId) where.userId = userId;
    if (module) where.module = module;
    if (action) where.action = action;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({ success: true, data: logs, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { next(error); }
};
