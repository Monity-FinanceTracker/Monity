const express = require('express');
const router = express.Router();

module.exports = (controllers, middleware) => {
    const { authController } = controllers;

    router.post('/register', (req, res, next) => authController.register(req, res, next));
    router.post('/login', (req, res, next) => authController.login(req, res, next));
    router.get('/profile', middleware.auth.authenticate, (req, res, next) => authController.getProfile(req, res, next));
    router.get('/financial-health', middleware.auth.authenticate, (req, res, next) => authController.getFinancialHealth(req, res, next));

    // Account management endpoints
    router.delete('/account', middleware.auth.authenticate, (req, res, next) => authController.deleteAccount(req, res, next));

    // Data export endpoint - Premium feature only
    router.post('/account/export-data',
        middleware.auth.authenticate,
        middleware.auth.checkPremium,
        (req, res, next) => authController.exportUserData(req, res, next)
    );

    return router;
};
