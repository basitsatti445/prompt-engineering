const { User } = require('../models');

/**
 * Permission-based middleware factory
 * Creates middleware that checks specific permissions
 */
class PermissionMiddleware {
  /**
   * Check if user has a specific permission
   * @param {string} permission - Permission to check
   * @returns {function} - Middleware function
   */
  static hasPermission(permission) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        // Get fresh user data from database
        const user = await User.findById(req.user.id);
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }

        // Check if user is active
        if (!user.isActive) {
          return res.status(403).json({
            success: false,
            message: 'Account is deactivated'
          });
        }

        // Check permission
        if (!user.hasPermission(permission)) {
          return res.status(403).json({
            success: false,
            message: `Permission denied. Required permission: ${permission}`
          });
        }

        // Update user object in request
        req.user = user;
        next();
      } catch (error) {
        console.error('Permission check error:', error);
        return res.status(500).json({
          success: false,
          message: 'Permission check failed'
        });
      }
    };
  }

  /**
   * Check if user is a founder
   * @returns {function} - Middleware function
   */
  static requireFounder() {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        const user = await User.findById(req.user.id);
        if (!user || !user.isFounder()) {
          return res.status(403).json({
            success: false,
            message: 'Founder role required'
          });
        }

        req.user = user;
        next();
      } catch (error) {
        console.error('Founder check error:', error);
        return res.status(500).json({
          success: false,
          message: 'Role check failed'
        });
      }
    };
  }

  /**
   * Check if user is a reviewer
   * @returns {function} - Middleware function
   */
  static requireReviewer() {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        const user = await User.findById(req.user.id);
        if (!user || !user.isReviewer()) {
          return res.status(403).json({
            success: false,
            message: 'Reviewer role required'
          });
        }

        req.user = user;
        next();
      } catch (error) {
        console.error('Reviewer check error:', error);
        return res.status(500).json({
          success: false,
          message: 'Role check failed'
        });
      }
    };
  }

  /**
   * Check if founder can create a team
   * @returns {function} - Middleware function
   */
  static canCreateTeam() {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        const user = await User.findById(req.user.id);
        if (!user || !user.canCreateTeam()) {
          return res.status(403).json({
            success: false,
            message: 'Cannot create team. You must be a founder without an existing team.'
          });
        }

        req.user = user;
        next();
      } catch (error) {
        console.error('Team creation check error:', error);
        return res.status(500).json({
          success: false,
          message: 'Team creation check failed'
        });
      }
    };
  }

  /**
   * Check if founder can submit a pitch
   * @returns {function} - Middleware function
   */
  static canSubmitPitch() {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        const user = await User.findById(req.user.id);
        if (!user || !user.canSubmitPitch()) {
          return res.status(403).json({
            success: false,
            message: 'Cannot submit pitch. You must be a founder with an existing team.'
          });
        }

        req.user = user;
        next();
      } catch (error) {
        console.error('Pitch submission check error:', error);
        return res.status(500).json({
          success: false,
          message: 'Pitch submission check failed'
        });
      }
    };
  }

  /**
   * Check if reviewer can vote
   * @returns {function} - Middleware function
   */
  static canVote() {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        const user = await User.findById(req.user.id);
        if (!user || !user.canVote()) {
          return res.status(403).json({
            success: false,
            message: 'Voting permission denied. Reviewer role required.'
          });
        }

        // Check rate limiting
        if (!user.canVoteNow()) {
          return res.status(429).json({
            success: false,
            message: 'Rate limit exceeded. Maximum 10 votes per minute.',
            retryAfter: 60
          });
        }

        req.user = user;
        next();
      } catch (error) {
        console.error('Voting permission check error:', error);
        return res.status(500).json({
          success: false,
          message: 'Voting permission check failed'
        });
      }
    };
  }

  /**
   * Check if reviewer can leave feedback
   * @returns {function} - Middleware function
   */
  static canLeaveFeedback() {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        const user = await User.findById(req.user.id);
        if (!user || !user.canLeaveFeedback()) {
          return res.status(403).json({
            success: false,
            message: 'Feedback permission denied. Reviewer role required.'
          });
        }

        req.user = user;
        next();
      } catch (error) {
        console.error('Feedback permission check error:', error);
        return res.status(500).json({
          success: false,
          message: 'Feedback permission check failed'
        });
      }
    };
  }

  /**
   * Check if user owns a specific resource
   * @param {string} resourceType - Type of resource (team, pitch)
   * @param {string} paramName - Parameter name containing the resource ID
   * @returns {function} - Middleware function
   */
  static ownsResource(resourceType, paramName = 'id') {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        const resourceId = req.params[paramName];
        if (!resourceId) {
          return res.status(400).json({
            success: false,
            message: 'Resource ID is required'
          });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }

        let isOwner = false;

        if (resourceType === 'team') {
          isOwner = user.team && user.team.toString() === resourceId;
        } else if (resourceType === 'pitch') {
          // For pitch ownership, we need to check through the team
          if (user.team) {
            const { Pitch } = require('../models');
            const pitch = await Pitch.findById(resourceId).populate('team');
            isOwner = pitch && pitch.team.founder.toString() === user._id.toString();
          }
        }

        if (!isOwner) {
          return res.status(403).json({
            success: false,
            message: `Access denied. You do not own this ${resourceType}.`
          });
        }

        req.user = user;
        next();
      } catch (error) {
        console.error('Resource ownership check error:', error);
        return res.status(500).json({
          success: false,
          message: 'Resource ownership check failed'
        });
      }
    };
  }

  /**
   * Check if user has already voted on a pitch
   * @returns {function} - Middleware function
   */
  static hasNotVoted() {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        const pitchId = req.params.id || req.params.pitchId;
        if (!pitchId) {
          return res.status(400).json({
            success: false,
            message: 'Pitch ID is required'
          });
        }

        const { Vote } = require('../models');
        const existingVote = await Vote.findOne({
          pitch: pitchId,
          reviewer: req.user.id
        });

        if (existingVote) {
          // Allow update of existing vote
          req.existingVote = existingVote;
        }

        next();
      } catch (error) {
        console.error('Vote check error:', error);
        return res.status(500).json({
          success: false,
          message: 'Vote check failed'
        });
      }
    };
  }
}

module.exports = PermissionMiddleware;
