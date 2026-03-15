/**
 * Product API — End-to-End Tests
 * Run: node tests/product.test.js
 */

require('dotenv').config();
const http = require('http');
const app  = require('../src/app');

const PORT = 5002;
const BASE = `http://localhost:${PORT}/api/v1`;

let server;
let passed = 0;
let failed = 0;
let createdProductId;
let sampleSlug;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

async function req(method, path, body, token) {
  const res  = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json();
  return { status: res.status, ...json };
}

/** Register an admin user and return their JWT */
async function getAdminToken() {
  const email = `admin_${Date.now()}@spareblaze.in`;

  // Register as customer first
  await req('POST', '/auth/register', {
    name: 'Admin Tester', email, phone: '9000000001', password: 'AdminPass123',
  });

  // Promote to admin directly in DB
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  await prisma.user.update({ where: { email }, data: { role: 'admin' } });
  await prisma.$disconnect();

  // Login and get fresh token with admin role
  const login = await req('POST', '/auth/login', { email, password: 'AdminPass123' });
  return login.data.token;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

async function runTests() {
  console.log('\n─── Phase 5: Product API Tests ─────────────────────────────────\n');

  const adminToken = await getAdminToken();

  // ── 1. List products ──────────────────────────────────────────────────────
  console.log('1. GET /products — default list');
  const list = await req('GET', '/products');
  assert('returns 200',             list.status === 200);
  assert('success: true',           list.success === true);
  assert('data is array',           Array.isArray(list.data));
  assert('default limit is 20',     list.data.length <= 20);
  assert('has pagination meta',     list.pagination?.total > 0);
  assert('total is ~600',           list.pagination?.total >= 600);
  assert('totalPages calculated',   list.pagination?.totalPages >= 30);
  assert('product has required fields',
    list.data[0]?.id && list.data[0]?.title && list.data[0]?.price !== undefined);
  assert('no inactive products',    list.data.every(p => p.isActive === true));
  assert('has category nested',     list.data[0]?.category?.slug !== undefined);
  assert('has inventory nested',    list.data[0]?.inventory?.quantity !== undefined);
  sampleSlug = list.data[0]?.slug;

  // ── 2. Pagination ─────────────────────────────────────────────────────────
  console.log('\n2. GET /products — pagination');
  const page2 = await req('GET', '/products?page=2&limit=10');
  assert('returns 200',             page2.status === 200);
  assert('limit=10 respected',      page2.data.length <= 10);
  assert('page=2 in meta',          page2.pagination?.page === 2);
  assert('different items than p1', page2.data[0]?.id !== list.data[0]?.id);

  // ── 3. Filter by category ─────────────────────────────────────────────────
  console.log('\n3. GET /products?category=aftermarket');
  const byCat = await req('GET', '/products?category=aftermarket');
  assert('returns 200',              byCat.status === 200);
  assert('all items are aftermarket',
    byCat.data.every(p => p.category?.slug === 'aftermarket'));
  assert('aftermarket count ~586',   byCat.pagination?.total >= 580);

  // ── 4. Filter by price range ──────────────────────────────────────────────
  console.log('\n4. GET /products?minPrice=1000&maxPrice=5000');
  const priceRange = await req('GET', '/products?minPrice=1000&maxPrice=5000');
  assert('returns 200',           priceRange.status === 200);
  assert('all prices in range',
    priceRange.data.every(p => Number(p.price) >= 1000 && Number(p.price) <= 5000));

  // ── 5. Sort orders ────────────────────────────────────────────────────────
  console.log('\n5. GET /products — sort orders');
  const asc  = await req('GET', '/products?sort=price_asc&limit=5');
  const desc = await req('GET', '/products?sort=price_desc&limit=5');
  assert('price_asc: first ≤ last',
    Number(asc.data[0]?.price) <= Number(asc.data[asc.data.length - 1]?.price));
  assert('price_desc: first ≥ last',
    Number(desc.data[0]?.price) >= Number(desc.data[desc.data.length - 1]?.price));
  assert('asc and desc differ',   asc.data[0]?.id !== desc.data[0]?.id);

  // ── 6. In-stock filter ────────────────────────────────────────────────────
  console.log('\n6. GET /products?inStock=true');
  const inStock = await req('GET', '/products?inStock=true');
  assert('returns 200',  inStock.status === 200);
  assert('all in stock', inStock.data.every(p => p.inventory?.quantity > 0));

  // ── 7. Get by category slug (route) ──────────────────────────────────────
  console.log('\n7. GET /products/category/oem');
  const oemCat = await req('GET', '/products/category/oem');
  assert('returns 200',           oemCat.status === 200);
  assert('all items OEM',         oemCat.data.every(p => p.category?.slug === 'oem'));
  assert('OEM count is 10',       oemCat.pagination?.total === 10);

  // ── 8. Category not found ─────────────────────────────────────────────────
  console.log('\n8. GET /products/category/nonexistent');
  const badCat = await req('GET', '/products/category/nonexistent');
  assert('returns 404',    badCat.status === 404);
  assert('success: false', badCat.success === false);

  // ── 9. Search ─────────────────────────────────────────────────────────────
  console.log('\n9. GET /products/search?q=brake');
  const srch = await req('GET', '/products/search?q=brake');
  assert('returns 200',         srch.status === 200);
  assert('has results',         srch.pagination?.total > 0);
  assert('results mention brake',
    srch.data.every(p => /brake/i.test(p.title) || /brake/i.test(p.brand || '')));

  // ── 10. Search — missing query ────────────────────────────────────────────
  console.log('\n10. GET /products/search — missing q param');
  const noQ = await req('GET', '/products/search');
  assert('returns 422',    noQ.status === 422);
  assert('success: false', noQ.success === false);

  // ── 11. Search — no results ───────────────────────────────────────────────
  console.log('\n11. GET /products/search?q=xyznosuchthing');
  const empty = await req('GET', '/products/search?q=xyznosuchthing');
  assert('returns 200',      empty.status === 200);
  assert('empty data array', empty.data.length === 0);
  assert('total is 0',       empty.pagination?.total === 0);

  // ── 12. Get product by slug ───────────────────────────────────────────────
  console.log('\n12. GET /products/:slug — by slug');
  const bySlug = await req('GET', `/products/${sampleSlug}`);
  assert('returns 200',             bySlug.status === 200);
  assert('correct slug',            bySlug.data?.slug === sampleSlug);
  assert('has description field',   'description' in bySlug.data);
  assert('has specifications field','specifications' in bySlug.data);
  assert('has inventory',           bySlug.data?.inventory?.quantity !== undefined);
  assert('has category',            bySlug.data?.category?.name !== undefined);

  // ── 13. Get product — not found ───────────────────────────────────────────
  console.log('\n13. GET /products/nonexistent-slug-xyz');
  const notFound = await req('GET', '/products/nonexistent-slug-xyz');
  assert('returns 404',    notFound.status === 404);
  assert('success: false', notFound.success === false);

  // ── 14. Admin: Create product ─────────────────────────────────────────────
  console.log('\n14. POST /products — admin create');

  // Get the aftermarket category ID first
  const catRes = await req('GET', '/products/category/aftermarket?limit=1');
  const categoryId = catRes.data[0]?.category?.id;

  const created = await req('POST', '/products', {
    title:           'Test Brake Pad for Maruti Swift 2023',
    brand:           'Bosch',
    categoryId,
    price:           1299,
    mrp:             1599,
    discountPercent: 18,
    images:          ['/product-images/test/brake-pad.jpg'],
    description:     'High-performance ceramic brake pad.',
  }, adminToken);

  assert('returns 201',             created.status === 201);
  assert('success: true',           created.success === true);
  assert('title matches',           created.data?.title === 'Test Brake Pad for Maruti Swift 2023');
  assert('slug generated',          typeof created.data?.slug === 'string' && created.data.slug.length > 0);
  assert('price stored correctly',  Number(created.data?.price) === 1299);
  assert('discount stored',         created.data?.discountPercent === 18);
  assert('inventory created',       created.data?.inventory?.quantity === 0);
  createdProductId = created.data?.id;

  // ── 15. Admin: Create — no auth ───────────────────────────────────────────
  console.log('\n15. POST /products — no auth (401 expected)');
  const noAuth = await req('POST', '/products', { title: 'X', price: 1, mrp: 1, categoryId });
  assert('returns 401', noAuth.status === 401);

  // ── 16. Admin: Create — missing required fields ───────────────────────────
  console.log('\n16. POST /products — missing fields (422 expected)');
  const badCreate = await req('POST', '/products', { title: 'Only title' }, adminToken);
  assert('returns 422',         badCreate.status === 422);
  assert('validation details',  Array.isArray(badCreate.details));

  // ── 17. Admin: Update product ─────────────────────────────────────────────
  console.log('\n17. PUT /products/:id — admin update');
  const updated = await req('PUT', `/products/${createdProductId}`,
    { price: 1199, description: 'Updated description.' }, adminToken);
  assert('returns 200',              updated.status === 200);
  assert('price updated',            Number(updated.data?.price) === 1199);
  assert('description updated',      updated.data?.description === 'Updated description.');
  assert('slug unchanged (no title change)', updated.data?.slug === created.data?.slug);

  // ── 18. Admin: Update with new title regenerates slug ────────────────────
  console.log('\n18. PUT /products/:id — title change regenerates slug');
  const reslug = await req('PUT', `/products/${createdProductId}`,
    { title: 'Completely New Title For This Brake Pad' }, adminToken);
  assert('returns 200',       reslug.status === 200);
  assert('slug regenerated',  reslug.data?.slug !== created.data?.slug);
  assert('new slug has title',reslug.data?.slug.includes('completely-new-title'));

  // ── 19. Admin: Update — not found ─────────────────────────────────────────
  console.log('\n19. PUT /products/:id — bad ID (404 expected)');
  const badUpdate = await req('PUT', '/products/00000000-0000-0000-0000-000000000000',
    { price: 99 }, adminToken);
  assert('returns 404', badUpdate.status === 404);

  // ── 20. Get by UUID ───────────────────────────────────────────────────────
  console.log('\n20. GET /products/:id — fetch by UUID');
  const byId = await req('GET', `/products/${createdProductId}`);
  assert('returns 200',       byId.status === 200);
  assert('correct product',   byId.data?.id === createdProductId);

  // ── 21. Admin: Soft-delete ────────────────────────────────────────────────
  console.log('\n21. DELETE /products/:id — soft delete');
  const del = await req('DELETE', `/products/${createdProductId}`, null, adminToken);
  assert('returns 200',    del.status === 200);
  assert('success: true',  del.success === true);

  // Verify deleted product is hidden from public list
  const afterDel = await req('GET', `/products/${createdProductId}`);
  assert('deleted product returns 404', afterDel.status === 404);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────────────────────');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('─────────────────────────────────────────────────────────────────\n');

  if (failed > 0) process.exit(1);
}

server = http.createServer(app);
server.listen(PORT, async () => {
  try {
    await runTests();
  } catch (err) {
    console.error('\nUnexpected test error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});
