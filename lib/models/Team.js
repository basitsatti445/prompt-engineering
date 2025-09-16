const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  founder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Team members (optional for future expansion)
  members: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    role: {
      type: String,
      trim: true,
      maxlength: 50
    }
  }],
  // Team contact info
  contactEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  // Team status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure one team per founder
teamSchema.index({ founder: 1 }, { unique: true });
teamSchema.index({ name: 1 });

module.exports = mongoose.model('Team', teamSchema);
