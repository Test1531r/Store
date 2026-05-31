import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export const createBranch = async (req, res, next) => {
  try {
    const { name, code, address, phone, email } = req.body;

    const existing = await prisma.branch.findUnique({ where: { code } });
    if (existing) throw new AppError('Branch code already exists', 409);

    const branch = await prisma.branch.create({
      data: { name, code, address, phone, email, companyId: req.body.companyId }
    });

    res.status(201).json({ success: true, data: branch });
  } catch (error) { next(error); }
};

export const getBranches = async (req, res, next) => {
  try {
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { users: true, inventory: true } }
      }
    });
    res.json({ success: true, data: branches });
  } catch (error) { next(error); }
};

export const getBranch = async (req, res, next) => {
  try {
    const branch = await prisma.branch.findUnique({
      where: { id: req.params.id },
      include: {
        users: { include: { role: { select: { name: true } } } },
        cashboxes: true,
        _count: { select: { inventory: true, sales: true } }
      }
    });
    if (!branch) throw new AppError('Branch not found', 404);
    res.json({ success: true, data: branch });
  } catch (error) { next(error); }
};

export const updateBranch = async (req, res, next) => {
  try {
    const branch = await prisma.branch.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: branch });
  } catch (error) { next(error); }
};

export const deleteBranch = async (req, res, next) => {
  try {
    await prisma.branch.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });
    res.json({ success: true, message: 'Branch deactivated' });
  } catch (error) { next(error); }
};
