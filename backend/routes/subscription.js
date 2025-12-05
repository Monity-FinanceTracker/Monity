const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
  const { subscriptionController } = controllers;

  /**
   * Subscription Routes
   * All routes require authentication
   */

  // Get usage statistics
  router.get('/usage-stats', (req, res) => subscriptionController.getUsageStats(req, res));

  // Get subscription details
  router.get('/details', (req, res) => subscriptionController.getSubscriptionDetails(req, res));

  return router;
};
