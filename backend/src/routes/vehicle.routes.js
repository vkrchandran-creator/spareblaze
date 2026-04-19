const router = require('express').Router();
const controller = require('../controllers/vehicle.controller');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

// Public read routes
router.get('/brands', controller.listBrands);
router.get('/models', controller.listModels);

// Admin write routes
router.post('/brands', auth, admin, controller.createBrand);
router.put('/brands/:id', auth, admin, controller.updateBrand);

router.post('/models', auth, admin, controller.createModel);
router.put('/models/:id', auth, admin, controller.updateModel);
router.delete('/models/:id', auth, admin, controller.removeModel);

module.exports = router;
