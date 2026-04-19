const vehicleService = require('../services/vehicle.service');
const { success } = require('../utils/apiResponse');

async function listBrands(req, res, next) {
  try {
    const brands = await vehicleService.listBrands();
    return success(res, brands);
  } catch (err) { next(err); }
}

async function createBrand(req, res, next) {
  try {
    const brand = await vehicleService.createBrand(req.body);
    return success(res, brand, 'Vehicle brand created.', 201);
  } catch (err) { next(err); }
}

async function updateBrand(req, res, next) {
  try {
    const brand = await vehicleService.updateBrand(req.params.id, req.body);
    return success(res, brand, 'Vehicle brand updated.');
  } catch (err) { next(err); }
}

async function listModels(req, res, next) {
  try {
    const models = await vehicleService.listModels(req.query.brandId);
    return success(res, models);
  } catch (err) { next(err); }
}

async function createModel(req, res, next) {
  try {
    const model = await vehicleService.createModel(req.body);
    return success(res, model, 'Vehicle model created.', 201);
  } catch (err) { next(err); }
}

async function updateModel(req, res, next) {
  try {
    const model = await vehicleService.updateModel(req.params.id, req.body);
    return success(res, model, 'Vehicle model updated.');
  } catch (err) { next(err); }
}

async function removeModel(req, res, next) {
  try {
    await vehicleService.removeModel(req.params.id);
    return success(res, null, 'Vehicle model deleted.');
  } catch (err) { next(err); }
}

module.exports = {
  listBrands, createBrand, updateBrand,
  listModels, createModel, updateModel, removeModel
};
