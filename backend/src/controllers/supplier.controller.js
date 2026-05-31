import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export const createSupplier = async (req, res, next) => {
  try {
    const supplier = await prisma.supplier.create({ data: req.body });
    res.status(201).json({ success: true, data: supplier });
  } catch (error) { next(error); }
};

export const getSuppliers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }
    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({ where, skip, take: parseInt(limit), orderBy: { name: 'asc' } }),
      prisma.supplier.count({ where })
    ]);
    res.json({ success: true, data: suppliers, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { next(error); }
};

export const getSupplier = async (req, res, next) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id },
      include: {
        products: { take: 10 },
        purchases: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });
    if (!supplier) throw new AppError('Supplier not found', 404);
    res.json({ success: true, data: supplier });
  } catch (error) { next(error); }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await prisma.supplier.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: supplier });
  } catch (error) { next(error); }
};

export const deleteSupplier = async (req, res, next) => {
  try {
    await prisma.supplier.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, message: 'Supplier deactivated' });
  } catch (error) { next(error); }
};
