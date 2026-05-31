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

import { Label } from '@/components/ui/label';

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

export function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);

  const [editingProduct, setEditingProduct] =
    useState<any>(null);

  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    costPrice: '',
    sellingPrice: '',
    wholesalePrice: '',
    discountPrice: '',
    lowStockAlert: '5',
    warrantyDays: '365',
    categoryId: '',
  });

  // ================= AUTH =================

  const getAuthConfig = () => {
    const token =
      localStorage.getItem('accessToken');

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ================= LOAD PRODUCTS =================

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API}/products`,
        getAuthConfig()
      );

      setProducts(response.data.data || []);
    } catch (error: any) {
      console.error(error);

      if (
        error?.response?.status === 401
      ) {
        toast.error(
          'Session expired'
        );

        localStorage.clear();

        window.location.href = '/login';
      } else {
        toast.error(
          'Failed to load products'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD CATEGORIES =================

  const loadCategories = async () => {
    try {
      // categories بدون token

      const response = await axios.get(
        `${API}/categories`
      );

      setCategories(response.data.data || []);
    } catch (error) {
      console.error(error);

      toast.error(
        'Failed to load categories'
      );
    }
  };

  // ================= START =================

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // ================= RESET =================

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      barcode: '',
      costPrice: '',
      sellingPrice: '',
      wholesalePrice: '',
      discountPrice: '',
      lowStockAlert: '5',
      warrantyDays: '365',
      categoryId: '',
    });

    setEditingProduct(null);
  };

  // ================= CREATE / UPDATE =================

  const handleSubmit = async () => {
    try {
      if (
        !formData.name ||
        !formData.sellingPrice ||
        !formData.categoryId
      ) {
        toast.error(
          'Please fill required fields'
        );

        return;
      }

      const payload = {
        name: formData.name,

        description:
          formData.description,

        sku:
          formData.sku ||
          `SKU-${Date.now()}`,

        barcode:
          formData.barcode || null,

        costPrice: Number(
          formData.costPrice || 0
        ),

        sellingPrice: Number(
          formData.sellingPrice || 0
        ),

        wholesalePrice: Number(
          formData.wholesalePrice ||
            formData.sellingPrice
        ),

        discountPrice: Number(
          formData.discountPrice ||
            formData.sellingPrice
        ),

        lowStockAlert: Number(
          formData.lowStockAlert || 5
        ),

        warrantyDays: Number(
          formData.warrantyDays || 365
        ),

        categoryId:
          formData.categoryId,

        images: [],
        colors: [],
        storageSizes: [],

        isActive: true,
        isSerialized: false,
        hasVariants: false,
      };

      if (editingProduct) {
        await axios.put(
          `${API}/products/${editingProduct.id}`,
          payload,
          getAuthConfig()
        );

        toast.success(
          'Product updated successfully'
        );
      } else {
        await axios.post(
          `${API}/products`,
          payload,
          getAuthConfig()
        );

        toast.success(
          'Product created successfully'
        );
      }

      setOpen(false);

      resetForm();

      loadProducts();
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          'Operation failed'
      );
    }
  };

  // ================= DELETE =================

  const handleDelete = async (
    id: string
  ) => {
    const confirmDelete = confirm(
      'Delete this product?'
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${API}/products/${id}`,
        getAuthConfig()
      );

      toast.success(
        'Product deleted'
      );

      loadProducts();
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          'Delete failed'
      );
    }
  };

  // ================= EDIT =================

  const handleEdit = (
    product: any
  ) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || '',

      description:
        product.description || '',

      sku: product.sku || '',

      barcode:
        product.barcode || '',

      costPrice:
        product.costPrice?.toString() ||
        '',

      sellingPrice:
        product.sellingPrice?.toString() ||
        '',

      wholesalePrice:
        product.wholesalePrice?.toString() ||
        '',

      discountPrice:
        product.discountPrice?.toString() ||
        '',

      lowStockAlert:
        product.lowStockAlert?.toString() ||
        '5',

      warrantyDays:
        product.warrantyDays?.toString() ||
        '365',

      categoryId:
        product.categoryId || '',
    });

    setOpen(true);
  };

  // ================= FILTER =================

  const filteredProducts =
    products.filter((product) =>
      product.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <div className='space-y-6'>
      {/* HEADER */}

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>
            Products
          </h1>

          <p className='text-muted-foreground'>
            Manage inventory products
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={setOpen}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() =>
                resetForm()
              }
            >
              Add Product
            </Button>
          </DialogTrigger>

          <DialogContent className='max-w-3xl'>
            <DialogHeader>
              <DialogTitle>
                {editingProduct
                  ? 'Edit Product'
                  : 'Add Product'}
              </DialogTitle>
            </DialogHeader>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>
                  Product Name
                </Label>

                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>SKU</Label>

                <Input
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sku:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>
                  Barcode
                </Label>

                <Input
                  value={
                    formData.barcode
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      barcode:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>
                  Category
                </Label>

                <select
                  className='w-full border rounded-md h-10 px-3 bg-background'
                  value={
                    formData.categoryId
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryId:
                        e.target.value,
                    })
                  }
                >
                  <option value=''>
                    Select Category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <Label>
                  Cost Price
                </Label>

                <Input
                  type='number'
                  value={
                    formData.costPrice
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      costPrice:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>
                  Selling Price
                </Label>

                <Input
                  type='number'
                  value={
                    formData.sellingPrice
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sellingPrice:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>
                  Wholesale Price
                </Label>

                <Input
                  type='number'
                  value={
                    formData.wholesalePrice
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wholesalePrice:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>
                  Discount Price
                </Label>

                <Input
                  type='number'
                  value={
                    formData.discountPrice
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountPrice:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>
                  Low Stock Alert
                </Label>

                <Input
                  type='number'
                  value={
                    formData.lowStockAlert
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lowStockAlert:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>
                  Warranty Days
                </Label>

                <Input
                  type='number'
                  value={
                    formData.warrantyDays
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      warrantyDays:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className='col-span-2'>
                <Label>
                  Description
                </Label>

                <Input
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
              </div>
            </div>

            <Button
              className='w-full mt-4'
              onClick={handleSubmit}
            >
              {editingProduct
                ? 'Update Product'
                : 'Create Product'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH */}

      <Card>
        <CardContent className='pt-6'>
          <Input
            placeholder='Search products...'
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
            Products List
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
                  SKU
                </TableHead>

                <TableHead>
                  Barcode
                </TableHead>

                <TableHead>
                  Cost
                </TableHead>

                <TableHead>
                  Selling
                </TableHead>

                <TableHead>
                  Category
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
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length ===
                0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                  >
                    No Products Found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map(
                  (product) => (
                    <TableRow
                      key={
                        product.id
                      }
                    >
                      <TableCell>
                        {
                          product.name
                        }
                      </TableCell>

                      <TableCell>
                        {
                          product.sku
                        }
                      </TableCell>

                      <TableCell>
                        {
                          product.barcode
                        }
                      </TableCell>

                      <TableCell>
                        {
                          product.costPrice
                        }
                      </TableCell>

                      <TableCell>
                        {
                          product.sellingPrice
                        }
                      </TableCell>

                      <TableCell>
                        {
                          product
                            .category
                            ?.name
                        }
                      </TableCell>

                      <TableCell>
                        <div
                          className={`px-2 py-1 rounded-full text-xs w-fit ${
                            product.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.isActive
                            ? 'Active'
                            : 'Inactive'}
                        </div>
                      </TableCell>

                      <TableCell className='space-x-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            handleEdit(
                              product
                            )
                          }
                        >
                          Edit
                        </Button>

                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() =>
                            handleDelete(
                              product.id
                            )
                          }
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
