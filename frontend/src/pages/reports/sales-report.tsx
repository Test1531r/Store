import { useEffect, useMemo, useState } from 'react';

import axios from 'axios';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Calendar,
  Search,
  Printer,
} from 'lucide-react';

import { toast } from 'sonner';

const API =
  'http://localhost:5000/api/v1';

export function SalesReportPage() {
  const [sales, setSales] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [fromDate, setFromDate] =
    useState('');

  const [toDate, setToDate] =
    useState('');

  const token =
    localStorage.getItem(
      'accessToken'
    );

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ================= LOAD =================

  const loadSales =
    async () => {
      try {
        setLoading(true);

        const response =
          await axios.get(
            `${API}/sales`,
            { headers }
          );

        setSales(
          response.data.data || []
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to load report'
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadSales();
  }, []);

  // ================= FILTER =================

  const filteredSales =
    useMemo(() => {
      return sales.filter(
        (sale) => {
          const invoiceMatch =
            sale.invoiceNumber
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const saleDate =
            new Date(
              sale.createdAt
            );

          const fromMatch =
            fromDate
              ? saleDate >=
                new Date(
                  fromDate
                )
              : true;

          const toMatch =
            toDate
              ? saleDate <=
                new Date(
                  toDate
                )
              : true;

          return (
            invoiceMatch &&
            fromMatch &&
            toMatch
          );
        }
      );
    }, [
      sales,
      search,
      fromDate,
      toDate,
    ]);

  // ================= STATS =================

  const totalSales =
    filteredSales.reduce(
      (acc, sale) =>
        acc +
        Number(sale.total || 0),
      0
    );

  const totalInvoices =
    filteredSales.length;

  const totalProducts =
    filteredSales.reduce(
      (
        acc,
        sale
      ) =>
        acc +
        (sale.items?.length ||
          0),
      0
    );

  // ================= PRINT =================

  const handlePrint =
    () => {
      window.print();
    };

  return (
    <div className='space-y-6'>
      {/* HEADER */}

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>
            Sales Report
          </h1>

          <p className='text-muted-foreground'>
            Detailed sales analytics
          </p>
        </div>

        <Button
          onClick={handlePrint}
        >
          <Printer className='w-4 h-4 mr-2' />

          Print
        </Button>
      </div>

      {/* FILTERS */}

      <Card>
        <CardContent className='p-4'>
          <div className='grid gap-4 md:grid-cols-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-3 w-4 h-4 text-muted-foreground' />

              <Input
                placeholder='Invoice number'
                className='pl-10'
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />
            </div>

            <Input
              type='date'
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
            />

            <Input
              type='date'
              value={toDate}
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
            />

            <Button
              variant='outline'
              onClick={() => {
                setSearch('');
                setFromDate('');
                setToDate('');
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* STATS */}

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Total Sales
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                EGP{' '}
                {totalSales.toLocaleString()}
              </h2>
            </div>

            <DollarSign className='w-10 h-10 text-green-500' />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Invoices
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                {totalInvoices}
              </h2>
            </div>

            <ShoppingCart className='w-10 h-10 text-primary' />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Sold Products
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                {totalProducts}
              </h2>
            </div>

            <TrendingUp className='w-10 h-10 text-blue-500' />
          </CardContent>
        </Card>
      </div>

      {/* TABLE */}

      <Card>
        <CardHeader>
          <CardTitle>
            Sales Details
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
                  Products
                </TableHead>

                <TableHead>
                  Total
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead>
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredSales.map(
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
                      {sale.items?.map(
                        (
                          item: any,
                          index: number
                        ) => (
                          <div
                            key={
                              index
                            }
                          >
                            {
                              item
                                .product
                                ?.name
                            }{' '}
                            ×{' '}
                            {
                              item.quantity
                            }
                          </div>
                        )
                      )}
                    </TableCell>

                    <TableCell>
                      EGP{' '}
                      {Number(
                        sale.total
                      ).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <span className='px-2 py-1 rounded bg-primary/10 text-primary text-xs'>
                        {
                          sale.status
                        }
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Calendar className='w-4 h-4 text-muted-foreground' />

                        {new Date(
                          sale.createdAt
                        ).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )}

              {!loading &&
                filteredSales.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-center py-10 text-muted-foreground'
                    >
                      No sales found
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}