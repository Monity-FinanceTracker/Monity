// This file will export all services
const smartCategorizationService = require('./smartCategorizationService');
const aiSchedulerService = require('./aiSchedulerService');
const expenseSplittingService = require('./expenseSplittingService');
const savingsGoalsService = require('./savingsGoalsService');
const financialHealthService = require('./financialHealthService');
const ScheduledTransactionService = require('./scheduledTransactionService');
const AIChatService = require('./aiChatService');

// Create singleton instance
const scheduledTransactionService = new ScheduledTransactionService();

module.exports = {
  smartCategorizationService,
  aiSchedulerService,
  expenseSplittingService,
  savingsGoalsService,
  financialHealthService,
  scheduledTransactionService,
  AIChatService,
};
