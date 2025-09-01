const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { balanceController } = controllers;
    
    router.get('/all', balanceController.getBalance);
    router.get('/savings-overview', balanceController.getSavingsOverview);
    router.get('/:month/:year', balanceController.getMonthlyBalance);
    router.get('/history', balanceController.getBalanceHistory);
    
    return router;
};
