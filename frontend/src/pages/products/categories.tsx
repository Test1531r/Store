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

import { toast } from 'sonner';

const API = 'https://main-store-3pr5.onrender.com/api/v1';

export function CategoriesPage() {
  const [categories, setCategories] =
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

  const loadCategories =
    async () => {
      try {
        setLoading(true);

        const response =
          await axios.get(
            `${API}/categories`,
            {
              headers,
            }
          );

        setCategories(
          response.data.data || []
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to load categories'
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadCategories();
  }, []);

  // ================= CREATE / UPDATE =================

  const handleSubmit =
    async () => {
      try {
        if (!formData.name) {
          toast.error(
            'Category name required'
          );

          return;
        }

        if (editing) {
          await axios.put(
            `${API}/categories/${editing.id}`,
            formData,
            { headers }
          );

          toast.success(
            'Category updated'
          );
        } else {
          await axios.post(
            `${API}/categories`,
            formData,
            { headers }
          );

          toast.success(
            'Category created'
          );
        }

        setOpen(false);

        setEditing(null);

        setFormData({
          name: '',
          description: '',
        });

        loadCategories();
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
          'Delete this category?'
        )
      )
        return;

      try {
        await axios.delete(
          `${API}/categories/${id}`,
          { headers }
        );

        toast.success(
          'Category deleted'
        );

        loadCategories();
      } catch (error) {
        console.error(error);

        toast.error(
          'Delete failed'
        );
      }
    };

  // ================= FILTER =================

  const filtered =
    categories.filter((cat) =>
      cat.name
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
            Categories
          </h1>

          <p className='text-muted-foreground'>
            Manage product categories
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
                  description:
                    '',
                });
              }}
            >
              Add Category
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? 'Edit Category'
                  : 'Create Category'}
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-4'>
              <Input
                placeholder='Category Name'
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
            placeholder='Search categories...'
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
            Categories List
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
                  Description
                </TableHead>

                <TableHead>
                  Products
                </TableHead>

                <TableHead>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((cat) => (
                <TableRow
                  key={cat.id}
                >
                  <TableCell className='font-medium'>
                    {cat.name}
                  </TableCell>

                  <TableCell>
                    {cat.description ||
                      '-'}
                  </TableCell>

                  <TableCell>
                    {cat._count
                      ?.products || 0}
                  </TableCell>

                  <TableCell className='space-x-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => {
                        setEditing(cat);

                        setFormData({
                          name:
                            cat.name,
                          description:
                            cat.description ||
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
                          cat.id
                        )
                      }
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {!loading &&
                filtered.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className='text-center py-10 text-muted-foreground'
                    >
                      No categories found
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
