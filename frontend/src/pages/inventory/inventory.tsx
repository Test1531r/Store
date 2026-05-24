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
} from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';

import { toast } from 'sonner';

const API =
  'http://localhost:5000/api/v1';

export function InventoryPage() {
  const [inventory, setInventory] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [selectedItem, setSelectedItem] =
    useState<any>(null);

  const [newQty, setNewQty] =
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
            {
              headers,
            }
          );

        setInventory(
          response.data.data || []
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to load inventory'
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadInventory();
  }, []);

  // ================= UPDATE STOCK =================

  const updateStock =
    async () => {
      try {
        if (!selectedItem)
          return;

        await axios.put(
          `${API}/inventory/${selectedItem.id}`,
          {
            quantity:
              Number(newQty),
          },
          { headers }
        );

        toast.success(
          'Stock updated'
        );

        setSelectedItem(null);

        setNewQty('');

        loadInventory();
      } catch (error: any) {
        console.error(error);

        toast.error(
          error?.response?.data
            ?.message ||
            'Update failed'
        );
      }
    };

  // ================= FILTER =================

  const filtered =
    inventory.filter((item) =>
      item.product?.name
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
          Inventory
        </h1>

        <p className='text-muted-foreground'>
          Monitor stock levels
        </p>
      </div>

      {/* SEARCH */}

      <Card>
        <CardContent className='pt-6'>
          <Input
            placeholder='Search product...'
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />
        </CardContent>
      </Card>

      {/* TABLE */}

      <Card>
        <CardHeader>
          <CardTitle>
            Stock Levels
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
                  Reserved
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map(
                (item) => {
                  const low =
                    item.quantity <=
                    item.minStock;

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
                        {
                          item.branch
                            ?.name
                        }
                      </TableCell>

                      <TableCell>
                        {
                          item.quantity
                        }
                      </TableCell>

                      <TableCell>
                        {
                          item.reservedQty
                        }
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            low
                              ? 'destructive'
                              : 'default'
                          }
                        >
                          {low
                            ? 'LOW STOCK'
                            : 'IN STOCK'}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => {
                            setSelectedItem(
                              item
                            );

                            setNewQty(
                              item.quantity?.toString()
                            );
                          }}
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }
              )}

              {!loading &&
                filtered.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
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

      {/* UPDATE DIALOG */}

      <Dialog
        open={!!selectedItem}
        onOpenChange={() =>
          setSelectedItem(null)
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Update Stock
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className='space-y-4'>
              <div>
                <p className='font-medium'>
                  {
                    selectedItem.product
                      ?.name
                  }
                </p>

                <p className='text-sm text-muted-foreground'>
                  Current Stock:{' '}
                  {
                    selectedItem.quantity
                  }
                </p>
              </div>

              <Input
                type='number'
                placeholder='New Quantity'
                value={newQty}
                onChange={(e) =>
                  setNewQty(
                    e.target.value
                  )
                }
              />

              <Button
                className='w-full'
                onClick={updateStock}
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}