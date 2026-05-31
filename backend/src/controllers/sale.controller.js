import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { emitToBranch } from '../config/socket.js';

// Generate Invoice Number
const generateInvoiceNumber = async (branchId) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const count = await prisma.sale.count({
    where: {
      branchId,
      createdAt: {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate())
      }
    }
  });

  return `INV-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
};

// Create Sale (POS)
export const createSale = async (req, res, next) => {
  try {
    const {
      customerId,
      items,
      discount = 0,
      discountType = 'FIXED',
      taxRate = 14,
      payments,
      notes,
      branchId
    } = req.body;

    const effectiveBranchId = branchId || req.user.branchId;

    if (!effectiveBranchId) {
      throw new AppError('Branch ID is required', 400);
    }

    // Calculate totals
    let subtotal = 0;
    const saleItems = [];

    for (const item of items) {
      const { productId, variantId, quantity, unitPrice, discount: itemDiscount = 0 } = item;

      // Check stock
      const inventory = await prisma.inventory.findFirst({
        where: {
          productId,
          variantId: variantId || null,
          branchId: effectiveBranchId
        }
      });

      if (!inventory || inventory.quantity < quantity) {
        throw new AppError(`Insufficient stock for product ${productId}`, 400);
      }

      const itemTotal = (parseFloat(unitPrice) * quantity) - parseFloat(itemDiscount);
      subtotal += itemTotal;

      saleItems.push({
        productId,
        variantId,
        quantity,
        unitPrice: parseFloat(unitPrice),
        discount: parseFloat(itemDiscount),
        total: itemTotal
      });
    }

    // Calculate discount
    let discountAmount = discountType === 'PERCENTAGE' 
      ? subtotal * (parseFloat(discount) / 100)
      : parseFloat(discount);

    // Calculate tax
    const taxAmount = (subtotal - discountAmount) * (parseFloat(taxRate) / 100);
    const total = subtotal - discountAmount + taxAmount;

    // Validate payments
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    if (totalPaid < total) {
      throw new AppError('Total payments must cover the sale total', 400);
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(effectiveBranchId);

    // Create sale with transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Create sale
      const newSale = await tx.sale.create({
        data: {
          invoiceNumber,
          subtotal,
          discount: discountAmount,
          discountType,
          tax: taxAmount,
          taxRate: parseFloat(taxRate),
          total,
          paid: totalPaid,
          notes,
          branchId: effectiveBranchId,
          userId: req.user.id,
          customerId,
          items: {
            create: saleItems
          },
          payments: {
            create: payments.map(p => ({
              amount: parseFloat(p.amount),
              method: p.method,
              reference: p.reference
            }))
          }
        },
        include: {
          items: {
            include: {
              product: { select: { name: true, sku: true } },
              variant: { select: { color: true, storageSize: true } }
            }
          },
          payments: true,
          customer: { select: { name: true, phone: true } },
          branch: { select: { name: true } },
          user: { select: { firstName: true, lastName: true } }
        }
      });

      // Update inventory for each item
      for (const item of items) {
        const inventory = await tx.inventory.findFirst({
          where: {
            productId: item.productId,
            variantId: item.variantId || null,
            branchId: effectiveBranchId
          }
        });

        if (inventory) {
          const previousQty = inventory.quantity;
          const newQty = previousQty - item.quantity;

          await tx.inventory.update({
            where: { id: inventory.id },
            data: { quantity: newQty }
          });

          // Log inventory movement
          await tx.inventoryLog.create({
            data: {
              type: 'SALE',
              quantity: -item.quantity,
              previousQty,
              newQty,
              reference: invoiceNumber,
              productId: item.productId,
              variantId: item.variantId || null,
              branchId: effectiveBranchId,
              inventoryId: inventory.id
            }
          });
        }
      }

      // Update customer loyalty points if applicable
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            loyaltyPoints: { increment: Math.floor(total / 100) } // 1 point per 100 EGP
          }
        });
      }

      return newSale;
    });

    // Emit real-time update
    emitToBranch(effectiveBranchId, 'new-sale', sale);

    res.status(201).json({
      success: true,
      message: 'Sale completed successfully',
      data: sale
    });
  } catch (error) {
    next(error);
  }
};

// Get Sales
export const getSales = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      branchId,
      customerId,
      startDate,
      endDate,
      status,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (branchId) where.branchId = branchId;
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customer: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          items: {
            include: {
              product: { select: { name: true, sku: true } }
            }
          },
          payments: true,
          customer: { select: { name: true, phone: true } },
          branch: { select: { name: true } },
          user: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.sale.count({ where })
    ]);

    res.json({
      success: true,
      data: sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Sale
export const getSale = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        payments: true,
        customer: true,
        branch: true,
        user: { select: { firstName: true, lastName: true } }
      }
    });

    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    res.json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
};

// Process Return/Refund
export const processReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items, reason } = req.body;

    const originalSale = await prisma.sale.findUnique({
      where: { id },
      include: { items: true, payments: true }
    });

    if (!originalSale) {
      throw new AppError('Original sale not found', 404);
    }

    const returnSale = await prisma.$transaction(async (tx) => {
      // Create return sale
      const newReturn = await tx.sale.create({
        data: {
          invoiceNumber: `RET-${originalSale.invoiceNumber}`,
          status: 'REFUNDED',
          subtotal: -originalSale.subtotal,
          discount: -originalSale.discount,
          tax: -originalSale.tax,
          total: -originalSale.total,
          paid: -originalSale.paid,
          isReturn: true,
          originalSaleId: id,
          branchId: originalSale.branchId,
          userId: req.user.id,
          customerId: originalSale.customerId,
          notes: `Return: ${reason || 'No reason provided'}`
        }
      });

      // Restore inventory
      for (const item of originalSale.items) {
        const inventory = await tx.inventory.findFirst({
          where: {
            productId: item.productId,
            variantId: item.variantId,
            branchId: originalSale.branchId
          }
        });

        if (inventory) {
          await tx.inventory.update({
            where: { id: inventory.id },
            data: { quantity: { increment: item.quantity } }
          });

          await tx.inventoryLog.create({
            data: {
              type: 'RETURN',
              quantity: item.quantity,
              previousQty: inventory.quantity,
              newQty: inventory.quantity + item.quantity,
              reference: newReturn.invoiceNumber,
              productId: item.productId,
              variantId: item.variantId,
              branchId: originalSale.branchId,
              inventoryId: inventory.id
            }
          });
        }
      }

      // Update original sale status
      await tx.sale.update({
        where: { id },
        data: { status: 'REFUNDED' }
      });

      return newReturn;
    });

    emitToBranch(originalSale.branchId, 'sale-returned', returnSale);

    res.json({
      success: true,
      message: 'Return processed successfully',
      data: returnSale
    });
  } catch (error) {
    next(error);
  }
};

// Get Daily Sales Summary
export const getDailySummary = async (req, res, next) => {
  try {
    const { branchId, date = new Date().toISOString().split('T')[0] } = req.query;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const where = {
      createdAt: { gte: startOfDay, lte: endOfDay },
      status: 'COMPLETED',
      ...(branchId && { branchId })
    };

    const [sales, paymentSummary] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          items: true,
          payments: true
        }
      }),
      prisma.payment.groupBy({
        by: ['method'],
        where: {
          sale: { createdAt: { gte: startOfDay, lte: endOfDay } },
          ...(branchId && { sale: { branchId } })
        },
        _sum: { amount: true },
        _count: true
      })
    ]);

    const summary = {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, s) => sum + parseFloat(s.total), 0),
      totalItems: sales.reduce((sum, s) => sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0), 0),
      totalDiscount: sales.reduce((sum, s) => sum + parseFloat(s.discount), 0),
      totalTax: sales.reduce((sum, s) => sum + parseFloat(s.tax), 0),
      paymentMethods: paymentSummary.map(p => ({
        method: p.method,
        amount: p._sum.amount,
        count: p._count
      }))
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};
