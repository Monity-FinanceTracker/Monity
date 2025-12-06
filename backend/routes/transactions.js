const express = require('express');
const router = express.Router();

module.exports = (controllers, middleware) => {
    const { transactionController } = controllers;

    router.get('/', (req, res, next) => transactionController.getAllTransactions(req, res, next));
    
    // Export transactions - Premium only (must be before /:id route)
    if (middleware && middleware.auth && middleware.auth.checkPremium) {
        router.post('/export',
            middleware.auth.checkPremium,
            (req, res, next) => transactionController.exportTransactions(req, res, next)
        );
    } else {
        // Fallback if middleware not provided
        const { checkPremium } = require('../middleware/auth');
        router.post('/export',
            checkPremium,
            (req, res, next) => transactionController.exportTransactions(req, res, next)
        );
    }
    
    router.get('/:id', (req, res, next) => transactionController.getTransactionById(req, res, next));
    router.post('/', (req, res, next) => transactionController.createTransaction(req, res, next));
    router.put('/:id', (req, res, next) => transactionController.updateTransaction(req, res, next));
    router.delete('/:id', (req, res, next) => transactionController.deleteTransaction(req, res, next));

    return router;
};
