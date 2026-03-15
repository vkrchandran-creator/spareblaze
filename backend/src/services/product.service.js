const prisma = require('../config/db');

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT     = 100;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Fields returned on every product list item */
const LIST_SELECT = {
  id:             true,
  title:          true,
  slug:           true,
  brand:          true,
  price:          true,
  mrp:            true,
  discountPercent:true,
  images:         true,
  isActive:       true,
  category:       { select: { id: true, name: true, slug: true } },
  inventory:      { select: { quantity: true } },
};

/** Full fields for a single product detail page */
const DETAIL_SELECT = {
  ...LIST_SELECT,
  description:        true,
  sku:                true,
  specifications:     true,
  compatibleVehicles: true,
  createdAt:          true,
  updatedAt:          true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsePagination(query) {
  const page  = Math.max(1, parseInt(query.page)  || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
}

function buildSortOrder(sort) {
  switch (sort) {
    case 'price_asc':     return { price: 'asc' };
    case 'price_desc':    return { price: 'desc' };
    case 'discount_desc': return { discountPercent: 'desc' };
    case 'newest':
    default:              return { createdAt: 'desc' };
  }
}

function buildPaginationMeta(page, limit, total) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

/**
 * Generate a URL-safe slug. Checks the DB for collisions and appends
 * a counter suffix until it finds a unique value.
 */
async function uniqueSlug(title, excludeId = null) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);

  let candidate = base;
  let counter   = 1;

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${counter++}`;
  }
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * List products with optional filters, sorting, and pagination.
 *
 * Supported query params:
 *   category  — category slug
 *   brand     — exact brand match (case-insensitive)
 *   minPrice  — minimum price
 *   maxPrice  — maximum price
 *   inStock   — "true" to show only in-stock items
 *   sort      — price_asc | price_desc | discount_desc | newest (default)
 *   page      — page number (default 1)
 *   limit     — items per page (default 20, max 100)
 */
async function list(query = {}) {
  const { page, limit, skip } = parsePagination(query);
  const orderBy = buildSortOrder(query.sort);

  const where = { isActive: true };

  if (query.category) {
    where.category = { slug: query.category.toLowerCase() };
  }
  if (query.brand) {
    where.brand = { equals: query.brand, mode: 'insensitive' };
  }
  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
    if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
  }
  if (query.inStock === 'true') {
    where.inventory = { quantity: { gt: 0 } };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, select: LIST_SELECT, orderBy, skip, take: limit }),
    prisma.product.count({ where }),
  ]);

  return { products, pagination: buildPaginationMeta(page, limit, total) };
}

/**
 * Full-text search across title and brand.
 * Uses case-insensitive contains — adequate for 600 products.
 * For larger catalogs: upgrade to pg_trgm or Meilisearch.
 */
async function search(q, query = {}) {
  const { page, limit, skip } = parsePagination(query);
  const term = q.trim();

  const where = {
    isActive: true,
    OR: [
      { title: { contains: term, mode: 'insensitive' } },
      { brand: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
    ],
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select:  LIST_SELECT,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, pagination: buildPaginationMeta(page, limit, total) };
}

/**
 * Products filtered by category slug, with all list query params supported.
 */
async function byCategory(slug, query = {}) {
  // Confirm the category exists first
  const category = await prisma.category.findUnique({
    where:  { slug: slug.toLowerCase() },
    select: { id: true, name: true, slug: true },
  });

  if (!category) {
    const err = new Error(`Category '${slug}' not found.`);
    err.status = 404;
    throw err;
  }

  return list({ ...query, category: slug });
}

/**
 * Get a single product by UUID or slug.
 * Includes full details: specs, compatible vehicles, inventory.
 */
async function getOne(idOrSlug) {
  const isUuid = UUID_RE.test(idOrSlug);

  const product = await prisma.product.findFirst({
    where: isUuid
      ? { id: idOrSlug,   isActive: true }
      : { slug: idOrSlug, isActive: true },
    select: DETAIL_SELECT,
  });

  if (!product) {
    const err = new Error('Product not found.');
    err.status = 404;
    throw err;
  }

  return product;
}

/**
 * Create a new product (admin only).
 * Automatically creates an Inventory record with quantity 0.
 */
async function create(data) {
  const {
    title, description, sku, brand, categoryId,
    price, mrp, discountPercent = 0, images = [],
    specifications, compatibleVehicles,
  } = data;

  // Verify category exists
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    const err = new Error('Category not found.');
    err.status = 404;
    throw err;
  }

  const slug = await uniqueSlug(title);

  const product = await prisma.product.create({
    data: {
      title, slug, description, sku, brand, categoryId,
      price:           parseFloat(price),
      mrp:             parseFloat(mrp),
      discountPercent: parseInt(discountPercent) || 0,
      images,
      specifications:     specifications     || undefined,
      compatibleVehicles: compatibleVehicles || undefined,
      inventory: {
        create: { quantity: 0, lowStockThreshold: 5 },
      },
    },
    select: DETAIL_SELECT,
  });

  return product;
}

/**
 * Update a product (admin only).
 * Regenerates slug if title changes.
 */
async function update(id, data) {
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true },
  });

  if (!existing) {
    const err = new Error('Product not found.');
    err.status = 404;
    throw err;
  }

  const updateData = { ...data };

  if (data.price !== undefined) updateData.price = parseFloat(data.price);
  if (data.mrp   !== undefined) updateData.mrp   = parseFloat(data.mrp);

  // Regenerate slug only if the title has actually changed
  if (data.title && data.title !== existing.title) {
    updateData.slug = await uniqueSlug(data.title, id);
  }

  // Prevent direct inventory updates through this endpoint
  delete updateData.inventory;

  const product = await prisma.product.update({
    where:  { id },
    data:   updateData,
    select: DETAIL_SELECT,
  });

  return product;
}

/**
 * Soft-delete a product (admin only).
 * Sets isActive = false. Product remains in DB for order history integrity.
 */
async function softDelete(id) {
  const existing = await prisma.product.findUnique({
    where:  { id },
    select: { id: true },
  });

  if (!existing) {
    const err = new Error('Product not found.');
    err.status = 404;
    throw err;
  }

  await prisma.product.update({
    where: { id },
    data:  { isActive: false },
  });
}

module.exports = { list, search, byCategory, getOne, create, update, softDelete };
