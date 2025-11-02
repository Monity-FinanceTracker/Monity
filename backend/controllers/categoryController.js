const { Category } = require('../models');
const { logger } = require('../utils/logger');
const { supabaseAdmin } = require('../config');

class CategoryController {
    async getAllCategories(req, res) {
        const userId = req.user.id;
        try {
            const categories = await Category.findByUser(userId);
            
            // Get all transactions for the user to count categories
            // Note: category field in transactions is stored as plain text (not encrypted)
            const { data: allTransactions, error: transactionsError } = await supabaseAdmin
                .from('transactions')
                .select('category')
                .eq('userId', userId);

            if (transactionsError) {
                logger.warn('Error fetching transactions for category counting', { error: transactionsError.message });
            }

            // Count transactions per category
            const transactionCounts = {};
            if (allTransactions) {
                allTransactions.forEach(transaction => {
                    const categoryName = transaction.category;
                    if (categoryName) {
                        transactionCounts[categoryName] = (transactionCounts[categoryName] || 0) + 1;
                    }
                });
            }

            // Map categories with their transaction counts
            const categoriesWithCounts = categories.map(category => ({
                ...category,
                transactionCount: transactionCounts[category.name] || 0
            }));

            res.json(categoriesWithCounts);

        } catch (error) {
            logger.error('Failed to get categories for user', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to fetch categories' });
        }
    }

    async createCategory(req, res) {
        const userId = req.user.id;
        const { name, typeId, color, icon, metadata } = req.body;

        if (!name || !typeId) {
            return res.status(400).json({ message: 'Category name and type are required' });
        }

        try {
            const newCategory = {
                name,
                typeId,
                userId: userId,
                color: color || '#01C38D',
                icon: icon || '📦',
                metadata: metadata || {} // Support metadata for internationalization
            };

            const createdCategory = await Category.create(newCategory);
            res.status(201).json(createdCategory);

        } catch (error) {
            logger.error('Failed to create category', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to create category' });
        }
    }

    async updateCategory(req, res) {
        const userId = req.user.id;
        const categoryId = req.params.id;
        const { name, typeId, color, icon } = req.body;

        try {
            const updatedCategory = await Category.update(categoryId, userId, {
                name,
                typeId,
                color,
                icon,
            });

            if (!updatedCategory) {
                return res.status(404).json({ error: 'Category not found or you do not have permission to update it.' });
            }

            res.json(updatedCategory);

        } catch (error) {
            logger.error('Failed to update category', { userId, categoryId, error: error.message });
            res.status(500).json({ error: 'Failed to update category' });
        }
    }

    async deleteCategory(req, res) {
        const userId = req.user.id;
        const categoryId = req.params.id;

        try {
            const deletedCategory = await Category.delete(categoryId, userId);

            if (!deletedCategory) {
                return res.status(404).json({ error: 'Category not found or you do not have permission to delete it.' });
            }

            res.json({ message: 'Category deleted successfully' });
            
        } catch (error)
        {
            logger.error('Failed to delete category', { userId, categoryId, error: error.message });
            res.status(500).json({ error: 'Failed to delete category' });
        }
    }
}

module.exports = CategoryController;
