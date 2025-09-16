const { Vote, Pitch } = require('../models');
const { checkProfanity } = require('../utils/profanityFilter');

/**
 * Voting Guardrails Middleware
 * Implements all voting-related security and validation rules
 */
class VotingGuardrails {
  /**
   * Validate voting request
   * @returns {function} - Middleware function
   */
  static validateVote() {
    return async (req, res, next) => {
      try {
        const { rating } = req.body;
        const pitchId = req.params.id || req.params.pitchId;

        // Validate rating
        if (!rating || typeof rating !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Rating is required and must be a number'
          });
        }

        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
          return res.status(400).json({
            success: false,
            message: 'Rating must be an integer between 1 and 5'
          });
        }

        // Validate pitch exists
        const pitch = await Pitch.findById(pitchId);
        if (!pitch) {
          return res.status(404).json({
            success: false,
            message: 'Pitch not found'
          });
        }

        if (!pitch.isActive) {
          return res.status(400).json({
            success: false,
            message: 'Cannot vote on inactive pitch'
          });
        }

        // Check if user has already voted
        const existingVote = await Vote.findOne({
          pitch: pitchId,
          reviewer: req.user.id
        });

        if (existingVote) {
          // Allow update of existing vote
          req.existingVote = existingVote;
          req.isUpdate = true;
        } else {
          req.isUpdate = false;
        }

        req.pitch = pitch;
        next();
      } catch (error) {
        console.error('Vote validation error:', error);
        return res.status(500).json({
          success: false,
          message: 'Vote validation failed'
        });
      }
    };
  }

  /**
   * Enforce one vote per reviewer per pitch rule
   * @returns {function} - Middleware function
   */
  static enforceOneVotePerPitch() {
    return async (req, res, next) => {
      try {
        const pitchId = req.params.id || req.params.pitchId;
        const reviewerId = req.user.id;

        // Check existing vote
        const existingVote = await Vote.findOne({
          pitch: pitchId,
          reviewer: reviewerId
        });

        if (existingVote) {
          // Update existing vote instead of creating new one
          req.existingVote = existingVote;
          req.isUpdate = true;
        } else {
          req.isUpdate = false;
        }

        next();
      } catch (error) {
        console.error('One vote per pitch check error:', error);
        return res.status(500).json({
          success: false,
          message: 'Vote check failed'
        });
      }
    };
  }

  /**
   * Rate limiting for voting
   * @returns {function} - Middleware function
   */
  static rateLimitVoting() {
    return async (req, res, next) => {
      try {
        const user = req.user;

        // Check if user can vote now (rate limiting)
        if (!user.canVoteNow()) {
          const timeUntilReset = 60 - Math.floor((Date.now() - user.lastVoteTime.getTime()) / 1000);
          
          return res.status(429).json({
            success: false,
            message: 'Rate limit exceeded. Maximum 10 votes per minute.',
            retryAfter: Math.max(0, timeUntilReset),
            currentVoteCount: user.voteCount,
            maxVotes: 10
          });
        }

        next();
      } catch (error) {
        console.error('Rate limiting check error:', error);
        return res.status(500).json({
          success: false,
          message: 'Rate limiting check failed'
        });
      }
    };
  }

  /**
   * Validate feedback
   * @returns {function} - Middleware function
   */
  static validateFeedback() {
    return async (req, res, next) => {
      try {
        const { content } = req.body;
        const pitchId = req.params.id || req.params.pitchId;

        // Validate content
        if (!content || typeof content !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'Feedback content is required'
          });
        }

        const trimmedContent = content.trim();

        // Check if empty after trimming
        if (trimmedContent.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Feedback cannot be empty'
          });
        }

        // Check character limit
        if (trimmedContent.length > 240) {
          return res.status(400).json({
            success: false,
            message: 'Feedback cannot exceed 240 characters'
          });
        }

        // Check for profanity
        const profanityCheck = checkProfanity(trimmedContent);
        if (profanityCheck.hasProfanity) {
          return res.status(400).json({
            success: false,
            message: 'Feedback contains inappropriate content',
            flaggedWords: profanityCheck.flaggedWords
          });
        }

        // Validate pitch exists
        const pitch = await Pitch.findById(pitchId);
        if (!pitch) {
          return res.status(404).json({
            success: false,
            message: 'Pitch not found'
          });
        }

        if (!pitch.isActive) {
          return res.status(400).json({
            success: false,
            message: 'Cannot leave feedback on inactive pitch'
          });
        }

        req.pitch = pitch;
        req.feedbackContent = trimmedContent;
        next();
      } catch (error) {
        console.error('Feedback validation error:', error);
        return res.status(500).json({
          success: false,
          message: 'Feedback validation failed'
        });
      }
    };
  }

  /**
   * Check if user can leave feedback on this pitch
   * @returns {function} - Middleware function
   */
  static canLeaveFeedback() {
    return async (req, res, next) => {
      try {
        const pitchId = req.params.id || req.params.pitchId;
        const reviewerId = req.user.id;

        // Check if user has already left feedback
        const { Feedback } = require('../models');
        const existingFeedback = await Feedback.findOne({
          pitch: pitchId,
          reviewer: reviewerId
        });

        if (existingFeedback) {
          return res.status(400).json({
            success: false,
            message: 'You have already left feedback for this pitch'
          });
        }

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
   * Update vote tracking after successful vote
   * @returns {function} - Middleware function
   */
  static updateVoteTracking() {
    return async (req, res, next) => {
      try {
        // This middleware runs after the vote is successfully processed
        const user = req.user;
        
        // Update vote tracking
        await user.updateVoteTracking();

        next();
      } catch (error) {
        console.error('Vote tracking update error:', error);
        // Don't fail the request if tracking update fails
        next();
      }
    };
  }

  /**
   * Comprehensive voting middleware that combines all checks
   * @returns {function} - Middleware function
   */
  static comprehensiveVotingCheck() {
    return [
      this.validateVote(),
      this.enforceOneVotePerPitch(),
      this.rateLimitVoting()
    ];
  }

  /**
   * Comprehensive feedback middleware that combines all checks
   * @returns {function} - Middleware function
   */
  static comprehensiveFeedbackCheck() {
    return [
      this.validateFeedback(),
      this.canLeaveFeedback()
    ];
  }
}

module.exports = VotingGuardrails;
