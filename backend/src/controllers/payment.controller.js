const { success: ok } = require('../utils/apiResponse');
const paymentService  = require('../services/payment.service');

async function initiate(req, res, next) {
  try {
    const result = await paymentService.initiate(req.user.userId, req.body.orderId);
    return ok(res, result, 'Payment initiated.');
  } catch (err) { next(err); }
}

async function verify(req, res, next) {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const result = await paymentService.verify(req.user.userId, {
      orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature,
    });
    return ok(res, result, 'Payment verified successfully.');
  } catch (err) { next(err); }
}

async function webhook(req, res) {
  // Must return 200 immediately — Razorpay retries on any non-200
  const rawBody  = req.body;                                     // Buffer (set in app.js)
  const sig      = req.headers['x-razorpay-signature'] || '';

  // Fire-and-forget: process asynchronously, do not await
  paymentService.handleWebhook(rawBody, sig).catch(() => {});

  return res.status(200).json({ received: true });
}

module.exports = { initiate, verify, webhook };
