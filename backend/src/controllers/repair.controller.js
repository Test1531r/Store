import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { emitToBranch } from '../config/socket.js';

const generateTicketNumber = async () => {
  const count = await prisma.repair.count();
  return `REP-${Date.now().toString().slice(-6)}-${String(count + 1).padStart(4, '0')}`;
};

export const createRepair = async (req, res, next) => {
  try {
    const {
      deviceType, deviceModel, imei, serialNumber, problem,
      estimatedCost, customerId, branchId, priority, notes
    } = req.body;

    const effectiveBranchId = branchId || req.user.branchId;
    const ticketNumber = await generateTicketNumber();

    const repair = await prisma.repair.create({
      data: {
        ticketNumber,
        deviceType,
        deviceModel,
        imei,
        serialNumber,
        problem,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
        customerId,
        branchId: effectiveBranchId,
        priority: priority || 'NORMAL',
        notes
      },
      include: {
        customer: true,
        branch: { select: { name: true } }
      }
    });

    // Create initial status history
    await prisma.repairStatusHistory.create({
      data: {
        repairId: repair.id,
        status: 'RECEIVED',
        notes: 'Device received for repair'
      }
    });

    emitToBranch(effectiveBranchId, 'repair-created', repair);

    res.status(201).json({ success: true, data: repair });
  } catch (error) { next(error); }
};

export const getRepairs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, branchId, technicianId, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    if (branchId) where.branchId = branchId;
    if (technicianId) where.technicianId = technicianId;
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search } },
        { deviceModel: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [repairs, total] = await Promise.all([
      prisma.repair.findMany({
        where,
        include: {
          customer: { select: { name: true, phone: true } },
          technician: { select: { firstName: true, lastName: true } },
          branch: { select: { name: true } },
          _count: { select: { items: true, statusHistory: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.repair.count({ where })
    ]);

    res.json({ success: true, data: repairs, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { next(error); }
};

export const getRepair = async (req, res, next) => {
  try {
    const repair = await prisma.repair.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        technician: { select: { firstName: true, lastName: true, phone: true } },
        branch: true,
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (!repair) throw new AppError('Repair not found', 404);
    res.json({ success: true, data: repair });
  } catch (error) { next(error); }
};

export const updateRepairStatus = async (req, res, next) => {
  try {
    const { status, notes, finalCost, technicianId } = req.body;
    const { id } = req.params;

    const repair = await prisma.repair.findUnique({ where: { id } });
    if (!repair) throw new AppError('Repair not found', 404);

    const updateData = { status };
    if (finalCost) updateData.finalCost = parseFloat(finalCost);
    if (technicianId) updateData.technicianId = technicianId;
    if (status === 'DELIVERED') updateData.deliveredAt = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const upd = await tx.repair.update({
        where: { id },
        data: updateData,
        include: {
          customer: { select: { name: true, phone: true } },
          branch: { select: { name: true } }
        }
      });

      await tx.repairStatusHistory.create({
        data: { repairId: id, status, notes }
      });

      return upd;
    });

    emitToBranch(repair.branchId, 'repair-updated', updated);

    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const addRepairItem = async (req, res, next) => {
  try {
    const { repairId } = req.params;
    const { name, quantity, unitPrice } = req.body;

    const item = await prisma.repairItem.create({
      data: {
        repairId,
        name,
        quantity: parseInt(quantity),
        unitPrice: parseFloat(unitPrice),
        total: parseInt(quantity) * parseFloat(unitPrice)
      }
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) { next(error); }
};
