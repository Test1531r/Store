import { useEffect, useState } from 'react';

import axios from 'axios';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  BarChart3,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';

import { toast } from 'sonner';

const API =
  'http://localhost:5000/api/v1';

export function ReportsPage() {
  const [stats, setStats] =
    useState<any>({
      totalSales: 0,
      totalProfit: 0,
      totalProducts: 0,
      totalInvoices: 0,
    });

  const [topProducts, setTopProducts] =
    useState<any[]>([]);

  const [lowStock, setLowStock] =
    useState<any[]>([]);

  const [recentSales, setRecentSales] =
    useState<any[]>([]);

  const token =
    localStorage.getItem(
      'accessToken'
    );

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ================= LOAD REPORTS =================

  const loadReports =
    async () => {
      try {
        const [
          salesRes,
          productsRes,
          inventoryRes,
        ] = await Promise.all([
          axios.get(
            `${API}/sales`,
            { headers }
          ),

          axios.get(
            `${API}/products`,
            { headers }
          ),

          axios.get(
            `${API}/inventory`,
            { headers }
          ),
        ]);

        const sales =
          salesRes.data.data || [];

        const products =
          productsRes.data.data || [];

        const inventory =
          inventoryRes.data.data || [];

        // ================= TOTALS =================

        const totalSales =
          sales.reduce(
            (
              acc: number,
              item: any
            ) =>
              acc +
              Number(
                item.total || 0
              ),
            0
          );

        const totalProfit =
          sales.reduce(
            (
              acc: number,
              sale: any
            ) =>
              acc +
              Number(
                sale.total || 0
              ),
            0
          ) * 0.25;

        // ================= LOW STOCK =================

        const low =
          inventory.filter(
            (item: any) =>
              item.quantity <=
              item.minStock
          );

        // ================= TOP PRODUCTS =================

        const sortedProducts =
          [...products]
            .sort(
              (
                a: any,
                b: any
              ) =>
                (b.saleItems
                  ?.length ||
                  0) -
                (a.saleItems
                  ?.length ||
                  0)
            )
            .slice(0, 5);

        setStats({
          totalSales,
          totalProfit,
          totalProducts:
            products.length,
          totalInvoices:
            sales.length,
        });

        setTopProducts(
          sortedProducts
        );

        setLowStock(low);

        setRecentSales(
          sales.slice(0, 8)
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to load reports'
        );
      }
    };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className='space-y-6'>
      {/* HEADER */}

      <div>
        <h1 className='text-3xl font-bold'>
          Reports & Analytics
        </h1>

        <p className='text-muted-foreground'>
          Business overview and statistics
        </p>
      </div>

      {/* STATS */}

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* SALES */}

        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Total Sales
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                EGP{' '}
                {stats.totalSales.toLocaleString()}
              </h2>
            </div>

            <DollarSign className='w-10 h-10 text-primary' />
          </CardContent>
        </Card>

        {/* PROFIT */}

        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Profit
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                EGP{' '}
                {stats.totalProfit.toLocaleString()}
              </h2>
            </div>

            <TrendingUp className='w-10 h-10 text-green-500' />
          </CardContent>
        </Card>

        {/* PRODUCTS */}

        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Products
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                {
                  stats.totalProducts
                }
              </h2>
            </div>

            <Package className='w-10 h-10 text-blue-500' />
          </CardContent>
        </Card>

        {/* INVOICES */}

        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Invoices
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                {
                  stats.totalInvoices
                }
              </h2>
            </div>

            <ShoppingCart className='w-10 h-10 text-orange-500' />
          </CardContent>
        </Card>
      </div>

      {/* TABLES */}

      <div className='grid gap-6 lg:grid-cols-2'>
        {/* TOP PRODUCTS */}

        <Card>
          <CardHeader>
            <CardTitle>
              Top Products
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Product
                  </TableHead>

                  <TableHead>
                    SKU
                  </TableHead>

                  <TableHead>
                    Sales
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {topProducts.map(
                  (product) => (
                    <TableRow
                      key={
                        product.id
                      }
                    >
                      <TableCell className='font-medium'>
                        {
                          product.name
                        }
                      </TableCell>

                      <TableCell>
                        {
                          product.sku
                        }
                      </TableCell>

                      <TableCell>
                        {
                          product
                            .saleItems
                            ?.length
                        }
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* LOW STOCK */}

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertTriangle className='w-5 h-5 text-red-500' />

              Low Stock
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Product
                  </TableHead>

                  <TableHead>
                    Qty
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {lowStock.map(
                  (item) => (
                    <TableRow
                      key={item.id}
                    >
                      <TableCell className='font-medium'>
                        {
                          item.product
                            ?.name
                        }
                      </TableCell>

                      <TableCell>
                        {
                          item.quantity
                        }
                      </TableCell>

                      <TableCell>
                        <Badge variant='destructive'>
                          LOW
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                )}

                {lowStock.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className='text-center py-8 text-muted-foreground'
                    >
                      No low stock items
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* RECENT SALES */}

      <Card>
        <CardHeader>
          <CardTitle>
            Recent Sales
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Invoice
                </TableHead>

                <TableHead>
                  Customer
                </TableHead>

                <TableHead>
                  Total
                </TableHead>

                <TableHead>
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {recentSales.map(
                (sale) => (
                  <TableRow
                    key={sale.id}
                  >
                    <TableCell className='font-medium'>
                      {
                        sale.invoiceNumber
                      }
                    </TableCell>

                    <TableCell>
                      {sale.customer
                        ?.name ||
                        'Walk-in'}
                    </TableCell>

                    <TableCell>
                      EGP{' '}
                      {Number(
                        sale.total
                      ).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      {new Date(
                        sale.createdAt
                      ).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}