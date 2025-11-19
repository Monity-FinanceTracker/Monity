const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { analyticsController } = controllers;

    // Public endpoints (can be used by authenticated or anonymous users)
    router.post('/track', (req, res, next) => analyticsController.track(req, res, next));
    router.post('/batch', (req, res, next) => analyticsController.trackBatch(req, res, next));
    router.post('/session/start', (req, res, next) => analyticsController.startSession(req, res, next));
    router.post('/session/end', (req, res, next) => analyticsController.endSession(req, res, next));

    // Authenticated endpoints
    router.post('/identify', (req, res, next) => analyticsController.identify(req, res, next));

    // Admin-only endpoints
    router.get('/metrics', (req, res, next) => analyticsController.getMetrics(req, res, next));
    router.get('/features', (req, res, next) => analyticsController.getFeatureAdoption(req, res, next));
    router.get('/funnel', (req, res, next) => analyticsController.getFunnel(req, res, next));
    router.get('/retention', (req, res, next) => analyticsController.getRetention(req, res, next));
    router.get('/events', (req, res, next) => analyticsController.getEventCounts(req, res, next));
    router.get('/dashboard', (req, res, next) => analyticsController.getDashboard(req, res, next));
    router.get('/insights', (req, res, next) => analyticsController.getInsights(req, res, next));

    return router;
};
