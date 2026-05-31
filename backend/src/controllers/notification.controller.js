import { prisma } from '../config/database.js';

export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = unreadOnly === 'true' ? { isRead: false } : {};

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: false } })
    ]);

    res.json({ success: true, data: notifications, unreadCount, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { next(error); }
};

export const markAsRead = async (req, res, next) => {
  try {
    await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) { next(error); }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) { next(error); }
};
