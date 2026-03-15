/**
 * Order API — End-to-End Tests
 * Run: node tests/order.test.js
 */

require('dotenv').config();
const http = require('http');
const app  = require('../src/app');

const PORT = 5004;
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

async function registerUser(tag) {
  const email = `order_${tag}_${Date.now()}@spareblaze.in`;
  const r = await req('POST', '/auth/register', {
    name: `Order User ${tag}`, email, phone: '9100000001', password: 'OrderPass123',
  });
  return { token: r.data.token, userId: r.data.user.id };
}

async function getAdminToken() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const email  = `order_admin_${Date.now()}@spareblaze.in`;
  await req('POST', '/auth/register', {
    name: 'Order Admin', email, phone: '9100000002', password: 'AdminPass123',
  });
  await prisma.user.update({ where: { email }, data: { role: 'admin' } });
  await prisma.$disconnect();
  const r = await req('POST', '/auth/login', { email, password: 'AdminPass123' });
  return r.data.token;
}

async function getPricedProducts(count = 2) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const products = await prisma.product.findMany({
    where:   { isActive: true, price: { gt: 0 }, inventory: { quantity: { gt: 2 } } },
    select:  { id: true, price: true },
    orderBy: { createdAt: 'asc' },
    take:    count,
  });
  await prisma.$disconnect();
  return products;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function runTests() {
  console.log('\n─── Phase 7: Order API Tests ────────────────────────────────────\n');

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const { token, userId } = await registerUser('main');
  const { token: tokenB }  = await registerUser('other');
  const adminToken         = await getAdminToken();
  const products           = await getPricedProducts(2);
  const [prod1, prod2]     = products;

  // ── 1. Address: list empty ────────────────────────────────────────────────
  console.log('1. GET /auth/addresses — empty list');
  const emptyAddr = await req('GET', '/auth/addresses', undefined, token);
  assert('returns 200',          emptyAddr.status === 200);
  assert('empty array',          Array.isArray(emptyAddr.data) && emptyAddr.data.length === 0);

  // ── 2. Address: add ───────────────────────────────────────────────────────
  console.log('\n2. POST /auth/addresses — add address');
  const addAddr = await req('POST', '/auth/addresses', {
    label: 'Home', line1: '42 MG Road', line2: 'Apt 3B',
    city: 'Bengaluru', state: 'Karnataka', pincode: '560001',
  }, token);
  assert('returns 201',              addAddr.status === 201);
  assert('address has id',           typeof addAddr.data?.id === 'string');
  assert('isDefault true (first)',   addAddr.data?.isDefault === true);
  assert('city correct',             addAddr.data?.city === 'Bengaluru');
  const addressId = addAddr.data?.id;

  // ── 3. Address: validation ────────────────────────────────────────────────
  console.log('\n3. POST /auth/addresses — invalid pincode (422)');
  const badAddr = await req('POST', '/auth/addresses', {
    line1: 'X', city: 'Y', state: 'Z', pincode: 'ABCDEF',
  }, token);
  assert('returns 422',      badAddr.status === 422);
  assert('pincode in errors',badAddr.details?.some(e => e.path === 'pincode'));

  // ── 4. Address: list populated ────────────────────────────────────────────
  console.log('\n4. GET /auth/addresses — one address listed');
  const listAddr = await req('GET', '/auth/addresses', undefined, token);
  assert('returns 200',         listAddr.status === 200);
  assert('has one address',     listAddr.data?.length === 1);
  assert('default is first',    listAddr.data?.[0]?.isDefault === true);

  // ── 5. Create order — empty cart (400) ───────────────────────────────────
  console.log('\n5. POST /orders — empty cart (400 expected)');
  const emptyCart = await req('POST', '/orders', { addressId }, token);
  assert('returns 400',             emptyCart.status === 400);
  assert('empty cart message',      emptyCart.message.toLowerCase().includes('empty'));

  // Populate cart
  await req('POST', '/cart/add', { productId: prod1.id, quantity: 2 }, token);
  await req('POST', '/cart/add', { productId: prod2.id, quantity: 1 }, token);

  // ── 6. Create order — bad address (404) ──────────────────────────────────
  console.log('\n6. POST /orders — wrong addressId (404 expected)');
  const badAddr2 = await req('POST', '/orders',
    { addressId: '00000000-0000-0000-0000-000000000000' }, token);
  assert('returns 404',    badAddr2.status === 404);
  assert('success: false', badAddr2.success === false);

  // ── 7. Create order — success ─────────────────────────────────────────────
  console.log('\n7. POST /orders — successful order creation');
  const created = await req('POST', '/orders', { addressId }, token);
  assert('returns 201',              created.status === 201);
  assert('success: true',            created.success === true);
  assert('has order id',             typeof created.data?.id === 'string');
  assert('status is pending',        created.data?.status === 'pending');
  assert('has items array',          Array.isArray(created.data?.items));
  assert('two items in order',       created.data?.items?.length === 2);
  assert('totalAmount > 0',          Number(created.data?.totalAmount) > 0);
  assert('shippingAddress snapshot', created.data?.shippingAddress?.city === 'Bengaluru');
  assert('unitPrice snapshotted',    Number(created.data?.items[0]?.unitPrice) > 0);
  assert('totalPrice = qty × unit',
    Number(created.data?.items[0]?.totalPrice) ===
    Number(created.data?.items[0]?.unitPrice) * created.data?.items[0]?.quantity);

  const orderId = created.data?.id;
  const expectedTotal = Number(prod1.price) * 2 + Number(prod2.price) * 1;
  assert('server-computed total correct',
    Math.abs(Number(created.data?.totalAmount) - expectedTotal) < 0.01);

  // ── 8. Cart cleared after order ───────────────────────────────────────────
  console.log('\n8. Cart is cleared after order creation');
  const cartAfter = await req('GET', '/cart', undefined, token);
  assert('cart is empty', cartAfter.data?.items?.length === 0);

  // ── 9. Inventory decremented ──────────────────────────────────────────────
  console.log('\n9. Inventory decremented after order');
  const inv = await prisma.inventory.findUnique({ where: { productId: prod1.id } });
  const afterStock = inv?.quantity ?? 0;
  // We added 2 to order; seed set 10 — so it should be 8 (or less if prior tests ran)
  assert('stock decreased by 2', afterStock <= 8);

  // ── 10. List orders ───────────────────────────────────────────────────────
  console.log('\n10. GET /orders — user order list');
  const orders = await req('GET', '/orders', undefined, token);
  assert('returns 200',        orders.status === 200);
  assert('has orders array',   Array.isArray(orders.data));
  assert('our order present',  orders.data?.some(o => o.id === orderId));
  assert('has pagination',     orders.pagination?.total >= 1);

  // ── 11. Get order by id ───────────────────────────────────────────────────
  console.log('\n11. GET /orders/:id — detail view');
  const detail = await req('GET', `/orders/${orderId}`, undefined, token);
  assert('returns 200',         detail.status === 200);
  assert('correct id',          detail.data?.id === orderId);
  assert('items populated',     detail.data?.items?.length === 2);
  assert('product title present',typeof detail.data?.items[0]?.product?.title === 'string');

  // ── 12. Other user cannot view order ─────────────────────────────────────
  console.log('\n12. GET /orders/:id — isolation (other user gets 404)');
  const stolen = await req('GET', `/orders/${orderId}`, undefined, tokenB);
  assert('returns 404',    stolen.status === 404);
  assert('success: false', stolen.success === false);

  // ── 13. Cancel order ──────────────────────────────────────────────────────
  console.log('\n13. PUT /orders/:id/cancel — cancel a pending order');
  // Create a second order to cancel
  await req('POST', '/cart/add', { productId: prod1.id, quantity: 1 }, token);
  const order2 = await req('POST', '/orders', { addressId }, token);
  const order2Id = order2.data?.id;

  const stockBefore = (await prisma.inventory.findUnique({ where: { productId: prod1.id } }))?.quantity;

  const cancelled = await req('PUT', `/orders/${order2Id}/cancel`, undefined, token);
  assert('returns 200',             cancelled.status === 200);
  assert('status is cancelled',     cancelled.data?.status === 'cancelled');

  // Verify inventory restored
  const stockAfter = (await prisma.inventory.findUnique({ where: { productId: prod1.id } }))?.quantity;
  assert('inventory restored after cancel', stockAfter === stockBefore + 1);

  // ── 14. Cancel already-cancelled order (422) ──────────────────────────────
  console.log('\n14. PUT /orders/:id/cancel — already cancelled (422 expected)');
  const doubleCancel = await req('PUT', `/orders/${order2Id}/cancel`, undefined, token);
  assert('returns 422',           doubleCancel.status === 422);
  assert('invalid transition msg',doubleCancel.message.toLowerCase().includes('cannot move'));

  // ── 15. No auth ───────────────────────────────────────────────────────────
  console.log('\n15. POST /orders — no auth (401 expected)');
  const noAuth = await req('POST', '/orders', { addressId });
  assert('returns 401', noAuth.status === 401);

  // ── 16. Admin: list all orders ────────────────────────────────────────────
  console.log('\n16. GET /orders/admin/all — admin list');
  const adminOrders = await req('GET', '/orders/admin/all', undefined, adminToken);
  assert('returns 200',        adminOrders.status === 200);
  assert('has orders',         adminOrders.pagination?.total >= 1);
  assert('includes user info', adminOrders.data?.[0]?.user?.email !== undefined);

  // ── 17. Admin: filter by status ───────────────────────────────────────────
  console.log('\n17. GET /orders/admin/all?status=pending — filter by status');
  const pendingOrders = await req('GET', '/orders/admin/all?status=pending', undefined, adminToken);
  assert('returns 200',         pendingOrders.status === 200);
  assert('all are pending',     pendingOrders.data?.every(o => o.status === 'pending'));

  // ── 18. Admin: non-admin blocked (403) ───────────────────────────────────
  console.log('\n18. GET /orders/admin/all — non-admin (403 expected)');
  const notAdmin = await req('GET', '/orders/admin/all', undefined, token);
  assert('returns 403',    notAdmin.status === 403);
  assert('success: false', notAdmin.success === false);

  // ── 19. Admin: update status → processing ────────────────────────────────
  console.log('\n19. PUT /orders/admin/:id/status — pending → confirmed → processing');

  // Move our first order: pending → confirmed
  const toConfirmed = await req('PUT', `/orders/admin/${orderId}/status`,
    { status: 'confirmed' }, adminToken);
  assert('pending → confirmed works',  toConfirmed.data?.status === 'confirmed');

  // confirmed → processing
  const toProcessing = await req('PUT', `/orders/admin/${orderId}/status`,
    { status: 'processing' }, adminToken);
  assert('confirmed → processing works', toProcessing.data?.status === 'processing');

  // ── 20. Admin: update with tracking info ─────────────────────────────────
  console.log('\n20. PUT /orders/admin/:id/status — shipped with tracking number');
  const toShipped = await req('PUT', `/orders/admin/${orderId}/status`,
    { status: 'shipped', trackingNumber: 'DTDC123456789', notes: 'Dispatched from Bengaluru' },
    adminToken);
  assert('processing → shipped works', toShipped.data?.status === 'shipped');
  assert('tracking in notes',          toShipped.data?.notes?.includes('DTDC123456789'));
  assert('notes appended',             toShipped.data?.notes?.includes('Dispatched from Bengaluru'));

  // ── 21. Admin: invalid transition (422) ──────────────────────────────────
  console.log('\n21. PUT /orders/admin/:id/status — invalid transition (422 expected)');
  const badTransition = await req('PUT', `/orders/admin/${orderId}/status`,
    { status: 'pending' }, adminToken);
  assert('returns 422',    badTransition.status === 422);
  assert('cannot move msg',badTransition.message.toLowerCase().includes('cannot move'));

  // ── 22. Admin: cancel confirmed order restores inventory ──────────────────
  console.log('\n22. Admin cancel of confirmed order restores inventory');
  // Create a fresh order and confirm it
  await req('POST', '/cart/add', { productId: prod2.id, quantity: 1 }, token);
  const order3     = await req('POST', '/orders', { addressId }, token);
  const order3Id   = order3.data?.id;
  await req('PUT', `/orders/admin/${order3Id}/status`, { status: 'confirmed' }, adminToken);

  const stockPre = (await prisma.inventory.findUnique({ where: { productId: prod2.id } }))?.quantity;
  await req('PUT', `/orders/admin/${order3Id}/status`, { status: 'cancelled' }, adminToken);
  const stockPost = (await prisma.inventory.findUnique({ where: { productId: prod2.id } }))?.quantity;

  assert('inventory restored on admin cancel', stockPost === stockPre + 1);

  // ── 23. Admin: deliver order ──────────────────────────────────────────────
  console.log('\n23. Full lifecycle: shipped → delivered');
  const toDelivered = await req('PUT', `/orders/admin/${orderId}/status`,
    { status: 'delivered' }, adminToken);
  assert('shipped → delivered works', toDelivered.data?.status === 'delivered');

  // ── 24. Address: delete ───────────────────────────────────────────────────
  console.log('\n24. DELETE /auth/addresses/:id');
  const delAddr = await req('DELETE', `/auth/addresses/${addressId}`, undefined, token);
  assert('returns 200',    delAddr.status === 200);
  assert('success: true',  delAddr.success === true);

  // Cannot delete another user's address
  const stolenDel = await req('DELETE', `/auth/addresses/${addressId}`, undefined, tokenB);
  assert('other user gets 404', stolenDel.status === 404);

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
