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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

export function TransfersPage() {
  const [transfers, setTransfers] =
    useState<any[]>([]);

  const [branches, setBranches] =
    useState<any[]>([]);

  const [products, setProducts] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [open, setOpen] =
    useState(false);

  const [formData, setFormData] =
    useState({
      fromBranchId: '',
      toBranchId: '',
      productId: '',
      quantity: '',
      notes: '',
    });

  const token =
    localStorage.getItem(
      'accessToken'
    );

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ================= LOAD =================

  const loadData =
    async () => {
      try {
        setLoading(true);

        const [
          transfersRes,
          branchesRes,
          productsRes,
        ] = await Promise.all([
          axios.get(
            `${API}/transfers`,
            { headers }
          ),

          axios.get(
            `${API}/branches`,
            { headers }
          ),

          axios.get(
            `${API}/products`,
            { headers }
          ),
        ]);

        setTransfers(
          transfersRes.data.data ||
            []
        );

        setBranches(
          branchesRes.data.data ||
            []
        );

        setProducts(
          productsRes.data.data ||
            []
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to load transfers'
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadData();
  }, []);

  // ================= CREATE =================

  const handleCreate =
    async () => {
      try {
        if (
          !formData.fromBranchId ||
          !formData.toBranchId ||
          !formData.productId ||
          !formData.quantity
        ) {
          toast.error(
            'Please complete all fields'
          );

          return;
        }

        await axios.post(
          `${API}/transfers`,
          {
            fromBranchId:
              formData.fromBranchId,

            toBranchId:
              formData.toBranchId,

            notes:
              formData.notes,

            items: [
              {
                productId:
                  formData.productId,

                quantity:
                  Number(
                    formData.quantity
                  ),
              },
            ],
          },
          { headers }
        );

        toast.success(
          'Transfer created'
        );

        setOpen(false);

        setFormData({
          fromBranchId: '',
          toBranchId: '',
          productId: '',
          quantity: '',
          notes: '',
        });

        loadData();
      } catch (error: any) {
        console.error(error);

        toast.error(
          error?.response?.data
            ?.message ||
            'Transfer failed'
        );
      }
    };

  // ================= STATUS =================

  const getStatusVariant =
    (status: string) => {
      switch (status) {
        case 'RECEIVED':
          return 'default';

        case 'PENDING':
          return 'secondary';

        case 'CANCELLED':
          return 'destructive';

        default:
          return 'outline';
      }
    };

  return (
    <div className='space-y-6'>
      {/* HEADER */}

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>
            Stock Transfers
          </h1>

          <p className='text-muted-foreground'>
            Transfer products between branches
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={setOpen}
        >
          <DialogTrigger asChild>
            <Button>
              New Transfer
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Create Transfer
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-4'>
              {/* FROM BRANCH */}

              <Select
                value={
                  formData.fromBranchId
                }
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    fromBranchId:
                      v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='From Branch' />
                </SelectTrigger>

                <SelectContent>
                  {branches.map(
                    (branch) => (
                      <SelectItem
                        key={branch.id}
                        value={
                          branch.id
                        }
                      >
                        {
                          branch.name
                        }
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              {/* TO BRANCH */}

              <Select
                value={
                  formData.toBranchId
                }
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    toBranchId:
                      v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='To Branch' />
                </SelectTrigger>

                <SelectContent>
                  {branches.map(
                    (branch) => (
                      <SelectItem
                        key={branch.id}
                        value={
                          branch.id
                        }
                      >
                        {
                          branch.name
                        }
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              {/* PRODUCT */}

              <Select
                value={
                  formData.productId
                }
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    productId:
                      v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select Product' />
                </SelectTrigger>

                <SelectContent>
                  {products.map(
                    (product) => (
                      <SelectItem
                        key={product.id}
                        value={
                          product.id
                        }
                      >
                        {
                          product.name
                        }
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              {/* QTY */}

              <Input
                type='number'
                placeholder='Quantity'
                value={
                  formData.quantity
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity:
                      e.target.value,
                  })
                }
              />

              {/* NOTES */}

              <Input
                placeholder='Notes'
                value={formData.notes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notes:
                      e.target.value,
                  })
                }
              />

              <Button
                className='w-full'
                onClick={handleCreate}
              >
                Create Transfer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLE */}

      <Card>
        <CardHeader>
          <CardTitle>
            Transfers List
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Transfer No
                </TableHead>

                <TableHead>
                  From
                </TableHead>

                <TableHead>
                  To
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead>
                  Date
                </TableHead>

                <TableHead>
                  Items
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {transfers.map(
                (transfer) => (
                  <TableRow
                    key={
                      transfer.id
                    }
                  >
                    <TableCell className='font-medium'>
                      {
                        transfer.transferNumber
                      }
                    </TableCell>

                    <TableCell>
                      {
                        transfer
                          .fromBranch
                          ?.name
                      }
                    </TableCell>

                    <TableCell>
                      {
                        transfer
                          .toBranch
                          ?.name
                      }
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={getStatusVariant(
                          transfer.status
                        )}
                      >
                        {
                          transfer.status
                        }
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {new Date(
                        transfer.createdAt
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      {
                        transfer
                          .items
                          ?.length
                      }
                    </TableCell>
                  </TableRow>
                )
              )}

              {!loading &&
                transfers.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-center py-10 text-muted-foreground'
                    >
                      No transfers found
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