const { Team, User } = require('../models');

class TeamService {
  /**
   * Create a new team
   * @param {string} founderId - Founder's user ID
   * @param {object} teamData - Team data
   * @returns {object} - Created team
   */
  async createTeam(founderId, teamData) {
    // Check if founder already has a team
    const existingTeam = await Team.findOne({ founder: founderId });
    if (existingTeam) {
      throw new Error('You already have a team. Each founder can only create one team.');
    }

    // Create team
    const team = new Team({
      ...teamData,
      founder: founderId
    });

    await team.save();

    // Update user's team reference
    await User.findByIdAndUpdate(founderId, { team: team._id });

    // Populate founder data
    await team.populate('founder', 'name email');

    return team;
  }

  /**
   * Get team by ID
   * @param {string} teamId - Team ID
   * @returns {object} - Team data
   */
  async getTeamById(teamId) {
    const team = await Team.findById(teamId)
      .populate('founder', 'name email')
      .populate({
        path: 'pitches',
        select: 'title oneLiner category stage averageRating totalVotes createdAt'
      });

    if (!team) {
      throw new Error('Team not found');
    }

    return team;
  }

  /**
   * Get team by founder ID
   * @param {string} founderId - Founder's user ID
   * @returns {object|null} - Team data or null
   */
  async getTeamByFounder(founderId) {
    const team = await Team.findOne({ founder: founderId })
      .populate('founder', 'name email')
      .populate({
        path: 'pitches',
        select: 'title oneLiner category stage averageRating totalVotes createdAt'
      });

    return team;
  }

  /**
   * Update team
   * @param {string} teamId - Team ID
   * @param {string} founderId - Founder's user ID (for authorization)
   * @param {object} updateData - Data to update
   * @returns {object} - Updated team
   */
  async updateTeam(teamId, founderId, updateData) {
    // Verify ownership
    const team = await Team.findOne({ _id: teamId, founder: founderId });
    if (!team) {
      throw new Error('Team not found or you do not have permission to update it');
    }

    // Update team
    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      updateData,
      { new: true, runValidators: true }
    ).populate('founder', 'name email');

    return updatedTeam;
  }

  /**
   * Delete team
   * @param {string} teamId - Team ID
   * @param {string} founderId - Founder's user ID (for authorization)
   * @returns {boolean} - Success status
   */
  async deleteTeam(teamId, founderId) {
    // Verify ownership
    const team = await Team.findOne({ _id: teamId, founder: founderId });
    if (!team) {
      throw new Error('Team not found or you do not have permission to delete it');
    }

    // Remove team reference from user
    await User.findByIdAndUpdate(founderId, { $unset: { team: 1 } });

    // Delete team (this will cascade delete pitches due to schema constraints)
    await Team.findByIdAndDelete(teamId);

    return true;
  }

  /**
   * Get all teams with pagination
   * @param {object} options - Query options
   * @returns {object} - Teams and pagination info
   */
  async getAllTeams(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      sortBy = 'newest'
    } = options;

    const skip = (page - 1) * limit;
    let query = { isActive: true };

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
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
      case 'name':
        sort = { name: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const teams = await Team.find(query)
      .populate('founder', 'name email')
      .populate({
        path: 'pitches',
        select: 'title oneLiner category stage averageRating totalVotes'
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Team.countDocuments(query);

    return {
      teams,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get team statistics
   * @param {string} teamId - Team ID
   * @returns {object} - Team statistics
   */
  async getTeamStats(teamId) {
    const team = await Team.findById(teamId)
      .populate({
        path: 'pitches',
        select: 'averageRating totalVotes weightedScore'
      });

    if (!team) {
      throw new Error('Team not found');
    }

    const pitch = team.pitches[0]; // Each team has one pitch
    const stats = {
      teamName: team.name,
      founderName: team.founder.name,
      pitchCount: team.pitches.length,
      averageRating: pitch ? pitch.averageRating : 0,
      totalVotes: pitch ? pitch.totalVotes : 0,
      weightedScore: pitch ? pitch.weightedScore : 0,
      createdAt: team.createdAt
    };

    return stats;
  }
}

module.exports = new TeamService();
