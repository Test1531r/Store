import { useEffect, useState } from 'react';

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';

import {
  Search,
  Printer,
  Receipt,
} from 'lucide-react';

import { toast } from 'sonner';

const API =
  'http://localhost:5000/api/v1';

export function InvoicesPage() {
  const [sales, setSales] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(false);

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
          'Failed to load invoices'
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
    sales.filter((sale) =>
      sale.invoiceNumber
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // ================= PRINT =================

  const handlePrint =
    (sale: any) => {
      const printWindow =
        window.open(
          '',
          '_blank'
        );

      if (!printWindow) return;

      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice</title>

            <style>
              body {
                font-family: Arial;
                padding: 20px;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }

              th, td {
                border: 1px solid #ddd;
                padding: 8px;
              }

              h1 {
                margin-bottom: 10px;
              }
            </style>
          </head>

          <body>
            <h1>Invoice</h1>

            <p>
              Invoice:
              ${sale.invoiceNumber}
            </p>

            <p>
              Customer:
              ${
                sale.customer
                  ?.name ||
                'Walk-in'
              }
            </p>

            <p>
              Date:
              ${new Date(
                sale.createdAt
              ).toLocaleString()}
            </p>

            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                ${sale.items
                  ?.map(
                    (
                      item: any
                    ) => `
                  <tr>
                    <td>
                      ${item.product?.name}
                    </td>

                    <td>
                      ${item.quantity}
                    </td>

                    <td>
                      ${item.unitPrice}
                    </td>

                    <td>
                      ${item.total}
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>

            <h2>
              Total:
              EGP ${sale.total}
            </h2>

            <script>
              window.print()
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
    };

  return (
    <div className='space-y-6'>
      {/* HEADER */}

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>
            Invoices
          </h1>

          <p className='text-muted-foreground'>
            Sales invoices management
          </p>
        </div>
      </div>

      {/* SEARCH */}

      <Card>
        <CardContent className='p-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-3 w-4 h-4 text-muted-foreground' />

            <Input
              placeholder='Search invoice number...'
              className='pl-10'
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}

      <Card>
        <CardHeader>
          <CardTitle>
            Invoices List
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
                  Status
                </TableHead>

                <TableHead>
                  Date
                </TableHead>

                <TableHead>
                  Actions
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
                      EGP{' '}
                      {Number(
                        sale.total
                      ).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <Badge>
                        {sale.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {new Date(
                        sale.createdAt
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <div className='flex gap-2'>
                        {/* VIEW */}

                        <Dialog>
                          <DialogTrigger
                            asChild
                          >
                            <Button
                              size='sm'
                              variant='outline'
                            >
                              <Receipt className='w-4 h-4 mr-2' />

                              View
                            </Button>
                          </DialogTrigger>

                          <DialogContent className='max-w-3xl'>
                            <DialogHeader>
                              <DialogTitle>
                                Invoice Details
                              </DialogTitle>
                            </DialogHeader>

                            <div className='space-y-4'>
                              <div className='grid grid-cols-2 gap-4'>
                                <div>
                                  <p className='text-sm text-muted-foreground'>
                                    Invoice
                                  </p>

                                  <p className='font-medium'>
                                    {
                                      sale.invoiceNumber
                                    }
                                  </p>
                                </div>

                                <div>
                                  <p className='text-sm text-muted-foreground'>
                                    Customer
                                  </p>

                                  <p className='font-medium'>
                                    {sale
                                      .customer
                                      ?.name ||
                                      'Walk-in'}
                                  </p>
                                </div>
                              </div>

                              {/* ITEMS */}

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
                                      Price
                                    </TableHead>

                                    <TableHead>
                                      Total
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>

                                <TableBody>
                                  {sale.items?.map(
                                    (
                                      item: any
                                    ) => (
                                      <TableRow
                                        key={
                                          item.id
                                        }
                                      >
                                        <TableCell>
                                          {
                                            item
                                              .product
                                              ?.name
                                          }
                                        </TableCell>

                                        <TableCell>
                                          {
                                            item.quantity
                                          }
                                        </TableCell>

                                        <TableCell>
                                          EGP{' '}
                                          {
                                            item.unitPrice
                                          }
                                        </TableCell>

                                        <TableCell>
                                          EGP{' '}
                                          {
                                            item.total
                                          }
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>

                              <div className='text-right'>
                                <h2 className='text-2xl font-bold'>
                                  Total:
                                  EGP{' '}
                                  {
                                    sale.total
                                  }
                                </h2>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* PRINT */}

                        <Button
                          size='sm'
                          onClick={() =>
                            handlePrint(
                              sale
                            )
                          }
                        >
                          <Printer className='w-4 h-4 mr-2' />

                          Print
                        </Button>
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
                      No invoices found
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