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

export function SuppliersPage() {
  const [suppliers, setSuppliers] =
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
      email: '',
      address: '',
      taxNumber: '',
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

  const loadSuppliers =
    async () => {
      try {
        setLoading(true);

        const response =
          await axios.get(
            `${API}/suppliers`,
            {
              headers,
            }
          );

        setSuppliers(
          response.data.data || []
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to load suppliers'
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // ================= SUBMIT =================

  const handleSubmit =
    async () => {
      try {
        if (!formData.name) {
          toast.error(
            'Supplier name required'
          );

          return;
        }

        if (editing) {
          await axios.put(
            `${API}/suppliers/${editing.id}`,
            formData,
            { headers }
          );

          toast.success(
            'Supplier updated'
          );
        } else {
          await axios.post(
            `${API}/suppliers`,
            formData,
            { headers }
          );

          toast.success(
            'Supplier created'
          );
        }

        setOpen(false);

        setEditing(null);

        setFormData({
          name: '',
          phone: '',
          email: '',
          address: '',
          taxNumber: '',
          notes: '',
        });

        loadSuppliers();
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
          'Delete supplier?'
        )
      )
        return;

      try {
        await axios.delete(
          `${API}/suppliers/${id}`,
          { headers }
        );

        toast.success(
          'Supplier deleted'
        );

        loadSuppliers();
      } catch (error) {
        console.error(error);

        toast.error(
          'Delete failed'
        );
      }
    };

  // ================= FILTER =================

  const filtered =
    suppliers.filter((s) =>
      s.name
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
            Suppliers
          </h1>

          <p className='text-muted-foreground'>
            Manage suppliers and vendors
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
                  email: '',
                  address: '',
                  taxNumber: '',
                  notes: '',
                });
              }}
            >
              Add Supplier
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? 'Edit Supplier'
                  : 'Create Supplier'}
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-4'>
              <Input
                placeholder='Supplier Name'
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
                placeholder='Tax Number'
                value={
                  formData.taxNumber
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    taxNumber:
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
            placeholder='Search suppliers...'
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
            Suppliers List
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
                  Balance
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
                (supplier) => (
                  <TableRow
                    key={supplier.id}
                  >
                    <TableCell className='font-medium'>
                      {
                        supplier.name
                      }
                    </TableCell>

                    <TableCell>
                      {supplier.phone ||
                        '-'}
                    </TableCell>

                    <TableCell>
                      {supplier.email ||
                        '-'}
                    </TableCell>

                    <TableCell>
                      EGP{' '}
                      {Number(
                        supplier.balance ||
                          0
                      ).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      <Badge>
                        {supplier.isActive
                          ? 'Active'
                          : 'Inactive'}
                      </Badge>
                    </TableCell>

                    <TableCell className='space-x-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          setEditing(
                            supplier
                          );

                          setFormData({
                            name:
                              supplier.name ||
                              '',
                            phone:
                              supplier.phone ||
                              '',
                            email:
                              supplier.email ||
                              '',
                            address:
                              supplier.address ||
                              '',
                            taxNumber:
                              supplier.taxNumber ||
                              '',
                            notes:
                              supplier.notes ||
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
                            supplier.id
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
                      colSpan={6}
                      className='text-center py-10 text-muted-foreground'
                    >
                      No suppliers found
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