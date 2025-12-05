const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
  const { featureDiscoveryController } = controllers;

  // Get all discovered features for current user
  router.get('/discovered', (req, res) => featureDiscoveryController.getDiscoveredFeatures(req, res));

  // Mark a feature as discovered
  router.post('/discover', (req, res) => featureDiscoveryController.discoverFeature(req, res));

  // Get feature discovery statistics
  router.get('/stats', (req, res) => featureDiscoveryController.getFeatureStats(req, res));

  // Reset feature discovery (for testing)
  router.delete('/reset', (req, res) => featureDiscoveryController.resetFeatureDiscovery(req, res));

  return router;
};
