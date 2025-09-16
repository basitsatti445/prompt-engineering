const mongoose = require('mongoose');

/**
 * Check if string is a valid MongoDB ObjectId
 * @param {string} id - String to validate
 * @returns {boolean} - Whether string is valid ObjectId
 */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Validate MongoDB ObjectId and throw error if invalid
 * @param {string} id - String to validate
 * @param {string} fieldName - Name of field for error message
 * @throws {Error} - If ObjectId is invalid
 */
function validateObjectId(id, fieldName = 'ID') {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ${fieldName}: ${id}`);
  }
}

/**
 * Convert string to MongoDB ObjectId
 * @param {string} id - String to convert
 * @returns {mongoose.Types.ObjectId} - ObjectId instance
 * @throws {Error} - If string is not valid ObjectId
 */
function toObjectId(id) {
  validateObjectId(id);
  return new mongoose.Types.ObjectId(id);
}

/**
 * Sanitize and validate pagination parameters
 * @param {object} query - Query parameters
 * @returns {object} - Sanitized pagination parameters
 */
function sanitizePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create MongoDB sort object from sortBy parameter
 * @param {string} sortBy - Sort parameter
 * @returns {object} - MongoDB sort object
 */
function createSortObject(sortBy) {
  const sortMap = {
    'newest': { createdAt: -1 },
    'oldest': { createdAt: 1 },
    'rating': { averageRating: -1 },
    'votes': { totalVotes: -1 },
    'weighted': { weightedScore: -1 },
    'name': { name: 1 }
  };

  return sortMap[sortBy] || sortMap['newest'];
}

/**
 * Create text search query for MongoDB
 * @param {string} searchTerm - Search term
 * @returns {object} - MongoDB text search query
 */
function createTextSearchQuery(searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    return {};
  }

  return {
    $text: {
      $search: searchTerm.trim(),
      $caseSensitive: false
    }
  };
}

/**
 * Create date range query for MongoDB
 * @param {string} timeRange - Time range ('week', 'month', 'all')
 * @returns {object} - MongoDB date query
 */
function createDateRangeQuery(timeRange) {
  if (timeRange === 'all') {
    return {};
  }

  const now = new Date();
  let startDate;

  switch (timeRange) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      return {};
  }

  return {
    createdAt: { $gte: startDate }
  };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with score and feedback
 */
function validatePasswordStrength(password) {
  const result = {
    isValid: false,
    score: 0,
    feedback: []
  };

  if (!password) {
    result.feedback.push('Password is required');
    return result;
  }

  if (password.length < 6) {
    result.feedback.push('Password must be at least 6 characters long');
  } else {
    result.score += 1;
  }

  if (password.length >= 8) {
    result.score += 1;
  }

  if (/[a-z]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Password should contain at least one lowercase letter');
  }

  if (/[A-Z]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Password should contain at least one uppercase letter');
  }

  if (/[0-9]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Password should contain at least one number');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Password should contain at least one special character');
  }

  result.isValid = result.score >= 3 && password.length >= 6;

  return result;
}

module.exports = {
  isValidObjectId,
  validateObjectId,
  toObjectId,
  sanitizePagination,
  createSortObject,
  createTextSearchQuery,
  createDateRangeQuery,
  isValidEmail,
  validatePasswordStrength
};
