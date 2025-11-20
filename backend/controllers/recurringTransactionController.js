const ScheduledTransaction = require('../models/ScheduledTransaction');
const { logger } = require('../utils/logger');

class RecurringTransactionController {
    constructor(scheduledTransactionService) {
        this.scheduledTransactionService = scheduledTransactionService;
    }

    /**
     * Get all recurring transactions for the current user
     * GET /recurring-transactions
     */
    async getAllRecurringTransactions(req, res) {
        const userId = req.user.id;
        try {
            const recurringTransactions = await ScheduledTransaction.getAll(userId);
            res.json(recurringTransactions);
        } catch (error) {
            logger.error('Failed to get recurring transactions for user', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to fetch recurring transactions' });
        }
    }

    /**
     * Get a single recurring transaction by ID
     * GET /recurring-transactions/:id
     */
    async getRecurringTransactionById(req, res) {
        const userId = req.user.id;
        const transactionId = req.params.id;
        try {
            const transaction = await ScheduledTransaction.getById(transactionId, userId);
            if (!transaction) {
                return res.status(404).json({ error: 'Recurring transaction not found' });
            }
            res.json(transaction);
        } catch (error) {
            logger.error('Failed to get recurring transaction by ID', { userId, transactionId, error: error.message });
            res.status(500).json({ error: 'Failed to fetch recurring transaction' });
        }
    }

    /**
     * Create a new recurring transaction
     * POST /recurring-transactions
     */
    async createRecurringTransaction(req, res) {
        const userId = req.user.id;
        const { description, amount, category, typeId, frequency, startDate, endDate } = req.body;

        if (!description || !amount || !category || !typeId || !frequency || !startDate) {
            return res.status(400).json({
                error: 'Description, amount, category, typeId, frequency, and startDate are required'
            });
        }

        try {
            const newRecurringTransaction = {
                userId,
                description,
                amount: parseFloat(amount),
                category,
                typeId: parseInt(typeId, 10),
                recurrence_pattern: frequency,
                recurrence_interval: 1,
                next_execution_date: startDate,
                recurrence_end_date: endDate || null,
                is_active: true
            };

            const created = await ScheduledTransaction.create(newRecurringTransaction);

            logger.info('Created recurring transaction', {
                userId,
                transactionId: created.id,
                description: created.description
            });

            res.status(201).json(created);
        } catch (error) {
            logger.error('Failed to create recurring transaction', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to create recurring transaction' });
        }
    }

    /**
     * Update an existing recurring transaction
     * PUT /recurring-transactions/:id
     */
    async updateRecurringTransaction(req, res) {
        const userId = req.user.id;
        const transactionId = req.params.id;
        const { description, amount, category, typeId, frequency, startDate, endDate } = req.body;

        try {
            const existing = await ScheduledTransaction.getById(transactionId, userId);
            if (!existing) {
                return res.status(404).json({ error: 'Recurring transaction not found' });
            }

            const updates = {};
            if (description !== undefined) updates.description = description;
            if (amount !== undefined) updates.amount = parseFloat(amount);
            if (category !== undefined) updates.category = category;
            if (typeId !== undefined) updates.typeId = parseInt(typeId, 10);
            if (frequency !== undefined) updates.recurrence_pattern = frequency;
            if (startDate !== undefined) updates.next_execution_date = startDate;
            if (endDate !== undefined) updates.recurrence_end_date = endDate;

            const updated = await ScheduledTransaction.update(transactionId, userId, updates);

            logger.info('Updated recurring transaction', {
                userId,
                transactionId,
                updates: Object.keys(updates)
            });

            res.json(updated);
        } catch (error) {
            logger.error('Failed to update recurring transaction', { userId, transactionId, error: error.message });
            res.status(500).json({ error: 'Failed to update recurring transaction' });
        }
    }

    /**
     * Delete (deactivate) a recurring transaction
     * DELETE /recurring-transactions/:id
     */
    async deleteRecurringTransaction(req, res) {
        const userId = req.user.id;
        const transactionId = req.params.id;

        try {
            const existing = await ScheduledTransaction.getById(transactionId, userId);
            if (!existing) {
                return res.status(404).json({ error: 'Recurring transaction not found' });
            }

            await ScheduledTransaction.deactivate(transactionId, userId);

            logger.info('Deleted (deactivated) recurring transaction', {
                userId,
                transactionId
            });

            res.json({ message: 'Recurring transaction deleted successfully' });
        } catch (error) {
            logger.error('Failed to delete recurring transaction', { userId, transactionId, error: error.message });
            res.status(500).json({ error: 'Failed to delete recurring transaction' });
        }
    }

    /**
     * Manually process all due recurring transactions
     * POST /recurring-transactions/process
     */
    async processRecurringTransactions(req, res) {
        const userId = req.user.id;

        try {
            logger.info('[RecurringTransactionController] Manual processing triggered by user', { userId });

            // Call the scheduled transaction service to execute due transactions
            await this.scheduledTransactionService.manualExecute();

            logger.info('[RecurringTransactionController] Manual processing completed', { userId });

            res.json({
                success: true,
                message: 'Recurring transactions processed successfully'
            });
        } catch (error) {
            logger.error('[RecurringTransactionController] Failed to process recurring transactions', {
                userId,
                error: error.message,
                stack: error.stack
            });
            res.status(500).json({
                error: 'Failed to process recurring transactions',
                details: error.message
            });
        }
    }
}

module.exports = RecurringTransactionController;
