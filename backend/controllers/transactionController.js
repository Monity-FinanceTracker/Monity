const { Transaction } = require('../models');
const { logger } = require('../utils/logger');

class TransactionController {

    async getAllTransactions(req, res) {
        const userId = req.user.id;
        try {
            const transactions = await Transaction.getAll(userId);
            res.json(transactions);
        } catch (error) {
            logger.error('Failed to get transactions for user', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to fetch transactions' });
        }
    }

    async getTransactionById(req, res) {
        const userId = req.user.id;
        const transactionId = req.params.id;
        try {
            const transaction = await Transaction.getById(transactionId, userId);
            if (!transaction) {
                return res.status(404).json({ error: 'Transaction not found' });
            }
            res.json(transaction);
        } catch (error) {
            logger.error('Failed to get transaction by ID', { userId, transactionId, error: error.message });
            res.status(500).json({ error: 'Failed to fetch transaction' });
        }
    }

    async createTransaction(req, res) {
        const userId = req.user.id;
        const { description, amount, category, date, typeId, wasAISuggested, aiConfidence, suggestedCategory } = req.body;

        if (!description || !amount || !category || !date || !typeId) {
            return res.status(400).json({ message: 'Description, amount, category, date, and typeId are required' });
        }

        try {
            const newTransaction = {
                userId,
                description,
                amount: parseFloat(amount),
                category,
                date,
                typeId,
            };

            const createdTransaction = await Transaction.create(newTransaction);
            
            // Handle AI feedback separately, should not block the main transaction flow
            if (wasAISuggested && suggestedCategory) {
                // This could be offloaded to a queue in a larger application
                const smartCategorizationService = new (require('../services/smartCategorizationService'))(this.supabase);
                smartCategorizationService.recordFeedback(
                    userId,
                    description,
                    suggestedCategory,
                    category,
                    suggestedCategory === category,
                    aiConfidence || 0.5,
                    parseFloat(amount)
                ).catch(err => logger.error('Failed to record AI feedback', { error: err.message }));
            }

            res.status(201).json(createdTransaction);
        } catch (error) {
            logger.error('Failed to create transaction', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to create transaction' });
        }
    }

    async updateTransaction(req, res) {
        const userId = req.user.id;
        const transactionId = req.params.id;
        const { description, amount, category, date, typeId } = req.body;

        try {
            const updatedTransaction = await Transaction.update(transactionId, userId, {
                description,
                amount,
                category,
                date,
                typeId
            });

            if (!updatedTransaction) {
                return res.status(404).json({ error: 'Transaction not found or you do not have permission to update it.' });
            }

            res.json(updatedTransaction);
        } catch (error) {
            logger.error('Failed to update transaction', { userId, transactionId, error: error.message });
            res.status(500).json({ error: 'Failed to update transaction' });
        }
    }

    async deleteTransaction(req, res) {
        const userId = req.user.id;
        const transactionId = req.params.id;

        try {
            const deletedTransaction = await Transaction.delete(transactionId, userId);

            if (!deletedTransaction) {
                return res.status(404).json({ error: 'Transaction not found or you do not have permission to delete it.' });
            }

            res.json({ message: 'Transaction deleted successfully' });
        } catch (error) {
            logger.error('Failed to delete transaction', { userId, transactionId, error: error.message });
            res.status(500).json({ error: 'Failed to delete transaction' });
        }
    }
}

module.exports = TransactionController;
