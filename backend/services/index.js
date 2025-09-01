// This file will export all services
const smartCategorizationService = require('./smartCategorizationService');
const aiSchedulerService = require('./aiSchedulerService');
const expenseSplittingService = require('./expenseSplittingService');
const savingsGoalsService = require('./savingsGoalsService');
const financialHealthService = require('./financialHealthService');

module.exports = {
  smartCategorizationService,
  aiSchedulerService,
  expenseSplittingService,
  savingsGoalsService,
  financialHealthService,
};
