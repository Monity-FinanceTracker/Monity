const { Transaction } = require('../models');
const SavingsGoal = require('../models/SavingsGoal');
const { logger } = require('../utils/logger');
const { invalidateUserBalance } = require('../services/balanceCache');

class TransactionController {

    async getAllTransactions(req, res) {
        const userId = req.user.id;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

        try {
            const transactions = await Transaction.getAll(userId, { limit, offset });
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

            // Invalidate balance cache since a new transaction was created
            invalidateUserBalance(userId);

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

            // Invalidate balance cache since transaction was updated
            invalidateUserBalance(userId);

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
            // Get the transaction before deleting it to check if it's a savings goal transaction
            // Transaction.getById already returns decrypted data
            const transaction = await Transaction.getById(transactionId, userId);
            
            if (!transaction) {
                return res.status(404).json({ error: 'Transaction not found or you do not have permission to delete it.' });
            }

            // Check if this is a savings goal transaction and update the goal accordingly
            if (transaction.metadata && transaction.typeId === 3) {
                const metadata = typeof transaction.metadata === 'string' 
                    ? JSON.parse(transaction.metadata) 
                    : transaction.metadata;

                if (metadata.savings_goal_id) {
                    const savingsGoalModel = new SavingsGoal(null);
                    const goal = await savingsGoalModel.findById(metadata.savings_goal_id, userId);

                    if (goal) {
                        const transactionAmount = parseFloat(transaction.amount || 0);
                        let newCurrentAmount;

                        if (metadata.operation === 'allocate') {
                            // If deleting an allocation, decrease the goal's current_amount
                            newCurrentAmount = parseFloat(goal.current_amount || 0) - transactionAmount;
                        } else if (metadata.operation === 'withdraw') {
                            // If deleting a withdrawal, increase the goal's current_amount
                            // Withdrawals have negative amounts, so we subtract the negative (which adds)
                            newCurrentAmount = parseFloat(goal.current_amount || 0) - transactionAmount;
                        }

                        // Ensure current_amount doesn't go negative
                        if (newCurrentAmount < 0) {
                            newCurrentAmount = 0;
                        }

                        // Update the goal's current_amount
                        await savingsGoalModel.update(metadata.savings_goal_id, userId, {
                            current_amount: newCurrentAmount
                        });

                        logger.info('Updated savings goal current_amount after transaction deletion', {
                            userId,
                            goalId: metadata.savings_goal_id,
                            operation: metadata.operation,
                            transactionAmount,
                            oldAmount: goal.current_amount,
                            newAmount: newCurrentAmount
                        });
                    }
                }
            }

            // Now delete the transaction
            const deletedTransaction = await Transaction.delete(transactionId, userId);

            if (!deletedTransaction) {
                return res.status(404).json({ error: 'Transaction not found or you do not have permission to delete it.' });
            }

            // Invalidate balance cache since transaction was deleted
            invalidateUserBalance(userId);

            res.json({ message: 'Transaction deleted successfully' });
        } catch (error) {
            logger.error('Failed to delete transaction', { userId, transactionId, error: error.message });
            res.status(500).json({ error: 'Failed to delete transaction' });
        }
    }
}

module.exports = TransactionController;
