const router     = require('express').Router();
const { body, param, query } = require('express-validator');
const controller = require('../controllers/product.controller');
const validate   = require('../middleware/validate.middleware');
const auth       = require('../middleware/auth.middleware');
const admin      = require('../middleware/admin.middleware');

// GET /api/v1/products  — list with filter/sort/pagination
router.get('/', controller.list);

// GET /api/v1/products/search?q=brake+pad
router.get('/search',
  [query('q').trim().notEmpty().withMessage('Search query is required')],
  validate,
  controller.search,
);

// GET /api/v1/products/category/:slug
router.get('/category/:slug', controller.byCategory);

// GET /api/v1/products/brands — public list of distinct brands (must be before /:id)
router.get('/brands', async (req, res, next) => {
  try {
    const adminService = require('../services/admin.service');
    const { success } = require('../utils/apiResponse');
    const list = await adminService.getBrands();
    return success(res, list);
  } catch (err) { next(err); }
});

// GET /api/v1/products/:id
router.get('/:id', controller.getOne);

// POST /api/v1/products  (admin)
router.post('/', auth, admin,
  [
    body('title').trim().notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('mrp').isFloat({ min: 0 }),
    body('categoryId').notEmpty(),
  ],
  validate,
  controller.create,
);

// PUT /api/v1/products/:id  (admin)
router.put('/:id', auth, admin, controller.update);

// DELETE /api/v1/products/:id  (admin — soft delete)
router.delete('/:id', auth, admin, controller.remove);

module.exports = router;
