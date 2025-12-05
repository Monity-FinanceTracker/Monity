const { Budget } = require('../models');
const { logger } = require('../utils/logger');
const { decrypt, decryptObject } = require('../middleware/encryption');

class BudgetController {
    /**
     * Helper function to calculate and add spent amount to a budget
     * @param {Object} budget - Budget object
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Budget with spent field
     */
    async addSpentToBudget(budget, userId) {
        try {
            // Get category name from the joined categories data
            // Categories might be an object or array, and the name is ENCRYPTED
            let categoryName = null;
            let rawCategoryName = null;
            
            if (budget.categories) {
                // Handle both object and array formats
                if (Array.isArray(budget.categories) && budget.categories.length > 0) {
                    rawCategoryName = budget.categories[0].name;
                } else if (budget.categories.name) {
                    rawCategoryName = budget.categories.name;
                }
            }
            
            // Fallback to direct category field if available
            if (!rawCategoryName) {
                rawCategoryName = budget.category;
            }
            
            if (!rawCategoryName) {
                logger.warn('Budget missing category name', { 
                    budgetId: budget.id, 
                    userId,
                    budgetData: JSON.stringify(budget)
                });
                return { ...budget, spent: 0 };
            }
            
            // Decrypt the category name (categories.name is encrypted)
            // Check if it looks encrypted (has colons and hex format)
            if (rawCategoryName.includes(':') && rawCategoryName.split(':').length === 3) {
                const decrypted = decrypt(rawCategoryName);
                // If decryption succeeded, use decrypted value; otherwise use original
                categoryName = (decrypted && decrypted !== rawCategoryName) ? decrypted : rawCategoryName;
                logger.debug('Decrypted category name', {
                    budgetId: budget.id,
                    encrypted: rawCategoryName.substring(0, 30) + '...',
                    decrypted: categoryName
                });
            } else {
                // Already plain text
                categoryName = rawCategoryName;
            }
            
            if (!categoryName) {
                logger.warn('Failed to decrypt category name', { 
                    budgetId: budget.id, 
                    userId,
                    rawCategoryName: rawCategoryName?.substring(0, 50)
                });
                return { ...budget, spent: 0 };
            }
            
            logger.debug('Calculating spent for budget', {
                budgetId: budget.id,
                categoryName,
                month: budget.month,
                userId
            });
            
            // Calculate spent amount for this budget
            const spent = await Budget.calculateSpentAmount(
                userId,
                categoryName,
                budget.month
            );
            
            logger.debug('Budget spent calculated', {
                budgetId: budget.id,
                categoryName,
                spent,
                month: budget.month
            });
            
            return { ...budget, spent };
        } catch (error) {
            logger.error('Failed to calculate spent for budget', { 
                budgetId: budget.id, 
                userId, 
                error: error.message,
                stack: error.stack
            });
            // Return budget with spent as 0 on error
            return { ...budget, spent: 0 };
        }
    }
    async getAllBudgets(req, res) {
        try {
            const userId = req.user.id;
            const budgets = await Budget.findByUserId(userId);
            
            // Calculate spent amount for each budget
            const budgetsWithSpent = await Promise.all(
                budgets.map(budget => this.addSpentToBudget(budget, userId))
            );
            
            res.json(budgetsWithSpent);
        } catch (error) {
            logger.error('Failed to get budgets', { userId: req.user.id, error: error.message });
            res.status(500).json({ error: 'Failed to fetch budgets' });
        }
    }

    async getBudgetById(req, res) {
        try {
            const userId = req.user.id;
            const budgetId = req.params.id;
            
            const budget = await Budget.findById(budgetId, userId);
            
            if (!budget) {
                return res.status(404).json({ error: 'Budget not found' });
            }
            
            // Calculate and add spent amount
            const budgetWithSpent = await this.addSpentToBudget(budget, userId);
            
            res.json(budgetWithSpent);
        } catch (error) {
            logger.error('Failed to get budget by ID', { 
                userId: req.user.id, 
                budgetId: req.params.id,
                error: error.message 
            });
            res.status(500).json({ error: 'Failed to fetch budget' });
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
            const userId = req.user.id;
            const { id } = req.params;
            
            // Filter out fields that shouldn't be updated (like spent, categories, etc.)
            const allowedFields = ['name', 'amount', 'categoryId', 'month', 'period', 'startDate'];
            const updateData = {};
            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    updateData[field] = req.body[field];
                }
            }
            
            // Handle legacy frontend that sends startDate instead of month
            if (updateData.startDate && !updateData.month) {
                updateData.month = updateData.startDate;
            }
            
            const updatedBudget = await Budget.update(id, userId, updateData);
            if (!updatedBudget) {
                return res.status(404).json({ error: 'Budget not found' });
            }
            
            // Fetch the updated budget with category join to calculate spent
            const budgetWithCategory = await Budget.findById(id, userId);
            if (!budgetWithCategory) {
                return res.status(404).json({ error: 'Budget not found' });
            }
            
            // Calculate and add spent amount
            const budgetWithSpent = await this.addSpentToBudget(budgetWithCategory, userId);
            
            res.json(budgetWithSpent);
        } catch (error) {
            logger.error('Failed to update budget', { 
                userId: req.user.id, 
                budgetId: req.params.id,
                error: error.message,
                stack: error.stack
            });
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
