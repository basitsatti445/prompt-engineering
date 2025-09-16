const { Pitch, Team } = require('../models');

class LeaderboardService {
  /**
   * Get leaderboard with weighted scoring
   * @param {object} options - Query options
   * @returns {object} - Leaderboard and pagination info
   */
  async getLeaderboard(options = {}) {
    const {
      page = 1,
      limit = 20,
      category = '',
      stage = '',
      timeRange = 'all' // 'all', 'week', 'month'
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

    // Add time range filter
    if (timeRange !== 'all') {
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
          startDate = null;
      }
      
      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    // Get pitches with team data, sorted by weighted score
    const pitches = await Pitch.find(query)
      .populate('team', 'name founder contactEmail website')
      .populate({
        path: 'team.founder',
        select: 'name email'
      })
      .sort({ 
        weightedScore: -1, 
        lastVoteAt: -1, // Tie-breaker: most recent vote
        createdAt: -1   // Secondary tie-breaker: newest pitch
      })
      .skip(skip)
      .limit(limit);

    const total = await Pitch.countDocuments(query);

    // Format leaderboard entries
    const leaderboard = pitches.map((pitch, index) => ({
      rank: skip + index + 1,
      pitch: {
        id: pitch._id,
        title: pitch.title,
        oneLiner: pitch.oneLiner,
        category: pitch.category,
        stage: pitch.stage,
        averageRating: pitch.averageRating,
        totalVotes: pitch.totalVotes,
        weightedScore: pitch.weightedScore,
        createdAt: pitch.createdAt
      },
      team: {
        id: pitch.team._id,
        name: pitch.team.name,
        contactEmail: pitch.team.contactEmail,
        website: pitch.team.website,
        founder: pitch.team.founder
      }
    }));

    return {
      leaderboard,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get top performers by category
   * @param {string} category - Pitch category
   * @param {number} limit - Number of top performers
   * @returns {array} - Top performers in category
   */
  async getTopPerformersByCategory(category, limit = 10) {
    const pitches = await Pitch.find({ 
      category, 
      isActive: true,
      totalVotes: { $gt: 0 } // Only pitches with votes
    })
      .populate('team', 'name founder')
      .populate({
        path: 'team.founder',
        select: 'name email'
      })
      .sort({ weightedScore: -1, lastVoteAt: -1 })
      .limit(limit);

    return pitches.map((pitch, index) => ({
      rank: index + 1,
      pitch: {
        id: pitch._id,
        title: pitch.title,
        oneLiner: pitch.oneLiner,
        averageRating: pitch.averageRating,
        totalVotes: pitch.totalVotes,
        weightedScore: pitch.weightedScore
      },
      team: {
        id: pitch.team._id,
        name: pitch.team.name,
        founder: pitch.team.founder
      }
    }));
  }

  /**
   * Get top performers by stage
   * @param {string} stage - Pitch stage
   * @param {number} limit - Number of top performers
   * @returns {array} - Top performers in stage
   */
  async getTopPerformersByStage(stage, limit = 10) {
    const pitches = await Pitch.find({ 
      stage, 
      isActive: true,
      totalVotes: { $gt: 0 } // Only pitches with votes
    })
      .populate('team', 'name founder')
      .populate({
        path: 'team.founder',
        select: 'name email'
      })
      .sort({ weightedScore: -1, lastVoteAt: -1 })
      .limit(limit);

    return pitches.map((pitch, index) => ({
      rank: index + 1,
      pitch: {
        id: pitch._id,
        title: pitch.title,
        oneLiner: pitch.oneLiner,
        averageRating: pitch.averageRating,
        totalVotes: pitch.totalVotes,
        weightedScore: pitch.weightedScore
      },
      team: {
        id: pitch.team._id,
        name: pitch.team.name,
        founder: pitch.team.founder
      }
    }));
  }

  /**
   * Get leaderboard statistics
   * @returns {object} - Leaderboard statistics
   */
  async getLeaderboardStats() {
    const totalPitches = await Pitch.countDocuments({ isActive: true });
    const totalTeams = await Team.countDocuments({ isActive: true });
    
    // Get average metrics
    const avgMetrics = await Pitch.aggregate([
      { $match: { isActive: true, totalVotes: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$averageRating' },
          avgVotes: { $avg: '$totalVotes' },
          avgWeightedScore: { $avg: '$weightedScore' }
        }
      }
    ]);

    const averages = avgMetrics[0] || {
      avgRating: 0,
      avgVotes: 0,
      avgWeightedScore: 0
    };

    // Get category distribution
    const categoryStats = await Pitch.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$averageRating' },
          avgVotes: { $avg: '$totalVotes' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get stage distribution
    const stageStats = await Pitch.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          avgRating: { $avg: '$averageRating' },
          avgVotes: { $avg: '$totalVotes' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      totalPitches,
      totalTeams,
      averages: {
        rating: Math.round(averages.avgRating * 100) / 100,
        votes: Math.round(averages.avgVotes * 100) / 100,
        weightedScore: Math.round(averages.avgWeightedScore * 100) / 100
      },
      categoryDistribution: categoryStats,
      stageDistribution: stageStats
    };
  }

  /**
   * Get trending pitches (most votes in last 7 days)
   * @param {number} limit - Number of trending pitches
   * @returns {array} - Trending pitches
   */
  async getTrendingPitches(limit = 10) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const pitches = await Pitch.find({
      isActive: true,
      lastVoteAt: { $gte: sevenDaysAgo },
      totalVotes: { $gt: 0 }
    })
      .populate('team', 'name founder')
      .populate({
        path: 'team.founder',
        select: 'name email'
      })
      .sort({ totalVotes: -1, lastVoteAt: -1 })
      .limit(limit);

    return pitches.map((pitch, index) => ({
      rank: index + 1,
      pitch: {
        id: pitch._id,
        title: pitch.title,
        oneLiner: pitch.oneLiner,
        category: pitch.category,
        stage: pitch.stage,
        averageRating: pitch.averageRating,
        totalVotes: pitch.totalVotes,
        weightedScore: pitch.weightedScore,
        lastVoteAt: pitch.lastVoteAt
      },
      team: {
        id: pitch.team._id,
        name: pitch.team.name,
        founder: pitch.team.founder
      }
    }));
  }

  /**
   * Get team's leaderboard position
   * @param {string} teamId - Team ID
   * @returns {object} - Team's position and surrounding teams
   */
  async getTeamPosition(teamId) {
    const teamPitch = await Pitch.findOne({ team: teamId, isActive: true })
      .populate('team', 'name founder');

    if (!teamPitch) {
      throw new Error('Team not found or has no active pitch');
    }

    // Count teams with higher weighted scores
    const higherScoreCount = await Pitch.countDocuments({
      isActive: true,
      $or: [
        { weightedScore: { $gt: teamPitch.weightedScore } },
        {
          weightedScore: teamPitch.weightedScore,
          lastVoteAt: { $gt: teamPitch.lastVoteAt }
        }
      ]
    });

    const position = higherScoreCount + 1;

    // Get teams around this position (±2)
    const skip = Math.max(0, position - 3);
    const surroundingPitches = await Pitch.find({ isActive: true })
      .populate('team', 'name founder')
      .sort({ weightedScore: -1, lastVoteAt: -1 })
      .skip(skip)
      .limit(5);

    const surroundingTeams = surroundingPitches.map((pitch, index) => ({
      rank: skip + index + 1,
      pitch: {
        id: pitch._id,
        title: pitch.title,
        weightedScore: pitch.weightedScore,
        averageRating: pitch.averageRating,
        totalVotes: pitch.totalVotes
      },
      team: {
        id: pitch.team._id,
        name: pitch.team.name,
        founder: pitch.team.founder
      },
      isCurrentTeam: pitch.team._id.toString() === teamId
    }));

    return {
      currentPosition: position,
      team: {
        id: teamPitch.team._id,
        name: teamPitch.team.name,
        founder: teamPitch.team.founder
      },
      pitch: {
        id: teamPitch._id,
        title: teamPitch.title,
        weightedScore: teamPitch.weightedScore,
        averageRating: teamPitch.averageRating,
        totalVotes: teamPitch.totalVotes
      },
      surroundingTeams
    };
  }
}

module.exports = new LeaderboardService();
