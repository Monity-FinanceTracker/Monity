const cron = require('node-cron');
const ScheduledTransaction = require('../models/ScheduledTransaction');
const Transaction = require('../models/Transaction');
const { logger } = require('../utils/logger');

class ScheduledTransactionService {
    constructor() {
        this.isInitialized = false;
        this.cronJob = null;
    }

    /**
     * Initialize the scheduled transaction service
     */
    initialize() {
        if (this.isInitialized) {
            logger.info('[ScheduledTransactionService] Already initialized');
            return;
        }

        try {
            logger.info('[ScheduledTransactionService] Initializing...');

            // Run every day at 00:01 (1 minute past midnight)
            this.cronJob = cron.schedule('1 0 * * *', async () => {
                logger.info('[ScheduledTransactionService] Running daily scheduled transaction check...');
                await this.executeScheduledTransactions();
            }, {
                scheduled: true,
                timezone: "UTC"
            });

            this.isInitialized = true;
            logger.info('[ScheduledTransactionService] Initialized successfully. Cron job scheduled for 00:01 UTC daily.');

        } catch (error) {
            logger.error('[ScheduledTransactionService] Failed to initialize:', { error: error.message });
        }
    }

    /**
     * Execute all scheduled transactions that are due
     */
    async executeScheduledTransactions() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of day

            const dueTransactions = await ScheduledTransaction.getAllDueTransactions(today);

            logger.info(`[ScheduledTransactionService] Found ${dueTransactions.length} transactions to execute`);

            for (const scheduledTxn of dueTransactions) {
                try {
                    await this.executeTransaction(scheduledTxn);
                } catch (error) {
                    logger.error(`[ScheduledTransactionService] Failed to execute transaction ${scheduledTxn.id}:`, {
                        error: error.message,
                        transactionId: scheduledTxn.id
                    });
                    // Continue with other transactions even if one fails
                }
            }

            logger.info('[ScheduledTransactionService] Completed scheduled transaction execution');
        } catch (error) {
            logger.error('[ScheduledTransactionService] Error during scheduled transaction execution:', {
                error: error.message
            });
        }
    }

    /**
     * Execute a single scheduled transaction
     */
    async executeTransaction(scheduledTxn) {
        // Create the actual transaction
        const transactionData = {
            userId: scheduledTxn.userId,
            description: scheduledTxn.description,
            amount: parseFloat(scheduledTxn.amount),
            category: scheduledTxn.category,
            date: scheduledTxn.next_execution_date,
            typeId: scheduledTxn.typeId,
        };

        const createdTransaction = await Transaction.create(transactionData);

        logger.info(`[ScheduledTransactionService] Created transaction from scheduled transaction ${scheduledTxn.id}`, {
            transactionId: createdTransaction.id,
            userId: scheduledTxn.userId
        });

        // Update the scheduled transaction for next execution
        if (scheduledTxn.recurrence_pattern === 'once') {
            // Deactivate one-time transactions
            await ScheduledTransaction.deactivate(scheduledTxn.id, scheduledTxn.userId);
            logger.info(`[ScheduledTransactionService] Deactivated one-time scheduled transaction ${scheduledTxn.id}`);
        } else {
            // Calculate next execution date for recurring transactions
            const nextDate = this.calculateNextExecutionDate(
                scheduledTxn.next_execution_date,
                scheduledTxn.recurrence_pattern,
                scheduledTxn.recurrence_interval || 1
            );

            // Check if we've passed the end date
            if (scheduledTxn.recurrence_end_date && nextDate > new Date(scheduledTxn.recurrence_end_date)) {
                await ScheduledTransaction.deactivate(scheduledTxn.id, scheduledTxn.userId);
                logger.info(`[ScheduledTransactionService] Deactivated scheduled transaction ${scheduledTxn.id} - end date reached`);
            } else {
                await ScheduledTransaction.update(scheduledTxn.id, scheduledTxn.userId, {
                    last_executed_date: scheduledTxn.next_execution_date,
                    next_execution_date: nextDate.toISOString().split('T')[0]
                });
                logger.info(`[ScheduledTransactionService] Updated scheduled transaction ${scheduledTxn.id} - next execution: ${nextDate.toISOString().split('T')[0]}`);
            }
        }

        return createdTransaction;
    }

    /**
     * Calculate the next execution date based on recurrence pattern
     */
    calculateNextExecutionDate(currentDateStr, pattern, interval = 1) {
        const currentDate = new Date(currentDateStr);
        const nextDate = new Date(currentDate);

        switch (pattern) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + interval);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + (7 * interval));
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + interval);
                break;
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + interval);
                break;
            default:
                throw new Error(`Unknown recurrence pattern: ${pattern}`);
        }

        return nextDate;
    }

    /**
     * Calculate all future occurrences of a scheduled transaction within a date range
     */
    calculateOccurrencesInRange(scheduledTxn, startDate, endDate) {
        if (!scheduledTxn.is_active) {
            return [];
        }

        const occurrences = [];
        let currentDate = new Date(scheduledTxn.next_execution_date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        const recurrenceEnd = scheduledTxn.recurrence_end_date
            ? new Date(scheduledTxn.recurrence_end_date)
            : null;

        // For one-time transactions
        if (scheduledTxn.recurrence_pattern === 'once') {
            if (currentDate >= start && currentDate <= end) {
                occurrences.push({
                    ...scheduledTxn,
                    execution_date: currentDate.toISOString().split('T')[0]
                });
            }
            return occurrences;
        }

        // For recurring transactions
        const maxIterations = 1000; // Safety limit
        let iterations = 0;

        // If the next execution date is before the start date, fast-forward to find the first occurrence in range
        while (currentDate < start && iterations < maxIterations) {
            currentDate = this.calculateNextExecutionDate(
                currentDate.toISOString().split('T')[0],
                scheduledTxn.recurrence_pattern,
                scheduledTxn.recurrence_interval || 1
            );
            iterations++;
        }

        // Now generate all occurrences within the range
        while (currentDate <= end && iterations < maxIterations) {
            // Check if we've passed the recurrence end date
            if (recurrenceEnd && currentDate > recurrenceEnd) {
                break;
            }

            if (currentDate >= start && currentDate <= end) {
                occurrences.push({
                    ...scheduledTxn,
                    execution_date: currentDate.toISOString().split('T')[0]
                });
            }

            currentDate = this.calculateNextExecutionDate(
                currentDate.toISOString().split('T')[0],
                scheduledTxn.recurrence_pattern,
                scheduledTxn.recurrence_interval || 1
            );

            iterations++;
        }

        return occurrences;
    }

    /**
     * Manually trigger execution (for testing or manual runs)
     */
    async manualExecute() {
        logger.info('[ScheduledTransactionService] Manual execution triggered');
        await this.executeScheduledTransactions();
    }

    /**
     * Stop the cron job
     */
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.isInitialized = false;
            logger.info('[ScheduledTransactionService] Stopped');
        }
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            cronJobActive: this.cronJob ? true : false
        };
    }
}

module.exports = ScheduledTransactionService;
