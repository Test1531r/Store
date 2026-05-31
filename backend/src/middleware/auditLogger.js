import { prisma } from '../config/database.js';

export const auditLogger = (module, action) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      // Only log successful operations that modify data
      if (req.method !== 'GET' && res.statusCode < 400 && req.user) {
        try {
          await prisma.auditLog.create({
            data: {
              action,
              module,
              entityId: req.params.id || body?.data?.id,
              entityType: module,
              previousValue: req.body, // Simplified - in production, fetch previous
              newValue: body?.data || body,
              ipAddress: req.ip,
              userId: req.user.id
            }
          });
        } catch (error) {
          console.error('Audit log error:', error);
        }
      }

      return originalJson(body);
    };

    next();
  };
};
