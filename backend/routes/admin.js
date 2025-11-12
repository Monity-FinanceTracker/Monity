const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { adminController } = controllers;

    router.get('/health', (req, res, next) => adminController.getSystemHealth(req, res, next));
    router.get('/stats', (req, res, next) => adminController.getUserStats(req, res, next));
    router.get('/analytics', (req, res, next) => adminController.getAnalytics(req, res, next));
    router.get('/trends', (req, res, next) => adminController.getTrends(req, res, next));
    router.get('/financial-health', (req, res, next) => adminController.getFinancialHealthMetrics(req, res, next));

    // New admin monitoring endpoints
    router.get('/engagement', (req, res, next) => adminController.getEngagementMetrics(req, res, next));
    router.get('/monetization', (req, res, next) => adminController.getMonetizationMetrics(req, res, next));
    router.get('/errors', (req, res, next) => adminController.getErrorPerformanceMetrics(req, res, next));
    router.get('/segments', (req, res, next) => adminController.getSegments(req, res, next));
    
    // Email validation metrics
    router.get('/email-metrics', (req, res, next) => adminController.getEmailMetrics(req, res, next));

    return router;
};
