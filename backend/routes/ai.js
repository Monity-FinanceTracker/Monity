const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { aiController } = controllers;

    router.post('/suggest-category', (req, res, next) => aiController.categorizeTransaction(req, res, next));
    router.post('/feedback', (req, res, next) => aiController.recordFeedback(req, res, next));
    router.get('/projections', (req, res, next) => aiController.getProjectedExpenses(req, res, next));
    router.get('/stats', (req, res, next) => aiController.getAIStats(req, res, next));

    return router;
};
