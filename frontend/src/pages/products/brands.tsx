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

const API =
  'http://localhost:5000/api/v1';

export function BrandsPage() {
  const [brands, setBrands] =
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
      logo: '',
    });

  const token =
    localStorage.getItem(
      'accessToken'
    );

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ================= LOAD =================

  const loadBrands =
    async () => {
      try {
        setLoading(true);

        const response =
          await axios.get(
            `${API}/brands`,
            {
              headers,
            }
          );

        setBrands(
          response.data.data || []
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to load brands'
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadBrands();
  }, []);

  // ================= CREATE / UPDATE =================

  const handleSubmit =
    async () => {
      try {
        if (!formData.name) {
          toast.error(
            'Brand name required'
          );

          return;
        }

        if (editing) {
          await axios.put(
            `${API}/brands/${editing.id}`,
            formData,
            { headers }
          );

          toast.success(
            'Brand updated'
          );
        } else {
          await axios.post(
            `${API}/brands`,
            formData,
            { headers }
          );

          toast.success(
            'Brand created'
          );
        }

        setOpen(false);

        setEditing(null);

        setFormData({
          name: '',
          description: '',
          logo: '',
        });

        loadBrands();
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
          'Delete this brand?'
        )
      )
        return;

      try {
        await axios.delete(
          `${API}/brands/${id}`,
          { headers }
        );

        toast.success(
          'Brand deleted'
        );

        loadBrands();
      } catch (error) {
        console.error(error);

        toast.error(
          'Delete failed'
        );
      }
    };

  // ================= FILTER =================

  const filtered =
    brands.filter((brand) =>
      brand.name
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
            Brands
          </h1>

          <p className='text-muted-foreground'>
            Manage product brands
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
                  logo: '',
                });
              }}
            >
              Add Brand
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? 'Edit Brand'
                  : 'Create Brand'}
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-4'>
              <Input
                placeholder='Brand Name'
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

              <Input
                placeholder='Logo URL'
                value={formData.logo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    logo:
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
            placeholder='Search brands...'
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
            Brands List
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Logo
                </TableHead>

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
              {filtered.map(
                (brand) => (
                  <TableRow
                    key={brand.id}
                  >
                    <TableCell>
                      {brand.logo ? (
                        <img
                          src={
                            brand.logo
                          }
                          alt=''
                          className='w-10 h-10 rounded object-cover'
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>

                    <TableCell className='font-medium'>
                      {brand.name}
                    </TableCell>

                    <TableCell>
                      {brand.description ||
                        '-'}
                    </TableCell>

                    <TableCell>
                      {brand._count
                        ?.products || 0}
                    </TableCell>

                    <TableCell className='space-x-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          setEditing(
                            brand
                          );

                          setFormData({
                            name:
                              brand.name,
                            description:
                              brand.description ||
                              '',
                            logo:
                              brand.logo ||
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
                            brand.id
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
                      colSpan={5}
                      className='text-center py-10 text-muted-foreground'
                    >
                      No brands found
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