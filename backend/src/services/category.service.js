const prisma = require('../config/db');

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

// List all categories (with product count)
async function list() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true, name: true, slug: true, parentId: true,
      _count: { select: { products: true } },
    },
  });
}

// Create a category; auto-generate slug; verify parentId if provided
async function create({ name, parentId }) {
  const slug = slugify(name);
  // Check slug uniqueness
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    const err = new Error(`Slug "${slug}" already exists.`); err.status = 409; throw err;
  }
  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) { const err = new Error('Parent category not found.'); err.status = 404; throw err; }
  }
  return prisma.category.create({ data: { name: name.trim(), slug, parentId: parentId || null } });
}

// Update a category
async function update(id, { name, parentId }) {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) { const err = new Error('Category not found.'); err.status = 404; throw err; }
  const data = {};
  if (name) { data.name = name.trim(); data.slug = slugify(name); }
  if (parentId !== undefined) data.parentId = parentId || null;
  return prisma.category.update({ where: { id }, data });
}

// Delete a category (only if it has no products)
async function remove(id) {
  const cat = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
  if (!cat) { const err = new Error('Category not found.'); err.status = 404; throw err; }
  if (cat._count.products > 0) {
    const err = new Error(`Cannot delete: category has ${cat._count.products} products.`); err.status = 409; throw err;
  }
  await prisma.category.delete({ where: { id } });
}

module.exports = { list, create, update, remove };
