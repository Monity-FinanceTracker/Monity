const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { transactionController } = controllers;

    router.get('/', (req, res, next) => transactionController.getAllTransactions(req, res, next));
    router.get('/:id', (req, res, next) => transactionController.getTransactionById(req, res, next));
    router.post('/', (req, res, next) => transactionController.createTransaction(req, res, next));
    router.put('/:id', (req, res, next) => transactionController.updateTransaction(req, res, next));
    router.delete('/:id', (req, res, next) => transactionController.deleteTransaction(req, res, next));

    return router;
};
