const { asyncHandler } = require('../utils/helpers');
const { supabaseAdmin } = require('../config/supabase');
const { decryptObject } = require('../middleware/encryption');
const ScheduledTransaction = require('../models/ScheduledTransaction');
const { logger } = require('../utils/logger');

class CashFlowController {
    constructor(supabase, scheduledTransactionService) {
        this.supabase = supabase;
        this.scheduledTransactionService = scheduledTransactionService;
    }

    /**
     * Get scheduled transactions for a user
     */
    getAllScheduledTransactions = asyncHandler(async (req, res) => {
        const userId = req.user.id;

        try {
            const scheduledTransactions = await ScheduledTransaction.getAll(userId);
            res.json(scheduledTransactions);
        } catch (error) {
            logger.error('Failed to get scheduled transactions', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to fetch scheduled transactions' });
        }
    });

    /**
     * Get a single scheduled transaction
     */
    getScheduledTransactionById = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { id } = req.params;

        try {
            const scheduledTransaction = await ScheduledTransaction.getById(id, userId);

            if (!scheduledTransaction) {
                return res.status(404).json({ error: 'Scheduled transaction not found' });
            }

            res.json(scheduledTransaction);
        } catch (error) {
            logger.error('Failed to get scheduled transaction', { userId, id, error: error.message });
            res.status(500).json({ error: 'Failed to fetch scheduled transaction' });
        }
    });

    /**
     * Create a scheduled transaction
     */
    createScheduledTransaction = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const {
            description,
            amount,
            category,
            typeId,
            scheduled_date,
            recurrence_pattern,
            recurrence_interval,
            recurrence_end_date
        } = req.body;

        // Validation
        if (!description || !amount || !category || !typeId) {
            return res.status(400).json({
                error: 'Description, amount, category, and typeId are required'
            });
        }

        if (recurrence_pattern === 'once' && !scheduled_date) {
            return res.status(400).json({
                error: 'Scheduled date is required for one-time transactions'
            });
        }

        if (recurrence_pattern !== 'once' && !scheduled_date) {
            return res.status(400).json({
                error: 'Initial scheduled date is required for recurring transactions'
            });
        }

        try {
            const scheduledTransactionData = {
                userId,
                description,
                amount: parseFloat(amount),
                category,
                typeId,
                recurrence_pattern: recurrence_pattern || 'once',
                recurrence_interval: recurrence_interval || 1,
                recurrence_end_date: recurrence_end_date || null,
                next_execution_date: scheduled_date,
                last_executed_date: null,
                is_active: true
            };

            const createdScheduledTransaction = await ScheduledTransaction.create(scheduledTransactionData);

            logger.info('Created scheduled transaction', {
                userId,
                scheduledTransactionId: createdScheduledTransaction.id
            });

            res.status(201).json(createdScheduledTransaction);
        } catch (error) {
            logger.error('Failed to create scheduled transaction', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to create scheduled transaction' });
        }
    });

    /**
     * Update a scheduled transaction
     */
    updateScheduledTransaction = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { id } = req.params;
        const updates = req.body;

        try {
            const updatedTransaction = await ScheduledTransaction.update(id, userId, updates);

            if (!updatedTransaction) {
                return res.status(404).json({
                    error: 'Scheduled transaction not found or you do not have permission to update it'
                });
            }

            logger.info('Updated scheduled transaction', { userId, scheduledTransactionId: id });
            res.json(updatedTransaction);
        } catch (error) {
            logger.error('Failed to update scheduled transaction', { userId, id, error: error.message });
            res.status(500).json({ error: 'Failed to update scheduled transaction' });
        }
    });

    /**
     * Delete a scheduled transaction
     */
    deleteScheduledTransaction = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { id } = req.params;

        try {
            const deletedTransaction = await ScheduledTransaction.delete(id, userId);

            if (!deletedTransaction) {
                return res.status(404).json({
                    error: 'Scheduled transaction not found or you do not have permission to delete it'
                });
            }

            logger.info('Deleted scheduled transaction', { userId, scheduledTransactionId: id });
            res.json({ message: 'Scheduled transaction deleted successfully' });
        } catch (error) {
            logger.error('Failed to delete scheduled transaction', { userId, id, error: error.message });
            res.status(500).json({ error: 'Failed to delete scheduled transaction' });
        }
    });

    /**
     * Get calendar data with daily balances for a date range
     */
    getCalendarData = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'start_date and end_date are required' });
        }

        try {
            // Get all past transactions up to end_date
            const { data: pastTransactions, error: txnError } = await supabaseAdmin
                .from('transactions')
                .select('*')
                .eq('userId', userId)
                .lte('date', end_date)
                .order('date', { ascending: true });

            if (txnError) throw txnError;

            // Get scheduled transactions
            const scheduledTransactions = await ScheduledTransaction.getAll(userId);

            // Decrypt past transactions
            const decryptedPastTransactions = pastTransactions.map(txn => {
                const decrypted = decryptObject('transactions', txn);
                return {
                    ...decrypted,
                    amount: parseFloat(decrypted.amount || 0),
                    date: decrypted.date
                };
            });

            // Calculate all scheduled transaction occurrences up to end_date
            // We need ALL occurrences up to end_date (not just in the range) to properly calculate starting balance
            const scheduledOccurrences = [];
            const earliestDate = decryptedPastTransactions.length > 0
                ? decryptedPastTransactions[0].date
                : start_date;

            for (const scheduledTxn of scheduledTransactions) {
                const occurrences = this.scheduledTransactionService.calculateOccurrencesInRange(
                    scheduledTxn,
                    earliestDate,
                    end_date
                );
                scheduledOccurrences.push(...occurrences);
            }

            // Calculate daily balances
            const dailyBalances = this.calculateDailyBalances(
                decryptedPastTransactions,
                scheduledOccurrences,
                start_date,
                end_date
            );

            res.json({
                dailyBalances,
                pastTransactions: decryptedPastTransactions.filter(
                    txn => txn.date >= start_date && txn.date <= end_date
                ),
                scheduledOccurrences
            });
        } catch (error) {
            logger.error('Failed to get calendar data', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to fetch calendar data' });
        }
    });

    /**
     * Calculate daily balances including past and future transactions
     */
    calculateDailyBalances(pastTransactions, scheduledOccurrences, startDate, endDate) {
        const dailyBalances = {};

        // Calculate balance up to start date from all past transactions and scheduled transactions
        let runningBalance = 0;
        const beforeStartDate = pastTransactions.filter(txn => txn.date < startDate);
        const scheduledBeforeStartDate = scheduledOccurrences.filter(occur => occur.execution_date < startDate);

        // Add past actual transactions
        beforeStartDate.forEach(txn => {
            if (txn.typeId === 2) { // Income
                runningBalance += txn.amount;
            } else if (txn.typeId === 1) { // Expense
                runningBalance -= txn.amount;
            } else if (txn.typeId === 3) { // Savings
                runningBalance += txn.amount;
            }
        });

        // Add scheduled transactions that occurred before start date
        scheduledBeforeStartDate.forEach(scheduled => {
            if (scheduled.typeId === 2) { // Income
                runningBalance += parseFloat(scheduled.amount);
            } else if (scheduled.typeId === 1) { // Expense
                runningBalance -= parseFloat(scheduled.amount);
            } else if (scheduled.typeId === 3) { // Savings
                runningBalance += parseFloat(scheduled.amount);
            }
        });

        // Generate all dates in the range
        const currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);

        while (currentDate <= endDateObj) {
            const dateStr = currentDate.toISOString().split('T')[0];

            // Get transactions for this date
            const transactionsForDate = pastTransactions.filter(txn => txn.date === dateStr);
            const scheduledForDate = scheduledOccurrences.filter(
                occur => occur.execution_date === dateStr
            );

            // Calculate balance change for this day
            let dailyChange = 0;

            // Add actual transactions
            transactionsForDate.forEach(txn => {
                if (txn.typeId === 2) { // Income
                    dailyChange += txn.amount;
                } else if (txn.typeId === 1) { // Expense
                    dailyChange -= txn.amount;
                } else if (txn.typeId === 3) { // Savings
                    dailyChange += txn.amount;
                }
            });

            // Add scheduled transactions for this date
            scheduledForDate.forEach(scheduled => {
                if (scheduled.typeId === 2) { // Income
                    dailyChange += parseFloat(scheduled.amount);
                } else if (scheduled.typeId === 1) { // Expense
                    dailyChange -= parseFloat(scheduled.amount);
                } else if (scheduled.typeId === 3) { // Savings
                    dailyChange += parseFloat(scheduled.amount);
                }
            });

            runningBalance += dailyChange;

            const today = new Date().toISOString().split('T')[0];

            dailyBalances[dateStr] = {
                date: dateStr,
                balance: runningBalance,
                income: transactionsForDate
                    .filter(txn => txn.typeId === 2)
                    .reduce((sum, txn) => sum + txn.amount, 0) +
                    scheduledForDate
                        .filter(s => s.typeId === 2)
                        .reduce((sum, s) => sum + parseFloat(s.amount), 0),
                expenses: transactionsForDate
                    .filter(txn => txn.typeId === 1)
                    .reduce((sum, txn) => sum + txn.amount, 0) +
                    scheduledForDate
                        .filter(s => s.typeId === 1)
                        .reduce((sum, s) => sum + parseFloat(s.amount), 0),
                isNegative: runningBalance < 0,
                isPast: dateStr < today,
                isToday: dateStr === today,
                isFuture: dateStr > today
            };

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dailyBalances;
    }
}

module.exports = CashFlowController;
