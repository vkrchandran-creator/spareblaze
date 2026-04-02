const { success, paginated } = require('../utils/apiResponse');
const adminService = require('../services/admin.service');

async function dashboard(req, res, next) {
  try {
    const stats = await adminService.getDashboardStats();
    return success(res, stats);
  } catch (err) { next(err); }
}

async function inventory(req, res, next) {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { items, pagination } = await adminService.getInventory({ page, limit });
    return paginated(res, items, pagination);
  } catch (err) { next(err); }
}

async function updateStock(req, res, next) {
  try {
    const inv = await adminService.updateStock(req.params.productId, parseInt(req.body.quantity, 10));
    return success(res, inv, 'Stock updated.');
  } catch (err) { next(err); }
}

async function users(req, res, next) {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { users: userList, pagination } = await adminService.getUsers({ page, limit });
    return paginated(res, userList, pagination);
  } catch (err) { next(err); }
}

async function brands(req, res, next) {
  try {
    const list = await adminService.getBrands();
    return success(res, list);
  } catch (err) { next(err); }
}

module.exports = { dashboard, inventory, updateStock, users, brands };
