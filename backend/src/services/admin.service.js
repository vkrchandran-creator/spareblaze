const prisma = require('../config/db');

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
async function getBrands() {
  const results = await prisma.product.findMany({
    where: { isActive: true, NOT: { brand: null } },
    select: { brand: true },
    distinct: ['brand'],
    orderBy: { brand: 'asc' },
  });
  return results.map(r => r.brand).filter(Boolean);
}

module.exports = { getDashboardStats, getInventory, updateStock, getUsers, getBrands };
