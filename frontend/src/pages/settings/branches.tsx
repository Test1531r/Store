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

export function BranchesPage() {
  const [branches, setBranches] =
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
      code: '',
      phone: '',
      email: '',
      address: '',
    });

  const token =
    localStorage.getItem(
      'accessToken'
    );

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ================= LOAD =================

  const loadBranches =
    async () => {
      try {
        setLoading(true);

        const response =
          await axios.get(
            `${API}/branches`,
            { headers }
          );

        setBranches(
          response.data.data || []
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to load branches'
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadBranches();
  }, []);

  // ================= CREATE / UPDATE =================

  const handleSubmit =
    async () => {
      try {
        if (
          !formData.name ||
          !formData.code
        ) {
          toast.error(
            'Name and code required'
          );

          return;
        }

        if (editing) {
          await axios.put(
            `${API}/branches/${editing.id}`,
            formData,
            { headers }
          );

          toast.success(
            'Branch updated'
          );
        } else {
          await axios.post(
            `${API}/branches`,
            formData,
            { headers }
          );

          toast.success(
            'Branch created'
          );
        }

        setOpen(false);

        setEditing(null);

        setFormData({
          name: '',
          code: '',
          phone: '',
          email: '',
          address: '',
        });

        loadBranches();
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
          'Delete branch?'
        )
      )
        return;

      try {
        await axios.delete(
          `${API}/branches/${id}`,
          { headers }
        );

        toast.success(
          'Branch deleted'
        );

        loadBranches();
      } catch (error) {
        console.error(error);

        toast.error(
          'Delete failed'
        );
      }
    };

  // ================= FILTER =================

  const filtered =
    branches.filter((branch) =>
      branch.name
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
            Branches
          </h1>

          <p className='text-muted-foreground'>
            Manage store branches
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
                  code: '',
                  phone: '',
                  email: '',
                  address: '',
                });
              }}
            >
              Add Branch
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? 'Edit Branch'
                  : 'Create Branch'}
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-4'>
              <Input
                placeholder='Branch Name'
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
                placeholder='Branch Code'
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code:
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
            placeholder='Search branches...'
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
            Branches List
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
                  Code
                </TableHead>

                <TableHead>
                  Phone
                </TableHead>

                <TableHead>
                  Email
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
                (branch) => (
                  <TableRow
                    key={branch.id}
                  >
                    <TableCell className='font-medium'>
                      {
                        branch.name
                      }
                    </TableCell>

                    <TableCell>
                      {branch.code}
                    </TableCell>

                    <TableCell>
                      {branch.phone ||
                        '-'}
                    </TableCell>

                    <TableCell>
                      {branch.email ||
                        '-'}
                    </TableCell>

                    <TableCell>
                      <Badge>
                        {branch.isActive
                          ? 'ACTIVE'
                          : 'INACTIVE'}
                      </Badge>
                    </TableCell>

                    <TableCell className='space-x-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          setEditing(
                            branch
                          );

                          setFormData({
                            name:
                              branch.name ||
                              '',
                            code:
                              branch.code ||
                              '',
                            phone:
                              branch.phone ||
                              '',
                            email:
                              branch.email ||
                              '',
                            address:
                              branch.address ||
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
                            branch.id
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
                      No branches found
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