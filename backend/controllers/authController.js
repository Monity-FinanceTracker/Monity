const User = require('../models/User');
const { logger } = require('../utils/logger');
const jwt = require('jsonwebtoken');

class AuthController {
    constructor(supabase) {
        this.supabase = supabase;
        this.userModel = new User(supabase);
    }

    async register(req, res) {
        const { email, password, name } = req.body;
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: 'user',
                        name: name
                    }
                }
            });

            if (error) {
                logger.error('User registration failed', { error: error.message });
                return res.status(400).json({ error: error.message });
            }

            if (data.user) {
                // Not waiting for this to complete to speed up response time
                this.userModel.createDefaultCategories(data.user.id)
                    .catch(err => logger.error('Failed to create default categories', { userId: data.user.id, error: err.message }));
            }

            res.status(201).json({ user: data.user, session: data.session });

        } catch (error) {
            logger.error('An unexpected error occurred during registration', { error: error.message });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async login(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password,
            });
    
            if (error) {
                logger.warn('Login failed for user', { email: email, error: error.message });
                return res.status(400).json({ error: 'Invalid credentials' });
            }
    
            res.json({ user: data.user, session: data.session });

        } catch (error) {
            logger.error('An unexpected error occurred during login', { email: email, error: error.message });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getProfile(req, res) {
        // The user object is attached to the request by the auth middleware
        const userId = req.user.id;

        try {
            const { data, error } = await this.userModel.getById(userId);

            if (error) {
                logger.error('Failed to get user profile', { userId, error: error.message });
                return res.status(500).json({ error: 'Failed to fetch user profile.' });
            }
            if (!data) {
                return res.status(404).json({ error: 'User not found.' });
            }

            res.json(data);

        } catch (error) {
            logger.error('An unexpected error occurred while fetching profile', { userId, error: error.message });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getFinancialHealth(req, res) {
        const userId = req.user.id;

        try {
            // Use the existing financial health service
            const FinancialHealthService = require('../services/financialHealthService');
            const financialHealthService = new FinancialHealthService(this.supabase);
            
            const healthData = await financialHealthService.getFinancialHealthScore(userId);

            // Get additional metrics for the user using the Transaction model for proper decryption
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const thirtyDaysAgoDateString = thirtyDaysAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD

            logger.info('Querying transactions', { userId, thirtyDaysAgoDateString });

            // Use Transaction model to get all transactions (bypasses RLS with supabaseAdmin)
            const Transaction = require('../models/Transaction');
            const allTransactions = await Transaction.getAll(userId);

            // Filter transactions from last 30 days
            const transactions = allTransactions.filter(t => t.date >= thirtyDaysAgoDateString);

            logger.info('Transactions from last 30 days', {
                allCount: allTransactions.length,
                filteredCount: transactions.length,
                type3Count: transactions.filter(t => t.typeId === 3).length
            });

            // Calculate detailed metrics
            const totalIncome = transactions.filter(t => t.typeId === 2).reduce((sum, t) => sum + t.amount, 0);
            const totalExpenses = transactions.filter(t => t.typeId === 1).reduce((sum, t) => sum + Math.abs(t.amount), 0);

            // Calculate total savings from type 3 transactions
            // Now includes savings goal allocations/withdrawals (auto-created)
            // Allocations are positive, withdrawals are negative, so simple sum works
            const type3Transactions = transactions.filter(t => t.typeId === 3);
            const totalSavings = type3Transactions.reduce((sum, t) => sum + t.amount, 0);

            logger.info('Financial Health Calculation Debug', {
                userId,
                totalTransactions: transactions.length,
                type3Count: type3Transactions.length,
                type3Transactions: type3Transactions.map(t => ({ amount: t.amount, category: t.category, date: t.date })),
                totalSavings,
                totalIncome,
                totalExpenses
            });

            // Calculate rates and ratios
            const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100) : 0;
            const expenseRatio = totalIncome > 0 ? ((totalExpenses / totalIncome) * 100) : 0;

            // Generate personalized recommendations
            const recommendations = [];
            
            if (savingsRate < 10) {
                recommendations.push({
                    type: 'savings',
                    priority: 'high',
                    title: 'Increase Your Savings Rate',
                    description: 'Aim to save at least 10-20% of your income for a healthy financial future.',
                    actionable: 'Consider setting up automatic transfers to savings.'
                });
            }

            if (expenseRatio > 80) {
                recommendations.push({
                    type: 'expenses',
                    priority: 'medium',
                    title: 'Review Your Expenses',
                    description: 'Your expense ratio is quite high. Look for areas to reduce spending.',
                    actionable: 'Review your largest expense categories and find savings opportunities.'
                });
            }

            if (totalSavings > 0 && savingsRate > 15) {
                recommendations.push({
                    type: 'investment',
                    priority: 'low',
                    title: 'Consider Investment Options',
                    description: 'You have good savings habits! Consider growing your money through investments.',
                    actionable: 'Explore low-risk investment options for better returns.'
                });
            }

            if (recommendations.length === 0) {
                recommendations.push({
                    type: 'positive',
                    priority: 'info',
                    title: 'Great Financial Habits!',
                    description: 'Keep up the excellent work with your financial management.',
                    actionable: 'Continue monitoring your progress and set new financial goals.'
                });
            }

            // Determine health category
            let healthCategory = 'Poor';
            if (healthData.score >= 80) healthCategory = 'Excellent';
            else if (healthData.score >= 60) healthCategory = 'Good';
            else if (healthData.score >= 40) healthCategory = 'Fair';

            res.json({
                score: Math.round(healthData.score),
                category: healthCategory,
                metrics: {
                    savingsRate: parseFloat(savingsRate.toFixed(1)),
                    expenseRatio: parseFloat(expenseRatio.toFixed(1)),
                    totalIncome,
                    totalExpenses,
                    totalSavings,
                    transactionCount: transactions.length
                },
                recommendations,
                period: '30 days',
                lastUpdated: new Date().toISOString()
            });

        } catch (error) {
            logger.error('An unexpected error occurred while fetching financial health', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to calculate financial health' });
        }
    }
}

module.exports = AuthController;
