const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['founder', 'reviewer'],
    required: true,
    immutable: true // Role cannot be changed after creation
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  // For founders: track their team
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  // For reviewers: track voting activity for rate limiting
  lastVoteTime: {
    type: Date,
    default: null
  },
  voteCount: {
    type: Number,
    default: 0
  },
  // User status and permissions
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: {
    canCreateTeam: {
      type: Boolean,
      default: function() {
        return this.role === 'founder';
      }
    },
    canSubmitPitch: {
      type: Boolean,
      default: function() {
        return this.role === 'founder';
      }
    },
    canVote: {
      type: Boolean,
      default: function() {
        return this.role === 'reviewer';
      }
    },
    canLeaveFeedback: {
      type: Boolean,
      default: function() {
        return this.role === 'reviewer';
      }
    }
  },
  // Track user activity for analytics
  lastLoginAt: {
    type: Date,
    default: null
  },
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Role-based permission methods
userSchema.methods.hasPermission = function(permission) {
  return this.isActive && this.permissions[permission] === true;
};

userSchema.methods.isFounder = function() {
  return this.role === 'founder' && this.isActive;
};

userSchema.methods.isReviewer = function() {
  return this.role === 'reviewer' && this.isActive;
};

userSchema.methods.canCreateTeam = function() {
  return this.isFounder() && !this.team;
};

userSchema.methods.canSubmitPitch = function() {
  return this.isFounder() && this.team;
};

userSchema.methods.canVote = function() {
  return this.isReviewer();
};

userSchema.methods.canLeaveFeedback = function() {
  return this.isReviewer();
};

// Rate limiting methods
userSchema.methods.canVoteNow = function() {
  if (!this.isReviewer()) return false;
  
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  
  // Reset vote count if more than a minute has passed
  if (this.lastVoteTime && this.lastVoteTime < oneMinuteAgo) {
    return true; // Can vote, count will be reset
  }
  
  // Check if within rate limit
  return this.voteCount < 10;
};

userSchema.methods.updateVoteTracking = function() {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  
  // Reset vote count if more than a minute has passed
  if (this.lastVoteTime && this.lastVoteTime < oneMinuteAgo) {
    this.voteCount = 1;
  } else {
    this.voteCount += 1;
  }
  
  this.lastVoteTime = now;
  return this.save();
};

// Update login tracking
userSchema.methods.updateLoginTracking = function() {
  this.lastLoginAt = new Date();
  this.loginCount += 1;
  return this.save();
};

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'permissions.canVote': 1 });
userSchema.index({ lastVoteTime: 1 });

module.exports = mongoose.model('User', userSchema);
