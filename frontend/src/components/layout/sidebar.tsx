import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  Truck,
  Wrench,
  Receipt,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
  CreditCard,
  Bell,
  FileText,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  module: string;
  action: string;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/', module: 'DASHBOARD', action: 'READ' },
  {
    label: 'POS',
    icon: ShoppingCart,
    href: '/pos',
    module: 'SALES',
    action: 'CREATE',
  },
  {
    label: 'Sales',
    icon: Receipt,
    href: '/sales',
    module: 'SALES',
    action: 'READ',
    children: [
      { label: 'Invoices', href: '/sales/invoices' },
      { label: 'Returns', href: '/sales/returns' },
    ],
  },
  {
    label: 'Products',
    icon: Package,
    href: '/products',
    module: 'PRODUCTS',
    action: 'READ',
    children: [
      { label: 'All Products', href: '/products/products' },
      { label: 'Categories', href: '/products/categories' },
      { label: 'Brands', href: '/products/brands' },
    ],
  },
  {
    label: 'Inventory',
    icon: Warehouse,
    href: '/inventory',
    module: 'INVENTORY',
    action: 'READ',
    children: [
      { label: 'Stock Levels', href: '/inventory' },
      { label: 'Transfers', href: '/inventory/transfers' },
      { label: 'Stock Count', href: '/inventory/count' },
    ],
  },
  {
    label: 'Customers',
    icon: Users,
    href: '/customers',
    module: 'CUSTOMERS',
    action: 'READ',
  },
  {
    label: 'Suppliers',
    icon: Truck,
    href: '/suppliers',
    module: 'SUPPLIERS',
    action: 'READ',
  },
  {
    label: 'Repairs',
    icon: Wrench,
    href: '/repairs',
    module: 'REPAIRS',
    action: 'READ',
  },
  {
    label: 'Finance',
    icon: CreditCard,
    href: '/finance',
    module: 'FINANCE',
    action: 'READ',
    children: [
      { label: 'Cashboxes', href: '/finance/cashboxes' },
      { label: 'Expenses', href: '/finance/expenses' },
      { label: 'Transactions', href: '/finance/transactions' },
    ],
  },
  {
    label: 'Reports',
    icon: BarChart3,
    href: '/reports',
    module: 'REPORTS',
    action: 'READ',
    children: [
      { label: 'Sales Report', href: '/reports/sales' },
      { label: 'Inventory Report', href: '/reports/inventory' },
      { label: 'Profit Report', href: '/reports/profit' },
      { label: 'Employees', href: '/reports/employees' },
    ],
  },
  {
    label: 'Branches',
    icon: Building2,
    href: '/branches',
    module: 'BRANCHES',
    action: 'READ',
  },
  {
    label: 'Users',
    icon: Users,
    href: '/users',
    module: 'USERS',
    action: 'READ',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    module: 'SETTINGS',
    action: 'READ',
  },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const { user, hasPermission, logout } = useAuthStore();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const filteredNav = navItems.filter((item) =>
    hasPermission(item.module, item.action)
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {sidebarOpen ? (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Enterprise POS</span>
          </Link>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <ShoppingCart className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden lg:flex"
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {filteredNav.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          const isExpanded = expandedItems.includes(item.label);

          return (
            <div key={item.label}>
              <Link
                to={item.href}
                onClick={(e) => {
                  if (item.children) {
                    e.preventDefault();
                    toggleExpand(item.label);
                  }
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  !sidebarOpen && 'justify-center px-2'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.children && (
                      <ChevronRight
                        className={cn(
                          'w-4 h-4 transition-transform',
                          isExpanded && 'rotate-90'
                        )}
                      />
                    )}
                  </>
                )}
              </Link>

              {/* Submenu */}
              {sidebarOpen && item.children && isExpanded && (
                <div className="ml-9 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      to={child.href}
                      className={cn(
                        'block px-3 py-2 rounded-lg text-sm transition-colors',
                        location.pathname === child.href
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-border p-3">
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.role?.name}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
