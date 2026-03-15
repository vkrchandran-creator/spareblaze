const router     = require('express').Router();
const { body }   = require('express-validator');
const controller = require('../controllers/payment.controller');
const validate   = require('../middleware/validate.middleware');
const auth       = require('../middleware/auth.middleware');

// POST /api/v1/payments/initiate  — creates Razorpay order
router.post('/initiate',
  auth,
  [body('orderId').notEmpty().withMessage('orderId is required')],
  validate,
  controller.initiate,
);

// POST /api/v1/payments/verify  — verify Razorpay signature after payment
router.post('/verify',
  auth,
  [
    body('orderId').notEmpty(),
    body('razorpay_order_id').notEmpty(),
    body('razorpay_payment_id').notEmpty(),
    body('razorpay_signature').notEmpty(),
  ],
  validate,
  controller.verify,
);

// POST /api/v1/payments/webhook  — Razorpay async webhook (no auth — IP-verified)
router.post('/webhook', controller.webhook);

module.exports = router;
