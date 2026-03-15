/**
 * Global Express error handler.
 * Attach as the last middleware in app.js.
 * Never expose stack traces in production.
 */
// Express requires the 4-argument signature to recognise this as an error handler.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const statusCode = err.status || err.statusCode || 500;
  const message    = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    console.error(`[${req.method}] ${req.path} — ${statusCode}: ${message}`);
    if (err.stack) console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
