# Enterprise Mobile & Electronics Store ERP/POS System

A full-featured, enterprise-grade web-based ERP/POS system for managing mobile phones, accessories, and computer stores with support for multiple branches, inventory management, sales, accounting, analytics, transfers, repair services, and financial transactions.

## Features

### Core Modules
- **Authentication & Authorization** - JWT with refresh tokens, RBAC with 6 roles
- **Multi-Branch Management** - Branch-specific inventory, employees, reports, transfers
- **Product Management** - Barcode/QR/IMEI support, variants, categories, brands
- **Inventory Management** - Real-time tracking, multi-branch stock, audit logs
- **POS System** - Fast cashier interface, barcode scanning, multiple payment methods
- **Sales Management** - Invoices, returns, analytics, profit calculation
- **Financial System** - Expenses, cashboxes, P&L reports, daily closing
- **Financial Transactions** - Vodafone Cash, InstaPay, STC Pay, bank transfers
- **Customer Management** - Profiles, purchase history, credit, loyalty points
- **Supplier Management** - Profiles, purchase invoices, debt tracking
- **Repair Center** - Ticket system, technician assignment, status tracking
- **Reporting & Analytics** - Dashboard, charts, employee performance
- **Audit Logs** - Complete action tracking with before/after values

### Tech Stack
**Backend:** Node.js + Express + Prisma ORM + PostgreSQL + Socket.io
**Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
**Real-time:** Socket.io for live inventory updates, notifications
**Security:** Helmet, rate limiting, input validation, JWT

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Docker Setup (Full Stack)
```bash
docker-compose up -d
```

## Default Login
- **Email:** admin@mobiletech.com
- **Password:** admin123

## User Roles
1. **Super Admin** - Full system access
2. **Branch Manager** - Branch management access
3. **Cashier** - POS and sales access
4. **Inventory Manager** - Inventory and transfers
5. **Accountant** - Financial access
6. **Technician** - Repair center access

## API Documentation
All endpoints are prefixed with `/api/v1`

### Authentication
- `POST /auth/login` - Login
- `POST /auth/register` - Register (Super Admin only)
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Current user

### Core Endpoints
- `GET/POST /products` - Product CRUD
- `GET/POST /inventory` - Inventory management
- `GET/POST /sales` - Sales & POS
- `GET/POST /customers` - Customer management
- `GET/POST /transfers` - Branch transfers
- `GET/POST /repairs` - Repair tickets
- `GET/POST /expenses` - Expense tracking
- `GET/POST /cashboxes` - Cashbox management
- `GET /dashboard/stats` - Dashboard analytics
- `GET /reports/*` - Reports

## Architecture

### Database Design
- **Multi-branch inventory** - Dedicated `inventory` table linking products to branches
- **Inventory movement history** - Complete audit trail of all stock changes
- **Product variants** - Support for color, storage size, IMEI tracking
- **Financial transactions** - Separate table for Vodafone Cash, InstaPay, etc.
- **Repair workflow** - Status history with technician assignment

### Security
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Rate limiting (1000 requests per 15 minutes)
- Helmet security headers
- Input validation with express-validator
- SQL injection protection via Prisma ORM
- XSS protection
- Audit logging for all data changes

## License
MIT License
