const mongoose = require('mongoose');

const pitchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  oneLiner: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: [
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
    ]
  },
  stage: {
    type: String,
    required: true,
    enum: ['Idea', 'MVP', 'Early Stage', 'Growth Stage', 'Established']
  },
  // Demo and deck URLs
  demoUrl: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Basic URL validation
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Demo URL must be a valid HTTP/HTTPS URL'
    }
  },
  deckUrl: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Basic URL validation
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Deck URL must be a valid HTTP/HTTPS URL'
    }
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  // Pitch metrics
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  weightedScore: {
    type: Number,
    default: 0
  },
  // Last vote timestamp for tie-breaking
  lastVoteAt: {
    type: Date,
    default: null
  },
  // Pitch status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure one pitch per team
pitchSchema.index({ team: 1 }, { unique: true });

// Indexes for efficient queries
pitchSchema.index({ category: 1 });
pitchSchema.index({ stage: 1 });
pitchSchema.index({ weightedScore: -1 }); // For leaderboard
pitchSchema.index({ averageRating: -1 });
pitchSchema.index({ totalVotes: -1 });

// Text search index
pitchSchema.index({ 
  title: 'text', 
  oneLiner: 'text', 
  description: 'text' 
});

// Calculate weighted score
pitchSchema.methods.calculateWeightedScore = function() {
  if (this.totalVotes === 0) {
    this.weightedScore = 0;
  } else {
    this.weightedScore = this.averageRating * Math.log10(this.totalVotes + 1);
  }
  return this.weightedScore;
};

module.exports = mongoose.model('Pitch', pitchSchema);
