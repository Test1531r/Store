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
  Package,
  AlertTriangle,
  Warehouse,
  Search,
  Printer,
  Boxes,
} from 'lucide-react';

import { toast } from 'sonner';

const API =
  'http://localhost:5000/api/v1';

export function InventoryReportPage() {
  const [inventory, setInventory] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const token =
    localStorage.getItem(
      'accessToken'
    );

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ================= LOAD =================

  const loadInventory =
    async () => {
      try {
        setLoading(true);

        const response =
          await axios.get(
            `${API}/inventory`,
            { headers }
          );

        setInventory(
          response.data.data || []
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to load inventory report'
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadInventory();
  }, []);

  // ================= FILTER =================

  const filteredInventory =
    useMemo(() => {
      return inventory.filter(
        (item) =>
          item.product?.name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          item.product?.sku
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [inventory, search]);

  // ================= STATS =================

  const totalProducts =
    filteredInventory.length;

  const totalQuantity =
    filteredInventory.reduce(
      (acc, item) =>
        acc +
        Number(item.quantity || 0),
      0
    );

  const lowStockItems =
    filteredInventory.filter(
      (item) =>
        item.quantity <=
        (item.minStock || 5)
    ).length;

  const inventoryValue =
    filteredInventory.reduce(
      (acc, item) =>
        acc +
        Number(item.quantity || 0) *
          Number(
            item.product
              ?.costPrice || 0
          ),
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
            Inventory Report
          </h1>

          <p className='text-muted-foreground'>
            Complete inventory overview
          </p>
        </div>

        <Button
          onClick={handlePrint}
        >
          <Printer className='w-4 h-4 mr-2' />

          Print
        </Button>
      </div>

      {/* SEARCH */}

      <Card>
        <CardContent className='p-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-3 w-4 h-4 text-muted-foreground' />

            <Input
              placeholder='Search product or SKU...'
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

      {/* STATS */}

      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Products
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                {totalProducts}
              </h2>
            </div>

            <Package className='w-10 h-10 text-primary' />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Total Quantity
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                {totalQuantity}
              </h2>
            </div>

            <Boxes className='w-10 h-10 text-blue-500' />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Low Stock
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                {lowStockItems}
              </h2>
            </div>

            <AlertTriangle className='w-10 h-10 text-red-500' />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Inventory Value
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                EGP{' '}
                {inventoryValue.toLocaleString()}
              </h2>
            </div>

            <Warehouse className='w-10 h-10 text-green-500' />
          </CardContent>
        </Card>
      </div>

      {/* TABLE */}

      <Card>
        <CardHeader>
          <CardTitle>
            Inventory Details
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
                  Branch
                </TableHead>

                <TableHead>
                  Quantity
                </TableHead>

                <TableHead>
                  Min Stock
                </TableHead>

                <TableHead>
                  Cost Price
                </TableHead>

                <TableHead>
                  Total Value
                </TableHead>

                <TableHead>
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredInventory.map(
                (item) => {
                  const isLow =
                    item.quantity <=
                    (item.minStock ||
                      5);

                  return (
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
                          item.product
                            ?.sku
                        }
                      </TableCell>

                      <TableCell>
                        {item.branch
                          ?.name ||
                          '-'}
                      </TableCell>

                      <TableCell>
                        {
                          item.quantity
                        }
                      </TableCell>

                      <TableCell>
                        {item.minStock}
                      </TableCell>

                      <TableCell>
                        EGP{' '}
                        {Number(
                          item.product
                            ?.costPrice
                        ).toLocaleString()}
                      </TableCell>

                      <TableCell>
                        EGP{' '}
                        {(
                          Number(
                            item.quantity
                          ) *
                          Number(
                            item
                              .product
                              ?.costPrice
                          )
                        ).toLocaleString()}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            isLow
                              ? 'bg-red-100 text-red-600'
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {isLow
                            ? 'LOW STOCK'
                            : 'GOOD'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                }
              )}

              {!loading &&
                filteredInventory.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className='text-center py-10 text-muted-foreground'
                    >
                      No inventory found
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