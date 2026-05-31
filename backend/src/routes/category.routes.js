import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// ================= GET CATEGORIES =================

router.get('/', async (req, res) => {
  try {
    const categories =
      await prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
      });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        'Failed to load categories',
    });
  }
});

// ================= CREATE CATEGORY =================

router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
    } = req.body;

    const category =
      await prisma.category.create({
        data: {
          name,
          description,
        },
      });

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        'Failed to create category',
    });
  }
});

export default router;