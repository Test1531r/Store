import { prisma } from '../config/database.js';

export const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, branchId, groupBy = 'day' } = req.query;
    const where = { status: 'COMPLETED' };
    if (branchId) where.branchId = branchId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: { include: { product: { select: { name: true, category: { select: { name: true } } } } } },
        branch: { select: { name: true } }
      }
    });

    // Group by date
    const grouped = {};
    sales.forEach(sale => {
      const date = new Date(sale.createdAt).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { date, sales: 0, revenue: 0, items: 0, profit: 0 };
      }
      grouped[date].sales += 1;
      grouped[date].revenue += parseFloat(sale.total);
      grouped[date].items += sale.items.reduce((sum, i) => sum + i.quantity, 0);
      grouped[date].profit += sale.items.reduce((sum, i) => {
        return sum + (parseFloat(i.unitPrice) - parseFloat(i.product.costPrice || 0)) * i.quantity;
      }, 0);
    });

    res.json({ success: true, data: Object.values(grouped) });
  } catch (error) { next(error); }
};

export const getInventoryReport = async (req, res, next) => {
  try {
    const { branchId } = req.query;
    const where = branchId ? { branchId } : {};

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        product: {
          include: {
            category: { select: { name: true } },
            brand: { select: { name: true } }
          }
        },
        branch: { select: { name: true } }
      }
    });

    const summary = {
      totalProducts: inventory.length,
      totalValue: inventory.reduce((sum, i) => sum + (parseFloat(i.product.costPrice) * i.quantity), 0),
      lowStockCount: inventory.filter(i => i.quantity <= i.minStock).length,
      outOfStock: inventory.filter(i => i.quantity === 0).length
    };

    res.json({ success: true, data: { inventory, summary } });
  } catch (error) { next(error); }
};

export const getProfitReport = async (req, res, next) => {
  try {
    const { startDate, endDate, branchId } = req.query;
    const where = { status: 'COMPLETED' };
    if (branchId) where.branchId = branchId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [sales, expenses] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: { items: { include: { product: { select: { costPrice: true } } } } }
      }),
      prisma.expense.findMany({
        where: {
          ...(branchId && { branchId }),
          ...(startDate || endDate ? { date: {} } : {})
        }
      })
    ]);

    const revenue = sales.reduce((sum, s) => sum + parseFloat(s.total), 0);
    const costOfGoods = sales.reduce((sum, s) => {
      return sum + s.items.reduce((iSum, i) => iSum + (parseFloat(i.product.costPrice || 0) * i.quantity), 0);
    }, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const grossProfit = revenue - costOfGoods;
    const netProfit = grossProfit - totalExpenses;

    res.json({
      success: true,
      data: {
        revenue,
        costOfGoods,
        grossProfit,
        totalExpenses,
        netProfit,
        profitMargin: revenue > 0 ? ((netProfit / revenue) * 100).toFixed(2) : 0
      }
    });
  } catch (error) { next(error); }
};

export const getEmployeePerformance = async (req, res, next) => {
  try {
    const { startDate, endDate, branchId } = req.query;
    const where = { status: 'COMPLETED' };
    if (branchId) where.branchId = branchId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        items: true
      }
    });

    const performance = {};
    sales.forEach(sale => {
      const userId = sale.userId;
      if (!performance[userId]) {
        performance[userId] = {
          user: sale.user,
          sales: 0,
          revenue: 0,
          items: 0
        };
      }
      performance[userId].sales += 1;
      performance[userId].revenue += parseFloat(sale.total);
      performance[userId].items += sale.items.reduce((sum, i) => sum + i.quantity, 0);
    });

    res.json({ success: true, data: Object.values(performance) });
  } catch (error) { next(error); }
};
