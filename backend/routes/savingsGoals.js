const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { savingsGoalController } = controllers;

    router.get('/', savingsGoalController.getAllSavingsGoals.bind(savingsGoalController));
    router.post('/', savingsGoalController.createSavingsGoal.bind(savingsGoalController));
    router.get('/:id', savingsGoalController.getSavingsGoalById.bind(savingsGoalController));
    router.put('/:id', savingsGoalController.updateSavingsGoal.bind(savingsGoalController));
    router.delete('/:id', savingsGoalController.deleteSavingsGoal.bind(savingsGoalController));
    router.post('/:id/allocate', savingsGoalController.allocateToGoal.bind(savingsGoalController));
    router.post('/:id/withdraw', savingsGoalController.withdrawFromGoal.bind(savingsGoalController));

    return router;
};
