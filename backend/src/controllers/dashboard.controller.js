import { prisma } from '../config/database.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const { branchId, period = 'today' } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (period === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { gte: start };
    } else if (period === 'week') {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: start };
    } else if (period === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { gte: start };
    }

    const where = { createdAt: dateFilter };
    if (branchId) where.branchId = branchId;

    const [
      totalSales,
      totalRevenue,
      totalCustomers,
      totalRepairs,
      lowStockCount,
      pendingTransfers,
      recentSales,
      topProducts
    ] = await Promise.all([
      prisma.sale.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.sale.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _sum: { total: true }
      }),
      prisma.customer.count({
        where: period === 'today' ? { createdAt: dateFilter } : {}
      }),
      prisma.repair.count({ where: { ...where, status: { not: 'DELIVERED' } } }),
      prisma.inventory.count({
        where: {
          quantity: { lte: prisma.inventory.fields.minStock },
          ...(branchId && { branchId })
        }
      }),
      prisma.transfer.count({
        where: {
          status: { in: ['PENDING', 'APPROVED', 'IN_TRANSIT'] },
          ...(branchId && { OR: [{ fromBranchId: branchId }, { toBranchId: branchId }] })
        }
      }),
      prisma.sale.findMany({
        where: { ...where, status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: { select: { name: true } },
          branch: { select: { name: true } },
          user: { select: { firstName: true, lastName: true } }
        }
      }),
      prisma.saleItem.groupBy({
        by: ['productId'],
        where: { sale: { ...where, status: 'COMPLETED' } },
        _sum: { quantity: true },
        _count: true,
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      })
    ]);

    // Get product names for top products
    const topProductsWithNames = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await prisma.product.findUnique({
          where: { id: tp.productId },
          select: { name: true, sku: true }
        });
        return { ...tp, product };
      })
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalSales,
          totalRevenue: totalRevenue._sum.total || 0,
          totalCustomers,
          totalRepairs,
          lowStockCount,
          pendingTransfers
        },
        recentSales,
        topProducts: topProductsWithNames
      }
    });
  } catch (error) { next(error); }
};

export const getChartData = async (req, res, next) => {
  try {
    const { branchId, type = 'sales', period = '7d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let data = [];

    if (type === 'sales') {
      const sales = await prisma.sale.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate },
          ...(branchId && { branchId })
        },
        select: { total: true, createdAt: true }
      });

      const grouped = {};
      sales.forEach(s => {
        const date = new Date(s.createdAt).toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = 0;
        grouped[date] += parseFloat(s.total);
      });

      data = Object.entries(grouped).map(([date, value]) => ({ date, value }));
    } else if (type === 'profit') {
      const sales = await prisma.sale.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate },
          ...(branchId && { branchId })
        },
        include: {
          items: { include: { product: { select: { costPrice: true } } } }
        }
      });

      const grouped = {};
      sales.forEach(s => {
        const date = new Date(s.createdAt).toISOString().split('T')[0];
        const profit = s.items.reduce((sum, i) => {
          return sum + (parseFloat(i.unitPrice) - parseFloat(i.product.costPrice || 0)) * i.quantity;
        }, 0);
        if (!grouped[date]) grouped[date] = 0;
        grouped[date] += profit;
      });

      data = Object.entries(grouped).map(([date, value]) => ({ date, value }));
    }

    res.json({ success: true, data });
  } catch (error) { next(error); }
};
