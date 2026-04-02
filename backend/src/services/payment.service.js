const crypto = require('crypto');

// ─── In-memory order store ────────────────────────────────────────────────────
// Holds full order details (cart items, address, etc.) keyed by txnid.
// Retrieved on PayU success callback to populate the confirmation email.
// TODO Phase 5/6: replace with a DB-persisted Order record.
const pendingOrders = new Map();

// Prune entries older than 2 hours to prevent unbounded memory growth.
setInterval(() => {
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  for (const [key, val] of pendingOrders) {
    if (val.createdAt < cutoff) pendingOrders.delete(key);
  }
}, 30 * 60 * 1000); // run every 30 min

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPayUCredentials() {
  const key  = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_MERCHANT_SALT;
  if (!key || !salt) {
    const err = new Error('PayU credentials are not configured.');
    err.status = 503;
    throw err;
  }
  return { key, salt };
}

function computeSHA512(str) {
  return crypto.createHash('sha512').update(str).digest('hex');
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Generate PayU form parameters (including SHA-512 hash) for the browser to
 * POST directly to the PayU gateway.
 *
 * Hash format (request):
 *   key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
 *
 * The salt never leaves the server — the frontend only receives the final hash.
 */
async function initiate({ firstname, email, phone, amount, productinfo, items = [], address = '' }) {
  const { key, salt } = getPayUCredentials();

  const txnid           = 'SB' + Date.now() + Math.floor(Math.random() * 1000);
  const formattedAmount = parseFloat(amount).toFixed(2);

  const hashString = `${key}|${txnid}|${formattedAmount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
  const hash       = computeSHA512(hashString);

  const callbackBase = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  const payuEndpoint = process.env.NODE_ENV === 'production'
    ? 'https://secure.payu.in/_payment'
    : 'https://test.payu.in/_payment';

  // Store full order details so they're available when PayU hits the success callback.
  pendingOrders.set(txnid, {
    firstname,
    email,
    phone,
    amount: formattedAmount,
    productinfo,
    items,
    address,
    orderDate: new Date(),
    createdAt: Date.now(),
  });

  return {
    payuEndpoint,
    params: {
      key,
      txnid,
      amount:      formattedAmount,
      productinfo,
      firstname,
      email,
      phone,
      surl: `${callbackBase}/api/v1/payments/success`,
      furl: `${callbackBase}/api/v1/payments/failure`,
      hash,
    },
  };
}

/**
 * Verify the PayU success callback response hash to confirm the payment.
 *
 * Reverse hash format (response):
 *   salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
 *
 * Uses timingSafeEqual to prevent timing-attack leakage.
 */
async function handleSuccess(payuData) {
  const { key, salt } = getPayUCredentials();

  const {
    status,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '',
    hash: receivedHash,
  } = payuData;

  const reverseHashString =
    `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

  const expectedHash = computeSHA512(reverseHashString);

  // Pad to equal length before timingSafeEqual (prevents length-leak shortcut)
  const expectedBuf = Buffer.from(expectedHash.padEnd(128, '0'));
  const receivedBuf = Buffer.from((receivedHash || '').padEnd(128, '0'));

  if (!crypto.timingSafeEqual(expectedBuf, receivedBuf) ||
      expectedHash !== (receivedHash || '')) {
    const err = new Error('PayU response hash verification failed.');
    err.status = 400;
    throw err;
  }

  // Retrieve and clean up the stored order details for this transaction.
  const orderData = pendingOrders.get(txnid) || {};
  pendingOrders.delete(txnid);

  return {
    verified:  true,
    status,
    txnid,
    mihpayid:  payuData.mihpayid || '',
    amount,
    // Merge stored order details so the controller can send the confirmation email.
    firstname:   orderData.firstname  || payuData.firstname || '',
    email:       orderData.email      || payuData.email     || '',
    phone:       orderData.phone      || '',
    address:     orderData.address    || '',
    items:       orderData.items      || [],
    orderDate:   orderData.orderDate  || new Date(),
  };
}

/**
 * Handle PayU failure callback.
 * No hash to verify on failure — just return the transaction details.
 */
async function handleFailure(payuData) {
  return {
    failed: true,
    status: payuData.status || 'failure',
    txnid:  payuData.txnid  || '',
  };
}

module.exports = { initiate, handleSuccess, handleFailure };
