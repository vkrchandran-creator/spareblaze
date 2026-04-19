const { success } = require('../utils/apiResponse');
const categoryService = require('../services/category.service');

async function list(req, res, next) {
  try {
    const cats = await categoryService.list(req.query);
    return success(res, cats);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const cat = await categoryService.create(req.body);
    return success(res, cat, 'Category created.', 201);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const cat = await categoryService.update(req.params.id, req.body);
    return success(res, cat, 'Category updated.');
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await categoryService.remove(req.params.id);
    return success(res, null, 'Category deleted.');
  } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };
