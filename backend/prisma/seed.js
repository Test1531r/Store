import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create company
  const company = await prisma.company.create({
    data: {
      name: 'Mobile Tech Store',
      email: 'admin@mobiletech.com',
      phone: '+20 100 000 0000',
      address: 'Cairo, Egypt',
      currency: 'EGP'
    }
  });

  // Create branches
  const mainBranch = await prisma.branch.create({
    data: { name: 'Main Branch', code: 'MAIN-001', address: 'Downtown Cairo', companyId: company.id }
  });
  const branch2 = await prisma.branch.create({
    data: { name: 'Nasr City Branch', code: 'NSR-002', address: 'Nasr City', companyId: company.id }
  });

  // Create permissions
  const modules = [
    'USERS', 'BRANCHES', 'PRODUCTS', 'INVENTORY', 'SALES', 'CUSTOMERS',
    'SUPPLIERS', 'TRANSFERS', 'EXPENSES', 'FINANCE', 'REPAIRS', 'REPORTS',
    'SETTINGS', 'AUDIT', 'DASHBOARD'
  ];
  const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE'];

  const permissions = [];
  for (const module of modules) {
    for (const action of actions) {
      const perm = await prisma.permission.create({
        data: { module, action, description: `${action} ${module}` }
      });
      permissions.push(perm);
    }
  }

  // Create roles
  const superAdminRole = await prisma.role.create({
    data: {
      name: 'SUPER_ADMIN',
      description: 'Full system access',
      permissions: {
        create: permissions.map(p => ({ permissionId: p.id }))
      }
    }
  });

  const managerRole = await prisma.role.create({
    data: {
      name: 'BRANCH_MANAGER',
      description: 'Branch manager with limited admin access',
      permissions: {
        create: permissions
          .filter(p => !['SETTINGS', 'AUDIT'].includes(p.module))
          .map(p => ({ permissionId: p.id }))
      }
    }
  });

  const cashierRole = await prisma.role.create({
    data: {
      name: 'CASHIER',
      description: 'POS and sales access',
      permissions: {
        create: permissions
          .filter(p => ['SALES', 'CUSTOMERS', 'DASHBOARD'].includes(p.module))
          .map(p => ({ permissionId: p.id }))
      }
    }
  });

  const inventoryRole = await prisma.role.create({
    data: {
      name: 'INVENTORY_MANAGER',
      description: 'Inventory management access',
      permissions: {
        create: permissions
          .filter(p => ['PRODUCTS', 'INVENTORY', 'TRANSFERS', 'SUPPLIERS', 'DASHBOARD'].includes(p.module))
          .map(p => ({ permissionId: p.id }))
      }
    }
  });

  const accountantRole = await prisma.role.create({
    data: {
      name: 'ACCOUNTANT',
      description: 'Financial access',
      permissions: {
        create: permissions
          .filter(p => ['EXPENSES', 'FINANCE', 'REPORTS', 'DASHBOARD'].includes(p.module))
          .map(p => ({ permissionId: p.id }))
      }
    }
  });

  const technicianRole = await prisma.role.create({
    data: {
      name: 'TECHNICIAN',
      description: 'Repair center access',
      permissions: {
        create: permissions
          .filter(p => ['REPAIRS', 'INVENTORY', 'DASHBOARD'].includes(p.module))
          .map(p => ({ permissionId: p.id }))
      }
    }
  });

  // Create Super Admin
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mobiletech.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+20 100 000 0000',
      roleId: superAdminRole.id
    }
  });

  // Create sample users
  await prisma.user.create({
    data: {
      email: 'manager@mobiletech.com',
      password: await bcrypt.hash('manager123', 12),
      firstName: 'Branch',
      lastName: 'Manager',
      roleId: managerRole.id,
      branchId: mainBranch.id
    }
  });

  await prisma.user.create({
    data: {
      email: 'cashier@mobiletech.com',
      password: await bcrypt.hash('cashier123', 12),
      firstName: 'Main',
      lastName: 'Cashier',
      roleId: cashierRole.id,
      branchId: mainBranch.id
    }
  });

  // Create expense categories
  const expenseCategories = [
    { name: 'Rent', color: '#ef4444' },
    { name: 'Salaries', color: '#f97316' },
    { name: 'Electricity', color: '#eab308' },
    { name: 'Internet', color: '#22c55e' },
    { name: 'Purchases', color: '#3b82f6' },
    { name: 'Maintenance', color: '#a855f7' },
    { name: 'Transportation', color: '#ec4899' },
    { name: 'Miscellaneous', color: '#6b7280' }
  ];

  for (const cat of expenseCategories) {
    await prisma.expenseCategory.create({ data: cat });
  }

  // Create categories
  const categories = [
    { name: 'Mobile Phones', description: 'Smartphones and feature phones' },
    { name: 'Accessories', description: 'Phone cases, chargers, cables' },
    { name: 'Computers', description: 'Laptops and desktops' },
    { name: 'Tablets', description: 'iPads and Android tablets' },
    { name: 'Smart Watches', description: 'Wearable devices' }
  ];

  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }

  // Create brands
  const brands = [
    { name: 'Apple', description: 'iPhone, iPad, Mac' },
    { name: 'Samsung', description: 'Galaxy series' },
    { name: 'Xiaomi', description: 'Redmi and Mi series' },
    { name: 'Huawei', description: 'Mate and P series' },
    { name: 'Oppo', description: 'Reno and Find series' }
  ];

  for (const brand of brands) {
    await prisma.brand.create({ data: brand });
  }

  // Create cashboxes
  await prisma.cashbox.create({
    data: { name: 'Main Cash', type: 'CASH', branchId: mainBranch.id, balance: 5000 }
  });
  await prisma.cashbox.create({
    data: { name: 'Vodafone Cash', type: 'WALLET', branchId: mainBranch.id, balance: 0 }
  });

  console.log('✅ Database seeded successfully!');
  console.log('🔑 Default login: admin@mobiletech.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
