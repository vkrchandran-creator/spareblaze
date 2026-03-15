const { validationResult } = require('express-validator');
const { error } = require('../utils/apiResponse');

/**
 * Run after express-validator chains.
 * Returns 422 with field-level error details if validation fails.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, 'Validation failed', 422, errors.array());
  }
  next();
}

module.exports = validate;
