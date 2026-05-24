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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';

import { toast } from 'sonner';

const API =
  'http://localhost:5000/api';

export function SalesPage() {
  const [sales, setSales] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState('');

  const [selectedSale, setSelectedSale] =
    useState<any>(null);

  const [open, setOpen] =
    useState(false);

  const token =
    localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ================= LOAD SALES =================

  const loadSales =
    async () => {
      try {
        const response =
          await axios.get(
            `${API}/sales`,
            {
              headers,
            }
          );

        setSales(
          response.data.data || []
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to load sales'
        );
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

  // ================= STATUS =================

  const getStatusColor = (
    status: string
  ) => {
    switch (status) {
      case 'COMPLETED':
        return 'default';

      case 'PENDING':
        return 'secondary';

      case 'CANCELLED':
        return 'destructive';

      default:
        return 'outline';
    }
  };

  // ================= TOTALS =================

  const totalSales =
    sales.reduce(
      (acc, sale) =>
        acc + Number(sale.total),
      0
    );

  return (
    <div className='space-y-6'>
      {/* HEADER */}

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>
            Sales
          </h1>

          <p className='text-muted-foreground'>
            Manage invoices and sales transactions
          </p>
        </div>

        <Card className='w-64'>
          <CardContent className='pt-6'>
            <div className='text-sm text-muted-foreground'>
              Total Sales
            </div>

            <div className='text-3xl font-bold text-green-600'>
              EGP{' '}
              {totalSales.toFixed(
                2
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH */}

      <Card>
        <CardContent className='pt-6'>
          <Input
            placeholder='Search invoice...'
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />
        </CardContent>
      </Card>

      {/* SALES TABLE */}

      <Card>
        <CardHeader>
          <CardTitle>
            Sales List
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
                  Branch
                </TableHead>

                <TableHead>
                  Total
                </TableHead>

                <TableHead>
                  Paid
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
                        'Walk-in Customer'}
                    </TableCell>

                    <TableCell>
                      {
                        sale.branch
                          ?.name
                      }
                    </TableCell>

                    <TableCell>
                      EGP{' '}
                      {Number(
                        sale.total
                      ).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      EGP{' '}
                      {Number(
                        sale.paid
                      ).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={getStatusColor(
                          sale.status
                        )}
                      >
                        {
                          sale.status
                        }
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {new Date(
                        sale.createdAt
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Dialog
                        open={open}
                        onOpenChange={
                          setOpen
                        }
                      >
                        <DialogTrigger
                          asChild
                        >
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() =>
                              setSelectedSale(
                                sale
                              )
                            }
                          >
                            View
                          </Button>
                        </DialogTrigger>

                        <DialogContent className='max-w-3xl'>
                          <DialogHeader>
                            <DialogTitle>
                              Invoice Details
                            </DialogTitle>
                          </DialogHeader>

                          {selectedSale && (
                            <div className='space-y-6'>
                              {/* INFO */}

                              <div className='grid grid-cols-2 gap-4'>
                                <Card>
                                  <CardContent className='pt-6 space-y-2'>
                                    <div>
                                      <strong>
                                        Invoice:
                                      </strong>{' '}
                                      {
                                        selectedSale.invoiceNumber
                                      }
                                    </div>

                                    <div>
                                      <strong>
                                        Customer:
                                      </strong>{' '}
                                      {selectedSale
                                        .customer
                                        ?.name ||
                                        'Walk-in'}
                                    </div>

                                    <div>
                                      <strong>
                                        Branch:
                                      </strong>{' '}
                                      {
                                        selectedSale
                                          .branch
                                          ?.name
                                      }
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardContent className='pt-6 space-y-2'>
                                    <div>
                                      <strong>
                                        Subtotal:
                                      </strong>{' '}
                                      EGP{' '}
                                      {Number(
                                        selectedSale.subtotal
                                      ).toFixed(
                                        2
                                      )}
                                    </div>

                                    <div>
                                      <strong>
                                        Tax:
                                      </strong>{' '}
                                      EGP{' '}
                                      {Number(
                                        selectedSale.tax
                                      ).toFixed(
                                        2
                                      )}
                                    </div>

                                    <div className='text-lg font-bold text-green-600'>
                                      Total:{' '}
                                      EGP{' '}
                                      {Number(
                                        selectedSale.total
                                      ).toFixed(
                                        2
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* ITEMS */}

                              <Card>
                                <CardHeader>
                                  <CardTitle>
                                    Items
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
                                          Price
                                        </TableHead>

                                        <TableHead>
                                          Total
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                      {selectedSale.items?.map(
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
                                              {Number(
                                                item.unitPrice
                                              ).toFixed(
                                                2
                                              )}
                                            </TableCell>

                                            <TableCell>
                                              EGP{' '}
                                              {Number(
                                                item.total
                                              ).toFixed(
                                                2
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        )
                                      )}
                                    </TableBody>
                                  </Table>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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