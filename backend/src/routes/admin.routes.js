const router     = require('express').Router();
const { body }   = require('express-validator');
const controller = require('../controllers/admin.controller');
const validate   = require('../middleware/validate.middleware');
const auth       = require('../middleware/auth.middleware');
const admin      = require('../middleware/admin.middleware');

// All admin routes require authentication + admin role
router.use(auth, admin);

router.get('/dashboard',               controller.dashboard);
router.get('/inventory',               controller.inventory);
router.put('/inventory/:productId',
  [body('quantity').isInt({ min: 0 }).withMessage('quantity must be a non-negative integer')],
  validate,
  controller.updateStock,
);
router.get('/users',                   controller.users);
router.get('/brands',                  controller.brands);

module.exports = router;
