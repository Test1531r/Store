import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Search, ClipboardList, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const API = 'http://localhost:5000/api/v1';

export function StockCountPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [countedQty, setCountedQty] = useState('');

  const token = localStorage.getItem('accessToken');

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ================= LOAD INVENTORY =================
  const loadInventory = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/inventory`, { headers });

      setInventory(res.data.data || []);
    } catch (err) {
      console.log(err);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // ================= FILTER =================
  const filtered = useMemo(() => {
    return inventory.filter((i) =>
      i.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.product?.sku?.toLowerCase().includes(search.toLowerCase())
    );
  }, [inventory, search]);

  // ================= STOCK COUNT UPDATE =================
  const handleCount = async () => {
    try {
      if (!selected || countedQty === '') {
        toast.error('Enter quantity');
        return;
      }

      const qty = Number(countedQty);

      await axios.post(
        `${API}/inventory/${selected.branchId}/count`,
        {
          items: [
            {
              inventoryId: selected.id,
              countedQty: qty,
              notes: 'Manual stock count',
            },
          ],
        },
        { headers }
      );

      toast.success('Stock updated successfully');

      setOpen(false);
      setSelected(null);
      setCountedQty('');

      loadInventory();
    } catch (err: any) {
      console.log(err);
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  // ================= STATS =================
  const total = filtered.length;

  const lowStock = filtered.filter(
    (i) => i.quantity <= (i.minStock || 5)
  ).length;

  const totalQty = filtered.reduce(
    (a, b) => a + (b.quantity || 0),
    0
  );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Stock Count</h1>
          <p className="text-muted-foreground">Inventory Management</p>
        </div>
      </div>

      {/* SEARCH */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex justify-between">
            <div>
              <p>Products</p>
              <h2 className="text-2xl font-bold">{total}</h2>
            </div>
            <ClipboardList />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex justify-between">
            <div>
              <p>Total Qty</p>
              <h2 className="text-2xl font-bold">{totalQty}</h2>
            </div>
            <CheckCircle />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex justify-between">
            <div>
              <p>Low Stock</p>
              <h2 className="text-2xl font-bold">{lowStock}</h2>
            </div>
            <AlertTriangle />
          </CardContent>
        </Card>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Min</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((item) => {
                const isLow = item.quantity <= (item.minStock || 5);

                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.product?.name}</TableCell>
                    <TableCell>{item.product?.sku}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.minStock}</TableCell>

                    <TableCell>
                      <span className={isLow ? 'text-red-500' : 'text-green-600'}>
                        {isLow ? 'LOW' : 'GOOD'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Button
                        onClick={() => {
                          setSelected(item);
                          setCountedQty(String(item.quantity));
                          setOpen(true);
                        }}
                      >
                        Adjust
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DIALOG (IMPORTANT: OUTSIDE MAP) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p>Product</p>
              <p className="font-bold">{selected?.product?.name}</p>
            </div>

            <Input
              type="number"
              value={countedQty}
              onChange={(e) => setCountedQty(e.target.value)}
            />

            <Button className="w-full" onClick={handleCount}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}