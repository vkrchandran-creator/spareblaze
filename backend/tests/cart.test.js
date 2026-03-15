/**
 * Cart API — End-to-End Tests
 * Run: node tests/cart.test.js
 */

require('dotenv').config();
const http = require('http');
const app  = require('../src/app');

const PORT = 5003;
const BASE = `http://localhost:${PORT}/api/v1`;

let server;
let passed = 0;
let failed = 0;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}${detail ? `  →  ${detail}` : ''}`);
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
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json();
  return { status: res.status, ...json };
}

/** Register a fresh user and return their token + userId */
async function registerUser(suffix = '') {
  const email = `cartuser_${suffix}_${Date.now()}@spareblaze.in`;
  const res   = await req('POST', '/auth/register', {
    name: `Cart User ${suffix}`, email, phone: '9123456780', password: 'CartPass123',
  });
  return { token: res.data.token, userId: res.data.user.id, email };
}

/** Get a real priced product and a real OEM (no-price) product from the DB */
async function getSeedProducts() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const [priced, oosProduct] = await Promise.all([
    // A product with price > 0 and inventory > 0
    prisma.product.findFirst({
      where:   { isActive: true, price: { gt: 0 }, inventory: { quantity: { gt: 0 } } },
      select:  { id: true, title: true },
      orderBy: { createdAt: 'asc' },
    }),
    // A product we'll temporarily drain to 0 stock for OOS tests
    prisma.product.findFirst({
      where:   { isActive: true, price: { gt: 0 }, inventory: { quantity: { gt: 0 } } },
      select:  { id: true, title: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  await prisma.$disconnect();
  return { priced, oosProduct };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function runTests() {
  console.log('\n─── Phase 6: Cart API Tests ─────────────────────────────────────\n');

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const { token, userId } = await registerUser('A');
  const { token: tokenB }  = await registerUser('B');
  const { priced, oosProduct } = await getSeedProducts();

  // ── 1. Empty cart on new user ─────────────────────────────────────────────
  console.log('1. GET /cart — empty cart for new user');
  const empty = await req('GET', '/cart', undefined, token);
  assert('returns 200',            empty.status === 200);
  assert('success: true',          empty.success === true);
  assert('items is empty array',   Array.isArray(empty.data?.items) && empty.data.items.length === 0);
  assert('summary.totalItems = 0', empty.data?.summary?.totalItems === 0);
  assert('summary.totalAmount= 0', empty.data?.summary?.totalAmount === 0);
  assert('summary.itemCount = 0',  empty.data?.summary?.itemCount === 0);

  // ── 2. Add item to cart ───────────────────────────────────────────────────
  console.log('\n2. POST /cart/add — add 2 units of a product');
  const add1 = await req('POST', '/cart/add', { productId: priced.id, quantity: 2 }, token);
  assert('returns 200',             add1.status === 200);
  assert('success: true',           add1.success === true);
  assert('cart has 1 item',         add1.data?.items?.length === 1);
  assert('quantity is 2',           add1.data?.items[0]?.quantity === 2);
  assert('product title present',   add1.data?.items[0]?.product?.title === priced.title);
  assert('subtotal = price × qty',
    add1.data?.items[0]?.subtotal === add1.data?.items[0]?.product?.price * 2);
  assert('summary.totalItems = 2',  add1.data?.summary?.totalItems === 2);
  assert('summary.itemCount = 1',   add1.data?.summary?.itemCount === 1);
  assert('totalAmount > 0',         add1.data?.summary?.totalAmount > 0);
  assert('stockAvailable present',  add1.data?.items[0]?.stockAvailable >= 2);

  // ── 3. Add same item again — quantity increments ──────────────────────────
  console.log('\n3. POST /cart/add — add same product again (quantity should increment)');
  const add2 = await req('POST', '/cart/add', { productId: priced.id, quantity: 1 }, token);
  assert('returns 200',             add2.status === 200);
  assert('still 1 item in cart',    add2.data?.items?.length === 1);
  assert('quantity is now 3',       add2.data?.items[0]?.quantity === 3);
  assert('summary.totalItems = 3',  add2.data?.summary?.totalItems === 3);

  // ── 4. Add without auth ───────────────────────────────────────────────────
  console.log('\n4. POST /cart/add — no token (401 expected)');
  const noAuth = await req('POST', '/cart/add', { productId: priced.id, quantity: 1 });
  assert('returns 401',    noAuth.status === 401);
  assert('success: false', noAuth.success === false);

  // ── 5. Add validation errors ──────────────────────────────────────────────
  console.log('\n5. POST /cart/add — invalid body (422 expected)');
  const badAdd = await req('POST', '/cart/add', { productId: '', quantity: 0 }, token);
  assert('returns 422',         badAdd.status === 422);
  assert('has details',         Array.isArray(badAdd.details));

  // ── 6. Add nonexistent product ────────────────────────────────────────────
  console.log('\n6. POST /cart/add — nonexistent productId (404 expected)');
  const badProd = await req('POST', '/cart/add',
    { productId: '00000000-0000-0000-0000-000000000000', quantity: 1 }, token);
  assert('returns 404',    badProd.status === 404);
  assert('success: false', badProd.success === false);

  // ── 7. Out-of-stock validation ────────────────────────────────────────────
  console.log('\n7. POST /cart/add — out-of-stock product (400 expected)');
  // Temporarily set stock to 0 on oosProduct
  await prisma.inventory.update({
    where: { productId: oosProduct.id },
    data:  { quantity: 0 },
  });
  const oos = await req('POST', '/cart/add', { productId: oosProduct.id, quantity: 1 }, token);
  assert('returns 400',              oos.status === 400);
  assert('out-of-stock message',     oos.message.toLowerCase().includes('out of stock'));
  // Restore stock
  await prisma.inventory.update({ where: { productId: oosProduct.id }, data: { quantity: 5 } });

  // ── 8. Exceeds stock validation ───────────────────────────────────────────
  console.log('\n8. POST /cart/add — quantity exceeds stock (400 expected)');
  // Set stock to 2 for oosProduct
  await prisma.inventory.update({ where: { productId: oosProduct.id }, data: { quantity: 2 } });
  const overStock = await req('POST', '/cart/add', { productId: oosProduct.id, quantity: 99 }, token);
  assert('returns 400',          overStock.status === 400);
  assert('only X units message', overStock.message.toLowerCase().includes('only'));
  await prisma.inventory.update({ where: { productId: oosProduct.id }, data: { quantity: 10 } });

  // ── 9. Update quantity ────────────────────────────────────────────────────
  console.log('\n9. PUT /cart/update — set quantity to 5');
  const upd = await req('PUT', '/cart/update', { productId: priced.id, quantity: 5 }, token);
  assert('returns 200',             upd.status === 200);
  assert('quantity is now 5',       upd.data?.items[0]?.quantity === 5);
  assert('summary.totalItems = 5',  upd.data?.summary?.totalItems === 5);

  // ── 10. Update to 0 removes the item ─────────────────────────────────────
  console.log('\n10. PUT /cart/update — quantity=0 removes item');
  const updZero = await req('PUT', '/cart/update', { productId: priced.id, quantity: 0 }, token);
  assert('returns 200',          updZero.status === 200);
  assert('cart is now empty',    updZero.data?.items?.length === 0);
  assert('totalItems = 0',       updZero.data?.summary?.totalItems === 0);

  // ── 11. Update item not in cart ───────────────────────────────────────────
  console.log('\n11. PUT /cart/update — item not in cart (404 expected)');
  const updNotIn = await req('PUT', '/cart/update', { productId: priced.id, quantity: 1 }, token);
  assert('returns 404',    updNotIn.status === 404);
  assert('success: false', updNotIn.success === false);

  // ── 12. Remove item ───────────────────────────────────────────────────────
  console.log('\n12. DELETE /cart/remove/:productId');
  // Add first, then remove
  await req('POST', '/cart/add', { productId: priced.id, quantity: 2 }, token);
  const rmv = await req('DELETE', `/cart/remove/${priced.id}`, undefined, token);
  assert('returns 200',       rmv.status === 200);
  assert('cart is empty',     rmv.data?.items?.length === 0);

  // Remove again (idempotent — no error)
  const rmv2 = await req('DELETE', `/cart/remove/${priced.id}`, undefined, token);
  assert('remove is idempotent (200)', rmv2.status === 200);

  // ── 13. Clear cart ────────────────────────────────────────────────────────
  console.log('\n13. DELETE /cart/clear');
  await req('POST', '/cart/add', { productId: priced.id,   quantity: 1 }, token);
  await req('POST', '/cart/add', { productId: oosProduct.id, quantity: 2 }, token);
  const clr = await req('DELETE', '/cart/clear', undefined, token);
  assert('returns 200',       clr.status === 200);
  assert('items is empty',    clr.data?.items?.length === 0);
  assert('totalAmount = 0',   clr.data?.summary?.totalAmount === 0);

  // ── 14. Cart isolation between users ─────────────────────────────────────
  console.log('\n14. Cart isolation — users cannot see each other\'s carts');
  await req('POST', '/cart/add', { productId: priced.id, quantity: 1 }, token);
  const cartB = await req('GET', '/cart', undefined, tokenB);
  assert('user B sees empty cart', cartB.data?.items?.length === 0);

  // ── 15. GET /cart — full shape check ─────────────────────────────────────
  console.log('\n15. GET /cart — verify full response shape');
  const full = await req('GET', '/cart', undefined, token);
  const item = full.data?.items?.[0];
  assert('has cartItemId',         typeof item?.cartItemId === 'string');
  assert('has quantity',           typeof item?.quantity === 'number');
  assert('has subtotal',           typeof item?.subtotal === 'number');
  assert('has stockAvailable',     typeof item?.stockAvailable === 'number');
  assert('has unavailable flag',   typeof item?.unavailable === 'boolean');
  assert('product.id present',     typeof item?.product?.id === 'string');
  assert('product.price is number',typeof item?.product?.price === 'number');
  assert('product.mrp is number',  typeof item?.product?.mrp === 'number');
  assert('product.images is array',Array.isArray(item?.product?.images));
  assert('summary shape correct',
    typeof full.data?.summary?.totalItems === 'number' &&
    typeof full.data?.summary?.totalAmount === 'number' &&
    typeof full.data?.summary?.itemCount === 'number');

  // ── 16. Merge guest cart ──────────────────────────────────────────────────
  console.log('\n16. POST /cart/merge — merge guest cart on login');
  const { token: tokenC } = await registerUser('C');

  // Pre-populate DB cart with 1 unit of priced product
  await req('POST', '/cart/add', { productId: priced.id, quantity: 1 }, tokenC);

  // Guest cart has 2 units of priced (should keep higher: 2) + oosProduct (new item)
  const merged = await req('POST', '/cart/merge', {
    items: [
      { productId: priced.id,     quantity: 2 },
      { productId: oosProduct.id, quantity: 1 },
    ],
  }, tokenC);

  assert('returns 200',                merged.status === 200);
  assert('has skipped array',          Array.isArray(merged.data?.skipped));
  const mergedPriced = merged.data?.items?.find(i => i.product.id === priced.id);
  assert('kept higher quantity (2)',    mergedPriced?.quantity === 2);
  assert('new item added from guest',
    merged.data?.items?.some(i => i.product.id === oosProduct.id));

  // ── 17. Merge skips invalid productIds ───────────────────────────────────
  console.log('\n17. POST /cart/merge — invalid items are skipped, not rejected');
  const { token: tokenD } = await registerUser('D');
  const mergedBad = await req('POST', '/cart/merge', {
    items: [
      { productId: '00000000-0000-0000-0000-000000000000', quantity: 1 },
      { productId: priced.id, quantity: 1 },
    ],
  }, tokenD);
  assert('returns 200',         mergedBad.status === 200);
  assert('bad item is skipped', mergedBad.data?.skipped?.length === 1);
  assert('valid item added',    mergedBad.data?.items?.some(i => i.product.id === priced.id));

  // ── Summary ───────────────────────────────────────────────────────────────
  await prisma.$disconnect();

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
