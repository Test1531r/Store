import { useEffect, useState } from 'react';

import axios from 'axios';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';

import {
  RotateCcw,
  Search,
} from 'lucide-react';

import { toast } from 'sonner';

const API =
  'http://localhost:5000/api/v1';

export function ReturnsPage() {
  const [sales, setSales] =
    useState<any[]>([]);

  const [selectedSale, setSelectedSale] =
    useState<any>(null);

  const [open, setOpen] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [reason, setReason] =
    useState('');

  const token =
    localStorage.getItem(
      'accessToken'
    );

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
            { headers }
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

  // ================= RETURN =================

  const handleReturn =
    async () => {
      try {
        if (!selectedSale) return;

        await axios.post(
          `${API}/sales/${selectedSale.id}/return`,
          {
            reason,
          },
          { headers }
        );

        toast.success(
          'Return completed successfully'
        );

        setOpen(false);

        setReason('');

        loadSales();
      } catch (error: any) {
        console.error(error);

        toast.error(
          error?.response?.data
            ?.message ||
            'Return failed'
        );
      }
    };

  // ================= FILTER =================

  const filteredSales =
    sales.filter((sale) =>
      sale.invoiceNumber
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div className='space-y-6'>
      {/* HEADER */}

      <div>
        <h1 className='text-3xl font-bold'>
          Returns
        </h1>

        <p className='text-muted-foreground'>
          Manage sales returns
        </p>
      </div>

      {/* SEARCH */}

      <Card>
        <CardContent className='p-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-3 w-4 h-4 text-muted-foreground' />

            <Input
              placeholder='Search invoice...'
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
                      <Badge
                        variant={
                          sale.isReturn
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {sale.isReturn
                          ? 'RETURNED'
                          : sale.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {new Date(
                        sale.createdAt
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      {!sale.isReturn && (
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
                              variant='destructive'
                              onClick={() =>
                                setSelectedSale(
                                  sale
                                )
                              }
                            >
                              <RotateCcw className='w-4 h-4 mr-2' />

                              Return
                            </Button>
                          </DialogTrigger>

                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Return Invoice
                              </DialogTitle>
                            </DialogHeader>

                            <div className='space-y-4'>
                              <div>
                                <p className='text-sm text-muted-foreground'>
                                  Invoice
                                </p>

                                <p className='font-medium'>
                                  {
                                    selectedSale?.invoiceNumber
                                  }
                                </p>
                              </div>

                              <div>
                                <p className='text-sm text-muted-foreground'>
                                  Total
                                </p>

                                <p className='font-medium'>
                                  EGP{' '}
                                  {selectedSale?.total}
                                </p>
                              </div>

                              <Input
                                placeholder='Reason'
                                value={
                                  reason
                                }
                                onChange={(e) =>
                                  setReason(
                                    e.target
                                      .value
                                  )
                                }
                              />

                              <Button
                                variant='destructive'
                                className='w-full'
                                onClick={
                                  handleReturn
                                }
                              >
                                Confirm Return
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                )
              )}

              {filteredSales.length ===
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