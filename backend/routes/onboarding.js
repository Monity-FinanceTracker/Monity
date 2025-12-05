const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
  const { onboardingController } = controllers;

  // Get onboarding progress
  router.get('/progress', (req, res) => onboardingController.getOnboardingProgress(req, res));

  // Start onboarding
  router.post('/start', (req, res) => onboardingController.startOnboarding(req, res));

  // Complete a step
  router.post('/complete-step', (req, res) => onboardingController.completeStep(req, res));

  // Complete entire onboarding
  router.post('/complete', (req, res) => onboardingController.completeOnboarding(req, res));

  // Skip onboarding
  router.post('/skip', (req, res) => onboardingController.skipOnboarding(req, res));

  // Update checklist progress
  router.post('/checklist', (req, res) => onboardingController.updateChecklistProgress(req, res));

  return router;
};
