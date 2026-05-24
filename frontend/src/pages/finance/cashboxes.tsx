import { useEffect, useMemo, useState } from 'react';

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
  Wallet,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  Landmark,
} from 'lucide-react';

import { toast } from 'sonner';

const API =
  'http://localhost:5000/api/v1';

interface Cashbox {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  isActive: boolean;
  branch?: {
    name: string;
  };
}

export function CashboxesPage() {
  const [cashboxes, setCashboxes] =
    useState<Cashbox[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [openCreate, setOpenCreate] =
    useState(false);

  const [openTransaction, setOpenTransaction] =
    useState(false);

  const [selectedCashbox, setSelectedCashbox] =
    useState<Cashbox | null>(null);

  const [formData, setFormData] =
    useState({
      name: '',
      type: 'CASH',
      balance: '',
      currency: 'EGP',
      branchId: '',
    });

  const [transactionData, setTransactionData] =
    useState({
      type: 'INCOME',
      amount: '',
      description: '',
    });

  const token =
    localStorage.getItem(
      'accessToken'
    );

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ================= LOAD =================

  const loadCashboxes =
    async () => {
      try {
        setLoading(true);

        const response =
          await axios.get(
            `${API}/cashboxes`,
            { headers }
          );

        setCashboxes(
          response.data.data || []
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to load cashboxes'
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadCashboxes();
  }, []);

  // ================= CREATE =================

  const handleCreate =
    async () => {
      try {
        if (
          !formData.name ||
          !formData.balance
        ) {
          toast.error(
            'Complete required fields'
          );

          return;
        }

        await axios.post(
          `${API}/cashboxes`,
          {
            ...formData,
            balance: Number(
              formData.balance
            ),
          },
          { headers }
        );

        toast.success(
          'Cashbox created successfully'
        );

        setOpenCreate(false);

        setFormData({
          name: '',
          type: 'CASH',
          balance: '',
          currency: 'EGP',
          branchId: '',
        });

        loadCashboxes();
      } catch (error: any) {
        console.error(error);

        toast.error(
          error?.response?.data
            ?.message ||
            'Operation failed'
        );
      }
    };

  // ================= TRANSACTION =================

  const handleTransaction =
    async () => {
      try {
        if (
          !selectedCashbox ||
          !transactionData.amount
        ) {
          toast.error(
            'Please complete fields'
          );

          return;
        }

        await axios.post(
          `${API}/cashboxes/${selectedCashbox.id}/transactions`,
          {
            ...transactionData,
            amount: Number(
              transactionData.amount
            ),
          },
          { headers }
        );

        toast.success(
          'Transaction completed'
        );

        setOpenTransaction(false);

        setTransactionData({
          type: 'INCOME',
          amount: '',
          description: '',
        });

        loadCashboxes();
      } catch (error: any) {
        console.error(error);

        toast.error(
          error?.response?.data
            ?.message ||
            'Transaction failed'
        );
      }
    };

  // ================= FILTER =================

  const filteredCashboxes =
    useMemo(() => {
      return cashboxes.filter(
        (cashbox) =>
          cashbox.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [cashboxes, search]);

  // ================= STATS =================

  const totalBalance =
    cashboxes.reduce(
      (acc, cashbox) =>
        acc +
        Number(cashbox.balance || 0),
      0
    );

  return (
    <div className='space-y-6'>
      {/* HEADER */}

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>
            Cashboxes
          </h1>

          <p className='text-muted-foreground'>
            Manage company cashboxes
          </p>
        </div>

        {/* CREATE */}

        <Dialog
          open={openCreate}
          onOpenChange={setOpenCreate}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className='w-4 h-4 mr-2' />

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
                  <SelectValue placeholder='Select Type' />
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

              <Input
                placeholder='Currency'
                value={formData.currency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currency:
                      e.target.value,
                  })
                }
              />

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

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Total Cashboxes
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                {cashboxes.length}
              </h2>
            </div>

            <Wallet className='w-10 h-10 text-primary' />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Total Balance
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                EGP{' '}
                {totalBalance.toLocaleString()}
              </h2>
            </div>

            <Landmark className='w-10 h-10 text-green-500' />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Active
              </p>

              <h2 className='text-3xl font-bold mt-2'>
                {
                  cashboxes.filter(
                    (c) =>
                      c.isActive
                  ).length
                }
              </h2>
            </div>

            <Wallet className='w-10 h-10 text-blue-500' />
          </CardContent>
        </Card>
      </div>

      {/* SEARCH */}

      <Card>
        <CardContent className='p-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-3 w-4 h-4 text-muted-foreground' />

            <Input
              placeholder='Search cashbox...'
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
            Cashboxes List
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
                  Currency
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
              {filteredCashboxes.map(
                (cashbox) => (
                  <TableRow
                    key={cashbox.id}
                  >
                    <TableCell className='font-medium'>
                      {cashbox.name}
                    </TableCell>

                    <TableCell>
                      <Badge>
                        {cashbox.type}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      EGP{' '}
                      {Number(
                        cashbox.balance
                      ).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      {
                        cashbox.currency
                      }
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          cashbox.isActive
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {cashbox.isActive
                          ? 'ACTIVE'
                          : 'DISABLED'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className='flex gap-2'>
                        {/* DEPOSIT */}

                        <Dialog
                          open={
                            openTransaction
                          }
                          onOpenChange={
                            setOpenTransaction
                          }
                        >
                          <DialogTrigger
                            asChild
                          >
                            <Button
                              size='sm'
                              onClick={() => {
                                setSelectedCashbox(
                                  cashbox
                                );

                                setTransactionData(
                                  {
                                    type: 'INCOME',
                                    amount:
                                      '',
                                    description:
                                      '',
                                  }
                                );
                              }}
                            >
                              <ArrowDownCircle className='w-4 h-4 mr-1' />

                              Deposit
                            </Button>
                          </DialogTrigger>

                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Add Transaction
                              </DialogTitle>
                            </DialogHeader>

                            <div className='space-y-4'>
                              <Select
                                value={
                                  transactionData.type
                                }
                                onValueChange={(
                                  v
                                ) =>
                                  setTransactionData(
                                    {
                                      ...transactionData,
                                      type: v,
                                    }
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                  <SelectItem value='INCOME'>
                                    INCOME
                                  </SelectItem>

                                  <SelectItem value='EXPENSE'>
                                    EXPENSE
                                  </SelectItem>
                                </SelectContent>
                              </Select>

                              <Input
                                type='number'
                                placeholder='Amount'
                                value={
                                  transactionData.amount
                                }
                                onChange={(
                                  e
                                ) =>
                                  setTransactionData(
                                    {
                                      ...transactionData,
                                      amount:
                                        e
                                          .target
                                          .value,
                                    }
                                  )
                                }
                              />

                              <Input
                                placeholder='Description'
                                value={
                                  transactionData.description
                                }
                                onChange={(
                                  e
                                ) =>
                                  setTransactionData(
                                    {
                                      ...transactionData,
                                      description:
                                        e
                                          .target
                                          .value,
                                    }
                                  )
                                }
                              />

                              <Button
                                className='w-full'
                                onClick={
                                  handleTransaction
                                }
                              >
                                Save Transaction
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* WITHDRAW */}

                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => {
                            setSelectedCashbox(
                              cashbox
                            );

                            setOpenTransaction(
                              true
                            );

                            setTransactionData(
                              {
                                type: 'EXPENSE',
                                amount:
                                  '',
                                description:
                                  '',
                              }
                            );
                          }}
                        >
                          <ArrowUpCircle className='w-4 h-4 mr-1' />

                          Withdraw
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )}

              {!loading &&
                filteredCashboxes.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
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