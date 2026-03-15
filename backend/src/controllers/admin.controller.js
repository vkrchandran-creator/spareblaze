const { success, error } = require('../utils/apiResponse');
// const adminService = require('../services/admin.service');  // wired in Phase 9

async function dashboard(req, res, next) {
  try {
    return error(res, 'Not implemented yet — coming in Phase 9', 501);
  } catch (err) { next(err); }
}

async function inventory(req, res, next) {
  try {
    return error(res, 'Not implemented yet — coming in Phase 9', 501);
  } catch (err) { next(err); }
}

async function updateStock(req, res, next) {
  try {
    return error(res, 'Not implemented yet — coming in Phase 9', 501);
  } catch (err) { next(err); }
}

async function users(req, res, next) {
  try {
    return error(res, 'Not implemented yet — coming in Phase 9', 501);
  } catch (err) { next(err); }
}

module.exports = { dashboard, inventory, updateStock, users };
