const { success, paginated } = require('../utils/apiResponse');
const productService                = require('../services/product.service');

async function list(req, res, next) {
  try {
    const { products, pagination } = await productService.list(req.query);
    return paginated(res, products, pagination);
  } catch (err) { next(err); }
}

async function search(req, res, next) {
  try {
    const { products, pagination } = await productService.search(req.query.q, req.query);
    return paginated(res, products, pagination, `Search results for "${req.query.q}"`);
  } catch (err) { next(err); }
}

async function byCategory(req, res, next) {
  try {
    const { products, pagination } = await productService.byCategory(req.params.slug, req.query);
    return paginated(res, products, pagination);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const product = await productService.getOne(req.params.id);
    return success(res, product);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const product = await productService.create(req.body);
    return success(res, product, 'Product created successfully.', 201);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const product = await productService.update(req.params.id, req.body);
    return success(res, product, 'Product updated successfully.');
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await productService.softDelete(req.params.id);
    return success(res, null, 'Product deactivated successfully.');
  } catch (err) { next(err); }
}

module.exports = { list, search, byCategory, getOne, create, update, remove };
