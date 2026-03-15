const router     = require('express').Router();
const { body }   = require('express-validator');
const controller = require('../controllers/order.controller');
const validate   = require('../middleware/validate.middleware');
const auth       = require('../middleware/auth.middleware');
const admin      = require('../middleware/admin.middleware');

// All order routes require authentication
router.use(auth);

// POST /api/v1/orders  — create order from cart
router.post('/',
  [
    body('addressId').notEmpty().withMessage('Delivery address is required'),
  ],
  validate,
  controller.create,
);

// GET /api/v1/orders  — user's own order history
router.get('/', controller.list);

// GET /api/v1/orders/:id
router.get('/:id', controller.getOne);

// PUT /api/v1/orders/:id/cancel
router.put('/:id/cancel', controller.cancel);

// ── Admin routes ──────────────────────────────────────────────────────────────

// GET /api/v1/orders/admin/all
router.get('/admin/all', admin, controller.adminList);

// PUT /api/v1/orders/admin/:id/status
router.put('/admin/:id/status',
  admin,
  [body('status').notEmpty().withMessage('status is required')],
  validate,
  controller.adminUpdateStatus,
);

module.exports = router;
