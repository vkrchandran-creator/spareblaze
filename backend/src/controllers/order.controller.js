const { success, paginated } = require('../utils/apiResponse');
const orderService           = require('../services/order.service');

async function create(req, res, next) {
  try {
    const order = await orderService.create(req.user.userId, req.body.addressId);
    return success(res, order, 'Order placed successfully.', 201);
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const { orders, pagination } = await orderService.list(req.user.userId, req.query);
    return paginated(res, orders, pagination, 'Orders retrieved.');
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const order = await orderService.getOne(req.user.userId, req.params.id);
    return success(res, order);
  } catch (err) { next(err); }
}

async function cancel(req, res, next) {
  try {
    const order = await orderService.cancel(req.user.userId, req.params.id);
    return success(res, order, 'Order cancelled.');
  } catch (err) { next(err); }
}

async function adminList(req, res, next) {
  try {
    const { orders, pagination } = await orderService.adminList(req.query);
    return paginated(res, orders, pagination, 'All orders retrieved.');
  } catch (err) { next(err); }
}

async function adminUpdateStatus(req, res, next) {
  try {
    const order = await orderService.adminUpdateStatus(req.params.id, req.body);
    return success(res, order, `Order status updated to '${req.body.status}'.`);
  } catch (err) { next(err); }
}

module.exports = { create, list, getOne, cancel, adminList, adminUpdateStatus };
