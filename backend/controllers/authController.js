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
            // Email já foi validado pelo middleware validateEmailDeep
            // Aqui fazemos o registro no Supabase
            logger.info('Attempting user registration', { email });

            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: 'user',
                        name: name
                    },
                    emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?type=email`
                }
            });

            if (error) {
                logger.error('User registration failed', { 
                    error: error.message,
                    email 
                });
                return res.status(400).json({ error: error.message });
            }

            if (data.user) {
<<<<<<< HEAD
<<<<<<< HEAD
                logger.info('User registered successfully', { 
=======
                logger.info('User registered successfully', {
>>>>>>> 358f1f6517ea7c6b697ad4b44c8a7e1bbbaac84f
                    userId: data.user.id,
                    email: data.user.email,
                    emailConfirmed: data.user.email_confirmed_at !== null
                });

                // Criar categorias padrão de forma assíncrona apenas se email já confirmado
                // Se email não confirmado, categorias serão criadas após confirmação
                if (data.user.email_confirmed_at) {
                    this.userModel.createDefaultCategories(data.user.id)
                        .catch(err => logger.error('Failed to create default categories', {
                            userId: data.user.id,
                            error: err.message
                        }));
                }
            }

            // Se email confirmation está habilitado, session será null
            // Neste caso, instruir usuário a verificar o email
            if (!data.session) {
                logger.info('Email confirmation required', {
                    userId: data.user.id,
                    email: data.user.email
                });

                return res.status(201).json({
                    user: {
                        id: data.user.id,
                        email: data.user.email
                    },
                    session: null,
                    requiresEmailConfirmation: true,
                    message: 'Conta criada! Por favor, verifique seu email para confirmar seu cadastro.'
                });
            }

            // Email já confirmado ou confirmation desabilitado - retornar session
            res.status(201).json({
                user: data.user,
                session: data.session,
<<<<<<< HEAD
                message: 'Conta criada com sucesso!' 
=======
                logger.info('User registered successfully', {
                    userId: data.user.id,
                    email: data.user.email,
                    emailConfirmed: data.user.email_confirmed_at !== null
                });

                // Criar categorias padrão de forma assíncrona apenas se email já confirmado
                // Se email não confirmado, categorias serão criadas após confirmação
                if (data.user.email_confirmed_at) {
                    this.userModel.createDefaultCategories(data.user.id)
                        .catch(err => logger.error('Failed to create default categories', {
                            userId: data.user.id,
                            error: err.message
                        }));
                }
            }

            // Se email confirmation está habilitado, session será null
            // Neste caso, instruir usuário a verificar o email
            if (!data.session) {
                logger.info('Email confirmation required', {
                    userId: data.user.id,
                    email: data.user.email
                });

                return res.status(201).json({
                    user: {
                        id: data.user.id,
                        email: data.user.email
                    },
                    session: null,
                    requiresEmailConfirmation: true,
                    message: 'Conta criada! Por favor, verifique seu email para confirmar seu cadastro.'
                });
            }

            // Email já confirmado ou confirmation desabilitado - retornar session
            res.status(201).json({
                user: data.user,
                session: data.session,
                requiresEmailConfirmation: false,
                message: 'Conta criada com sucesso!'
>>>>>>> 429196b016bd09c16635c353a0eb531e2033f047
=======
                requiresEmailConfirmation: false,
                message: 'Conta criada com sucesso!'
>>>>>>> 358f1f6517ea7c6b697ad4b44c8a7e1bbbaac84f
            });

        } catch (error) {
            logger.error('An unexpected error occurred during registration', { 
                error: error.message,
                email 
            });
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

    /**
     * Inicia o fluxo OAuth com Google
     * O Supabase gerencia todo o processo de autenticação OAuth
     */
    async loginWithGoogle(req, res) {
        try {
            logger.info('Google OAuth login initiated');

            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            if (error) {
                logger.error('Google OAuth initiation failed', { error: error.message });
                return res.status(400).json({ error: error.message });
            }

            // Redireciona o usuário diretamente para a URL do Google OAuth
            logger.info('Redirecting to Google OAuth', { url: data.url });
            res.redirect(data.url);

        } catch (error) {
            logger.error('An unexpected error occurred during Google OAuth', { error: error.message });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Trata o callback do OAuth (se necessário fazer algo no backend)
     * Normalmente o Supabase lida com isso automaticamente
     */
    async handleOAuthCallback(req, res) {
        try {
            const { access_token, refresh_token } = req.query;

            if (!access_token) {
                logger.warn('OAuth callback without access_token');
                return res.status(400).json({ error: 'Missing access token' });
            }

            // Supabase já criou o usuário automaticamente
            // Aqui podemos fazer ações adicionais se necessário
            logger.info('OAuth callback processed successfully');

            // Criar categorias padrão para novos usuários OAuth
            const { data: { user }, error } = await this.supabase.auth.getUser(access_token);
            
            if (!error && user) {
                // Verificar se é primeiro login (criar categorias padrão)
                const { data: existingProfile } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single();

                if (!existingProfile) {
                    // Primeiro login, criar categorias padrão
                    await this.userModel.createDefaultCategories(user.id)
                        .catch(err => logger.error('Failed to create default categories for OAuth user', { 
                            userId: user.id, 
                            error: err.message 
                        }));
                }

                logger.info('OAuth user processed', { userId: user.id, email: user.email });
            }

            // Redirecionar para o frontend
            const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            res.redirect(`${redirectUrl}/dashboard?auth=success`);

        } catch (error) {
            logger.error('An unexpected error occurred during OAuth callback', { error: error.message });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Reenvia o email de confirmação para o usuário
     * Útil quando o email não chegou ou expirou
     */
    async resendConfirmationEmail(req, res) {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ 
                success: false,
                error: 'Email é obrigatório' 
            });
        }

        try {
            logger.info('Resending confirmation email', { email });

            // Supabase envia automaticamente o email de confirmação
            const { data, error } = await this.supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
<<<<<<< HEAD
<<<<<<< HEAD
                    emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify`
=======
                    emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?type=email`
>>>>>>> 429196b016bd09c16635c353a0eb531e2033f047
=======
                    emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?type=email`
>>>>>>> 358f1f6517ea7c6b697ad4b44c8a7e1bbbaac84f
                }
            });

            if (error) {
                logger.error('Failed to resend confirmation email', { 
                    email, 
                    error: error.message 
                });

                // Mensagens de erro amigáveis
                if (error.message.includes('already confirmed')) {
                    return res.status(400).json({ 
                        success: false,
                        error: 'Este email já foi confirmado. Você pode fazer login.' 
                    });
                }

                if (error.message.includes('not found')) {
                    return res.status(404).json({ 
                        success: false,
                        error: 'Email não encontrado. Cadastre-se primeiro.' 
                    });
                }

                return res.status(400).json({ 
                    success: false,
                    error: error.message 
                });
            }

            logger.info('Confirmation email resent successfully', { email });

            res.json({
                success: true,
                message: 'Email de confirmação reenviado com sucesso! Verifique sua caixa de entrada.',
                email
            });

        } catch (error) {
            logger.error('An unexpected error occurred while resending confirmation email', { 
                email, 
                error: error.message 
            });
            res.status(500).json({ 
                success: false,
                error: 'Erro ao reenviar email de confirmação. Tente novamente.' 
            });
        }
    }

    /**
     * Verifica o status de confirmação do email do usuário
     * Útil para verificar se o usuário já confirmou o email
     */
    async checkEmailVerification(req, res) {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ 
                success: false,
                error: 'Email é obrigatório' 
            });
        }

        try {
            logger.info('Checking email verification status', { email });

            // Buscar usuário no Supabase Auth
            const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

            if (error) {
                logger.error('Failed to check email verification', { 
                    email, 
                    error: error.message 
                });
                return res.status(500).json({ 
                    success: false,
                    error: 'Erro ao verificar status do email' 
                });
            }

            // Encontrar usuário pelo email
            const user = users.find(u => u.email === email);

            if (!user) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Usuário não encontrado',
                    verified: false
                });
            }

            const isVerified = user.email_confirmed_at !== null;

            logger.info('Email verification status checked', { 
                email, 
                verified: isVerified 
            });

            res.json({
                success: true,
                email,
                verified: isVerified,
                confirmedAt: user.email_confirmed_at,
                message: isVerified 
                    ? 'Email já foi confirmado' 
                    : 'Email ainda não foi confirmado'
            });

        } catch (error) {
            logger.error('An unexpected error occurred while checking email verification', { 
                email, 
                error: error.message 
            });
            res.status(500).json({ 
                success: false,
                error: 'Erro ao verificar status do email' 
            });
        }
    }

    /**
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> 358f1f6517ea7c6b697ad4b44c8a7e1bbbaac84f
     * Inicializa a conta do usuário após confirmação de email
     * Cria categorias padrão e retorna perfil do usuário
     */
    async initializeAccount(req, res) {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Autenticação necessária'
            });
        }

        try {
            logger.info('Initializing user account', { userId });

            // Verificar se usuário já tem categorias (conta já foi inicializada)
            const { data: existingCategories } = await this.supabase
                .from('categories')
                .select('id')
                .eq('user_id', userId)
                .limit(1);

            // Se não tem categorias, criar as padrões
            if (!existingCategories || existingCategories.length === 0) {
                logger.info('Creating default categories for new user', { userId });
                await this.userModel.createDefaultCategories(userId);
            }

            // Buscar perfil do usuário
            const { data: profile, error: profileError } = await this.userModel.getById(userId);

            if (profileError) {
                logger.error('Failed to get user profile during initialization', {
                    userId,
                    error: profileError.message
                });
                return res.status(500).json({
                    success: false,
                    error: 'Erro ao buscar perfil do usuário'
                });
            }

            logger.info('User account initialized successfully', { userId });

            res.json({
                success: true,
                message: 'Conta inicializada com sucesso',
                user: profile
            });

        } catch (error) {
            logger.error('An unexpected error occurred during account initialization', {
                userId,
                error: error.message
            });
            res.status(500).json({
                success: false,
                error: 'Erro ao inicializar conta'
            });
        }
    }

    /**
<<<<<<< HEAD
>>>>>>> 429196b016bd09c16635c353a0eb531e2033f047
=======
>>>>>>> 358f1f6517ea7c6b697ad4b44c8a7e1bbbaac84f
     * Middleware para verificar se o email do usuário está confirmado
     * Pode ser usado em rotas que exigem email confirmado
     */
    async requireEmailVerified(req, res, next) {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ 
                success: false,
                error: 'Autenticação necessária' 
            });
        }

        try {
            // Buscar usuário no Supabase Auth
            const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);

            if (error || !user) {
                logger.error('Failed to get user for email verification check', { 
                    userId, 
                    error: error?.message 
                });
                return res.status(500).json({ 
                    success: false,
                    error: 'Erro ao verificar confirmação de email' 
                });
            }

            const isVerified = user.email_confirmed_at !== null;

            if (!isVerified) {
                logger.warn('User attempted to access resource without verified email', { 
                    userId, 
                    email: user.email 
                });

                return res.status(403).json({ 
                    success: false,
                    error: 'Email não confirmado',
                    message: 'Por favor, confirme seu email antes de continuar.',
                    emailVerified: false
                });
            }

            // Email verificado, continuar
            next();

        } catch (error) {
            logger.error('An unexpected error occurred in email verification middleware', { 
                userId, 
                error: error.message 
            });
            res.status(500).json({ 
                success: false,
                error: 'Erro ao verificar confirmação de email' 
            });
        }
    }
}

module.exports = AuthController;
