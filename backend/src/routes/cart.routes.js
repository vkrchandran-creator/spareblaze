const router     = require('express').Router();
const { body }   = require('express-validator');
const controller = require('../controllers/cart.controller');
const validate   = require('../middleware/validate.middleware');
const auth       = require('../middleware/auth.middleware');

// All cart routes require authentication
router.use(auth);

// GET /api/v1/cart
router.get('/', controller.getCart);

// POST /api/v1/cart/add
router.post('/add',
  [
    body('productId').notEmpty().withMessage('productId is required'),
    body('quantity').isInt({ min: 1 }).withMessage('quantity must be at least 1'),
  ],
  validate,
  controller.add,
);

// POST /api/v1/cart/merge  — merge guest localStorage cart on login
router.post('/merge',
  [body('items').isArray().withMessage('items must be an array')],
  validate,
  controller.merge,
);

// PUT /api/v1/cart/update
router.put('/update',
  [
    body('productId').notEmpty(),
    body('quantity').isInt({ min: 0 }).withMessage('quantity must be 0 or more (0 removes item)'),
  ],
  validate,
  controller.update,
);

// DELETE /api/v1/cart/remove/:productId
router.delete('/remove/:productId', controller.remove);

// DELETE /api/v1/cart/clear
router.delete('/clear', controller.clear);

module.exports = router;
