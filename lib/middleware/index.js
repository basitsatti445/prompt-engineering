// Export all middleware for easy importing
const auth = require('./auth');
const errorHandler = require('./errorHandler');
const validation = require('./validation');
const permissions = require('./permissions');
const votingGuardrails = require('./votingGuardrails');

module.exports = {
  ...auth,
  ...errorHandler,
  ...validation,
  permissions,
  votingGuardrails
};
