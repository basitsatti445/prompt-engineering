const { User } = require('../models');
const { generateToken } = require('../utils/jwt');

class AuthService {
  /**
   * Register a new user
   * @param {object} userData - User registration data
   * @returns {object} - User data and token
   */
  async signup(userData) {
    const { email, password, name, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      role
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Return user data without password
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    };

    return {
      user: userResponse,
      token
    };
  }

  /**
   * Authenticate user login
   * @param {object} credentials - Login credentials
   * @returns {object} - User data and token
   */
  async signin(credentials) {
    const { email, password } = credentials;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data without password
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      team: user.team,
      createdAt: user.createdAt
    };

    return {
      user: userResponse,
      token
    };
  }

  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {object} - User profile data
   */
  async getUserProfile(userId) {
    const user = await User.findById(userId)
      .populate('team', 'name description contactEmail website')
      .select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {object} updateData - Data to update
   * @returns {object} - Updated user data
   */
  async updateProfile(userId, updateData) {
    const allowedFields = ['name'];
    const updateFields = {};

    // Only allow certain fields to be updated
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields[key] = updateData[key];
      }
    });

    if (Object.keys(updateFields).length === 0) {
      throw new Error('No valid fields to update');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Check if user can vote (rate limiting)
   * @param {string} userId - User ID
   * @returns {boolean} - Whether user can vote
   */
  async canUserVote(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check rate limiting (10 votes per minute)
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    if (user.lastVoteTime && user.lastVoteTime > oneMinuteAgo) {
      if (user.voteCount >= 10) {
        return false; // Rate limited
      }
    } else {
      // Reset vote count if more than a minute has passed
      user.voteCount = 0;
      await user.save();
    }

    return true;
  }

  /**
   * Update user vote tracking
   * @param {string} userId - User ID
   */
  async updateVoteTracking(userId) {
    await User.findByIdAndUpdate(userId, {
      $inc: { voteCount: 1 },
      lastVoteTime: new Date()
    });
  }
}

module.exports = new AuthService();
