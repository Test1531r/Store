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
  Smartphone,
  Landmark,
  CreditCard,
  ArrowDownUp,
} from 'lucide-react';

import { toast } from 'sonner';

const API =
  'http://localhost:5000/api/v1';

export function TransactionsPage() {
  const [transactions, setTransactions] =
    useState<any[]>([]);

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      service: 'VODAFONE_CASH',
      type: 'SEND',
      amount: '',
      commission: '',
      senderPhone: '',
      receiverPhone: '',
      referenceNumber: '',
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

  const loadTransactions =
    async () => {
      try {
        setLoading(true);

        const response =
          await axios.get(
            `${API}/financial-transactions`,
            { headers }
          );

        setTransactions(
          response.data.data || []
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to load transactions'
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadTransactions();
  }, []);

  // ================= CREATE =================

  const handleCreate =
    async () => {
      try {
        if (
          !formData.amount
        ) {
          toast.error(
            'Amount required'
          );

          return;
        }

        const amount =
          Number(formData.amount);

        const commission =
          Number(
            formData.commission || 0
          );

        await axios.post(
          `${API}/financial-transactions`,
          {
            ...formData,
            amount,
            commission,
            netAmount:
              amount - commission,
          },
          { headers }
        );

        toast.success(
          'Transaction added'
        );

        setOpen(false);

        setFormData({
          service:
            'VODAFONE_CASH',
          type: 'SEND',
          amount: '',
          commission: '',
          senderPhone: '',
          receiverPhone: '',
          referenceNumber: '',
          notes: '',
        });

        loadTransactions();
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
    service: string
  ) => {
    switch (service) {
      case 'BANK_TRANSFER':
        return (
          <Landmark className='w-5 h-5' />
        );

      case 'INSTAPAY':
        return (
          <CreditCard className='w-5 h-5' />
        );

      default:
        return (
          <Smartphone className='w-5 h-5' />
        );
    }
  };

  // ================= TOTAL =================

  const totalAmount =
    transactions.reduce(
      (
        acc: number,
        item: any
      ) =>
        acc +
        Number(item.amount || 0),
      0
    );

  return (
    <div className='space-y-6'>
      {/* HEADER */}

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>
            Financial Transactions
          </h1>

          <p className='text-muted-foreground'>
            Vodafone Cash, InstaPay, Bank Transfers
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={setOpen}
        >
          <DialogTrigger asChild>
            <Button>
              Add Transaction
            </Button>
          </DialogTrigger>

          <DialogContent className='max-w-lg'>
            <DialogHeader>
              <DialogTitle>
                Create Transaction
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-4'>
              {/* SERVICE */}

              <Select
                value={
                  formData.service
                }
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    service: v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='VODAFONE_CASH'>
                    Vodafone Cash
                  </SelectItem>

                  <SelectItem value='INSTAPAY'>
                    InstaPay
                  </SelectItem>

                  <SelectItem value='STC_PAY'>
                    STC Pay
                  </SelectItem>

                  <SelectItem value='BANK_TRANSFER'>
                    Bank Transfer
                  </SelectItem>
                </SelectContent>
              </Select>

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
                  <SelectItem value='SEND'>
                    SEND
                  </SelectItem>

                  <SelectItem value='RECEIVE'>
                    RECEIVE
                  </SelectItem>
                </SelectContent>
              </Select>

              <Input
                type='number'
                placeholder='Amount'
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount:
                      e.target.value,
                  })
                }
              />

              <Input
                type='number'
                placeholder='Commission'
                value={
                  formData.commission
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commission:
                      e.target.value,
                  })
                }
              />

              <Input
                placeholder='Sender Phone'
                value={
                  formData.senderPhone
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    senderPhone:
                      e.target.value,
                  })
                }
              />

              <Input
                placeholder='Receiver Phone'
                value={
                  formData.receiverPhone
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    receiverPhone:
                      e.target.value,
                  })
                }
              />

              <Input
                placeholder='Reference Number'
                value={
                  formData.referenceNumber
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    referenceNumber:
                      e.target.value,
                  })
                }
              />

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
                Save Transaction
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* TOTAL */}

      <Card>
        <CardContent className='p-6 flex items-center justify-between'>
          <div>
            <p className='text-muted-foreground text-sm'>
              Total Transactions
            </p>

            <h2 className='text-4xl font-bold mt-2'>
              EGP{' '}
              {totalAmount.toLocaleString()}
            </h2>
          </div>

          <ArrowDownUp className='w-12 h-12 text-primary' />
        </CardContent>
      </Card>

      {/* TABLE */}

      <Card>
        <CardHeader>
          <CardTitle>
            Transactions List
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Service
                </TableHead>

                <TableHead>
                  Type
                </TableHead>

                <TableHead>
                  Amount
                </TableHead>

                <TableHead>
                  Commission
                </TableHead>

                <TableHead>
                  Net
                </TableHead>

                <TableHead>
                  Reference
                </TableHead>

                <TableHead>
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {transactions.map(
                (trx) => (
                  <TableRow
                    key={trx.id}
                  >
                    <TableCell className='flex items-center gap-2'>
                      {getIcon(
                        trx.service
                      )}

                      {trx.service}
                    </TableCell>

                    <TableCell>
                      <Badge>
                        {trx.type}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      EGP{' '}
                      {Number(
                        trx.amount
                      ).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      EGP{' '}
                      {Number(
                        trx.commission
                      ).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      EGP{' '}
                      {Number(
                        trx.netAmount
                      ).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      {trx.referenceNumber ||
                        '-'}
                    </TableCell>

                    <TableCell>
                      {new Date(
                        trx.createdAt
                      ).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )
              )}

              {!loading &&
                transactions.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='text-center py-10 text-muted-foreground'
                    >
                      No transactions found
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