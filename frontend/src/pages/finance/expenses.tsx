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
  'http://localhost:5000/api';

export function ExpensesPage() {
  const [expenses, setExpenses] =
    useState<any[]>([]);

  const [categories, setCategories] =
    useState<any[]>([]);

  const [branches, setBranches] =
    useState<any[]>([]);

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      amount: '',
      description: '',
      categoryId: '',
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
          expenseRes,
          categoryRes,
          branchRes,
        ] = await Promise.all([
          axios.get(
            `${API}/expenses`,
            { headers }
          ),

          axios.get(
            `${API}/expense-categories`,
            { headers }
          ),

          axios.get(
            `${API}/branches`,
            { headers }
          ),
        ]);

        setExpenses(
          expenseRes.data.data || []
        );

        setCategories(
          categoryRes.data.data || []
        );

        setBranches(
          branchRes.data.data || []
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to load expenses'
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
          !formData.amount ||
          !formData.categoryId ||
          !formData.branchId
        ) {
          toast.error(
            'Please complete required fields'
          );

          return;
        }

        await axios.post(
          `${API}/expenses`,
          {
            ...formData,
            amount:
              Number(
                formData.amount
              ),
          },
          { headers }
        );

        toast.success(
          'Expense created'
        );

        setOpen(false);

        setFormData({
          amount: '',
          description: '',
          categoryId: '',
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

  // ================= TOTAL =================

  const totalExpenses =
    expenses.reduce(
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
            Expenses
          </h1>

          <p className='text-muted-foreground'>
            Track company expenses
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={setOpen}
        >
          <DialogTrigger asChild>
            <Button>
              Add Expense
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Create Expense
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-4'>
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
                placeholder='Description'
                value={
                  formData.description
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description:
                      e.target.value,
                  })
                }
              />

              {/* CATEGORY */}

              <Select
                value={
                  formData.categoryId
                }
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    categoryId: v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select Category' />
                </SelectTrigger>

                <SelectContent>
                  {categories.map(
                    (cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.id}
                      >
                        {cat.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

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
                Save Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* TOTAL */}

      <Card>
        <CardContent className='p-6'>
          <div>
            <p className='text-muted-foreground text-sm'>
              Total Expenses
            </p>

            <h2 className='text-4xl font-bold mt-2'>
              EGP{' '}
              {totalExpenses.toLocaleString()}
            </h2>
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}

      <Card>
        <CardHeader>
          <CardTitle>
            Expenses List
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Amount
                </TableHead>

                <TableHead>
                  Category
                </TableHead>

                <TableHead>
                  Branch
                </TableHead>

                <TableHead>
                  Description
                </TableHead>

                <TableHead>
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {expenses.map(
                (expense) => (
                  <TableRow
                    key={expense.id}
                  >
                    <TableCell className='font-medium'>
                      EGP{' '}
                      {Number(
                        expense.amount
                      ).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <Badge>
                        {
                          expense
                            .category
                            ?.name
                        }
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {expense.branch
                        ?.name || '-'}
                    </TableCell>

                    <TableCell>
                      {expense.description ||
                        '-'}
                    </TableCell>

                    <TableCell>
                      {new Date(
                        expense.createdAt
                      ).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )
              )}

              {!loading &&
                expenses.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='text-center py-10 text-muted-foreground'
                    >
                      No expenses found
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