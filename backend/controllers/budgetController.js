const { Budget } = require('../models');
const { logger } = require('../utils/logger');

class BudgetController {
    async getAllBudgets(req, res) {
        try {
            const budgets = await Budget.findByUserId(req.user.id);
            res.json(budgets);
        } catch (error) {
            logger.error('Failed to get budgets', { userId: req.user.id, error: error.message });
            res.status(500).json({ error: 'Failed to fetch budgets' });
        }
    }

    async createBudget(req, res) {
        try {
            console.log('=== BUDGET CREATION DEBUG ===');
            console.log('Request body:', req.body);
            console.log('User ID:', req.user.id);
            
            const budgetData = { ...req.body, userId: req.user.id };
            
            // Handle legacy frontend that sends startDate instead of month
            if (budgetData.startDate && !budgetData.month) {
                budgetData.month = budgetData.startDate;
            }
            
            // Ensure month field is present (required by database)
            if (!budgetData.month) {
                budgetData.month = new Date().toISOString().split('T')[0];
            }
            
            // Validate required fields
            if (!budgetData.name || !budgetData.amount || !budgetData.categoryId) {
                return res.status(400).json({ 
                    error: 'Missing required fields: name, amount, and categoryId are required' 
                });
            }
            
            console.log('Budget data to create:', budgetData);
            
            const newBudget = await Budget.create(budgetData);
            console.log('=== BUDGET CREATED SUCCESSFULLY ===');
            res.status(201).json(newBudget);
        } catch (error) {
            console.error('=== BUDGET CREATION ERROR ===');
            console.error('Error details:', error);
            logger.error('Failed to create budget', { userId: req.user.id, error: error.message });
            res.status(500).json({ error: 'Failed to create budget' });
        }
    }

    async updateBudget(req, res) {
        try {
            const { id } = req.params;
            const updatedBudget = await Budget.update(id, req.user.id, req.body);
            if (!updatedBudget) {
                return res.status(404).json({ error: 'Budget not found' });
            }
            res.json(updatedBudget);
        } catch (error) {
            logger.error('Failed to update budget', { userId: req.user.id, error: error.message });
            res.status(500).json({ error: 'Failed to update budget' });
        }
    }

    async deleteBudget(req, res) {
        try {
            const { id } = req.params;
            const result = await Budget.delete(id, req.user.id);
            if (!result.success) {
                return res.status(404).json({ error: 'Budget not found' });
            }
            res.status(204).send();
        } catch (error) {
            logger.error('Failed to delete budget', { userId: req.user.id, error: error.message });
            res.status(500).json({ error: 'Failed to delete budget' });
        }
    }
}

module.exports = BudgetController;
