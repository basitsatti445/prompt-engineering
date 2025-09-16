const { Feedback, Pitch } = require('../models');
const { checkProfanity, filterProfanity } = require('../utils/profanityFilter');

class FeedbackService {
  /**
   * Submit feedback for a pitch
   * @param {string} pitchId - Pitch ID
   * @param {string} reviewerId - Reviewer's user ID
   * @param {string} content - Feedback content
   * @returns {object} - Feedback data
   */
  async submitFeedback(pitchId, reviewerId, content) {
    // Verify pitch exists
    const pitch = await Pitch.findById(pitchId);
    if (!pitch) {
      throw new Error('Pitch not found');
    }

    // Check for profanity
    const profanityCheck = checkProfanity(content);
    let processedContent = content;
    let isFlagged = false;
    let moderationReason = null;

    if (profanityCheck.hasProfanity) {
      // Filter profanity
      processedContent = filterProfanity(content);
      isFlagged = true;
      moderationReason = `Flagged words: ${profanityCheck.flaggedWords.join(', ')}`;
    }

    // Create feedback
    const feedback = new Feedback({
      pitch: pitchId,
      reviewer: reviewerId,
      content: processedContent,
      isFlagged,
      moderationReason,
      isVisible: !isFlagged // Hide flagged content by default
    });

    await feedback.save();

    // Populate reviewer data
    await feedback.populate('reviewer', 'name');

    return feedback;
  }

  /**
   * Get feedback for a pitch
   * @param {string} pitchId - Pitch ID
   * @param {object} options - Query options
   * @returns {object} - Feedback and pagination info
   */
  async getPitchFeedback(pitchId, options = {}) {
    const {
      page = 1,
      limit = 20,
      includeFlagged = false,
      sortBy = 'newest'
    } = options;

    const skip = (page - 1) * limit;
    let query = { pitch: pitchId };

    // Filter out flagged content unless specifically requested
    if (!includeFlagged) {
      query.isVisible = true;
    }

    // Sort options
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const feedback = await Feedback.find(query)
      .populate('reviewer', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments(query);

    return {
      feedback,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get recent feedback for a pitch (for pitch detail page)
   * @param {string} pitchId - Pitch ID
   * @param {number} limit - Number of feedback items to fetch
   * @returns {array} - Recent feedback
   */
  async getRecentFeedback(pitchId, limit = 5) {
    const feedback = await Feedback.find({ 
      pitch: pitchId, 
      isVisible: true 
    })
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    return feedback;
  }

  /**
   * Update feedback visibility (moderation)
   * @param {string} feedbackId - Feedback ID
   * @param {boolean} isVisible - Whether feedback should be visible
   * @param {string} moderatorId - Moderator's user ID
   * @returns {object} - Updated feedback
   */
  async moderateFeedback(feedbackId, isVisible, moderatorId) {
    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { 
        isVisible,
        moderationReason: isVisible ? 'Approved by moderator' : 'Hidden by moderator'
      },
      { new: true, runValidators: true }
    ).populate('reviewer', 'name');

    if (!feedback) {
      throw new Error('Feedback not found');
    }

    return feedback;
  }

  /**
   * Get reviewer's feedback history
   * @param {string} reviewerId - Reviewer's user ID
   * @param {object} options - Query options
   * @returns {object} - Feedback history and pagination info
   */
  async getReviewerFeedback(reviewerId, options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'newest'
    } = options;

    const skip = (page - 1) * limit;
    let sort = {};

    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const feedback = await Feedback.find({ reviewer: reviewerId })
      .populate({
        path: 'pitch',
        select: 'title oneLiner category team',
        populate: {
          path: 'team',
          select: 'name'
        }
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments({ reviewer: reviewerId });

    return {
      feedback,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Delete feedback
   * @param {string} feedbackId - Feedback ID
   * @param {string} reviewerId - Reviewer's user ID (for authorization)
   * @returns {boolean} - Success status
   */
  async deleteFeedback(feedbackId, reviewerId) {
    const feedback = await Feedback.findOne({ _id: feedbackId, reviewer: reviewerId });
    if (!feedback) {
      throw new Error('Feedback not found or you do not have permission to delete it');
    }

    await Feedback.findByIdAndDelete(feedbackId);
    return true;
  }

  /**
   * Get flagged feedback for moderation
   * @param {object} options - Query options
   * @returns {object} - Flagged feedback and pagination info
   */
  async getFlaggedFeedback(options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'newest'
    } = options;

    const skip = (page - 1) * limit;
    let sort = {};

    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const feedback = await Feedback.find({ isFlagged: true })
      .populate('reviewer', 'name')
      .populate({
        path: 'pitch',
        select: 'title oneLiner team',
        populate: {
          path: 'team',
          select: 'name'
        }
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments({ isFlagged: true });

    return {
      feedback,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get feedback analytics
   * @returns {object} - Feedback analytics
   */
  async getFeedbackAnalytics() {
    const totalFeedback = await Feedback.countDocuments();
    const visibleFeedback = await Feedback.countDocuments({ isVisible: true });
    const flaggedFeedback = await Feedback.countDocuments({ isFlagged: true });
    const totalPitches = await Pitch.countDocuments();
    
    const averageFeedbackPerPitch = totalPitches > 0 ? totalFeedback / totalPitches : 0;

    return {
      totalFeedback,
      visibleFeedback,
      flaggedFeedback,
      totalPitches,
      averageFeedbackPerPitch: Math.round(averageFeedbackPerPitch * 100) / 100,
      moderationRate: totalFeedback > 0 ? (flaggedFeedback / totalFeedback) * 100 : 0
    };
  }
}

module.exports = new FeedbackService();
