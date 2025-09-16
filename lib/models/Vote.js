const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  // Track if this is an updated vote
  isUpdated: {
    type: Boolean,
    default: false
  },
  previousRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  }
}, {
  timestamps: true
});

// Ensure one vote per reviewer per pitch
voteSchema.index({ pitch: 1, reviewer: 1 }, { unique: true });

// Index for efficient queries
voteSchema.index({ pitch: 1 });
voteSchema.index({ reviewer: 1 });
voteSchema.index({ rating: 1 });

module.exports = mongoose.model('Vote', voteSchema);
