const { Vote, Pitch } = require('../models');
const authService = require('./authService');

class VoteService {
  /**
   * Submit or update a vote
   * @param {string} pitchId - Pitch ID
   * @param {string} reviewerId - Reviewer's user ID
   * @param {number} rating - Rating (1-5)
   * @returns {object} - Vote data
   */
  async submitVote(pitchId, reviewerId, rating) {
    // Check if user can vote (rate limiting)
    const canVote = await authService.canUserVote(reviewerId);
    if (!canVote) {
      throw new Error('Rate limit exceeded. You can only vote 10 times per minute.');
    }

    // Verify pitch exists
    const pitch = await Pitch.findById(pitchId);
    if (!pitch) {
      throw new Error('Pitch not found');
    }

    // Check if reviewer already voted
    const existingVote = await Vote.findOne({ 
      pitch: pitchId, 
      reviewer: reviewerId 
    });

    let vote;
    if (existingVote) {
      // Update existing vote
      const previousRating = existingVote.rating;
      existingVote.rating = rating;
      existingVote.isUpdated = true;
      existingVote.previousRating = previousRating;
      await existingVote.save();
      vote = existingVote;
    } else {
      // Create new vote
      vote = new Vote({
        pitch: pitchId,
        reviewer: reviewerId,
        rating
      });
      await vote.save();
    }

    // Update pitch metrics
    const pitchService = require('./pitchService');
    await pitchService.updatePitchMetrics(pitchId);

    // Update user vote tracking
    await authService.updateVoteTracking(reviewerId);

    return vote;
  }

  /**
   * Get vote by reviewer and pitch
   * @param {string} pitchId - Pitch ID
   * @param {string} reviewerId - Reviewer's user ID
   * @returns {object|null} - Vote data or null
   */
  async getVoteByReviewer(pitchId, reviewerId) {
    const vote = await Vote.findOne({ 
      pitch: pitchId, 
      reviewer: reviewerId 
    });

    return vote;
  }

  /**
   * Get all votes for a pitch
   * @param {string} pitchId - Pitch ID
   * @param {object} options - Query options
   * @returns {object} - Votes and pagination info
   */
  async getPitchVotes(pitchId, options = {}) {
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
      case 'rating':
        sort = { rating: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const votes = await Vote.find({ pitch: pitchId })
      .populate('reviewer', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Vote.countDocuments({ pitch: pitchId });

    return {
      votes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get vote statistics for a pitch
   * @param {string} pitchId - Pitch ID
   * @returns {object} - Vote statistics
   */
  async getVoteStats(pitchId) {
    const votes = await Vote.find({ pitch: pitchId });
    
    if (votes.length === 0) {
      return {
        totalVotes: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const totalVotes = votes.length;
    const totalRating = votes.reduce((sum, vote) => sum + vote.rating, 0);
    const averageRating = totalRating / totalVotes;

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    votes.forEach(vote => {
      ratingDistribution[vote.rating]++;
    });

    return {
      totalVotes,
      averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
      ratingDistribution
    };
  }

  /**
   * Get reviewer's voting history
   * @param {string} reviewerId - Reviewer's user ID
   * @param {object} options - Query options
   * @returns {object} - Voting history and pagination info
   */
  async getReviewerVotes(reviewerId, options = {}) {
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
      case 'rating':
        sort = { rating: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const votes = await Vote.find({ reviewer: reviewerId })
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

    const total = await Vote.countDocuments({ reviewer: reviewerId });

    return {
      votes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Delete a vote
   * @param {string} voteId - Vote ID
   * @param {string} reviewerId - Reviewer's user ID (for authorization)
   * @returns {boolean} - Success status
   */
  async deleteVote(voteId, reviewerId) {
    const vote = await Vote.findOne({ _id: voteId, reviewer: reviewerId });
    if (!vote) {
      throw new Error('Vote not found or you do not have permission to delete it');
    }

    const pitchId = vote.pitch;
    await Vote.findByIdAndDelete(voteId);

    // Update pitch metrics
    const pitchService = require('./pitchService');
    await pitchService.updatePitchMetrics(pitchId);

    return true;
  }

  /**
   * Get voting analytics
   * @returns {object} - Voting analytics
   */
  async getVotingAnalytics() {
    const totalVotes = await Vote.countDocuments();
    const totalPitches = await Pitch.countDocuments();
    const averageVotesPerPitch = totalPitches > 0 ? totalVotes / totalPitches : 0;

    // Get rating distribution across all votes
    const ratingDistribution = await Vote.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach(item => {
      distribution[item._id] = item.count;
    });

    return {
      totalVotes,
      totalPitches,
      averageVotesPerPitch: Math.round(averageVotesPerPitch * 100) / 100,
      ratingDistribution: distribution
    };
  }
}

module.exports = new VoteService();
