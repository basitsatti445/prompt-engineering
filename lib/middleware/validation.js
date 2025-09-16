/**
 * Validation middleware factory
 * @param {object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 * @returns {function} - Middleware function
 */
function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Show all validation errors
      allowUnknown: false, // Don't allow unknown fields
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Replace the original property with validated and sanitized data
    req[property] = value;
    next();
  };
}

/**
 * Validate request body
 * @param {object} schema - Joi schema
 * @returns {function} - Middleware function
 */
function validateBody(schema) {
  return validate(schema, 'body');
}

/**
 * Validate query parameters
 * @param {object} schema - Joi schema
 * @returns {function} - Middleware function
 */
function validateQuery(schema) {
  return validate(schema, 'query');
}

/**
 * Validate route parameters
 * @param {object} schema - Joi schema
 * @returns {function} - Middleware function
 */
function validateParams(schema) {
  return validate(schema, 'params');
}

/**
 * Sanitize input to prevent XSS attacks
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Next middleware function
 */
function sanitizeInput(req, res, next) {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  };

  const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize body, query, and params
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
}

/**
 * Rate limiting middleware
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {function} - Middleware function
 */
function rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) { // Default: 100 requests per 15 minutes
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    } else {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000)
      });
    }

    // Add current request
    userRequests.push(now);
    requests.set(key, userRequests);

    next();
  };
}

/**
 * CORS middleware for API routes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Next middleware function
 */
function cors(req, res, next) {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
}

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  sanitizeInput,
  rateLimit,
  cors
};
