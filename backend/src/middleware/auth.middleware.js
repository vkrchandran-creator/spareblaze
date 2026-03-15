const { verifyToken } = require('../utils/generateToken');
const { error }       = require('../utils/apiResponse');

/**
 * Protects routes — requires a valid Bearer JWT.
 * Attaches decoded payload to req.user.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Authentication required. Please log in.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { userId, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Session expired. Please log in again.', 401);
    }
    return error(res, 'Invalid token.', 401);
  }
}

module.exports = authMiddleware;
