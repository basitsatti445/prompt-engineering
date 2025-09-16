// Export all services for easy importing
const authService = require('./authService');
const teamService = require('./teamService');
const pitchService = require('./pitchService');
const voteService = require('./voteService');
const feedbackService = require('./feedbackService');
const leaderboardService = require('./leaderboardService');

module.exports = {
  authService,
  teamService,
  pitchService,
  voteService,
  feedbackService,
  leaderboardService
};
