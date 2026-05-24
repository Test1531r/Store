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

import {
  Wallet,
  Landmark,
  CreditCard,
} from 'lucide-react';

import { toast } from 'sonner';

const API =
  'http://localhost:5000/api/v1';

export function FinancePage() {
  const [cashboxes, setCashboxes] =
    useState<any[]>([]);

  const [branches, setBranches] =
    useState<any[]>([]);

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      name: '',
      type: 'CASH',
      balance: '',
      branchId: '',
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
          cashboxRes,
          branchRes,
        ] = await Promise.all([
          axios.get(
            `${API}/cashboxes`,
            { headers }
          ),

          axios.get(
            `${API}/branches`,
            { headers }
          ),
        ]);

        setCashboxes(
          cashboxRes.data.data || []
        );

        setBranches(
          branchRes.data.data || []
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to load finance data'
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
          !formData.name ||
          !formData.branchId
        ) {
          toast.error(
            'Please complete required fields'
          );

          return;
        }

        await axios.post(
          `${API}/cashboxes`,
          {
            ...formData,
            balance:
              Number(
                formData.balance
              ) || 0,
          },
          { headers }
        );

        toast.success(
          'Cashbox created'
        );

        setOpen(false);

        setFormData({
          name: '',
          type: 'CASH',
          balance: '',
          branchId: '',
        });

        loadData();
      } catch (error: any) {
        console.error(error);

        toast.error(
          error?.response?.data
            ?.message ||
            'Operation failed'
        );
      }
    };

  // ================= ICON =================

  const getIcon = (
    type: string
  ) => {
    switch (type) {
      case 'BANK':
        return (
          <Landmark className='w-5 h-5' />
        );

      case 'WALLET':
        return (
          <CreditCard className='w-5 h-5' />
        );

      default:
        return (
          <Wallet className='w-5 h-5' />
        );
    }
  };

  return (
    <div className='space-y-6'>
      {/* HEADER */}

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>
            Finance
          </h1>

          <p className='text-muted-foreground'>
            Manage cashboxes and finances
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={setOpen}
        >
          <DialogTrigger asChild>
            <Button>
              Add Cashbox
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Create Cashbox
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-4'>
              <Input
                placeholder='Cashbox Name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name:
                      e.target.value,
                  })
                }
              />

              {/* TYPE */}

              <Select
                value={formData.type}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    type: v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='CASH'>
                    CASH
                  </SelectItem>

                  <SelectItem value='BANK'>
                    BANK
                  </SelectItem>

                  <SelectItem value='WALLET'>
                    WALLET
                  </SelectItem>

                  <SelectItem value='CREDIT'>
                    CREDIT
                  </SelectItem>
                </SelectContent>
              </Select>

              <Input
                type='number'
                placeholder='Opening Balance'
                value={formData.balance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    balance:
                      e.target.value,
                  })
                }
              />

              {/* BRANCH */}

              <Select
                value={
                  formData.branchId
                }
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    branchId: v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select Branch' />
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

              <Button
                className='w-full'
                onClick={handleCreate}
              >
                Create Cashbox
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* STATS */}

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {cashboxes.map(
          (cashbox) => (
            <Card
              key={cashbox.id}
            >
              <CardContent className='p-6 flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    {
                      cashbox.name
                    }
                  </p>

                  <h2 className='text-2xl font-bold mt-2'>
                    EGP{' '}
                    {Number(
                      cashbox.balance
                    ).toLocaleString()}
                  </h2>

                  <p className='text-xs text-muted-foreground mt-1'>
                    {cashbox.branch
                      ?.name || '-'}
                  </p>
                </div>

                <div className='p-3 rounded-xl bg-primary/10'>
                  {getIcon(
                    cashbox.type
                  )}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* TABLE */}

      <Card>
        <CardHeader>
          <CardTitle>
            Cashboxes
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Name
                </TableHead>

                <TableHead>
                  Type
                </TableHead>

                <TableHead>
                  Balance
                </TableHead>

                <TableHead>
                  Branch
                </TableHead>

                <TableHead>
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {cashboxes.map(
                (cashbox) => (
                  <TableRow
                    key={
                      cashbox.id
                    }
                  >
                    <TableCell className='font-medium'>
                      {
                        cashbox.name
                      }
                    </TableCell>

                    <TableCell>
                      {
                        cashbox.type
                      }
                    </TableCell>

                    <TableCell>
                      EGP{' '}
                      {Number(
                        cashbox.balance
                      ).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      {cashbox.branch
                        ?.name || '-'}
                    </TableCell>

                    <TableCell>
                      <Badge>
                        {cashbox.isActive
                          ? 'ACTIVE'
                          : 'INACTIVE'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              )}

              {!loading &&
                cashboxes.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='text-center py-10 text-muted-foreground'
                    >
                      No cashboxes found
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