const router     = require('express').Router();
const { body }   = require('express-validator');
const controller = require('../controllers/admin.controller');
const validate   = require('../middleware/validate.middleware');
const auth       = require('../middleware/auth.middleware');
const admin      = require('../middleware/admin.middleware');

// All admin routes require auth + admin role
router.use(auth, admin);

// GET /api/v1/admin/dashboard
router.get('/dashboard', controller.dashboard);

// GET /api/v1/admin/inventory
router.get('/inventory', controller.inventory);

// PUT /api/v1/admin/inventory/:productId
router.put('/inventory/:productId',
  [body('quantity').isInt({ min: 0 }).withMessage('quantity must be a non-negative integer')],
  validate,
  controller.updateStock,
);

// GET /api/v1/admin/users
router.get('/users', controller.users);

module.exports = router;
