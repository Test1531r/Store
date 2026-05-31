import { prisma } from '../config/database.js';
import bcrypt from 'bcryptjs';

/* ================= USERS ================= */

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        branch: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        role: true,
        branch: true
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* ================= CREATE USER ================= */

export const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      branchId,
      roleId
    } = req.body;

    // check exists
    const exists = await prisma.user.findUnique({
      where: { email }
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone: phone || null,

        // ✅ RELATIONS FIXED
        branch: branchId
          ? { connect: { id: branchId } }
          : undefined,

        role: roleId
          ? { connect: { id: roleId } }
          : undefined,

        isActive: true
      },
      include: {
        role: true,
        branch: true
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* ================= UPDATE USER ================= */

export const updateUser = async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      include: {
        role: true,
        branch: true
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* ================= DELETE USER ================= */

export const deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'User deleted'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* ================= ROLES ================= */

export const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: true
      }
    });

    res.json({
      success: true,
      data: roles
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const createRole = async (req, res) => {
  try {
    const { name } = req.body;

    const role = await prisma.role.create({
      data: { name }
    });

    res.json({
      success: true,
      data: role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* ================= PERMISSIONS ================= */

export const getPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany();

    res.json({
      success: true,
      data: permissions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};