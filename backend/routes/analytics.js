const express = require('express');
const router = express.Router();

module.exports = (controllers, middleware) => {
    const { analyticsController } = controllers;

    // Use optionalAuth middleware - allows both authenticated and anonymous tracking
    // This ensures req.user is populated when available, but doesn't block anonymous users
    const optionalAuth = middleware.auth.optionalAuth;

    // Public endpoints with optional authentication
    router.post('/track', optionalAuth, (req, res, next) => analyticsController.track(req, res, next));
    router.post('/batch', optionalAuth, (req, res, next) => analyticsController.trackBatch(req, res, next));
    router.post('/session/start', optionalAuth, (req, res, next) => analyticsController.startSession(req, res, next));
    router.post('/session/end', optionalAuth, (req, res, next) => analyticsController.endSession(req, res, next));

    // Authenticated endpoints
    router.post('/identify', 
        middleware.auth.authenticate,
        (req, res, next) => analyticsController.identify(req, res, next)
    );

    // Admin-only endpoints
    router.get('/metrics',
        middleware.auth.authenticate,
        middleware.auth.requireRole("admin"),
        (req, res, next) => analyticsController.getMetrics(req, res, next)
    );
    router.get('/features',
        middleware.auth.authenticate,
        middleware.auth.requireRole("admin"),
        (req, res, next) => analyticsController.getFeatureAdoption(req, res, next)
    );
    router.get('/funnel',
        middleware.auth.authenticate,
        middleware.auth.requireRole("admin"),
        (req, res, next) => analyticsController.getFunnel(req, res, next)
    );
    router.get('/retention',
        middleware.auth.authenticate,
        middleware.auth.requireRole("admin"),
        (req, res, next) => analyticsController.getRetention(req, res, next)
    );
    router.get('/events',
        middleware.auth.authenticate,
        middleware.auth.requireRole("admin"),
        (req, res, next) => analyticsController.getEventCounts(req, res, next)
    );
    router.get('/dashboard',
        middleware.auth.authenticate,
        middleware.auth.requireRole("admin"),
        (req, res, next) => analyticsController.getDashboard(req, res, next)
    );
    router.get('/insights',
        middleware.auth.authenticate,
        middleware.auth.requireRole("admin"),
        (req, res, next) => analyticsController.getInsights(req, res, next)
    );

    return router;
};
