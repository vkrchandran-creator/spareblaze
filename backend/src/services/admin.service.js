const prisma = require('../config/db');

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return Boolean(value);
}

async function getDashboardStats() {
  // Fetch all inventory rows to do per-row low-stock comparison
  const allInv = await prisma.inventory.findMany({ select: { quantity: true, lowStockThreshold: true } });
  const lowStockItems = allInv.filter(i => i.quantity <= i.lowStockThreshold).length;

  const [totalProducts, totalUsers, totalOrders] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.order.count(),
  ]);

  // Get total revenue
  const revenueResult = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: { in: ['confirmed', 'processing', 'shipped', 'delivered'] } },
  });

  return {
    totalProducts,
    totalUsers,
    totalOrders,
    lowStockItems,
    revenue: revenueResult._sum.totalAmount || 0,
  };
}

async function getInventory({ page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.inventory.findMany({
      skip,
      take: limit,
      orderBy: { quantity: 'asc' },
      include: {
        product: {
          select: { id: true, title: true, brand: true, price: true, isActive: true, category: { select: { name: true } } },
        },
      },
    }),
    prisma.inventory.count(),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function updateStock(productId, quantity) {
  const inv = await prisma.inventory.findUnique({ where: { productId } });
  if (!inv) { const err = new Error('Inventory record not found.'); err.status = 404; throw err; }
  return prisma.inventory.update({ where: { productId }, data: { quantity } });
}

async function getUsers({ page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, phone: true, role: true, isVerified: true, createdAt: true },
    }),
    prisma.user.count(),
  ]);
  return { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

// Get all distinct brands from active products
async function getBrands(query = {}) {
  const where = {};
  if (query.featuredOnly === 'true') where.isFeatured = true;
  if (query.includeInactive !== 'true') where.isActive = true;

  const brands = await prisma.brand.findMany({
    where,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      isActive: true,
      isFeatured: true,
      _count: { select: { products: true } },
    },
  });

  if (brands.length) return brands;

  const fallback = await prisma.product.findMany({
    where: { isActive: true, NOT: { brand: null } },
    select: { brand: true },
    distinct: ['brand'],
    orderBy: { brand: 'asc' },
  });

  return fallback
    .map((row) => row.brand)
    .filter(Boolean)
    .map((name) => ({
      id: name,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-'),
      logoUrl: null,
      isFeatured: false,
      _count: { products: 0 },
    }));
}

async function createBrand({ name, logoUrl, isFeatured = false, isActive = true }) {
  const cleanName = String(name || '').trim();
  if (!cleanName) {
    const err = new Error('Brand name is required.');
    err.status = 400;
    throw err;
  }

  const slug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const existing = await prisma.brand.findUnique({ where: { slug } });
  if (existing) {
    const err = new Error(`Brand "${cleanName}" already exists.`);
    err.status = 409;
    throw err;
  }

  return prisma.brand.create({
    data: {
      name: cleanName,
      slug,
      logoUrl: logoUrl || null,
      isActive: toBoolean(isActive),
      isFeatured: toBoolean(isFeatured),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      isActive: true,
      isFeatured: true,
      _count: { select: { products: true } },
    },
  });
}

async function updateBrand(id, { name, logoUrl, isFeatured, isActive }) {
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) {
    const err = new Error('Brand not found.');
    err.status = 404;
    throw err;
  }

  const data = {};
  if (name !== undefined) {
    const cleanName = String(name || '').trim();
    if (!cleanName) {
      const err = new Error('Brand name is required.');
      err.status = 400;
      throw err;
    }
    data.name = cleanName;
    data.slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  if (logoUrl !== undefined) data.logoUrl = logoUrl || null;
  if (isActive !== undefined) data.isActive = toBoolean(isActive);
  if (isFeatured !== undefined) data.isFeatured = toBoolean(isFeatured);

  return prisma.brand.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      isActive: true,
      isFeatured: true,
      _count: { select: { products: true } },
    },
  });
}

async function deleteBrand(id) {
  const brand = await prisma.brand.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!brand) {
    const err = new Error('Brand not found.');
    err.status = 404;
    throw err;
  }

  if (brand._count.products > 0) {
    const err = new Error(`Cannot delete brand "${brand.name}" because ${brand._count.products} products use it.`);
    err.status = 409;
    throw err;
  }

  await prisma.brand.delete({ where: { id } });
}

module.exports = {
  getDashboardStats,
  getInventory,
  updateStock,
  getUsers,
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
};
