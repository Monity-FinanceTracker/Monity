const { supabaseAdmin } = require('../config');
const { decryptObject, encryptObject } = require('../middleware/encryption');

const TABLE_NAME = 'budgets';

class Budget {
    static async create(budgetData) {
        const encryptedData = encryptObject(TABLE_NAME, budgetData);
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .insert([encryptedData])
            .select()
            .single();
        if (error) throw new Error(`Error creating budget: ${error.message}`);
        return decryptObject(TABLE_NAME, data);
    }

    static async findByUserId(userId) {
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .select('*, categories(id, name)')
            .eq('userId', userId);
        if (error) throw new Error(`Error fetching budgets: ${error.message}`);
        return decryptObject(TABLE_NAME, data);
    }

    /**
     * Calculate spent amount for a budget based on transactions
     * @param {string} userId - User ID
     * @param {string} categoryName - Category name to match transactions
     * @param {string} month - Budget month in format YYYY-MM-DD
     * @returns {Promise<number>} Total spent amount
     */
    static async calculateSpentAmount(userId, categoryName, month) {
        try {
            const { logger } = require('../utils/logger');
            
            // Parse month to get date range
            const monthDate = new Date(month);
            const year = monthDate.getFullYear();
            const monthIndex = monthDate.getMonth();
            
            // First day of the month
            const startDate = new Date(year, monthIndex, 1).toISOString().split('T')[0];
            
            // First day of next month (exclusive end)
            const endDate = new Date(year, monthIndex + 1, 1).toISOString().split('T')[0];

            logger.debug('Budget calculation query params', {
                userId,
                categoryName,
                month,
                startDate,
                endDate
            });

            // Query transactions for this user, date range, and expense type
            // Note: category is stored as plain text, but we'll filter after decryption
            // to handle any edge cases with exact matching
            const { data: transactions, error } = await supabaseAdmin
                .from('transactions')
                .select('amount, category, date, typeId')
                .eq('userId', userId)
                .eq('typeId', 1) // Only expenses
                .gte('date', startDate)
                .lt('date', endDate);

            if (error) {
                logger.error('Error fetching transactions for budget', {
                    error: error.message,
                    userId,
                    categoryName,
                    startDate,
                    endDate
                });
                throw new Error(`Error fetching transactions for budget calculation: ${error.message}`);
            }

            logger.debug('Transactions found for budget (before filtering)', {
                userId,
                categoryName,
                transactionCount: transactions?.length || 0,
                rawTransactions: transactions
            });

            // Decrypt transactions
            const decryptedTransactions = decryptObject('transactions', transactions || []);
            
            // Filter by category name after decryption (case-insensitive match)
            const matchingTransactions = decryptedTransactions.filter(txn => {
                const txnCategory = (txn.category || '').trim();
                const budgetCategory = (categoryName || '').trim();
                return txnCategory.toLowerCase() === budgetCategory.toLowerCase();
            });
            
            logger.debug('Decrypted and filtered transactions', {
                userId,
                categoryName,
                totalTransactions: decryptedTransactions.length,
                matchingTransactions: matchingTransactions.length,
                allCategories: decryptedTransactions.map(t => t.category),
                sampleTransaction: matchingTransactions[0]
            });
            
            const totalSpent = matchingTransactions.reduce((sum, txn) => {
                const amount = parseFloat(txn.amount) || 0;
                return sum + Math.abs(amount); // Use absolute value in case amounts are stored as negative
            }, 0);

            logger.debug('Budget spent calculation result', {
                userId,
                categoryName,
                totalSpent,
                transactionCount: decryptedTransactions.length
            });

            return totalSpent;
        } catch (error) {
            const { logger } = require('../utils/logger');
            logger.error('Error calculating spent amount', {
                error: error.message,
                stack: error.stack,
                userId,
                categoryName,
                month
            });
            return 0; // Return 0 on error to avoid breaking the budget display
        }
    }

    static async findById(id, userId) {
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .select('*, categories(id, name)')
            .eq('id', id)
            .eq('userId', userId)
            .single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error fetching budget: ${error.message}`);
        }
        return decryptObject(TABLE_NAME, data);
    }

    static async update(id, userId, updates) {
        const encryptedUpdates = encryptObject(TABLE_NAME, updates);
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .update(encryptedUpdates)
            .eq('id', id)
            .eq('userId', userId)
            .select()
            .single();
        if (error) throw new Error(`Error updating budget: ${error.message}`);
        return decryptObject(TABLE_NAME, data);
    }

    static async delete(id, userId) {
        const { error } = await supabaseAdmin
            .from(TABLE_NAME)
            .delete()
            .eq('id', id)
            .eq('userId', userId);
        if (error) throw new Error(`Error deleting budget: ${error.message}`);
        return { success: true };
    }
}

module.exports = Budget;
