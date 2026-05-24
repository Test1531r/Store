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

import { Badge } from '@/components/ui/badge';

import { toast } from 'sonner';

const API =
  'http://localhost:5000/api/v1';

export function CustomersPage() {
  const [customers, setCustomers] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [open, setOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<any>(null);

  const [formData, setFormData] =
    useState({
      name: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      notes: '',
      creditLimit: '',
    });

  const token =
    localStorage.getItem(
      'accessToken'
    );

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ================= LOAD =================

  const loadCustomers =
    async () => {
      try {
        setLoading(true);

        const response =
          await axios.get(
            `${API}/customers`,
            {
              headers,
            }
          );

        setCustomers(
          response.data.data || []
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to load customers'
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadCustomers();
  }, []);

  // ================= SUBMIT =================

  const handleSubmit =
    async () => {
      try {
        if (!formData.name) {
          toast.error(
            'Customer name required'
          );

          return;
        }

        const payload = {
          ...formData,
          creditLimit:
            Number(
              formData.creditLimit
            ) || 0,
        };

        if (editing) {
          await axios.put(
            `${API}/customers/${editing.id}`,
            payload,
            { headers }
          );

          toast.success(
            'Customer updated'
          );
        } else {
          await axios.post(
            `${API}/customers`,
            payload,
            { headers }
          );

          toast.success(
            'Customer created'
          );
        }

        setOpen(false);

        setEditing(null);

        setFormData({
          name: '',
          phone: '',
          whatsapp: '',
          email: '',
          address: '',
          notes: '',
          creditLimit: '',
        });

        loadCustomers();
      } catch (error: any) {
        console.error(error);

        toast.error(
          error?.response?.data
            ?.message ||
            'Operation failed'
        );
      }
    };

  // ================= DELETE =================

  const handleDelete =
    async (id: string) => {
      if (
        !confirm(
          'Delete customer?'
        )
      )
        return;

      try {
        await axios.delete(
          `${API}/customers/${id}`,
          { headers }
        );

        toast.success(
          'Customer deleted'
        );

        loadCustomers();
      } catch (error) {
        console.error(error);

        toast.error(
          'Delete failed'
        );
      }
    };

  // ================= FILTER =================

  const filtered =
    customers.filter((customer) =>
      customer.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div className='space-y-6'>
      {/* HEADER */}

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>
            Customers
          </h1>

          <p className='text-muted-foreground'>
            Manage customers and loyalty
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={setOpen}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditing(null);

                setFormData({
                  name: '',
                  phone: '',
                  whatsapp: '',
                  email: '',
                  address: '',
                  notes: '',
                  creditLimit: '',
                });
              }}
            >
              Add Customer
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? 'Edit Customer'
                  : 'Create Customer'}
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-4'>
              <Input
                placeholder='Customer Name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name:
                      e.target.value,
                  })
                }
              />

              <Input
                placeholder='Phone'
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone:
                      e.target.value,
                  })
                }
              />

              <Input
                placeholder='WhatsApp'
                value={
                  formData.whatsapp
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsapp:
                      e.target.value,
                  })
                }
              />

              <Input
                placeholder='Email'
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email:
                      e.target.value,
                  })
                }
              />

              <Input
                placeholder='Address'
                value={formData.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address:
                      e.target.value,
                  })
                }
              />

              <Input
                placeholder='Credit Limit'
                type='number'
                value={
                  formData.creditLimit
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    creditLimit:
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
                onClick={handleSubmit}
              >
                {editing
                  ? 'Update'
                  : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH */}

      <Card>
        <CardContent className='pt-6'>
          <Input
            placeholder='Search customers...'
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
            Customers List
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
                  Phone
                </TableHead>

                <TableHead>
                  Email
                </TableHead>

                <TableHead>
                  Credit
                </TableHead>

                <TableHead>
                  Points
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
                (customer) => (
                  <TableRow
                    key={customer.id}
                  >
                    <TableCell className='font-medium'>
                      {
                        customer.name
                      }
                    </TableCell>

                    <TableCell>
                      {customer.phone ||
                        '-'}
                    </TableCell>

                    <TableCell>
                      {customer.email ||
                        '-'}
                    </TableCell>

                    <TableCell>
                      EGP{' '}
                      {Number(
                        customer.creditUsed ||
                          0
                      ).toFixed(2)}
                      /
                      {Number(
                        customer.creditLimit ||
                          0
                      ).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      {
                        customer.loyaltyPoints
                      }
                    </TableCell>

                    <TableCell>
                      <Badge>
                        ACTIVE
                      </Badge>
                    </TableCell>

                    <TableCell className='space-x-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          setEditing(
                            customer
                          );

                          setFormData({
                            name:
                              customer.name ||
                              '',
                            phone:
                              customer.phone ||
                              '',
                            whatsapp:
                              customer.whatsapp ||
                              '',
                            email:
                              customer.email ||
                              '',
                            address:
                              customer.address ||
                              '',
                            notes:
                              customer.notes ||
                              '',
                            creditLimit:
                              customer.creditLimit?.toString() ||
                              '',
                          });

                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() =>
                          handleDelete(
                            customer.id
                          )
                        }
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              )}

              {!loading &&
                filtered.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='text-center py-10 text-muted-foreground'
                    >
                      No customers found
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