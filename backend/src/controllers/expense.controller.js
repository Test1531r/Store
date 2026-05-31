import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export const createExpense = async (req, res, next) => {
  try {
    const { amount, description, categoryId, branchId, receipt } = req.body;
    const effectiveBranchId = branchId || req.user.branchId;

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description,
        categoryId,
        branchId: effectiveBranchId,
        userId: req.user.id,
        receipt
      },
      include: {
        category: true,
        branch: { select: { name: true } },
        user: { select: { firstName: true, lastName: true } }
      }
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) { next(error); }
};

export const getExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, branchId, categoryId, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (branchId) where.branchId = branchId;
    if (categoryId) where.categoryId = categoryId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: true,
          branch: { select: { name: true } },
          user: { select: { firstName: true, lastName: true } }
        },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.expense.count({ where })
    ]);

    res.json({ success: true, data: expenses, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { next(error); }
};

export const getExpenseCategories = async (req, res, next) => {
  try {
    const categories = await prisma.expenseCategory.findMany({
      where: { isActive: true },
      include: { _count: { select: { expenses: true } } }
    });
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
};

export const createExpenseCategory = async (req, res, next) => {
  try {
    const category = await prisma.expenseCategory.create({ data: req.body });
    res.status(201).json({ success: true, data: category });
  } catch (error) { next(error); }
};
