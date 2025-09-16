/**
 * Send success response
 * @param {object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {object} - Response object
 */
function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} errors - Additional error details
 * @returns {object} - Response object
 */
function sendError(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send paginated response
 * @param {object} res - Express response object
 * @param {array} data - Response data array
 * @param {object} pagination - Pagination info
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {object} - Response object
 */
function sendPaginated(res, data, pagination, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: pagination.pages,
      hasNext: pagination.page < pagination.pages,
      hasPrev: pagination.page > 1
    },
    timestamp: new Date().toISOString()
  });
}

/**
 * Send validation error response
 * @param {object} res - Express response object
 * @param {array} errors - Validation errors
 * @returns {object} - Response object
 */
function sendValidationError(res, errors) {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: errors.map(error => ({
      field: error.field,
      message: error.message
    })),
    timestamp: new Date().toISOString()
  });
}

/**
 * Send not found response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @returns {object} - Response object
 */
function sendNotFound(res, message = 'Resource not found') {
  return res.status(404).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send unauthorized response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @returns {object} - Response object
 */
function sendUnauthorized(res, message = 'Unauthorized') {
  return res.status(401).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send forbidden response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @returns {object} - Response object
 */
function sendForbidden(res, message = 'Forbidden') {
  return res.status(403).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send rate limit response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} retryAfter - Seconds to wait before retry
 * @returns {object} - Response object
 */
function sendRateLimit(res, message = 'Too many requests', retryAfter = 60) {
  return res.status(429).json({
    success: false,
    message,
    retryAfter,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendRateLimit
};
