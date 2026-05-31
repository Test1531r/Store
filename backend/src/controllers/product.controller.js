import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { emitToBranch } from '../config/socket.js';


// ================= CREATE PRODUCT =================
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      barcode,
      sku,
      imei,
      serialNumber,
      costPrice,
      sellingPrice,
      wholesalePrice,
      discountPrice,
      lowStockAlert,
      warrantyDays,
      categoryId,
      brandId,
      supplierId,
      images,
      colors,
      storageSizes,
      isSerialized,
      hasVariants
    } = req.body;

    const finalSku =
      sku || `SKU-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 1️⃣ Create Product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        barcode,
        sku: finalSku,
        imei,
        serialNumber,
        costPrice: parseFloat(costPrice || 0),
        sellingPrice: parseFloat(sellingPrice || 0),
        wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : null,
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        lowStockAlert: parseInt(lowStockAlert || 5),
        warrantyDays: parseInt(warrantyDays || 365),
        categoryId,
        brandId,
        supplierId,
        images: images || [],
        colors: colors || [],
        storageSizes: storageSizes || [],
        isSerialized: isSerialized || false,
        hasVariants: hasVariants || false
      }
    });

    // 2️⃣ IMPORTANT: CREATE INVENTORY FOR ALL BRANCHES AUTOMATICALLY
    const branches = await prisma.branch.findMany();

    if (branches.length > 0) {
      await prisma.inventory.createMany({
        data: branches.map((b) => ({
          productId: product.id,
          branchId: b.id,
          quantity: 0,
          minStock: parseInt(lowStockAlert || 5)
        })),
        skipDuplicates: true
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    next(error);
  }
};


// ================= GET PRODUCTS =================
export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      brandId,
      branchId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(categoryId && { categoryId }),
      ...(brandId && { brandId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search } },
          { barcode: { contains: search } }
        ]
      })
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          inventory: {
            where: branchId ? { branchId } : undefined,
            include: { branch: true }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    });

  } catch (error) {
    next(error);
  }
};


// ================= GET SINGLE PRODUCT =================
export const getProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        brand: true,
        inventory: {
          include: { branch: true }
        }
      }
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({ success: true, data: product });

  } catch (error) {
    next(error);
  }
};


// ================= UPDATE PRODUCT =================
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.update({
      where: { id },
      data: req.body,
      include: {
        inventory: true
      }
    });

    // emit update
    product.inventory.forEach((inv) => {
      emitToBranch(inv.branchId, 'product-updated', product);
    });

    res.json({
      success: true,
      message: 'Updated successfully',
      data: product
    });

  } catch (error) {
    next(error);
  }
};


// ================= DELETE PRODUCT =================
export const deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({ success: true });

  } catch (error) {
    next(error);
  }
};


// ================= VARIANT (FIXED EXPORT) =================
export const createVariant = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const data = req.body;

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        sku: data.sku || `VAR-${Date.now()}`,
        barcode: data.barcode,
        color: data.color,
        storageSize: data.storageSize,
        imei: data.imei,
        costPrice: parseFloat(data.costPrice || 0),
        sellingPrice: parseFloat(data.sellingPrice || 0)
      }
    });

    res.status(201).json({
      success: true,
      data: variant
    });

  } catch (error) {
    next(error);
  }
};


// ================= LOW STOCK =================
export const getLowStock = async (req, res, next) => {
  try {
    const { branchId } = req.query;

    const data = await prisma.inventory.findMany({
      where: {
        quantity: { lte: prisma.inventory.fields.minStock },
        ...(branchId && { branchId })
      },
      include: {
        product: true,
        branch: true
      }
    });

    res.json({ success: true, data });

  } catch (error) {
    next(error);
  }
};