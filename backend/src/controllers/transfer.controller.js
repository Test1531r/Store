import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { emitToBranch } from '../config/socket.js';

const generateTransferNumber = async () => {
  const count = await prisma.transfer.count();
  return `TRF-${Date.now().toString().slice(-6)}-${String(count + 1).padStart(4, '0')}`;
};

export const createTransfer = async (req, res, next) => {
  try {
    const { fromBranchId, toBranchId, items, notes } = req.body;

    if (fromBranchId === toBranchId) {
      throw new AppError('Source and destination branches cannot be the same', 400);
    }

    const transferNumber = await generateTransferNumber();

    const transfer = await prisma.$transaction(async (tx) => {
      // Verify stock availability
      for (const item of items) {
        const inventory = await tx.inventory.findFirst({
          where: {
            productId: item.productId,
            variantId: item.variantId || null,
            branchId: fromBranchId
          }
        });

        if (!inventory || inventory.quantity < item.quantity) {
          throw new AppError(`Insufficient stock for product ${item.productId} at source branch`, 400);
        }
      }

      // Create transfer
      const newTransfer = await tx.transfer.create({
        data: {
          transferNumber,
          fromBranchId,
          toBranchId,
          requestedById: req.user.id,
          notes,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: item.quantity
            }))
          }
        },
        include: {
          items: true,
          fromBranch: { select: { name: true } },
          toBranch: { select: { name: true } },
          requestedBy: { select: { firstName: true, lastName: true } }
        }
      });

      // Deduct from source
      for (const item of items) {
        const inventory = await tx.inventory.findFirst({
          where: {
            productId: item.productId,
            variantId: item.variantId || null,
            branchId: fromBranchId
          }
        });

        const previousQty = inventory.quantity;
        const newQty = previousQty - item.quantity;

        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: newQty }
        });

        await tx.inventoryLog.create({
          data: {
            type: 'TRANSFER',
            quantity: -item.quantity,
            previousQty,
            newQty,
            reference: transferNumber,
            productId: item.productId,
            variantId: item.variantId || null,
            branchId: fromBranchId,
            inventoryId: inventory.id
          }
        });
      }

      return newTransfer;
    });

    emitToBranch(fromBranchId, 'transfer-created', transfer);
    emitToBranch(toBranchId, 'transfer-created', transfer);

    res.status(201).json({ success: true, message: 'Transfer created', data: transfer });
  } catch (error) { next(error); }
};

export const getTransfers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, branchId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    if (branchId) where.OR = [{ fromBranchId: branchId }, { toBranchId: branchId }];

    const [transfers, total] = await Promise.all([
      prisma.transfer.findMany({
        where,
        include: {
          items: { include: { product: { select: { name: true, sku: true } } } },
          fromBranch: { select: { name: true } },
          toBranch: { select: { name: true } },
          requestedBy: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.transfer.count({ where })
    ]);

    res.json({ success: true, data: transfers, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { next(error); }
};

export const getTransfer = async (req, res, next) => {
  try {
    const transfer = await prisma.transfer.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { product: true, variant: true } },
        fromBranch: true,
        toBranch: true,
        requestedBy: { select: { firstName: true, lastName: true } }
      }
    });
    if (!transfer) throw new AppError('Transfer not found', 404);
    res.json({ success: true, data: transfer });
  } catch (error) { next(error); }
};

export const updateTransferStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!transfer) throw new AppError('Transfer not found', 404);

    const updated = await prisma.$transaction(async (tx) => {
      const upd = await tx.transfer.update({
        where: { id },
        data: { status },
        include: {
          items: true,
          fromBranch: { select: { name: true } },
          toBranch: { select: { name: true } }
        }
      });

      // If received, add to destination inventory
      if (status === 'RECEIVED') {
        for (const item of transfer.items) {
          const existingInv = await tx.inventory.findFirst({
            where: {
              productId: item.productId,
              variantId: item.variantId,
              branchId: transfer.toBranchId
            }
          });

          if (existingInv) {
            const previousQty = existingInv.quantity;
            const newQty = previousQty + item.quantity;
            await tx.inventory.update({
              where: { id: existingInv.id },
              data: { quantity: newQty }
            });

            await tx.inventoryLog.create({
              data: {
                type: 'TRANSFER',
                quantity: item.quantity,
                previousQty,
                newQty,
                reference: transfer.transferNumber,
                productId: item.productId,
                variantId: item.variantId,
                branchId: transfer.toBranchId,
                inventoryId: existingInv.id
              }
            });
          } else {
            const newInv = await tx.inventory.create({
              data: {
                productId: item.productId,
                variantId: item.variantId,
                branchId: transfer.toBranchId,
                quantity: item.quantity
              }
            });

            await tx.inventoryLog.create({
              data: {
                type: 'TRANSFER',
                quantity: item.quantity,
                previousQty: 0,
                newQty: item.quantity,
                reference: transfer.transferNumber,
                productId: item.productId,
                variantId: item.variantId,
                branchId: transfer.toBranchId,
                inventoryId: newInv.id
              }
            });
          }
        }
      }

      return upd;
    });

    emitToBranch(transfer.fromBranchId, 'transfer-updated', updated);
    emitToBranch(transfer.toBranchId, 'transfer-updated', updated);

    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};
