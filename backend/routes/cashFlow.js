const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { cashFlowController } = controllers;

    // Scheduled Transaction Routes
    router.get('/scheduled-transactions', cashFlowController.getAllScheduledTransactions);
    router.get('/scheduled-transactions/:id', cashFlowController.getScheduledTransactionById);
    router.post('/scheduled-transactions', cashFlowController.createScheduledTransaction);
    router.put('/scheduled-transactions/:id', cashFlowController.updateScheduledTransaction);
    router.delete('/scheduled-transactions/:id', cashFlowController.deleteScheduledTransaction);

    // Calendar Data Route
    router.get('/calendar-data', cashFlowController.getCalendarData);

    return router;
};
