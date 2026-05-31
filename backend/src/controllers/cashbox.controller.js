import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export const createCashbox = async (req, res, next) => {
  try {
    const { name, type, branchId, currency } = req.body;
    const cashbox = await prisma.cashbox.create({
      data: { name, type, branchId, currency: currency || 'EGP' }
    });
    res.status(201).json({ success: true, data: cashbox });
  } catch (error) { next(error); }
};

export const getCashboxes = async (req, res, next) => {
  try {
    const { branchId } = req.query;
    const where = branchId ? { branchId } : {};
    const cashboxes = await prisma.cashbox.findMany({
      where,
      include: {
        branch: { select: { name: true } },
        _count: { select: { transactions: true } }
      }
    });
    res.json({ success: true, data: cashboxes });
  } catch (error) { next(error); }
};

export const getCashbox = async (req, res, next) => {
  try {
    const cashbox = await prisma.cashbox.findUnique({
      where: { id: req.params.id },
      include: {
        transactions: { orderBy: { createdAt: 'desc' }, take: 50 },
        branch: { select: { name: true } }
      }
    });
    if (!cashbox) throw new AppError('Cashbox not found', 404);
    res.json({ success: true, data: cashbox });
  } catch (error) { next(error); }
};

export const createTransaction = async (req, res, next) => {
  try {
    const { cashboxId, type, amount, description, reference } = req.body;

    const cashbox = await prisma.cashbox.findUnique({ where: { id: cashboxId } });
    if (!cashbox) throw new AppError('Cashbox not found', 404);

    let newBalance;
    if (type === 'INCOME') {
      newBalance = parseFloat(cashbox.balance) + parseFloat(amount);
    } else if (type === 'EXPENSE') {
      newBalance = parseFloat(cashbox.balance) - parseFloat(amount);
      if (newBalance < 0) throw new AppError('Insufficient balance', 400);
    } else {
      newBalance = parseFloat(cashbox.balance);
    }

    const transaction = await prisma.$transaction(async (tx) => {
      await tx.cashbox.update({
        where: { id: cashboxId },
        data: { balance: newBalance }
      });

      return tx.cashboxTransaction.create({
        data: {
          cashboxId,
          type,
          amount: parseFloat(amount),
          balance: newBalance,
          description,
          reference
        }
      });
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) { next(error); }
};
