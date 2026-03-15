const router     = require('express').Router();
const { body }   = require('express-validator');
const controller = require('../controllers/auth.controller');
const validate   = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const auth       = require('../middleware/auth.middleware');

// POST /api/v1/auth/register
router.post('/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile number is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  controller.register,
);

// POST /api/v1/auth/login
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  controller.login,
);

// GET /api/v1/auth/me  (protected)
router.get('/me', auth, controller.me);

// POST /api/v1/auth/logout
router.post('/logout', auth, controller.logout);

// ── Address management (protected) ────────────────────────────────────────────

// GET /api/v1/auth/addresses
router.get('/addresses', auth, controller.listAddresses);

// POST /api/v1/auth/addresses
router.post('/addresses',
  auth,
  [
    body('line1').trim().notEmpty().withMessage('line1 is required'),
    body('city').trim().notEmpty().withMessage('city is required'),
    body('state').trim().notEmpty().withMessage('state is required'),
    body('pincode').matches(/^\d{6}$/).withMessage('pincode must be 6 digits'),
  ],
  validate,
  controller.addAddress,
);

// DELETE /api/v1/auth/addresses/:addressId
router.delete('/addresses/:addressId', auth, controller.deleteAddress);

module.exports = router;
