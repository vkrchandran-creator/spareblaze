const { success } = require('../utils/apiResponse');
const cartService = require('../services/cart.service');

async function getCart(req, res, next) {
  try {
    const cart = await cartService.getCart(req.user.userId);
    return success(res, cart);
  } catch (err) { next(err); }
}

async function add(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.add(req.user.userId, productId, quantity);
    return success(res, cart, 'Item added to cart.');
  } catch (err) { next(err); }
}

async function merge(req, res, next) {
  try {
    const cart = await cartService.merge(req.user.userId, req.body.items);
    return success(res, cart, 'Cart merged successfully.');
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.update(req.user.userId, productId, quantity);
    return success(res, cart, 'Cart updated.');
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const cart = await cartService.remove(req.user.userId, req.params.productId);
    return success(res, cart, 'Item removed from cart.');
  } catch (err) { next(err); }
}

async function clear(req, res, next) {
  try {
    const cart = await cartService.clear(req.user.userId);
    return success(res, cart, 'Cart cleared.');
  } catch (err) { next(err); }
}

module.exports = { getCart, add, merge, update, remove, clear };
