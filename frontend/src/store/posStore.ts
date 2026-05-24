import { create } from 'zustand';
import type { SaleItem, Customer } from '@/types';

interface CartItem extends SaleItem {
  tempId: string;
}

interface POSState {
  cart: CartItem[];
  customer: Customer | null;
  discount: number;
  discountType: 'FIXED' | 'PERCENTAGE';
  taxRate: number;
  notes: string;
  addToCart: (item: Omit<CartItem, 'tempId' | 'total'>) => void;
  removeFromCart: (tempId: string) => void;
  updateQuantity: (tempId: string, quantity: number) => void;
  setCustomer: (customer: Customer | null) => void;
  setDiscount: (discount: number, type: 'FIXED' | 'PERCENTAGE') => void;
  setTaxRate: (rate: number) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getTax: () => number;
  getDiscountAmount: () => number;
}

export const usePOSStore = create<POSState>((set, get) => ({
  cart: [],
  customer: null,
  discount: 0,
  discountType: 'FIXED',
  taxRate: 14,
  notes: '',

  addToCart: (item) => {
    const tempId = `${item.productId}-${Date.now()}`;
    const total = (item.unitPrice * item.quantity) - item.discount;
    set((state) => ({
      cart: [...state.cart, { ...item, tempId, total }]
    }));
  },

  removeFromCart: (tempId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.tempId !== tempId)
    }));
  },

  updateQuantity: (tempId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(tempId);
      return;
    }
    set((state) => ({
      cart: state.cart.map((item) =>
        item.tempId === tempId
          ? { ...item, quantity, total: (item.unitPrice * quantity) - item.discount }
          : item
      )
    }));
  },

  setCustomer: (customer) => set({ customer }),
  setDiscount: (discount, type) => set({ discount, discountType: type }),
  setTaxRate: (rate) => set({ taxRate: rate }),
  setNotes: (notes) => set({ notes }),
  clearCart: () => set({ cart: [], customer: null, discount: 0, notes: '' }),

  getSubtotal: () => {
    return get().cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  },

  getDiscountAmount: () => {
    const subtotal = get().getSubtotal();
    return get().discountType === 'PERCENTAGE'
      ? subtotal * (get().discount / 100)
      : get().discount;
  },

  getTax: () => {
    return (get().getSubtotal() - get().getDiscountAmount()) * (get().taxRate / 100);
  },

  getTotal: () => {
    return get().getSubtotal() - get().getDiscountAmount() + get().getTax();
  },
}));
