/**
 * Custom error class to handle operational errors with status codes and codes.
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Standardized Express error handling middleware.
 */
function errorHandler(err, req, res, next) {
  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred.';

  // Log error stack for debugging in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error Handler] ${err.stack}`);
  } else if (statusCode === 500) {
    console.error(`[Error Handler] ${err.message}`);
  }

  return res.status(statusCode).json({
    error: true,
    message: message,
    code: errorCode
  });
}

module.exports = {
  ApiError,
  errorHandler
};
