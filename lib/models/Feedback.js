const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  pitch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pitch',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 240
  },
  // Track if feedback was flagged for moderation
  isFlagged: {
    type: Boolean,
    default: false
  },
  moderationReason: {
    type: String,
    trim: true,
    default: null
  },
  // Track if feedback is visible (for moderation)
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
feedbackSchema.index({ pitch: 1 });
feedbackSchema.index({ reviewer: 1 });
feedbackSchema.index({ createdAt: -1 }); // For recent feedback display

module.exports = mongoose.model('Feedback', feedbackSchema);
