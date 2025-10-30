const User = require('../models/User');
const { logger } = require('../utils/logger');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config');
const DataExportService = require('../services/dataExportService');

class AuthController {
    constructor(supabase) {
        this.supabase = supabase;
        this.userModel = new User(supabase);
        this.dataExportService = new DataExportService(supabase);
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

    async deleteAccount(req, res) {
        const userId = req.user.id;

        try {
            logger.info(`Account deletion requested for user ${userId}`);

            // Delete all user data from related tables using supabaseAdmin to bypass RLS
            const deleteOperations = [
                supabaseAdmin.from('transactions').delete().eq('user_id', userId),
                supabaseAdmin.from('budgets').delete().eq('user_id', userId),
                supabaseAdmin.from('categories').delete().eq('user_id', userId),
                supabaseAdmin.from('savings_goals').delete().eq('user_id', userId),
                supabaseAdmin.from('groups').delete().eq('user_id', userId),
                supabaseAdmin.from('ai_chats').delete().eq('user_id', userId),
                supabaseAdmin.from('scheduled_transactions').delete().eq('user_id', userId)
            ];

            // Execute all delete operations in parallel
            const results = await Promise.allSettled(deleteOperations);

            // Check if any deletions failed
            const failures = results.filter(r => r.status === 'rejected');
            if (failures.length > 0) {
                logger.error('Some data deletions failed during account deletion', {
                    userId,
                    failures: failures.map(f => f.reason)
                });
            }

            // Delete the user profile
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (profileError) {
                logger.error('Failed to delete user profile', { userId, error: profileError.message });
                return res.status(500).json({ error: 'Failed to delete profile data' });
            }

            // Delete the user from Supabase Auth
            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

            if (authError) {
                logger.error('Failed to delete user from auth system', { userId, error: authError.message });
                return res.status(500).json({ error: 'Failed to delete authentication account' });
            }

            logger.info(`Account successfully deleted for user ${userId}`);
            res.json({
                success: true,
                message: 'Account and all associated data have been permanently deleted'
            });

        } catch (error) {
            logger.error('An unexpected error occurred during account deletion', {
                userId,
                error: error.message
            });
            res.status(500).json({ error: 'Internal Server Error during account deletion' });
        }
    }

    async exportUserData(req, res) {
        const userId = req.user.id;
        const format = req.body.format || 'json'; // Default to JSON

        try {
            logger.info(`Data export requested for user ${userId} in format ${format}`);

            // Validate format
            if (!['json', 'csv', 'pdf'].includes(format.toLowerCase())) {
                return res.status(400).json({
                    error: 'Invalid format. Supported formats: json, csv, pdf'
                });
            }

            // Export all user data
            const exportedData = await this.dataExportService.exportAllUserData(userId, format);

            // Set appropriate content type and filename
            let contentType;
            let filename;

            switch (format.toLowerCase()) {
                case 'csv':
                    contentType = 'text/csv';
                    filename = `monity-data-export-${userId}-${Date.now()}.csv`;
                    break;
                case 'pdf':
                    contentType = 'application/pdf';
                    filename = `monity-data-export-${userId}-${Date.now()}.pdf`;
                    break;
                case 'json':
                default:
                    contentType = 'application/json';
                    filename = `monity-data-export-${userId}-${Date.now()}.json`;
                    break;
            }

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            if (format.toLowerCase() === 'pdf') {
                // For PDF, exportedData is a Buffer
                res.send(exportedData);
            } else {
                // For JSON and CSV, exportedData is a string
                res.send(exportedData);
            }

            logger.info(`Data export completed successfully for user ${userId}`);

        } catch (error) {
            logger.error('An unexpected error occurred during data export', {
                userId,
                error: error.message
            });
            res.status(500).json({ error: 'Internal Server Error during data export' });
        }
    }
}

module.exports = AuthController;
