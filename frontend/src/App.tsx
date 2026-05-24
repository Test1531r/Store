import { CategoriesPage } from '@/pages/products/categories';
import { BrandsPage } from '@/pages/products/brands';

import { InvoicesPage } from '@/pages/sales/invoices';
import { ReturnsPage } from '@/pages/sales/returns';

import { SuppliersPage } from '@/pages/suppliers/suppliers';

import { CashboxesPage } from '@/pages/finance/cashboxes';
import { ExpensesPage } from '@/pages/finance/expenses';
import { TransactionsPage } from '@/pages/finance/transactions';

import { SalesReportPage } from '@/pages/reports/sales-report';
import { InventoryReportPage } from '@/pages/reports/inventory-report';
import { ProfitReportPage } from '@/pages/reports/profit-report';

import { StockCountPage } from './pages/inventory/stock-count';

import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import { AppShell } from '@/components/layout/app-shell';
import { LoginPage } from '@/pages/auth/login';
import { DashboardPage } from '@/pages/dashboard/dashboard';
import { POSPage } from '@/pages/pos/pos';
import { ProductsPage } from '@/pages/products/products';
import { InventoryPage } from '@/pages/inventory/inventory';
import { TransfersPage } from '@/pages/inventory/transfers';
import { SalesPage } from '@/pages/sales/sales';
import { CustomersPage } from '@/pages/customers/customers';
import { RepairsPage } from '@/pages/repairs/repairs';
import { FinancePage } from '@/pages/finance/finance';
import { ReportsPage } from '@/pages/reports/reports';
import { BranchesPage } from '@/pages/settings/branches';
import { UsersPage } from '@/pages/settings/users';
import { SettingsPage } from '@/pages/settings/settings';
import { Toaster } from '@/components/ui/sonner';


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('accessToken');
      if (token && !isAuthenticated) {
        try {
          const response = await authApi.getMe();
          setUser(response.data.data);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    };
    init();
  }, []);

  if (!isAuthenticated && !localStorage.getItem('accessToken')) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="sales/invoices" element={<InvoicesPage />} />
          <Route path="sales/returns" element={<ReturnsPage />} />

          <Route path="products/categories" element={<CategoriesPage />} />
          <Route path="products/brands" element={<BrandsPage />} />

          <Route path="inventory/count" element={<StockCountPage />} />

          <Route path="suppliers" element={<SuppliersPage />} />

          <Route path="finance/cashboxes" element={<CashboxesPage />} />
          <Route path="finance/expenses" element={<ExpensesPage />} />
          <Route path="finance/transactions" element={<TransactionsPage />} />

          <Route path="reports/sales" element={<SalesReportPage />} />
          <Route path="reports/inventory" element={<InventoryReportPage />} />
          <Route path="reports/profit" element={<ProfitReportPage />} />
          <Route index element={<DashboardPage />} />
          <Route path="pos" element={<POSPage />} />
          <Route path="products/products" element={<ProductsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="inventory/transfers" element={<TransfersPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="repairs" element={<RepairsPage />} />
          <Route path="finance/*" element={<FinancePage />} />
          <Route path="reports/*" element={<ReportsPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}
