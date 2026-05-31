export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          message: 'Unique constraint violation',
          field: err.meta?.target?.[0]
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          message: 'Record not found'
        });
      case 'P2003':
        return res.status(400).json({
          success: false,
          message: 'Foreign key constraint failed'
        });
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}
