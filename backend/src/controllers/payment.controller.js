const { success: ok } = require('../utils/apiResponse');
const paymentService  = require('../services/payment.service');

/**
 * POST /api/v1/payments/initiate
 * Generate PayU form params + server-side hash for the browser to submit.
 * No auth required — supports guest checkout.
 */
async function initiate(req, res, next) {
  try {
    const { firstname, email, phone, amount, productinfo } = req.body;
    const result = await paymentService.initiate({ firstname, email, phone, amount, productinfo });
    return ok(res, result, 'PayU payment parameters generated.');
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/payments/success
 * PayU redirects the user's browser here after a successful payment.
 * Verifies the response hash, then redirects to the frontend success page.
 */
async function success(req, res) {
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim().replace(/\/$/, '');
  try {
    const result = await paymentService.handleSuccess(req.body);
    const params = new URLSearchParams({
      payment: 'success',
      txnid:   result.txnid,
      id:      result.mihpayid,
    });
    // Redirect to / (Vercel rewrites / → /pages/index.html).
    // Avoid /index.html — that file is under /pages/ and would 404 at root.
    return res.redirect(`${frontendUrl}/?${params.toString()}`);
  } catch {
    return res.redirect(`${frontendUrl}/?payment=failed`);
  }
}

/**
 * POST /api/v1/payments/failure
 * PayU redirects the user's browser here after a failed or cancelled payment.
 */
async function failure(req, res) {
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim().replace(/\/$/, '');
  const txnid = req.body.txnid || '';
  const params = new URLSearchParams({ payment: 'failed', txnid });
  return res.redirect(`${frontendUrl}/?${params.toString()}`);
}

module.exports = { initiate, success, failure };
