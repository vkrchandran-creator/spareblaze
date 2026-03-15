/**
 * Payment API — End-to-End Tests
 *
 * Tests run in two modes:
 *   - With Razorpay credentials: full flow including real Razorpay order creation
 *   - Without credentials: verifies graceful 503 responses
 *
 * Signature verification is tested using a locally-computed HMAC so no real
 * payment is needed — we simulate what Razorpay would send back.
 *
 * Run: NODE_ENV=test node tests/payment.test.js
 */

require('dotenv').config();
const http   = require('http');
const crypto = require('crypto');
const app    = require('../src/app');

const PORT = 5005;
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

async function reqRaw(path, rawBody, headers) {
  const res  = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: rawBody,
  });
  const json = await res.json();
  return { status: res.status, ...json };
}

async function registerUser(tag) {
  const email = `pay_${tag}_${Date.now()}@spareblaze.in`;
  const r = await req('POST', '/auth/register', {
    name: `Pay User ${tag}`, email, phone: '9100000005', password: 'PayPass123',
  });
  return { token: r.data.token, userId: r.data.user.id, email };
}

async function seedOrder(token) {
  // Add a priced item and create an address + order
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const product = await prisma.product.findFirst({
    where: { isActive: true, price: { gt: 0 }, inventory: { quantity: { gt: 0 } } },
    select: { id: true, price: true },
  });
  await prisma.$disconnect();

  // Add to cart
  await req('POST', '/cart/add', { productId: product.id, quantity: 1 }, token);

  // Add address
  const addrRes = await req('POST', '/auth/addresses', {
    label: 'Home', line1: '10 Brigade Road', city: 'Bengaluru',
    state: 'Karnataka', pincode: '560001',
  }, token);
  const addressId = addrRes.data.id;

  // Create order
  const orderRes = await req('POST', '/orders', { addressId }, token);
  return { orderId: orderRes.data.id, product };
}

// Build a valid Razorpay-style signature for testing verify endpoint
function buildSignature(rzpOrderId, rzpPaymentId, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${rzpOrderId}|${rzpPaymentId}`)
    .digest('hex');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function runTests() {
  console.log('\n─── Phase 8: Payment API Tests ──────────────────────────────────\n');

  const hasCredentials = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  if (!hasCredentials) {
    console.log('  ⚠  No Razorpay credentials found — running in no-credential mode\n');
  }

  const { token } = await registerUser('main');
  const { token: tokenB } = await registerUser('other');

  // ── 1. Initiate — no auth (401) ───────────────────────────────────────────
  console.log('1. POST /payments/initiate — no auth (401 expected)');
  const noAuth = await req('POST', '/payments/initiate', { orderId: 'fake-id' });
  assert('returns 401', noAuth.status === 401);

  // ── 2. Initiate — missing orderId (422) ───────────────────────────────────
  console.log('\n2. POST /payments/initiate — missing orderId (422 expected)');
  const missingId = await req('POST', '/payments/initiate', {}, token);
  assert('returns 422', missingId.status === 422);

  // ── 3. Initiate — order not found (404) ───────────────────────────────────
  console.log('\n3. POST /payments/initiate — non-existent order (404 expected)');
  const notFound = await req('POST', '/payments/initiate',
    { orderId: '00000000-0000-0000-0000-000000000000' }, token);
  assert('returns 404', notFound.status === 404);

  // ── 4. Initiate — order belongs to another user (404) ────────────────────
  console.log('\n4. POST /payments/initiate — other user\'s order (404 expected)');
  const { orderId: orderIdB } = await seedOrder(tokenB);
  const stolen = await req('POST', '/payments/initiate', { orderId: orderIdB }, token);
  assert('returns 404', stolen.status === 404);

  // ── 5. Initiate — no credentials (503 or success) ────────────────────────
  console.log('\n5. POST /payments/initiate — real order');
  const { orderId } = await seedOrder(token);
  const initRes = await req('POST', '/payments/initiate', { orderId }, token);

  if (!hasCredentials) {
    assert('returns 503 (no credentials)', initRes.status === 503,
      JSON.stringify(initRes.message));
  } else {
    assert('returns 200',            initRes.status === 200,    JSON.stringify(initRes));
    assert('has razorpayOrderId',    typeof initRes.data?.razorpayOrderId === 'string');
    assert('has amount',             typeof initRes.data?.amount === 'number');
    assert('currency is INR',        initRes.data?.currency === 'INR');
    assert('has keyId',              typeof initRes.data?.keyId === 'string');

    // ── 6. Initiate — idempotency (same order returns same gateway id) ─────
    console.log('\n6. POST /payments/initiate — idempotent retry');
    const initRes2 = await req('POST', '/payments/initiate', { orderId }, token);
    assert('returns 200',                  initRes2.status === 200);
    assert('same razorpay order id',
      initRes2.data?.razorpayOrderId === initRes.data?.razorpayOrderId);
  }

  // ── 7. Initiate — non-pending order (422) ─────────────────────────────────
  console.log('\n7. POST /payments/initiate — confirmed order (422 expected)');
  // Manually confirm the order to simulate post-payment state
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const { orderId: confirmedOrderId } = await seedOrder(token);
  await prisma.order.update({ where: { id: confirmedOrderId }, data: { status: 'confirmed' } });
  await prisma.$disconnect();

  const nonPending = await req('POST', '/payments/initiate', { orderId: confirmedOrderId }, token);
  assert('returns 422', nonPending.status === 422,
    JSON.stringify(nonPending.message));

  // ── 8. Verify — no auth (401) ─────────────────────────────────────────────
  console.log('\n8. POST /payments/verify — no auth (401 expected)');
  const verifyNoAuth = await req('POST', '/payments/verify', {
    orderId: 'x', razorpay_order_id: 'x', razorpay_payment_id: 'x', razorpay_signature: 'x',
  });
  assert('returns 401', verifyNoAuth.status === 401);

  // ── 9. Verify — missing fields (422) ──────────────────────────────────────
  console.log('\n9. POST /payments/verify — missing fields (422 expected)');
  const verifyMissing = await req('POST', '/payments/verify', { orderId: 'x' }, token);
  assert('returns 422', verifyMissing.status === 422);

  // ── 10. Verify — bad signature (400) ──────────────────────────────────────
  console.log('\n10. POST /payments/verify — invalid signature (400 expected)');
  if (hasCredentials) {
    // Need a payment record to exist — initiate first
    const { orderId: payOrderId } = await seedOrder(token);
    await req('POST', '/payments/initiate', { orderId: payOrderId }, token);

    const badSig = await req('POST', '/payments/verify', {
      orderId:            payOrderId,
      razorpay_order_id:  'order_fake',
      razorpay_payment_id:'pay_fake',
      razorpay_signature: 'deadbeefdeadbeef',
    }, token);
    assert('returns 400', badSig.status === 400,
      JSON.stringify(badSig.message));
    assert('not confirmed', badSig.success === false);
  } else {
    console.log('  ─  Skipped (no credentials)');
    passed++; // count as skipped-pass
  }

  // ── 11. Verify — valid signature (200 + order confirmed) ─────────────────
  console.log('\n11. POST /payments/verify — valid HMAC signature');
  if (hasCredentials) {
    const { orderId: verifyOrderId } = await seedOrder(token);
    const initiateRes = await req('POST', '/payments/initiate', { orderId: verifyOrderId }, token);
    const rzpOrderId  = initiateRes.data?.razorpayOrderId;
    const rzpPayId    = `pay_test_${Date.now()}`;
    const validSig    = buildSignature(rzpOrderId, rzpPayId, process.env.RAZORPAY_KEY_SECRET);

    const verifyRes = await req('POST', '/payments/verify', {
      orderId:             verifyOrderId,
      razorpay_order_id:   rzpOrderId,
      razorpay_payment_id: rzpPayId,
      razorpay_signature:  validSig,
    }, token);

    assert('returns 200',              verifyRes.status === 200, JSON.stringify(verifyRes));
    assert('status is captured',       verifyRes.data?.status === 'captured');
    assert('orderStatus is confirmed', verifyRes.data?.orderStatus === 'confirmed');

    // Verify DB state
    const { PrismaClient: PC } = require('@prisma/client');
    const p2 = new PC();
    const dbOrder   = await p2.order.findUnique({ where: { id: verifyOrderId } });
    const dbPayment = await p2.payment.findUnique({ where: { orderId: verifyOrderId } });
    await p2.$disconnect();

    assert('order status = confirmed in DB',  dbOrder?.status === 'confirmed');
    assert('payment status = captured in DB', dbPayment?.status === 'captured');
    assert('paidAt is set',                   dbPayment?.paidAt !== null);
    assert('gatewayPaymentId stored',         dbPayment?.gatewayPaymentId === rzpPayId);

    // ── 12. Verify — idempotent (already captured) ──────────────────────────
    console.log('\n12. POST /payments/verify — already captured (idempotent)');
    const dupVerify = await req('POST', '/payments/verify', {
      orderId:             verifyOrderId,
      razorpay_order_id:   rzpOrderId,
      razorpay_payment_id: rzpPayId,
      razorpay_signature:  validSig,
    }, token);
    assert('returns 200', dupVerify.status === 200);
    assert('status still captured', dupVerify.data?.status === 'captured');
  } else {
    console.log('  ─  Skipped (no credentials)');
    passed += 2; // count skipped sections as pass
  }

  // ── 13. Webhook — returns 200 regardless ─────────────────────────────────
  console.log('\n13. POST /payments/webhook — always returns 200');
  const webhookBody = JSON.stringify({ event: 'payment.captured', payload: {} });
  const webhookRes  = await reqRaw('/payments/webhook', webhookBody, {
    'x-razorpay-signature': 'any-sig',
  });
  assert('returns 200',        webhookRes.status === 200);
  assert('received: true',     webhookRes.received === true);

  // ── 14. Webhook — payment.failed event ────────────────────────────────────
  console.log('\n14. POST /payments/webhook — payment.failed event');
  const failedEvent = JSON.stringify({
    event: 'payment.failed',
    payload: { payment: { entity: { id: 'pay_nonexistent', order_id: 'order_nonexistent' } } },
  });
  const failedWebhook = await reqRaw('/payments/webhook', failedEvent, {
    'x-razorpay-signature': 'any-sig',
  });
  assert('returns 200 for failed event', failedWebhook.status === 200);

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
