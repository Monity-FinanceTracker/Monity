const AuthController = require("./authController");
const TransactionController = require("./transactionController");
const CategoryController = require("./categoryController");
const GroupController = require("./groupController");
const SavingsGoalController = require("./savingsGoalController");
const BalanceController = require("./balanceController");
const SubscriptionController = require("./subscriptionController");
const AdminController = require("./adminController");
const AiController = require("./aiController");
const InvitationController = require("./invitationController");
const BudgetController = require("./budgetController");
const FinancialProjectionsController = require("./financialProjectionsController");
const UserController = require("./userController");
const BillingController = require("./billingController");
const CashFlowController = require("./cashFlowController");
const AIChatController = require("./aiChatController");
const InvestmentCalculatorController = require("./investmentCalculatorController");
const AnalyticsController = require("./analyticsController");
const RecurringTransactionController = require("./recurringTransactionController");
const { scheduledTransactionService } = require("../services");
const { supabaseAdmin } = require("../config/supabase");

const initializeControllers = (supabase) => {
  return {
    authController: new AuthController(supabase),
    transactionController: new TransactionController(supabase),
    categoryController: new CategoryController(supabase),
    groupController: new GroupController(supabase),
    savingsGoalController: new SavingsGoalController(supabase),
    balanceController: new BalanceController(supabase),
    subscriptionController: new SubscriptionController(supabase),
    adminController: new AdminController(supabase),
    aiController: new AiController(supabase),
    invitationController: new InvitationController(supabase),
    budgetController: new BudgetController(supabase),
    financialProjectionsController: new FinancialProjectionsController(
      supabase
    ),
    userController: new UserController(supabase),
    billingController: new BillingController(supabase),
    cashFlowController: new CashFlowController(supabase, scheduledTransactionService),
    aiChatController: new AIChatController(supabase),
    investmentCalculatorController: new InvestmentCalculatorController(supabase),
    // Analytics controller uses admin client to bypass RLS for tracking
    analyticsController: new AnalyticsController(supabaseAdmin),
    // Recurring transaction controller uses scheduledTransactionService
    recurringTransactionController: new RecurringTransactionController(scheduledTransactionService),
  };
};

module.exports = initializeControllers;
