const router     = require('express').Router();
const { body }   = require('express-validator');
const controller = require('../controllers/category.controller');
const validate   = require('../middleware/validate.middleware');
const auth       = require('../middleware/auth.middleware');
const admin      = require('../middleware/admin.middleware');

// GET /api/v1/categories — public
router.get('/', controller.list);

// POST /api/v1/categories — admin only
router.post('/',
  auth, admin,
  [body('name').trim().notEmpty().withMessage('name is required')],
  validate,
  controller.create
);

// PUT /api/v1/categories/:id — admin only
router.put('/:id', auth, admin, controller.update);

// DELETE /api/v1/categories/:id — admin only
router.delete('/:id', auth, admin, controller.remove);

module.exports = router;
