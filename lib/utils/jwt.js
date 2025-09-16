const jwt = require('jsonwebtoken');
const { auth } = require('../config');

/**
 * Generate JWT token for user
 * @param {object} user - User object
 * @returns {string} - JWT token
 */
function generateToken(user) {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  return jwt.sign(payload, auth.jwt.secret, {
    expiresIn: auth.jwt.expiresIn,
    algorithm: auth.jwt.algorithm
  });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, auth.jwt.secret, {
      algorithms: [auth.jwt.algorithm]
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string} - Extracted token
 */
function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header');
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader
};
