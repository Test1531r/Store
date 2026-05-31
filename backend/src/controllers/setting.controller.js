import { prisma } from '../config/database.js';

export const getSettings = async (req, res, next) => {
  try {
    const { group } = req.query;
    const where = group ? { group } : {};
    const settings = await prisma.setting.findMany({ where });
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
};

export const getSetting = async (req, res, next) => {
  try {
    const setting = await prisma.setting.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data: setting });
  } catch (error) { next(error); }
};

export const updateSetting = async (req, res, next) => {
  try {
    const { key, value, group } = req.body;
    const setting = await prisma.setting.upsert({
      where: { companyId_key: { companyId: req.body.companyId, key } },
      update: { value },
      create: { companyId: req.body.companyId, key, value, group: group || 'GENERAL' }
    });
    res.json({ success: true, data: setting });
  } catch (error) { next(error); }
};
