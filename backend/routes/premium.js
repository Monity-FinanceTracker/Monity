const express = require('express');
const router = express.Router();

module.exports = (controllers, middleware) => {
  const { premiumPromptController } = controllers;

  // Check if prompt should be shown
  router.get('/should-show-prompt', (req, res) => premiumPromptController.shouldShowPrompt(req, res));

  // Record prompt action
  router.post('/prompt-action', (req, res) => premiumPromptController.recordPromptAction(req, res));

  // Get user's prompt history
  router.get('/prompt-history', (req, res) => premiumPromptController.getPromptHistory(req, res));

  // Get user's prompt statistics
  router.get('/prompt-stats', (req, res) => premiumPromptController.getPromptStats(req, res));

  // Reset snooze for a prompt
  router.post('/reset-snooze', (req, res) => premiumPromptController.resetSnooze(req, res));

  // Admin: Get conversion metrics (requires admin role)
  router.get(
    '/admin/conversion-metrics',
    middleware.auth.requireRole('admin'),
    (req, res) => premiumPromptController.getConversionMetrics(req, res)
  );

  return router;
};
