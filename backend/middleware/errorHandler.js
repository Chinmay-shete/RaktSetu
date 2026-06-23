// Global Error Handling Middleware
// Standardizes error responses to { error: true, message, code } format

function errorHandler(err, req, res, next) {
  // If headers have already been sent, delegate to the default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  console.error('💥 Error caught by handler:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    code: err.code,
    statusCode: err.statusCode || err.status
  });

  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(statusCode).json({
    error: true,
    message: err.message || 'An unexpected error occurred on the server.',
    code: errorCode
  });
}

module.exports = errorHandler;
