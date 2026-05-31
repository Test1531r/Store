import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { prisma } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupSocketHandlers } from './config/socket.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import branchRoutes from './routes/branch.routes.js';
import productRoutes from './routes/product.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import saleRoutes from './routes/sale.routes.js';
import customerRoutes from './routes/customer.routes.js';
import supplierRoutes from './routes/supplier.routes.js';
import transferRoutes from './routes/transfer.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import cashboxRoutes from './routes/cashbox.routes.js';
import repairRoutes from './routes/repair.routes.js';
import reportRoutes from './routes/report.routes.js';
import financialTransactionRoutes from './routes/financialTransaction.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import settingRoutes from './routes/setting.routes.js';
import auditLogRoutes from './routes/auditLog.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import categoryRoutes from './routes/category.routes.js';

dotenv.config();

const app = express();

// 👇 لازم هنا مباشرة بعد app
app.set('trust proxy', 1);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // requests per window
  message: { success: false, message: 'Too many requests, please try again later' }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Attach io to requests for real-time notifications
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/branches`, branchRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/inventory`, inventoryRoutes);
app.use(`${API_PREFIX}/sales`, saleRoutes);
app.use(`${API_PREFIX}/customers`, customerRoutes);
app.use(`${API_PREFIX}/suppliers`, supplierRoutes);
app.use(`${API_PREFIX}/transfers`, transferRoutes);
app.use(`${API_PREFIX}/expenses`, expenseRoutes);
app.use(`${API_PREFIX}/cashboxes`, cashboxRoutes);
app.use(`${API_PREFIX}/repairs`, repairRoutes);
app.use(`${API_PREFIX}/reports`, reportRoutes);
app.use(`${API_PREFIX}/financial-transactions`, financialTransactionRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/settings`, settingRoutes);
app.use(`${API_PREFIX}/audit-logs`, auditLogRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

app.use(
  '/api/categories',
  categoryRoutes
);

app.use(
  '/api/products',
  productRoutes
);

// Socket.io setup
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Enterprise POS API is running 🚀',
  });
});