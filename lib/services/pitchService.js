const { Pitch, Team, Vote } = require('../models');

class PitchService {
  /**
   * Create a new pitch
   * @param {string} teamId - Team ID
   * @param {object} pitchData - Pitch data
   * @returns {object} - Created pitch
   */
  async createPitch(teamId, pitchData) {
    // Check if team already has a pitch
    const existingPitch = await Pitch.findOne({ team: teamId });
    if (existingPitch) {
      throw new Error('Your team already has a pitch. Each team can only submit one pitch.');
    }

    // Verify team exists
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Create pitch
    const pitch = new Pitch({
      ...pitchData,
      team: teamId
    });

    await pitch.save();

    // Populate team data
    await pitch.populate('team', 'name founder');

    return pitch;
  }

  /**
   * Get pitch by ID
   * @param {string} pitchId - Pitch ID
   * @returns {object} - Pitch data
   */
  async getPitchById(pitchId) {
    const pitch = await Pitch.findById(pitchId)
      .populate('team', 'name founder contactEmail website')
      .populate({
        path: 'team.founder',
        select: 'name email'
      });

    if (!pitch) {
      throw new Error('Pitch not found');
    }

    return pitch;
  }

  /**
   * Update pitch
   * @param {string} pitchId - Pitch ID
   * @param {string} founderId - Founder's user ID (for authorization)
   * @param {object} updateData - Data to update
   * @returns {object} - Updated pitch
   */
  async updatePitch(pitchId, founderId, updateData) {
    // Verify ownership through team
    const pitch = await Pitch.findById(pitchId).populate('team');
    if (!pitch) {
      throw new Error('Pitch not found');
    }

    if (pitch.team.founder.toString() !== founderId) {
      throw new Error('You do not have permission to update this pitch');
    }

    // Update pitch
    const updatedPitch = await Pitch.findByIdAndUpdate(
      pitchId,
      updateData,
      { new: true, runValidators: true }
    ).populate('team', 'name founder');

    return updatedPitch;
  }

  /**
   * Delete pitch
   * @param {string} pitchId - Pitch ID
   * @param {string} founderId - Founder's user ID (for authorization)
   * @returns {boolean} - Success status
   */
  async deletePitch(pitchId, founderId) {
    // Verify ownership through team
    const pitch = await Pitch.findById(pitchId).populate('team');
    if (!pitch) {
      throw new Error('Pitch not found');
    }

    if (pitch.team.founder.toString() !== founderId) {
      throw new Error('You do not have permission to delete this pitch');
    }

    // Delete pitch
    await Pitch.findByIdAndDelete(pitchId);

    return true;
  }

  /**
   * Get all pitches with filtering and pagination
   * @param {object} options - Query options
   * @returns {object} - Pitches and pagination info
   */
  async getAllPitches(options = {}) {
    const {
      page = 1,
      limit = 20,
      category = '',
      stage = '',
      search = '',
      sortBy = 'newest'
    } = options;

    const skip = (page - 1) * limit;
    let query = { isActive: true };

    // Add filters
    if (category) {
      query.category = category;
    }
    if (stage) {
      query.stage = stage;
    }

    // Add search filter
    if (search) {
      query.$text = { $search: search };
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
      case 'rating':
        sort = { averageRating: -1 };
        break;
      case 'votes':
        sort = { totalVotes: -1 };
        break;
      case 'weighted':
        sort = { weightedScore: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const pitches = await Pitch.find(query)
      .populate('team', 'name founder contactEmail')
      .populate({
        path: 'team.founder',
        select: 'name email'
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Pitch.countDocuments(query);

    return {
      pitches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get pitch with recent feedback
   * @param {string} pitchId - Pitch ID
   * @param {number} limit - Number of feedback items to fetch
   * @returns {object} - Pitch with recent feedback
   */
  async getPitchWithFeedback(pitchId, limit = 5) {
    const pitch = await this.getPitchById(pitchId);
    
    // Get recent feedback
    const { Feedback } = require('../models');
    const recentFeedback = await Feedback.find({ 
      pitch: pitchId, 
      isVisible: true 
    })
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    return {
      ...pitch.toObject(),
      recentFeedback
    };
  }

  /**
   * Update pitch metrics after voting
   * @param {string} pitchId - Pitch ID
   */
  async updatePitchMetrics(pitchId) {
    const pitch = await Pitch.findById(pitchId);
    if (!pitch) {
      throw new Error('Pitch not found');
    }

    // Calculate new metrics
    const votes = await Vote.find({ pitch: pitchId });
    
    if (votes.length === 0) {
      pitch.averageRating = 0;
      pitch.totalVotes = 0;
      pitch.weightedScore = 0;
      pitch.lastVoteAt = null;
    } else {
      const totalRating = votes.reduce((sum, vote) => sum + vote.rating, 0);
      pitch.averageRating = totalRating / votes.length;
      pitch.totalVotes = votes.length;
      pitch.weightedScore = pitch.calculateWeightedScore();
      
      // Find most recent vote
      const mostRecentVote = await Vote.findOne({ pitch: pitchId })
        .sort({ updatedAt: -1 });
      pitch.lastVoteAt = mostRecentVote ? mostRecentVote.updatedAt : null;
    }

    await pitch.save();
    return pitch;
  }

  /**
   * Get pitch categories and stages for filtering
   * @returns {object} - Available categories and stages
   */
  async getPitchFilters() {
    const categories = [
      'Technology',
      'Healthcare',
      'Finance',
      'Education',
      'E-commerce',
      'Social Impact',
      'Entertainment',
      'Food & Beverage',
      'Transportation',
      'Other'
    ];

    const stages = [
      'Idea',
      'MVP',
      'Early Stage',
      'Growth Stage',
      'Established'
    ];

    return { categories, stages };
  }
}

module.exports = new PitchService();
