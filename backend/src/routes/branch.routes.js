import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();


// ================= GET ALL BRANCHES =================

router.get('/', async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: branches,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: 'Failed to load branches',
    });
  }
});


// ================= CREATE BRANCH =================

router.post('/', async (req, res) => {
  try {
    const {
      name,
      code,
      address,
      phone,
      email,
      companyId,
    } = req.body;

    if (!name || !code || !companyId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        code,
        address,
        phone,
        email,
        companyId,
      },
    });

    res.json({
      success: true,
      data: branch,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: 'Failed to create branch',
    });
  }
});


// ================= UPDATE BRANCH =================

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await prisma.branch.update({
      where: { id },

      data: req.body,
    });

    res.json({
      success: true,
      data: branch,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: 'Failed to update branch',
    });
  }
});


// ================= DELETE BRANCH =================

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.branch.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Branch deleted',
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete branch',
    });
  }
});

export default router;