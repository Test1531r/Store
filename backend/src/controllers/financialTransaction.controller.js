import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export const createTransaction = async (req, res, next) => {
  try {
    const {
      service, type, amount, commission, senderPhone, receiverPhone,
      referenceNumber, notes
    } = req.body;

    const netAmount = parseFloat(amount) - (parseFloat(commission) || 0);

    const transaction = await prisma.financialTransaction.create({
      data: {
        service,
        type,
        amount: parseFloat(amount),
        commission: parseFloat(commission) || 0,
        netAmount,
        senderPhone,
        receiverPhone,
        referenceNumber,
        notes
      }
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) { next(error); }
};

export const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, service, type, startDate, endDate, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (service) where.service = service;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { senderPhone: { contains: search } },
        { receiverPhone: { contains: search } },
        { referenceNumber: { contains: search } }
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.financialTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.financialTransaction.count({ where })
    ]);

    res.json({ success: true, data: transactions, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { next(error); }
};

export const getDailyReport = async (req, res, next) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const summary = await prisma.financialTransaction.groupBy({
      by: ['service', 'type'],
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay }
      },
      _sum: { amount: true, commission: true, netAmount: true },
      _count: true
    });

    res.json({ success: true, data: summary });
  } catch (error) { next(error); }
};
