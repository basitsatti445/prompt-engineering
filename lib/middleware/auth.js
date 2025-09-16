const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const { User } = require('../models');

/**
 * Authentication middleware - verifies JWT token
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Next middleware function
 */
async function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = extractTokenFromHeader(authHeader);
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database to ensure they still exist
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Add user info to request object
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      team: user.team
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
      error: error.message
    });
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Next middleware function
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.userId).select('-password');
    if (user) {
      req.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        team: user.team
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // Don't fail on invalid token for optional auth
    req.user = null;
    next();
  }
}

/**
 * Middleware to check if user has a specific role
 * @param {string|array} allowedRoles - Role(s) allowed to access
 * @returns {function} - Middleware function
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = req.user.role;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`
      });
    }

    next();
  };
}

/**
 * Middleware to check if user is a founder
 */
const requireFounder = requireRole('founder');

/**
 * Middleware to check if user is a reviewer
 */
const requireReviewer = requireRole('reviewer');

/**
 * Middleware to check if user is a founder or reviewer
 */
const requireFounderOrReviewer = requireRole(['founder', 'reviewer']);

/**
 * Middleware to check if user owns a team
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Next middleware function
 */
async function requireTeamOwnership(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.role !== 'founder') {
      return res.status(403).json({
        success: false,
        message: 'Only founders can perform this action.'
      });
    }

    // Check if user has a team
    if (!req.user.team) {
      return res.status(403).json({
        success: false,
        message: 'You must create a team first.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking team ownership.',
      error: error.message
    });
  }
}

/**
 * Middleware to check if user owns a specific pitch
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Next middleware function
 */
async function requirePitchOwnership(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.role !== 'founder') {
      return res.status(403).json({
        success: false,
        message: 'Only founders can perform this action.'
      });
    }

    const pitchId = req.params.id || req.params.pitchId;
    if (!pitchId) {
      return res.status(400).json({
        success: false,
        message: 'Pitch ID is required.'
      });
    }

    // Check if user's team owns this pitch
    const { Pitch } = require('../models');
    const pitch = await Pitch.findById(pitchId).populate('team');
    
    if (!pitch) {
      return res.status(404).json({
        success: false,
        message: 'Pitch not found.'
      });
    }

    if (pitch.team.founder.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this pitch.'
      });
    }

    // Add pitch to request for use in route handlers
    req.pitch = pitch;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking pitch ownership.',
      error: error.message
    });
  }
}

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requireFounder,
  requireReviewer,
  requireFounderOrReviewer,
  requireTeamOwnership,
  requirePitchOwnership
};
