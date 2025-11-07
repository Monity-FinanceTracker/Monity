const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { investmentCalculatorController } = controllers;

    // Calculate investment with compound interest
    router.post('/calculate', (req, res, next) => 
        investmentCalculatorController.calculateInvestment(req, res, next)
    );

    // Get current month usage statistics
    router.get('/usage', (req, res, next) => 
        investmentCalculatorController.getUsage(req, res, next)
    );

    // Get saved simulations (premium only)
    router.get('/simulations', (req, res, next) => 
        investmentCalculatorController.getSavedSimulations(req, res, next)
    );

    // Get usage statistics over time
    router.get('/usage-stats', (req, res, next) => 
        investmentCalculatorController.getUsageStats(req, res, next)
    );

    return router;
};






