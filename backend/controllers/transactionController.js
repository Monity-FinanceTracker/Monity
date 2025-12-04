const { Transaction } = require('../models');
const SavingsGoal = require('../models/SavingsGoal');
const { logger } = require('../utils/logger');
const { invalidateUserBalance } = require('../services/balanceCache');
const DataExportService = require('../services/dataExportService');

class TransactionController {
    constructor() {
        const { supabaseAdmin } = require('../config/supabase');
        this.supabase = supabaseAdmin;
        this.dataExportService = new DataExportService(supabaseAdmin);
    }

    /**
     * Helper method to update onboarding checklist progress
     * @param {string} userId - User ID
     * @param {Object} items - Object with checklist items to mark as complete
     */
    async updateOnboardingChecklist(userId, items) {
        try {
            // Get current checklist progress
            const { data: currentData, error: fetchError } = await this.supabase
                .from('user_onboarding')
                .select('checklist_progress')
                .eq('user_id', userId)
                .single();

            let checklistProgress = {};
            
            // If record doesn't exist, create it with initial progress
            if (fetchError && fetchError.code === 'PGRST116') {
                // No record exists, create one with the items we want to set
                checklistProgress = {};
                Object.keys(items).forEach(key => {
                    if (items[key] === true) {
                        checklistProgress[key] = true;
                    }
                });
                
                const { error: createError } = await this.supabase
                    .from('user_onboarding')
                    .insert({
                        user_id: userId,
                        checklist_progress: checklistProgress,
                        onboarding_completed: false,
                        created_at: new Date().toISOString()
                    });

                if (createError) {
                    logger.warn('Failed to create onboarding record', { userId, error: createError.message });
                    return;
                } else {
                    logger.info('Created onboarding record with checklist progress', { userId, checklistProgress });
                    return; // Already set, no need to update
                }
            } else if (fetchError) {
                // Other error
                logger.warn('Could not fetch onboarding progress', { userId, error: fetchError.message });
                return;
            } else {
                // Record exists, use current progress
                checklistProgress = currentData?.checklist_progress || {};
            }
            
            // Update items
            Object.keys(items).forEach(key => {
                if (items[key] === true) {
                    checklistProgress[key] = true;
                }
            });

            // Update checklist in database
            const { data: updateData, error: updateError } = await this.supabase
                .from('user_onboarding')
                .update({
                    checklist_progress: checklistProgress
                })
                .eq('user_id', userId)
                .select('checklist_progress');

            if (updateError) {
                logger.warn('Failed to update onboarding checklist', { userId, error: updateError.message, errorCode: updateError.code });
            } else {
                logger.info('Updated onboarding checklist successfully', { 
                    userId, 
                    items: Object.keys(items), 
                    updatedProgress: updateData?.[0]?.checklist_progress || checklistProgress,
                    download_report: checklistProgress.download_report
                });
            }
        } catch (error) {
            logger.error('Error updating onboarding checklist', { userId, error: error.message, stack: error.stack });
        }
    }

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

                // Mark onboarding checklist items as complete (AI categorization + first transaction)
                // This is done asynchronously and should not block the response
                this.updateOnboardingChecklist(userId, {
                    add_first_transaction: true,
                    explore_ai_categorization: true
                }).catch(err => logger.error('Failed to update onboarding checklist', { error: err.message }));
            } else {
                // Mark first transaction as complete (if not already marked)
                this.updateOnboardingChecklist(userId, {
                    add_first_transaction: true
                }).catch(err => logger.error('Failed to update onboarding checklist', { error: err.message }));
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

    async exportTransactions(req, res) {
        const userId = req.user.id;
        const { startDate, endDate } = req.body;

        try {
            logger.info(`Transaction export requested for user ${userId}`, { startDate, endDate });

            // Export transactions as CSV
            const csvData = await this.dataExportService.exportTransactions(userId, 'csv', {
                startDate: startDate || null,
                endDate: endDate || null
            });

            // Set appropriate headers for CSV download
            const filename = `monity-transactions-${userId}-${Date.now()}.csv`;
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            logger.info(`Transaction export completed successfully for user ${userId}`);

            // Mark onboarding checklist item as complete (download_report)
            // This is done BEFORE sending the response to ensure it executes
            // We do it in a fire-and-forget manner but ensure it starts before response
            this.updateOnboardingChecklist(userId, {
                download_report: true
            }).catch(err => {
                logger.error('Failed to update onboarding checklist for export', { 
                    userId, 
                    error: err.message,
                    stack: err.stack 
                });
            });

            // Send CSV data after starting the checklist update
            res.send(csvData);

        } catch (error) {
            logger.error('An unexpected error occurred during transaction export', {
                userId,
                error: error.message
            });

            // Handle specific error cases
            if (error.message.includes('No transactions found')) {
                return res.status(404).json({ 
                    error: 'No transactions found for the given criteria.' 
                });
            }

            res.status(500).json({ 
                error: 'Internal Server Error during transaction export',
                message: error.message 
            });
        }
    }
}

module.exports = TransactionController;
