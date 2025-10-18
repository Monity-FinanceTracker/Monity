// This file will export all models
const User = require('./User');
const Transaction = require('./Transaction');
const Category = require('./Category');
const Group = require('./Group');
const SavingsGoal = require('./SavingsGoal');
const Budget = require('./Budget');
const ScheduledTransaction = require('./ScheduledTransaction');

module.exports = {
  User,
  Transaction,
  Category,
  Group,
  SavingsGoal,
  Budget,
  ScheduledTransaction
};
