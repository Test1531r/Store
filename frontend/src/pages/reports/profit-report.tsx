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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Search,
  Printer,
} from 'lucide-react';

import { toast } from 'sonner';

const API =
  'http://localhost:5000/api/v1';

export function ProfitReportPage() {
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
          'Failed to load profit report'
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

  // ================= CALCULATIONS =================

  const totalRevenue =
    filteredSales.reduce(
      (acc, sale) =>
        acc +
        Number(sale.total || 0),
      0
    );

  const totalCost =
    filteredSales.reduce(
      (acc, sale) => {
        const itemsCost =
          sale.items?.reduce(
            (
              itemAcc: number,
              item: any
            ) =>
              itemAcc +
              Number(
                item.product
                  ?.costPrice || 0
              ) *
                Number(
                  item.quantity || 0
                ),
            0
          ) || 0;

        return acc + itemsCost;
      },
      0
    );

  const totalProfit =
    totalRevenue - totalCost;

  const profitMargin =
    totalRevenue > 0
      ? (
          (totalProfit /
            totalRevenue) *
          100
        ).toFixed(2)
      : 0;

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
            Profit Report
          </h1>

          <p className='text-muted-foreground'>
            Revenue & profit analytics
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

      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Revenue
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                EGP{' '}
                {totalRevenue.toLocaleString()}
              </h2>
            </div>

            <DollarSign className='w-10 h-10 text-green-500' />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Cost
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                EGP{' '}
                {totalCost.toLocaleString()}
              </h2>
            </div>

            <TrendingDown className='w-10 h-10 text-red-500' />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Net Profit
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                EGP{' '}
                {totalProfit.toLocaleString()}
              </h2>
            </div>

            <TrendingUp className='w-10 h-10 text-blue-500' />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Profit Margin
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                {profitMargin}%
              </h2>
            </div>

            <Package className='w-10 h-10 text-primary' />
          </CardContent>
        </Card>
      </div>

      {/* TABLE */}

      <Card>
        <CardHeader>
          <CardTitle>
            Profit Details
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
                  Revenue
                </TableHead>

                <TableHead>
                  Cost
                </TableHead>

                <TableHead>
                  Profit
                </TableHead>

                <TableHead>
                  Margin
                </TableHead>

                <TableHead>
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredSales.map(
                (sale) => {
                  const revenue =
                    Number(
                      sale.total || 0
                    );

                  const cost =
                    sale.items?.reduce(
                      (
                        acc: number,
                        item: any
                      ) =>
                        acc +
                        Number(
                          item.product
                            ?.costPrice ||
                            0
                        ) *
                          Number(
                            item.quantity ||
                              0
                          ),
                      0
                    ) || 0;

                  const profit =
                    revenue - cost;

                  const margin =
                    revenue > 0
                      ? (
                          (profit /
                            revenue) *
                          100
                        ).toFixed(2)
                      : 0;

                  return (
                    <TableRow
                      key={sale.id}
                    >
                      <TableCell className='font-medium'>
                        {
                          sale.invoiceNumber
                        }
                      </TableCell>

                      <TableCell>
                        EGP{' '}
                        {revenue.toLocaleString()}
                      </TableCell>

                      <TableCell>
                        EGP{' '}
                        {cost.toLocaleString()}
                      </TableCell>

                      <TableCell
                        className={
                          profit >= 0
                            ? 'text-green-600 font-bold'
                            : 'text-red-600 font-bold'
                        }
                      >
                        EGP{' '}
                        {profit.toLocaleString()}
                      </TableCell>

                      <TableCell>
                        {margin}%
                      </TableCell>

                      <TableCell>
                        {new Date(
                          sale.createdAt
                        ).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                }
              )}

              {!loading &&
                filteredSales.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-center py-10 text-muted-foreground'
                    >
                      No profit data found
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