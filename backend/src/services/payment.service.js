const crypto   = require('crypto');
const Razorpay = require('razorpay');
const prisma   = require('../config/db');

// ─── Razorpay client (lazy-initialised so tests without credentials don't crash) ─

let _razorpay = null;

function getRazorpay() {
  if (!_razorpay) {
    const keyId     = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      const err = new Error('Razorpay credentials are not configured.');
      err.status = 503;
      throw err;
    }
    _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return _razorpay;
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Initiate a payment for an existing pending order.
 *
 * Steps:
 *  1. Verify the order belongs to the requesting user and is in 'pending' status
 *  2. Check if a pending Payment row already exists (idempotent retry)
 *  3. Create a Razorpay order (amount in paise)
 *  4. Upsert Payment row with gatewayOrderId
 *  5. Return { razorpayOrderId, amount, currency, keyId } to the client
 */
async function initiate(userId, orderId) {
  const order = await prisma.order.findFirst({
    where:  { id: orderId, userId },
    select: { id: true, status: true, totalAmount: true, payment: true },
  });

  if (!order) {
    const err = new Error('Order not found.');
    err.status = 404;
    throw err;
  }

  if (order.status !== 'pending') {
    const err = new Error(
      `Payment can only be initiated for pending orders. ` +
      `Current status: '${order.status}'.`
    );
    err.status = 422;
    throw err;
  }

  // Idempotency: if we already have a pending payment with a gateway order id, reuse it
  if (order.payment?.gatewayOrderId && order.payment.status === 'pending') {
    return {
      razorpayOrderId: order.payment.gatewayOrderId,
      amount:          Number(order.totalAmount),
      currency:        'INR',
      keyId:           process.env.RAZORPAY_KEY_ID,
    };
  }

  // Amount in paise (Razorpay requires integer paise)
  const amountInPaise = Math.round(Number(order.totalAmount) * 100);

  const razorpay = getRazorpay();
  const rzpOrder = await razorpay.orders.create({
    amount:   amountInPaise,
    currency: 'INR',
    receipt:  orderId,
  });

  // Upsert the Payment row
  await prisma.payment.upsert({
    where:  { orderId },
    create: {
      orderId,
      gateway:        'razorpay',
      gatewayOrderId: rzpOrder.id,
      amount:         order.totalAmount,
      currency:       'INR',
      status:         'pending',
    },
    update: {
      gatewayOrderId: rzpOrder.id,
      status:         'pending',
    },
  });

  return {
    razorpayOrderId: rzpOrder.id,
    amount:          Number(order.totalAmount),
    currency:        'INR',
    keyId:           process.env.RAZORPAY_KEY_ID,
  };
}

/**
 * Verify the Razorpay payment signature after the client completes payment.
 *
 * Steps:
 *  1. Reconstruct HMAC-SHA256: hmac(razorpay_order_id + '|' + razorpay_payment_id, secret)
 *  2. Compare with provided signature using crypto.timingSafeEqual (no timing attacks)
 *  3. On match: update Payment (status=captured, gatewayPaymentId, paidAt) + Order (confirmed)
 *  4. On mismatch: return 400 — do NOT confirm the order
 */
async function verify(userId, { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    const err = new Error('Razorpay credentials are not configured.');
    err.status = 503;
    throw err;
  }

  // 1 — Verify the order belongs to this user and has a payment record
  const payment = await prisma.payment.findUnique({
    where:  { orderId },
    select: { id: true, status: true, gatewayOrderId: true, order: { select: { userId: true, status: true } } },
  });

  if (!payment || payment.order.userId !== userId) {
    const err = new Error('Payment record not found.');
    err.status = 404;
    throw err;
  }

  if (payment.status === 'captured') {
    // Already verified — idempotent
    const order = await prisma.order.findUnique({
      where:  { id: orderId },
      select: { id: true, status: true, totalAmount: true },
    });
    return { orderId, status: 'captured', orderStatus: order.status };
  }

  // 2 — HMAC signature check
  const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected  = crypto.createHmac('sha256', keySecret).update(body).digest('hex');

  const expectedBuf = Buffer.from(expected,           'hex');
  const actualBuf   = Buffer.from(razorpay_signature, 'hex');

  const signaturesMatch =
    expectedBuf.length === actualBuf.length &&
    crypto.timingSafeEqual(expectedBuf, actualBuf);

  if (!signaturesMatch) {
    const err = new Error('Payment signature verification failed. Payment not confirmed.');
    err.status = 400;
    throw err;
  }

  // 3 — Update Payment + Order atomically
  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: {
        status:           'captured',
        gatewayPaymentId: razorpay_payment_id,
        gatewaySignature: razorpay_signature,
        paidAt:           new Date(),
      },
    }),
    prisma.order.update({
      where: { id: orderId },
      data:  { status: 'confirmed' },
    }),
  ]);

  return { orderId, status: 'captured', orderStatus: 'confirmed' };
}

/**
 * Handle Razorpay async webhook events.
 *
 * The raw body is required for signature validation (set up in app.js before express.json()).
 * Always resolves (never throws) — caller must return 200 to Razorpay regardless.
 *
 * Handled events: payment.captured, payment.failed, refund.processed
 */
async function handleWebhook(rawBody, signature) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // If no webhook secret configured, skip signature validation (dev/test mode)
  if (webhookSecret) {
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuf = Buffer.from(expected,  'utf8');
    const actualBuf   = Buffer.from(signature, 'utf8');

    if (
      expectedBuf.length !== actualBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, actualBuf)
    ) {
      // Invalid signature — ignore silently (still return 200 to Razorpay)
      return { processed: false, reason: 'invalid_signature' };
    }
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString());
  } catch {
    return { processed: false, reason: 'invalid_json' };
  }

  const eventType = event.event;
  const payload   = event.payload?.payment?.entity ?? event.payload?.refund?.entity;

  if (!payload) return { processed: false, reason: 'no_payload' };

  try {
    if (eventType === 'payment.captured') {
      // Find payment by gateway order id
      const payment = await prisma.payment.findFirst({
        where: { gatewayOrderId: payload.order_id },
      });
      if (payment && payment.status !== 'captured') {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              status:           'captured',
              gatewayPaymentId: payload.id,
              paidAt:           new Date(payload.created_at * 1000),
            },
          }),
          prisma.order.update({
            where: { id: payment.orderId },
            data:  { status: 'confirmed' },
          }),
        ]);
      }

    } else if (eventType === 'payment.failed') {
      const payment = await prisma.payment.findFirst({
        where: { gatewayOrderId: payload.order_id },
      });
      if (payment && payment.status === 'pending') {
        await prisma.payment.update({
          where: { id: payment.id },
          data:  { status: 'failed' },
        });
      }

    } else if (eventType === 'refund.processed') {
      const payment = await prisma.payment.findFirst({
        where: { gatewayPaymentId: payload.payment_id },
      });
      if (payment) {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data:  { status: 'refunded' },
          }),
          prisma.order.update({
            where: { id: payment.orderId },
            data:  { status: 'refunded' },
          }),
        ]);
      }
    }
  } catch {
    // Log but do not throw — always return 200 to Razorpay
    return { processed: false, reason: 'db_error' };
  }

  return { processed: true, event: eventType };
}

module.exports = { initiate, verify, handleWebhook };
