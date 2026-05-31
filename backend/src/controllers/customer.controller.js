import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export const createCustomer = async (req, res, next) => {
  try {
    const customer = await prisma.customer.create({ data: req.body });
    res.status(201).json({ success: true, data: customer });
  } catch (error) { next(error); }
};

export const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: { _count: { select: { sales: true, repairs: true } } },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);
    res.json({ success: true, data: customers, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { next(error); }
};

export const getCustomer = async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        sales: { orderBy: { createdAt: 'desc' }, take: 10, include: { items: { include: { product: { select: { name: true } } } } } },
        repairs: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });
    if (!customer) throw new AppError('Customer not found', 404);
    res.json({ success: true, data: customer });
  } catch (error) { next(error); }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await prisma.customer.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: customer });
  } catch (error) { next(error); }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) { next(error); }
};
