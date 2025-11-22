const express = require("express");
const router = express.Router();
const path = require("path");

const healthRoutes = require("./health");
const authRoutes = require("./auth");
const transactionRoutes = require("./transactions");
const categoryRoutes = require("./categories");
const groupRoutes = require("./groups");
const savingsGoalsRoutes = require("./savingsGoals");
const adminRoutes = require("./admin");
const aiRoutes = require("./ai");
const aiChatRoutes = require("./aiChat");
const subscriptionRoutes = require("./subscription");
const balanceRoutes = require("./balance");
const invitationRoutes = require("./invitations");
const budgetRoutes = require("./budgets");
const financialProjectionsRoutes = require("./financialProjections");
const userRoutes = require("./users");
const billingRoutes = require("./billing");
const cashFlowRoutes = require("./cashFlow");
const investmentCalculatorRoutes = require("./investmentCalculator");
const analyticsRoutes = require("./analytics");
const recurringTransactionsRoutes = require("./recurringTransactions");

module.exports = (controllers, middleware) => {
  // Version 1 of the API
  const v1Router = express.Router();

  // Health check route - public, no rate limiting or auth
  v1Router.use("/health", healthRoutes(controllers, middleware));

  // Apply general rate limiting to all v1 routes
  v1Router.use(middleware.rateLimiter.apiLimiter);

  // Auth routes have a stricter rate limit
  v1Router.use(
    "/auth",
    middleware.rateLimiter.authLimiter,
    authRoutes(controllers, middleware)
  );

  // Authenticated routes
  v1Router.get(
    "/months",
    middleware.auth.authenticate,
    controllers.balanceController.getMonths
  );
  v1Router.use(
    "/transactions",
    middleware.auth.authenticate,
    transactionRoutes(controllers)
  );
  v1Router.use(
    "/categories",
    middleware.auth.authenticate,
    categoryRoutes(controllers)
  );
  v1Router.use(
    "/groups",
    middleware.auth.authenticate,
    groupRoutes(controllers)
  );
  v1Router.use(
    "/savings-goals",
    middleware.auth.authenticate,
    savingsGoalsRoutes(controllers)
  );
  v1Router.use("/ai", middleware.auth.authenticate, aiRoutes(controllers));
  v1Router.use("/ai-chat", middleware.auth.authenticate, aiChatRoutes(controllers));
  v1Router.use(
    "/subscription-tier",
    middleware.auth.authenticate,
    subscriptionRoutes(controllers)
  );
  v1Router.use(
    "/balance",
    middleware.auth.authenticate,
    balanceRoutes(controllers)
  );
  v1Router.use(
    "/invitations",
    middleware.auth.authenticate,
    invitationRoutes(controllers)
  );
  v1Router.use(
    "/budgets",
    middleware.auth.authenticate,
    budgetRoutes(controllers)
  );
  v1Router.use(
    "/financial-projections",
    middleware.auth.authenticate,
    financialProjectionsRoutes(controllers)
  );
  v1Router.use("/users", middleware.auth.authenticate, userRoutes(controllers));
  v1Router.use(
    "/billing",
    middleware.auth.authenticate,
    billingRoutes(controllers)
  );
  v1Router.use(
    "/cashflow",
    middleware.auth.authenticate,
    cashFlowRoutes(controllers)
  );
  v1Router.use(
    "/investment-calculator",
    middleware.auth.authenticate,
    investmentCalculatorRoutes(controllers)
  );
  v1Router.use(
    "/recurring-transactions",
    middleware.auth.authenticate,
    recurringTransactionsRoutes(controllers)
  );

  // Analytics routes - mixed public/admin (auth handled per-route)
  v1Router.use("/analytics", analyticsRoutes(controllers, middleware));

  // Admin routes with role check
  v1Router.use(
    "/admin",
    middleware.auth.authenticate,
    middleware.auth.requireRole("admin"),
    adminRoutes(controllers)
  );

  return v1Router;
};
