const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { recurringTransactionController } = controllers;

    // Get all recurring transactions
    router.get('/', (req, res, next) => recurringTransactionController.getAllRecurringTransactions(req, res, next));

    // Process all due recurring transactions (manual trigger)
    router.post('/process', (req, res, next) => recurringTransactionController.processRecurringTransactions(req, res, next));

    // Get a single recurring transaction by ID
    router.get('/:id', (req, res, next) => recurringTransactionController.getRecurringTransactionById(req, res, next));

    // Create a new recurring transaction
    router.post('/', (req, res, next) => recurringTransactionController.createRecurringTransaction(req, res, next));

    // Update an existing recurring transaction
    router.put('/:id', (req, res, next) => recurringTransactionController.updateRecurringTransaction(req, res, next));

    // Delete (deactivate) a recurring transaction
    router.delete('/:id', (req, res, next) => recurringTransactionController.deleteRecurringTransaction(req, res, next));

    return router;
};
