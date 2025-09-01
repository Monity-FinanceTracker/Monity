const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { groupController } = controllers;

    // Group CRUD operations
    router.get('/', (req, res, next) => groupController.getAllGroups(req, res, next));
    router.get('/:id', (req, res, next) => groupController.getGroupById(req, res, next));
    router.post('/', (req, res, next) => groupController.createGroup(req, res, next));
    router.put('/:id', (req, res, next) => groupController.updateGroup(req, res, next));
    router.delete('/:id', (req, res, next) => groupController.deleteGroup(req, res, next));
    
    // Group member management
    router.post('/:id/members', (req, res, next) => groupController.addGroupMember(req, res, next));
    router.delete('/:id/members/:userId', (req, res, next) => groupController.removeGroupMember(req, res, next));
    router.post('/:id/invite', (req, res, next) => groupController.sendGroupInvitation(req, res, next));
    
    // Group expense management
    router.post('/:id/expenses', (req, res, next) => groupController.addGroupExpense(req, res, next));
    router.put('/expenses/:expenseId', (req, res, next) => groupController.updateGroupExpense(req, res, next));
    router.delete('/expenses/:expenseId', (req, res, next) => groupController.deleteGroupExpense(req, res, next));
    
    // Expense share settlement
    router.post('/shares/:shareId/settle', (req, res, next) => groupController.settleExpenseShare(req, res, next));

    return router;
};
