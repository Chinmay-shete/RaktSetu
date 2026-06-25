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
  let message = err.message || 'An unexpected error occurred.';

  if (process.env.NODE_ENV === 'production') {
    if (statusCode === 500) {
      console.error(`[Error Handler] ${err.stack || err.message}`);
      message = 'An unexpected error occurred.';
    } else {
      console.error(`[Error Handler] ${err.message}`);
    }
  } else {
    console.error(`[Error Handler] ${err.stack || err.message}`);
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
