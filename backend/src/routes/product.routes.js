import express from 'express';
import { body } from 'express-validator';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  getLowStock
} from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, idParam, paginationQuery } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);

const productValidation = [
  body('name').trim().notEmpty(),
  body('costPrice').isFloat({ min: 0 }),
  body('sellingPrice').isFloat({ min: 0 }),
  body('categoryId').isUUID()
];

router.post('/', authorize('PRODUCTS:CREATE'), validate(productValidation), createProduct);
router.get('/', authorize('PRODUCTS:READ'), validate(paginationQuery), getProducts);
router.get('/low-stock', authorize('PRODUCTS:READ'), getLowStock);
router.get('/:id', authorize('PRODUCTS:READ'), validate([idParam]), getProduct);
router.put('/:id', authorize('PRODUCTS:UPDATE'), validate([idParam]), updateProduct);
router.delete('/:id', authorize('PRODUCTS:DELETE'), validate([idParam]), deleteProduct);
router.post('/:productId/variants', authorize('PRODUCTS:CREATE'), createVariant);

export default router;
