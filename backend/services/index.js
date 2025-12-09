// This file will export all services
const smartCategorizationService = require('./smartCategorizationService');
const aiSchedulerService = require('./aiSchedulerService');
const expenseSplittingService = require('./expenseSplittingService');
const savingsGoalsService = require('./savingsGoalsService');
const financialHealthService = require('./financialHealthService');
const ScheduledTransactionService = require('./scheduledTransactionService');
const AIChatService = require('./aiChatService');
const EmailValidationService = require('./emailValidationService');
const emailMetricsService = require('./emailMetricsService');

// Create singleton instances
const scheduledTransactionService = new ScheduledTransactionService();
const emailValidationService = new EmailValidationService();

module.exports = {
  smartCategorizationService,
  aiSchedulerService,
  expenseSplittingService,
  savingsGoalsService,
  financialHealthService,
  scheduledTransactionService,
  AIChatService,
  emailValidationService,
  emailMetricsService,
};
