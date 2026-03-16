const router     = require('express').Router();
const { body }   = require('express-validator');
const controller = require('../controllers/payment.controller');
const validate   = require('../middleware/validate.middleware');

// POST /api/v1/payments/initiate — generate PayU hash (no auth, guest checkout)
router.post('/initiate',
  [
    body('firstname').notEmpty().withMessage('firstname is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('phone is required'),
    body('amount').isNumeric().withMessage('amount must be numeric'),
    body('productinfo').notEmpty().withMessage('productinfo is required'),
  ],
  validate,
  controller.initiate,
);

// POST /api/v1/payments/success — PayU success callback (browser redirect)
router.post('/success', controller.success);

// POST /api/v1/payments/failure — PayU failure callback (browser redirect)
router.post('/failure', controller.failure);

module.exports = router;
