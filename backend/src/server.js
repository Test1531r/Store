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

// Routes
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

/**
 * مهم جدًا للاستضافة (Render / VPS / Railway / etc)
 */
app.set('trust proxy', 1);

const httpServer = createServer(app);

/**
 * Socket.io
 */
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
  }
});

/**
 * Rate Limit
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});

/**
 * Middleware
 */
app.use(helmet());
app.use(compression());
app.use(limiter);

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

/**
 * Attach socket.io to request
 */
app.use((req, res, next) => {
  req.io = io;
  next();
});

/**
 * API Prefix
 */
const API_PREFIX = '/api/v1';

/**
 * Routes
 */
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
app.use(`${API_PREFIX}/categories`, categoryRoutes);

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

/**
 * Root route (واحد فقط)
 */
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Enterprise POS API is running 🚀'
  });
});

/**
 * Socket setup
 */
setupSocketHandlers(io);

/**
 * Error handler (آخر حاجة)
 */
app.use(errorHandler);

/**
 * Server start (IMPORTANT)
 */
app.get('/db-test', async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.json({
      success: true,
      message: 'Database connected successfully 🚀',
      count: users.length
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed ❌',
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

/**
 * Graceful shutdown
 */
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
