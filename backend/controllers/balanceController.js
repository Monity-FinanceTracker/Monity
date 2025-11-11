const { asyncHandler } = require('../utils/helpers');
const { supabaseAdmin } = require('../config/supabase');
const { decryptObject, decrypt } = require('../middleware/encryption');
const {
    getCachedBalance,
    setCachedBalance,
    getCachedMonthlyBalance,
    setCachedMonthlyBalance
} = require('../services/balanceCache');

class BalanceController {
    constructor(supabase) {
        this.supabase = supabase;
    }

    /**
     * Check if a type 3 transaction is an allocation to a savings goal
     * Allocations should decrease available balance (money moving out)
     */
    isAllocationTransaction(txn) {
        // Check if metadata has operation: 'allocate' or category is 'Savings Goal'
        if (txn.metadata) {
            const metadata = typeof txn.metadata === 'string' 
                ? JSON.parse(txn.metadata) 
                : txn.metadata;
            if (metadata.operation === 'allocate') {
                return true;
            }
            // Withdrawals have operation: 'withdraw' and negative amounts, handled separately
            if (metadata.operation === 'withdraw') {
                return false; // Withdrawals are handled by their negative amount
            }
        }
        // Check if category indicates it's an allocation
        // Only treat as allocation if amount is positive (allocations use positive amounts)
        if (txn.category === 'Savings Goal' && (txn.amount > 0 || parseFloat(txn.amount) > 0)) {
            return true;
        }
        return false;
    }

    /**
     * Check if a type 3 transaction is a withdrawal from a savings goal
     * Withdrawals have negative amounts and should increase available balance (money coming back)
     */
    isWithdrawalTransaction(txn) {
        if (txn.metadata) {
            const metadata = typeof txn.metadata === 'string' 
                ? JSON.parse(txn.metadata) 
                : txn.metadata;
            if (metadata.operation === 'withdraw') {
                return true;
            }
        }
        // Withdrawals have negative amounts
        const amount = typeof txn.amount === 'string' ? parseFloat(txn.amount) : txn.amount;
        if (txn.category === 'Savings Goal' && amount < 0) {
            return true;
        }
        return false;
    }

    getBalance = asyncHandler(async (req, res) => {
        const userId = req.user.id;

        try {
            // Check cache first
            const cachedResult = getCachedBalance(userId);
            if (cachedResult) {
                return res.status(200).json(cachedResult);
            }

            // Cache miss - calculate balance
            // Get all transactions for the user
            const { data: transactions, error } = await supabaseAdmin
                .from('transactions')
                .select('*')
                .eq('userId', userId);

            if (error) {
                throw error;
            }

            // Get all savings goals for the user to calculate allocated amounts
            const { data: savingsGoals, error: savingsError } = await supabaseAdmin
                .from('savings_goals')
                .select('*')
                .eq('user_id', userId);

            if (savingsError) {
                throw savingsError;
            }

            // Decrypt transactions
            const decryptedTransactions = transactions.map(transaction => {
                const decrypted = decryptObject('transactions', transaction);
                return {
                    ...decrypted,
                    amount: parseFloat(decrypted.amount || 0)
                };
            });

            // Calculate balance: income - expenses, handling savings transactions properly
            let balance = 0;
            decryptedTransactions.forEach(transaction => {
                if (transaction.typeId === 2) { // Income
                    balance += transaction.amount;
                } else if (transaction.typeId === 1) { // Expense
                    balance -= transaction.amount;
                } else if (transaction.typeId === 3) { // Savings
                    // Handle different types of savings transactions
                    if (this.isAllocationTransaction(transaction)) {
                        // Allocation: subtract (money moving out of available balance)
                        balance -= transaction.amount;
                    } else if (this.isWithdrawalTransaction(transaction)) {
                        // Withdrawal: add back (money coming back to available balance)
                        // Since withdrawal amount is negative, subtracting it adds to balance
                        balance -= transaction.amount; // Subtracting negative = adding
                    } else {
                        // Regular savings deposit (positive amount adds to balance)
                        balance += transaction.amount;
                    }
                }
            });

            // Calculate total allocated to savings goals (for display purposes)
            let totalAllocated = 0;
            if (savingsGoals && savingsGoals.length > 0) {
                const decryptedGoals = savingsGoals.map(goal => decryptObject('savings_goals', goal));
                totalAllocated = decryptedGoals.reduce((sum, goal) => {
                    return sum + parseFloat(goal.current_amount || 0);
                }, 0);
            }

            // Available balance is now already calculated correctly in balance variable
            // No need to subtract totalAllocated separately since allocations are already subtracted
            const availableBalance = balance;

            const result = {
                balance: availableBalance,
                totalBalance: balance,
                allocatedSavings: totalAllocated
            };

            // Cache the result
            setCachedBalance(userId, result);

            res.status(200).json(result);
        } catch (error) {
            console.error('Error calculating balance:', error);
            res.status(500).json({ error: 'Failed to calculate balance' });
        }
    });

    getMonthlyBalance = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { month, year } = req.params;
        
        // Validate parameters
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        
        if (!month || !year || isNaN(monthNum) || isNaN(yearNum) || 
            monthNum < 1 || monthNum > 12 || yearNum < 2000 || yearNum > 2100) {
            console.error(`Invalid parameters: month=${month}, year=${year}`);
            return res.status(400).json({ 
                success: false,
                error: `Invalid month (${month}) or year (${year}) parameter`,
                received: { month, year }
            });
        }
        
        try {
            // Get transactions for specific month/year
            const startDate = `${year}-${month.padStart(2, '0')}-01`;
            const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

            const { data: transactions, error } = await supabaseAdmin
                .from('transactions')
                .select('*')
                .eq('userId', userId)
                .gte('date', startDate)
                .lte('date', endDate);

            if (error) {
                throw error;
            }

            // Decrypt transactions
            const decryptedTransactions = transactions.map(transaction => {
                const decrypted = decryptObject('transactions', transaction);
                return {
                    ...decrypted,
                    amount: parseFloat(decrypted.amount || 0)
                };
            });

            // Calculate monthly balance
            let balance = 0;
            decryptedTransactions.forEach(transaction => {
                if (transaction.typeId === 2) { // Income
                    balance += transaction.amount;
                } else if (transaction.typeId === 1) { // Expense
                    balance -= transaction.amount;
                } else if (transaction.typeId === 3) { // Savings
                    balance += transaction.amount;
                }
            });

            res.status(200).json({ balance: balance });
        } catch (error) {
            console.error('Error calculating monthly balance:', error);
            res.status(500).json({ error: 'Failed to calculate monthly balance' });
        }
    });

    getBalanceHistory = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        
        try {
            // Get all transactions for the user
            const { data: transactions, error } = await supabaseAdmin
                .from('transactions')
                .select('*')
                .eq('userId', userId)
                .order('date', { ascending: true });

            if (error) {
                throw error;
            }

            // Decrypt transactions
            const decryptedTransactions = transactions.map(transaction => {
                const decrypted = decryptObject('transactions', transaction);
                return {
                    ...decrypted,
                    amount: parseFloat(decrypted.amount || 0)
                };
            });

            // Group by month and calculate running balance
            const monthlyBalances = {};
            let runningBalance = 0;

            decryptedTransactions.forEach(transaction => {
                const date = new Date(transaction.date);
                const monthKey = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (!monthlyBalances[monthKey]) {
                    monthlyBalances[monthKey] = 0;
                }

                if (transaction.typeId === 2) { // Income
                    runningBalance += transaction.amount;
                    monthlyBalances[monthKey] += transaction.amount;
                } else if (transaction.typeId === 1) { // Expense
                    runningBalance -= transaction.amount;
                    monthlyBalances[monthKey] -= transaction.amount;
                } else if (transaction.typeId === 3) { // Savings
                    runningBalance += transaction.amount;
                    monthlyBalances[monthKey] += transaction.amount;
                }
            });

            const history = Object.entries(monthlyBalances).map(([month, balance]) => ({
                month,
                balance
            }));

            res.status(200).json(history);
        } catch (error) {
            console.error('Error getting balance history:', error);
            res.status(500).json({ error: 'Failed to get balance history' });
        }
    });

    getMonths = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        
        try {
            // Get unique months from transactions
            const { data: transactions, error } = await supabaseAdmin
                .from('transactions')
                .select('date')
                .eq('userId', userId)
                .order('date', { ascending: true });

            if (error) {
                throw error;
            }

            // Extract unique months
            const months = [...new Set(transactions.map(t => {
                const date = new Date(t.date);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                
                // Validate the date components
                if (isNaN(year) || isNaN(month) || year < 2000 || year > 2100 || month < 1 || month > 12) {
                    console.warn('Invalid date found:', t.date, 'parsed as:', { year, month });
                    return null;
                }
                
                return `${year}/${String(month).padStart(2, '0')}`;
            }).filter(Boolean))]; // Remove null values

            res.status(200).json(months);
        } catch (error) {
            console.error('Error getting months:', error);
            res.status(500).json({ error: 'Failed to get months' });
        }
    });

    getSavingsOverview = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        
        try {
            // Get all savings goals for the user
            const { data: savingsGoals, error } = await supabaseAdmin
                .from('savings_goals')
                .select('*')
                .eq('user_id', userId);

            if (error) {
                throw error;
            }

            if (!savingsGoals || savingsGoals.length === 0) {
                return res.status(200).json({
                    totalAllocated: 0,
                    totalTargets: 0,
                    goals: [],
                    progressPercentage: 0
                });
            }

            // Decrypt and process goals
            const decryptedGoals = savingsGoals.map(goal => {
                const decrypted = decryptObject('savings_goals', goal);
                const currentAmount = parseFloat(decrypted.current_amount || 0);
                const targetAmount = parseFloat(decrypted.target_amount || 0);
                const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
                
                return {
                    id: decrypted.id,
                    goal_name: decrypted.goal_name,
                    current_amount: currentAmount,
                    target_amount: targetAmount,
                    target_date: decrypted.target_date,
                    progress: Math.min(progress, 100) // Cap at 100%
                };
            });

            // Calculate totals
            const totalAllocated = decryptedGoals.reduce((sum, goal) => sum + goal.current_amount, 0);
            const totalTargets = decryptedGoals.reduce((sum, goal) => sum + goal.target_amount, 0);
            const overallProgress = totalTargets > 0 ? (totalAllocated / totalTargets) * 100 : 0;

            res.status(200).json({
                totalAllocated,
                totalTargets,
                goals: decryptedGoals.slice(0, 3), // Show top 3 goals on dashboard
                progressPercentage: Math.min(overallProgress, 100),
                totalGoals: decryptedGoals.length
            });
        } catch (error) {
            console.error('Error getting savings overview:', error);
            res.status(500).json({ error: 'Failed to get savings overview' });
        }
    });
}

module.exports = BalanceController;

