export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  permissions: { module: string; action: string }[];
  isActive: boolean;
  lastLogin?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  barcode?: string;
  sku: string;
  imei?: string;
  serialNumber?: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  discountPrice?: number;
  lowStockAlert: number;
  warrantyDays: number;
  isActive: boolean;
  isSerialized: boolean;
  hasVariants: boolean;
  images: string[];
  colors: string[];
  storageSizes: string[];
  category: { id: string; name: string };
  brand?: { id: string; name: string };
  supplier?: { id: string; name: string };
  inventory: InventoryItem[];
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  barcode?: string;
  color?: string;
  storageSize?: string;
  imei?: string;
  costPrice: number;
  sellingPrice: number;
  isActive: boolean;
}

export interface InventoryItem {
  id: string;
  quantity: number;
  reservedQty: number;
  minStock: number;
  location?: string;
  productId: string;
  variantId?: string;
  branchId: string;
  branch: { id: string; name: string };
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  status: 'DRAFT' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'PENDING';
  subtotal: number;
  discount: number;
  discountType: 'FIXED' | 'PERCENTAGE';
  tax: number;
  taxRate: number;
  total: number;
  paid: number;
  notes?: string;
  isReturn: boolean;
  createdAt: string;
  items: SaleItem[];
  payments: Payment[];
  customer?: { id: string; name: string; phone?: string };
  branch: { id: string; name: string };
  user: { firstName: string; lastName: string };
}

export interface SaleItem {
  id: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  productId: string;
  product: { name: string; sku: string };
  variant?: { color?: string; storageSize?: string };
}

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
}

export type PaymentMethod = 
  | 'CASH' | 'CARD' | 'VODAFONE_CASH' | 'INSTAPAY' 
  | 'STC_PAY' | 'BANK_TRANSFER' | 'CREDIT' | 'MIXED';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  creditLimit?: number;
  creditUsed: number;
  loyaltyPoints: number;
  notes?: string;
  whatsapp?: string;
}

export interface Repair {
  id: string;
  ticketNumber: string;
  deviceType: string;
  deviceModel: string;
  imei?: string;
  serialNumber?: string;
  problem: string;
  diagnosis?: string;
  estimatedCost?: number;
  finalCost?: number;
  paid: number;
  status: RepairStatus;
  priority: string;
  notes?: string;
  warrantyDays: number;
  deliveredAt?: string;
  createdAt: string;
  customer: Customer;
  technician?: { firstName: string; lastName: string };
  branch: { id: string; name: string };
}

export type RepairStatus = 
  | 'RECEIVED' | 'DIAGNOSING' | 'WAITING_PARTS' 
  | 'UNDER_REPAIR' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';

export interface Transfer {
  id: string;
  transferNumber: string;
  status: TransferStatus;
  notes?: string;
  fromBranch: { id: string; name: string };
  toBranch: { id: string; name: string };
  requestedBy: { firstName: string; lastName: string };
  items: TransferItem[];
  createdAt: string;
}

export type TransferStatus = 
  | 'PENDING' | 'APPROVED' | 'IN_TRANSIT' | 'RECEIVED' | 'REJECTED' | 'CANCELLED';

export interface TransferItem {
  id: string;
  quantity: number;
  receivedQty: number;
  productId: string;
  product: { name: string; sku: string };
  variant?: { color?: string; storageSize?: string };
}

export interface Expense {
  id: string;
  amount: number;
  description?: string;
  receipt?: string;
  date: string;
  category: { id: string; name: string; color?: string };
  branch: { id: string; name: string };
  user: { firstName: string; lastName: string };
}

export interface Cashbox {
  id: string;
  name: string;
  type: 'CASH' | 'BANK' | 'WALLET' | 'CREDIT';
  balance: number;
  currency: string;
  isActive: boolean;
  branch: { id: string; name: string };
}

export interface FinancialTransaction {
  id: string;
  service: string;
  type: string;
  amount: number;
  commission: number;
  netAmount: number;
  senderPhone?: string;
  receiverPhone?: string;
  referenceNumber?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalCustomers: number;
  totalRepairs: number;
  lowStockCount: number;
  pendingTransfers: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
