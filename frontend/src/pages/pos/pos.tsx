import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { usePOSStore } from '@/store/posStore';
import { useAuthStore } from '@/store/authStore';
import { productApi, saleApi, customerApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, paymentMethodLabels } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  X,
  Loader2,
  Calculator,
} from 'lucide-react';
import type { Product, Customer } from '@/types';

export function POSPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    cart, customer, discount, discountType, taxRate, notes,
    addToCart, removeFromCart, updateQuantity, setCustomer,
    setDiscount, setTaxRate, setNotes, clearCart,
    getSubtotal, getTotal, getTax, getDiscountAmount,
  } = usePOSStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [payments, setPayments] = useState<{ method: string; amount: number; reference?: string }[]>([]);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState('CASH');
  const [currentPaymentAmount, setCurrentPaymentAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: searchResults } = useQuery({
    queryKey: ['pos-search', searchQuery],
    queryFn: () => productApi.getAll({ search: searchQuery, limit: 10 }).then((r) => r.data.data),
    enabled: searchQuery.length > 2,
  });

  const { data: customers } = useQuery({
    queryKey: ['pos-customers', customerSearch],
    queryFn: () => customerApi.getAll({ search: customerSearch, limit: 5 }).then((r) => r.data.data),
    enabled: customerSearch.length > 2,
  });

  const createSaleMutation = useMutation({
    mutationFn: (data: any) => saleApi.create(data),
    onSuccess: (response) => {
      toast.success('Sale completed successfully!');
      clearCart();
      setShowPaymentDialog(false);
      setPayments([]);
      // Could print receipt here
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete sale');
    },
  });

  const handleAddToCart = (product: Product) => {
    const unitPrice = product.discountPrice || product.sellingPrice;
    addToCart({
      productId: product.id,
      quantity,
      unitPrice,
      discount: 0,
      product: { name: product.name, sku: product.sku },
    });
    setSearchQuery('');
    setQuantity(1);
    toast.success(`${product.name} added to cart`);
  };

  const handlePayment = () => {
    if (payments.length === 0) {
      toast.error('Please add at least one payment');
      return;
    }

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid < getTotal()) {
      toast.error('Total payments must cover the sale total');
      return;
    }

    const saleData = {
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
      })),
      discount: getDiscountAmount(),
      discountType,
      taxRate,
      payments: payments.map((p) => ({
        method: p.method,
        amount: p.amount,
        reference: p.reference,
      })),
      notes,
      customerId: customer?.id,
      branchId: user?.branch?.id,
    };

    createSaleMutation.mutate(saleData);
  };

  const addPayment = () => {
    const amount = parseFloat(currentPaymentAmount);
    if (!amount || amount <= 0) return;

    const remaining = getTotal() - payments.reduce((sum, p) => sum + p.amount, 0);
    const actualAmount = Math.min(amount, remaining);

    setPayments([...payments, { method: currentPaymentMethod, amount: actualAmount }]);
    setCurrentPaymentAmount('');
  };

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const remainingAmount = getTotal() - payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="h-[calc(100vh-4rem)] -m-4 lg:-m-6">
      <div className="pos-grid h-full">
        {/* Left Panel - Product Search & Cart */}
        <div className="flex flex-col h-full overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-border bg-card">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, barcode, SKU, or IMEI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
                autoFocus
              />
            </div>

            {/* Search Results */}
            {searchResults && searchResults.length > 0 && (
              <div className="absolute left-4 right-4 top-20 z-50 bg-popover border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {searchResults.map((product: Product) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddToCart(product)}
                    className="w-full flex items-center gap-4 p-3 hover:bg-accent text-left border-b last:border-0"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.sku} • Stock: {product.inventory?.[0]?.quantity || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(product.sellingPrice)}</p>
                      {product.discountPrice && (
                        <p className="text-xs text-green-600">
                          Sale: {formatCurrency(product.discountPrice)}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg">Cart is empty</p>
                <p className="text-sm">Search for products to add</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.tempId}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.unitPrice)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.tempId, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.tempId, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="font-semibold">{formatCurrency(item.total)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeFromCart(item.tempId)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Order Summary */}
        <div className="flex flex-col h-full border-l border-border bg-card">
          {/* Customer Selection */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomerDialog(true)}
              >
                {customer ? 'Change' : 'Select'}
              </Button>
            </div>
            {customer ? (
              <div className="p-2 rounded-lg bg-accent/50">
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Walk-in Customer</p>
            )}
          </div>

          {/* Order Summary */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(getSubtotal())}</span>
              </div>

              {/* Discount */}
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Discount"
                  value={discount || ''}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0, discountType)}
                  className="h-8 w-24"
                />
                <Select
                  value={discountType}
                  onValueChange={(v: 'FIXED' | 'PERCENTAGE') => setDiscount(discount, v)}
                >
                  <SelectTrigger className="h-8 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">EGP</SelectItem>
                    <SelectItem value="PERCENTAGE">%</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground ml-auto">
                  -{formatCurrency(getDiscountAmount())}
                </span>
              </div>

              {/* Tax */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tax ({taxRate}%)</span>
                <Input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="h-8 w-20 ml-auto"
                />
                <span className="text-sm">{formatCurrency(getTax())}</span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(getTotal())}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <Input
                placeholder="Add notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-border space-y-2">
            <Button
              className="w-full h-14 text-lg"
              disabled={cart.length === 0 || createSaleMutation.isPending}
              onClick={() => setShowPaymentDialog(true)}
            >
              {createSaleMutation.isPending ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-5 h-5 mr-2" />
              )}
              Checkout
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={clearCart}
              disabled={cart.length === 0}
            >
              <X className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {customers?.map((c: Customer) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCustomer(c);
                    setShowCustomerDialog(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.phone}</p>
                  </div>
                </button>
              )) || (
                <p className="text-center text-muted-foreground py-4">
                  Search for customers
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Payment Methods */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(paymentMethodLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setCurrentPaymentMethod(key)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    currentPaymentMethod === key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-accent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Amount Input */}
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Amount"
                value={currentPaymentAmount}
                onChange={(e) => setCurrentPaymentAmount(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addPayment}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex gap-2">
              {[10, 50, 100, 500].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPaymentAmount(amount.toString())}
                >
                  +{amount}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPaymentAmount(remainingAmount.toFixed(2))}
              >
                Exact
              </Button>
            </div>

            {/* Payment List */}
            {payments.length > 0 && (
              <div className="space-y-2">
                {payments.map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-accent/50"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{paymentMethodLabels[payment.method]}</Badge>
                      <span>{formatCurrency(payment.amount)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removePayment(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span className="font-bold">{formatCurrency(getTotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Paid</span>
                <span>{formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Remaining</span>
                <span className={remainingAmount > 0 ? 'text-destructive' : 'text-green-600'}>
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={remainingAmount > 0 || createSaleMutation.isPending}
            >
              {createSaleMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Receipt className="w-4 h-4 mr-2" />
              )}
              Complete Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
