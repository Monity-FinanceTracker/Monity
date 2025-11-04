
const { logger } = require('../utils');

class FinancialHealthService {
    constructor(supabase) {
        if (!supabase) {
            throw new Error('Supabase client is required.');
        }
        this.supabase = supabase;
    }

    async getFinancialHealthScore(userId) {
        try {
            // Use Transaction model to get all transactions (bypasses RLS with supabaseAdmin and handles decryption)
            const Transaction = require('../models/Transaction');
            const allTransactions = await Transaction.getAll(userId);

            // Filter transactions from last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const thirtyDaysAgoDateString = thirtyDaysAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD

            const transactions = allTransactions.filter(t => t.date >= thirtyDaysAgoDateString);

            const totalIncome = transactions.filter(t => t.typeId === 2).reduce((sum, t) => sum + t.amount, 0);
            const totalExpenses = transactions.filter(t => t.typeId === 1).reduce((sum, t) => sum + Math.abs(t.amount), 0);

            // Calculate total savings from type 3 transactions
            // Now includes savings goal allocations/withdrawals (auto-created)
            // Allocations are positive, withdrawals are negative, so simple sum works
            const totalSavings = transactions.filter(t => t.typeId === 3).reduce((sum, t) => sum + t.amount, 0);

            // Get liabilities and assets from the database
            const { data: liabilities, error: liabilitiesError } = await this.supabase
                .from('liabilities')
                .select('amount')
                .eq('userId', userId);

            const { data: assets, error: assetsError } = await this.supabase
                .from('assets')
                .select('amount')
                .eq('userId', userId);

            const totalLiabilities = liabilities?.reduce((sum, l) => sum + l.amount, 0) || 0;
            const totalAssets = assets?.reduce((sum, a) => sum + a.amount, 0) || 0;

            // Calculate rates and ratios
            const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) : 0;
            const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) : 1;
            const debtToIncomeRatio = totalIncome > 0 ? (totalLiabilities / totalIncome) : 1;
            const netWorth = totalAssets - totalLiabilities;
            
            // Log calculation details for debugging
            logger.info('Financial Health Score Calculation', {
                userId,
                totalIncome,
                totalExpenses,
                totalSavings,
                totalAssets,
                totalLiabilities,
                savingsRate: (savingsRate * 100).toFixed(2) + '%',
                expenseRatio: (expenseRatio * 100).toFixed(2) + '%',
                debtToIncomeRatio: (debtToIncomeRatio * 100).toFixed(2) + '%',
                netWorth,
                transactionCount: transactions.length
            });

            // Start with a base score of 50 (neutral score)
            // This ensures users always have some score even with poor metrics
            let score = 50;

            // Adjust score based on savings rate (0-35 points)
            if (totalIncome > 0) {
                if (savingsRate > 0.2) score += 35; // Excellent: >20% savings rate
                else if (savingsRate > 0.1) score += 25; // Good: 10-20% savings rate
                else if (savingsRate > 0.05) score += 15; // Fair: 5-10% savings rate
                else if (savingsRate > 0) score += 5; // Poor but positive: <5% savings rate
                else if (savingsRate < 0) score -= 10; // Negative: spending more than earning

                // Adjust score based on expense ratio (0-30 points)
                if (expenseRatio < 0.5) score += 30; // Excellent: <50% expense ratio
                else if (expenseRatio < 0.7) score += 20; // Good: 50-70% expense ratio
                else if (expenseRatio < 0.9) score += 10; // Fair: 70-90% expense ratio
                else if (expenseRatio >= 1) score -= 15; // Poor: spending >= income
            } else {
                // No income: base on expenses and savings only
                if (totalExpenses === 0 && totalSavings > 0) score += 10; // Has savings, no expenses
                else if (totalExpenses > 0) score -= 20; // Has expenses but no income
            }

            // Adjust score based on debt-to-income ratio (0-20 points)
            if (totalIncome > 0 && debtToIncomeRatio < 0.3) {
                score += 20; // Low debt-to-income ratio
            } else if (totalIncome > 0 && debtToIncomeRatio >= 0.4) {
                score -= 10; // High debt-to-income ratio
            }

            // Adjust score based on net worth (0-15 points)
            if (netWorth > 0) {
                score += 15; // Positive net worth
            } else if (netWorth < 0) {
                score -= 10; // Negative net worth
            }

            // Ensure score is within valid bounds (0-100)
            const finalScore = Math.max(0, Math.min(100, Math.round(score)));
            const category = this.getFinancialHealthCategory(finalScore);
            const recommendations = this.getFinancialHealthRecommendations({ savingsRate, expenseRatio, debtToIncomeRatio, netWorth });

            return {
                score: finalScore,
                category,
                recommendations,
                summary: {
                    savingsRate: (savingsRate * 100).toFixed(2),
                    expenseRatio: (expenseRatio * 100).toFixed(2),
                    debtToIncomeRatio: (debtToIncomeRatio * 100).toFixed(2),
                    netWorth: netWorth.toFixed(2)
                }
            };

        } catch (error) {
            logger.error('Error calculating financial health score', { userId, error: error.message });
            throw new Error('Failed to calculate financial health score.');
        }
    }

    getFinancialHealthCategory(score) {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Improvement';
    }

    getFinancialHealthRecommendations(summary) {
        const recommendations = [];
        if (summary.expenseRatio >= 1) {
            recommendations.push('Your expenses are higher than your income. Review your spending to find areas to cut back.');
        }
        if (summary.savingsRate < 0.1) {
            recommendations.push('Try to save at least 10% of your income. Automating savings can help.');
        }
        if (summary.debtToIncomeRatio > 0.4) {
            recommendations.push('A high debt-to-income ratio can be risky. Consider strategies to pay down your debt faster.');
        }
        if (recommendations.length === 0) {
            recommendations.push('You are doing great! Keep up the good work and continue to monitor your financial health.');
        }
        return recommendations;
    }
}

module.exports = FinancialHealthService;
