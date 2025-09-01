const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { budgetController } = controllers;

    router.get('/', budgetController.getAllBudgets.bind(budgetController));
    router.post('/', budgetController.createBudget.bind(budgetController));
    router.put('/:id', budgetController.updateBudget.bind(budgetController));
    router.delete('/:id', budgetController.deleteBudget.bind(budgetController));

    return router;
};
