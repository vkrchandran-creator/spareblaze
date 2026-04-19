const prisma = require('../config/db');

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT     = 100;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PRODUCT_TYPES = new Set(['oem', 'aftermarket']);
const PRODUCT_CONDITIONS = new Set(['new', 'used', 'refurbished']);
const PRICING_MODELS = new Set(['retail', 'wholesale']);
const GENERIC_BRAND_SLUG = 'generic';
const LEGACY_ATTRIBUTE_CATEGORY_MAP = {
  aftermarket: { type: 'aftermarket' },
  'after-market': { type: 'aftermarket' },
  oem: { type: 'oem' },
  used: { condition: 'used' },
  refurbished: { condition: 'refurbished' },
  wholesale: { pricingModel: 'wholesale' },
};

const PRODUCT_FIELD_NAMES = new Set(
  (((prisma._runtimeDataModel || {}).models || {}).Product || { fields: [] }).fields.map((field) => field.name),
);
const HAS_PRODUCT_ATTRIBUTES = ['type', 'condition', 'pricingModel'].every((field) => PRODUCT_FIELD_NAMES.has(field));

/** Fields returned on every product list item */
const LIST_SELECT = Object.assign({
  id:             true,
  title:          true,
  slug:           true,
  brand:          true,
  brandId:        true,
  brandRef:       { select: { id: true, name: true, slug: true, logoUrl: true } },
  price:          true,
  mrp:            true,
  discountPercent:true,
  images:         true,
  isActive:       true,
  isFeatured:     true,
  category:       { select: { id: true, name: true, slug: true } },
  inventory:      { select: { quantity: true } },
}, HAS_PRODUCT_ATTRIBUTES ? {
  type:           true,
  condition:      true,
  pricingModel:   true,
} : {});

/** Full fields for a single product detail page */
const DETAIL_SELECT = {
  ...LIST_SELECT,
  categoryId:         true,
  description:        true,
  sku:                true,
  specifications:     true,
  partNumbers: true, compatibleVehicles: { select: { vehicle: { select: { id: true, name: true, slug: true, brand: { select: { id: true, name: true } } } } } },
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

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return Boolean(value);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function parseBrandList(query) {
  if (Array.isArray(query.brands)) {
    return query.brands
      .map((brand) => String(brand).trim().replace(/-/g, ' '))
      .filter(Boolean);
  }

  if (typeof query.brands === 'string' && query.brands.trim()) {
    return query.brands
      .split(',')
      .map((brand) => brand.trim().replace(/-/g, ' '))
      .filter(Boolean);
  }

  if (query.brand) {
    return [String(query.brand).trim().replace(/-/g, ' ')].filter(Boolean);
  }

  return [];
}

function normalizeAllowed(value, allowed, fallback = null) {
  const normalized = String(value || '').trim().toLowerCase().replace(/-/g, '_');
  return allowed.has(normalized) ? normalized : fallback;
}

function parseAttributeList(value, allowed) {
  const rawValues = Array.isArray(value) ? value : String(value || '').split(',');
  return rawValues
    .map((item) => normalizeAllowed(item, allowed))
    .filter(Boolean);
}

function appendAttributeFilter(andConditions, field, rawValue, allowed) {
  const values = parseAttributeList(rawValue, allowed);
  if (values.length === 1) andConditions.push({ [field]: values[0] });
  if (values.length > 1) andConditions.push({ [field]: { in: values } });
}

function withLegacyCategoryMapping(query = {}) {
  const next = { ...query };
  const legacySlug = query.category ? String(query.category).trim().toLowerCase() : '';
  const mapped = LEGACY_ATTRIBUTE_CATEGORY_MAP[legacySlug];

  if (!mapped) return next;

  delete next.category;
  if (mapped.type && !next.type) next.type = mapped.type;
  if (mapped.condition && !next.condition) next.condition = mapped.condition;
  if (mapped.pricingModel && !next.pricing_model && !next.pricingModel) next.pricing_model = mapped.pricingModel;
  return next;
}

function appendProductFilters(where, query = {}) {
  query = withLegacyCategoryMapping(query);
  const andConditions = [];
  const brands = parseBrandList(query);
  const searchTerm = query.q ? String(query.q).trim() : '';

  if (query.category) {
    andConditions.push({ category: { slug: query.category.toLowerCase() } });
  }

  if (query.vehicle) {
    andConditions.push({
      compatibleVehicles: {
        some: { vehicle: { slug: query.vehicle } }
      }
    });
  }

  if (query.vehicle) {
    andConditions.push({
      compatibleVehicles: {
        some: { vehicle: { slug: query.vehicle } }
      }
    });
  }

  if (brands.length) {
    andConditions.push({
      OR: brands.map((brand) => ({
        OR: [
          { brandId: brand },
          { brand: { contains: brand } },
          { brandRef: { is: { slug: slugify(brand) } } },
          { brandRef: { is: { name: { contains: brand } } } },
        ],
      })).flatMap((item) => item.OR),
    });
  }

  if (query.minPrice || query.maxPrice) {
    const price = {};
    if (query.minPrice) price.gte = parseFloat(query.minPrice);
    if (query.maxPrice) price.lte = parseFloat(query.maxPrice);
    andConditions.push({ price });
  }

  if (query.minDiscount) {
    andConditions.push({ discountPercent: { gte: parseInt(query.minDiscount, 10) || 0 } });
  }

  if (query.inStock === 'true') {
    andConditions.push({ inventory: { quantity: { gt: 0 } } });
  }

  if (query.isFeatured === 'true') {
    andConditions.push({ isFeatured: true });
  }

  if (HAS_PRODUCT_ATTRIBUTES) {
    appendAttributeFilter(andConditions, 'type', query.type, PRODUCT_TYPES);
    appendAttributeFilter(andConditions, 'condition', query.condition, PRODUCT_CONDITIONS);
    appendAttributeFilter(andConditions, 'pricingModel', query.pricing_model || query.pricingModel, PRICING_MODELS);
  }

  if (searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: searchTerm } },
        { brand: { contains: searchTerm } },
        { brandRef: { is: { name: { contains: searchTerm } } } },
        { description: { contains: searchTerm } },
        { sku: { contains: searchTerm } },
      ],
    });
  }

  if (andConditions.length) {
    where.AND = andConditions;
  }

  return where;
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

async function ensureBrand(brandName) {
  const name = String(brandName || '').trim();
  if (!name) return resolveBrandBySlug(GENERIC_BRAND_SLUG);

  const slug = slugify(name);
  const existingBrand = await prisma.brand.findFirst({
    where: { slug, isActive: true },
    select: { id: true, name: true },
  });

  if (existingBrand) return { brand: existingBrand.name, brandId: existingBrand.id };
  return resolveBrandBySlug(GENERIC_BRAND_SLUG);
}

async function resolveBrandBySlug(slug) {
  const brand = await prisma.brand.upsert({
    where: { slug },
    update: { isActive: true },
    create: { name: slug === GENERIC_BRAND_SLUG ? 'Generic' : slug, slug, isActive: true },
    select: { id: true, name: true },
  });

  return { brand: brand.name, brandId: brand.id };
}

async function resolveBrand({ brandId, brand }) {
  if (brandId) {
    const brandRecord = await prisma.brand.findFirst({
      where: { id: brandId, isActive: true },
      select: { id: true, name: true },
    });
    if (!brandRecord) {
      const err = new Error('Brand not found.');
      err.status = 404;
      throw err;
    }
    return { brand: brandRecord.name, brandId: brandRecord.id };
  }

  // Backward compatibility for older API consumers that still send brand text.
  return ensureBrand(brand);
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
  const where = appendProductFilters({ isActive: true }, query);

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
  return list({ ...query, q: q.trim() });
}

/**
 * Products filtered by category slug, with all list query params supported.
 */
async function byCategory(slug, query = {}) {
  const legacySlug = String(slug || '').trim().toLowerCase();
  const legacyAttributes = LEGACY_ATTRIBUTE_CATEGORY_MAP[legacySlug];
  if (legacyAttributes) {
    return list({ ...query, ...legacyAttributes });
  }

  // Confirm the category exists first
  const category = await prisma.category.findUnique({
    where:  { slug: legacySlug },
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

  if (product && product.compatibleVehicles) { product.compatibleVehicles = product.compatibleVehicles.map(cv => ({ id: cv.vehicle.id, brand: cv.vehicle.brand.name, model: cv.vehicle.name, slug: cv.vehicle.slug })); } return product;
}

/**
 * Create a new product (admin only).
 * Automatically creates an Inventory record with quantity 0.
 */
async function create(data) {
  const {
    title, description, sku, brand, brandId, categoryId, type, condition,
    pricing_model: pricingModelSnake, pricingModel,
    price, mrp, discountPercent = 0, images = [],
    specifications, compatibleVehicles, isFeatured = false,
  } = data;

  // Verify category exists
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    const err = new Error('Category not found.');
    err.status = 404;
    throw err;
  }

  const slug = await uniqueSlug(title);
  const brandData = await resolveBrand({ brandId, brand });

  const product = await prisma.product.create({
    data: {
      title, slug, description, sku, categoryId,
      brand:   brandData.brand,
      brandId: brandData.brandId,
      ...(HAS_PRODUCT_ATTRIBUTES ? {
        type: normalizeAllowed(type, PRODUCT_TYPES, 'aftermarket'),
        condition: normalizeAllowed(condition, PRODUCT_CONDITIONS, 'new'),
        pricingModel: normalizeAllowed(pricingModelSnake || pricingModel, PRICING_MODELS, 'retail'),
      } : {}),
      price:           parseFloat(price),
      mrp:             parseFloat(mrp),
      discountPercent: parseInt(discountPercent) || 0,
      images,
      partNumbers,
      isFeatured: toBoolean(isFeatured),
      specifications:     specifications     || undefined,
      compatibleVehicles: compatibleVehicles && compatibleVehicles.length > 0 ? {
        create: compatibleVehicles.map(vid => ({ vehicleId: vid }))
      } : undefined,
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
  delete updateData.brandRef;
  if (updateData.pricing_model !== undefined) {
    updateData.pricingModel = updateData.pricing_model;
    delete updateData.pricing_model;
  }

  if (data.price !== undefined) updateData.price = parseFloat(data.price);
  if (data.mrp   !== undefined) updateData.mrp   = parseFloat(data.mrp);
  if (HAS_PRODUCT_ATTRIBUTES) {
    if (data.type !== undefined) updateData.type = normalizeAllowed(data.type, PRODUCT_TYPES, 'aftermarket');
    if (data.condition !== undefined) updateData.condition = normalizeAllowed(data.condition, PRODUCT_CONDITIONS, 'new');
    if (updateData.pricingModel !== undefined) updateData.pricingModel = normalizeAllowed(updateData.pricingModel, PRICING_MODELS, 'retail');
  } else {
    delete updateData.type;
    delete updateData.condition;
    delete updateData.pricingModel;
  }

  // Regenerate slug only if the title has actually changed
  if (data.title && data.title !== existing.title) {
    updateData.slug = await uniqueSlug(data.title, id);
  }

  if (data.brandId !== undefined || data.brand !== undefined) {
    const brandData = await resolveBrand({ brandId: data.brandId, brand: data.brand });
    updateData.brand = brandData.brand;
    updateData.brandId = brandData.brandId;
  }

  if (data.isFeatured !== undefined) updateData.isFeatured = toBoolean(data.isFeatured);

  // Prevent direct inventory updates through this endpoint
  if (data.partNumbers !== undefined) updateData.partNumbers = data.partNumbers; if (data.images !== undefined) updateData.images = data.images; delete updateData.inventory; if (data.compatibleVehicles !== undefined) { updateData.compatibleVehicles = { deleteMany: {}, create: data.compatibleVehicles.map(vid => ({ vehicleId: vid })) }; }

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
