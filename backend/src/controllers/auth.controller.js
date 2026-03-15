const { success, error } = require('../utils/apiResponse');
const authService        = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const { token, user } = await authService.register(req.body);
    return success(res, { token, user }, 'Account created successfully.', 201);
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { token, user } = await authService.login(req.body);
    return success(res, { token, user }, 'Login successful.');
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.userId);
    return success(res, user);
  } catch (err) { next(err); }
}

async function logout(_req, res) {
  // JWT is stateless — client discards the token.
  return success(res, null, 'Logged out successfully.');
}

async function addAddress(req, res, next) {
  try {
    const address = await authService.addAddress(req.user.userId, req.body);
    return success(res, address, 'Address added.', 201);
  } catch (err) { next(err); }
}

async function listAddresses(req, res, next) {
  try {
    const addresses = await authService.listAddresses(req.user.userId);
    return success(res, addresses);
  } catch (err) { next(err); }
}

async function deleteAddress(req, res, next) {
  try {
    await authService.deleteAddress(req.user.userId, req.params.addressId);
    return success(res, null, 'Address deleted.');
  } catch (err) { next(err); }
}

module.exports = { register, login, me, logout, addAddress, listAddresses, deleteAddress };
