const { error } = require('../utils/apiResponse');

/**
 * Restricts route to admin users only.
 * Must be used AFTER authMiddleware — requires req.user to be set.
 */
function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return error(res, 'Access denied. Admins only.', 403);
  }
  next();
}

module.exports = adminMiddleware;
