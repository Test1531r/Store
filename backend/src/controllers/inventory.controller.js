import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { emitToBranch } from '../config/socket.js';


// ================= GET INVENTORY =================
export const getInventory = async (req, res, next) => {
  try {
    const {
      branchId,
      page = 1,
      limit = 50,
      search = ''
    } = req.query;

    const skip = (page - 1) * limit;

    const where = {
      ...(branchId && { branchId }),
      ...(search && {
        product: {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        }
      })
    };

    const [inventory, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        include: {
          product: {
            include: {
              category: true,
              brand: true
            }
          },
          branch: true,
          variant: true
        },
        skip,
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' }
      }),

      prisma.inventory.count({ where })
    ]);

    res.json({
      success: true,
      data: inventory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    });

  } catch (error) {
    next(error);
  }
};


// ================= ADJUST STOCK (SAFE ERP LOGIC) =================
export const adjustStock = async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    const { quantity, type = 'ADD', reason, notes } = req.body;

    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId }
    });

    if (!inventory) {
      throw new AppError('Inventory not found', 404);
    }

    const previousQty = inventory.quantity;

    let change = parseInt(quantity);

    if (type === 'REMOVE') {
      change = -Math.abs(change);
    }

    const newQty = previousQty + change;

    if (newQty < 0) {
      throw new AppError('Stock cannot be negative', 400);
    }

    const updated = await prisma.inventory.update({
      where: { id: inventoryId },
      data: { quantity: newQty }
    });

    await prisma.inventoryLog.create({
      data: {
        type: 'ADJUSTMENT',
        quantity: change,
        previousQty,
        newQty,
        reference: reason || 'MANUAL_ADJUSTMENT',
        notes,
        productId: inventory.productId,
        variantId: inventory.variantId,
        branchId: inventory.branchId,
        inventoryId: inventory.id
      }
    });

    emitToBranch(inventory.branchId, 'inventory-updated', {
      inventoryId,
      productId: inventory.productId,
      previousQty,
      newQty
    });

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: updated
    });

  } catch (error) {
    next(error);
  }
};


// ================= CREATE INVENTORY (SAFE UPSERT - NO DUPLICATES) =================
export const createInventory = async (req, res, next) => {
  try {
    const {
      productId,
      branchId,
      quantity = 0,
      minStock = 5,
      variantId
    } = req.body;

    const inventory = await prisma.inventory.upsert({
      where: {
        productId_variantId_branchId: {
          productId,
          branchId,
          variantId: variantId || null
        }
      },
      update: {
        quantity,
        minStock
      },
      create: {
        productId,
        branchId,
        variantId: variantId || null,
        quantity,
        minStock
      }
    });

    res.json({
      success: true,
      data: inventory
    });

  } catch (error) {
    next(error);
  }
};


// ================= SYNC PRODUCTS TO INVENTORY (RUN ONCE ONLY) =================
export const syncInventoryWithProducts = async (req, res, next) => {
  try {
    const branches = await prisma.branch.findMany();
    const products = await prisma.product.findMany();

    let created = 0;

    for (const product of products) {
      for (const branch of branches) {
        await prisma.inventory.upsert({
          where: {
            productId_variantId_branchId: {
              productId: product.id,
              branchId: branch.id,
              variantId: null
            }
          },
          update: {},
          create: {
            productId: product.id,
            branchId: branch.id,
            quantity: 0,
            minStock: product.lowStockAlert || 5
          }
        });

        created++;
      }
    }

    res.json({
      success: true,
      message: 'Inventory synced successfully',
      created
    });

  } catch (error) {
    next(error);
  }
};


// ================= INVENTORY LOGS =================
export const getInventoryLogs = async (req, res, next) => {
  try {
    const {
      productId,
      branchId,
      page = 1,
      limit = 50
    } = req.query;

    const skip = (page - 1) * limit;

    const where = {
      ...(productId && { productId }),
      ...(branchId && { branchId })
    };

    const [logs, total] = await Promise.all([
      prisma.inventoryLog.findMany({
        where,
        include: {
          product: true,
          inventory: {
            include: {
              branch: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),

      prisma.inventoryLog.count({ where })
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    });

  } catch (error) {
    next(error);
  }
};


// ================= STOCK COUNT =================
export const stockCount = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { items } = req.body;

    const results = [];

    for (const item of items) {
      const inventory = await prisma.inventory.findUnique({
        where: { id: item.inventoryId }
      });

      if (!inventory || inventory.branchId !== branchId) continue;

      const diff = item.countedQty - inventory.quantity;

      if (diff !== 0) {
        const updated = await prisma.inventory.update({
          where: { id: inventory.id },
          data: { quantity: item.countedQty }
        });

        await prisma.inventoryLog.create({
          data: {
            type: 'ADJUSTMENT',
            quantity: diff,
            previousQty: inventory.quantity,
            newQty: item.countedQty,
            reference: 'STOCK_COUNT',
            notes: item.notes || '',
            productId: inventory.productId,
            variantId: inventory.variantId,
            branchId,
            inventoryId: inventory.id
          }
        });

        results.push(updated);
      }
    }

    emitToBranch(branchId, 'stock-count-completed', {
      branchId,
      itemsCounted: results.length
    });

    res.json({
      success: true,
      message: 'Stock count completed',
      data: results
    });

  } catch (error) {
    next(error);
  }
};