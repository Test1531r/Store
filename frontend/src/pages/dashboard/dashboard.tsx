import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/appStore';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Wrench,
  AlertTriangle,
  Truck,
  ArrowRight,
  Package,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function DashboardPage() {
  const { currentBranch } = useAppStore();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', currentBranch],
    queryFn: () => dashboardApi.getStats({ branchId: currentBranch }).then((r) => r.data.data),
  });

  const { data: chartData } = useQuery({
    queryKey: ['dashboard-charts', currentBranch],
    queryFn: () => dashboardApi.getCharts({ branchId: currentBranch, type: 'sales', period: '7d' }).then((r) => r.data.data),
  });

  const statCards = [
    {
      title: 'Total Sales',
      value: stats?.stats?.totalSales || 0,
      icon: ShoppingCart,
      trend: '+12%',
      trendUp: true,
      href: '/sales',
    },
    {
      title: 'Revenue',
      value: formatCurrency(stats?.stats?.totalRevenue || 0),
      icon: TrendingUp,
      trend: '+8%',
      trendUp: true,
      href: '/sales',
    },
    {
      title: 'New Customers',
      value: stats?.stats?.totalCustomers || 0,
      icon: Users,
      trend: '+5%',
      trendUp: true,
      href: '/customers',
    },
    {
      title: 'Active Repairs',
      value: stats?.stats?.totalRepairs || 0,
      icon: Wrench,
      trend: '-2%',
      trendUp: false,
      href: '/repairs',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/pos">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Open POS
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={stat.trendUp ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {stat.trendUp ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {stat.trend}
                </Badge>
                <span className="text-xs text-muted-foreground">vs last week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(stats?.stats?.lowStockCount > 0 || stats?.stats?.pendingTransfers > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats?.stats?.lowStockCount > 0 && (
            <Card className="border-yellow-500/50 bg-yellow-500/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Low Stock Alert</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stats.stats.lowStockCount} products are running low on stock
                    </p>
                    <Button variant="link" className="p-0 h-auto mt-2" asChild>
                      <Link to="/inventory">
                        View Inventory <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {stats?.stats?.pendingTransfers > 0 && (
            <Card className="border-blue-500/50 bg-blue-500/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Pending Transfers</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stats.stats.pendingTransfers} transfers awaiting action
                    </p>
                    <Button variant="link" className="p-0 h-auto mt-2" asChild>
                      <Link to="/inventory/transfers">
                        View Transfers <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData || []}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="url(#salesGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentSales?.map((sale: any) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                >
                  <div>
                    <p className="font-medium text-sm">{sale.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {sale.customer?.name || 'Walk-in Customer'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatCurrency(parseFloat(sale.total))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sale.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent sales
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {stats?.topProducts && stats.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {stats.topProducts.map((item: any) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.product?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item._sum.quantity} sold
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
