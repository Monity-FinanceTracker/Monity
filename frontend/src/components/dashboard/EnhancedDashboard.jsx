import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { get } from '../../utils/api';
import { BalanceCard, Savings, SavingsOverviewCard } from '../ui';
import { BalanceChart, ExpenseChart } from '../charts';

/**
 * Enhanced Dashboard with improved UX, quick actions, and better visual hierarchy
 */
const EnhancedDashboard = () => {
    const { t } = useTranslation();
    const { user, subscriptionTier } = useAuth();
    const [dashboardData, setDashboardData] = useState({
        recentTransactions: [],
        upcomingBills: [],
        budgetAlerts: [],
        savingsProgress: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    // Removed activeQuickAction state to prevent unnecessary re-renders on hover

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch recent transactions
            const { data: transactions } = await get('/transactions');
            const recentTransactions = Array.isArray(transactions) 
                ? transactions.slice(0, 5) 
                : [];

            setDashboardData(prev => ({
                ...prev,
                recentTransactions
            }));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        {
            id: 'add-expense',
            title: t('quickActions.add_expense'),
            description: t('quickActions.add_expense_desc'),
            icon: <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
            color: 'from-red-500 to-red-600',
            path: '/add-expense',
            shortcut: 'E'
        },
        {
            id: 'add-income',
            title: t('quickActions.add_income'),
            description: t('quickActions.add_income_desc'),
            icon: <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>,
            color: 'from-green-500 to-green-600',
            path: '/add-income',
            shortcut: 'I'
        },
        {
            id: 'view-transactions',
            title: t('quickActions.view_transactions'),
            description: t('quickActions.view_transactions_desc'),
            icon: <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
            color: 'from-blue-500 to-blue-600',
            path: '/transactions',
            shortcut: 'T'
        },
        {
            id: 'manage-budgets',
            title: t('quickActions.manage_budgets'),
            description: t('quickActions.manage_budgets_desc'),
            icon: <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            color: 'from-purple-500 to-purple-600',
            path: '/budgets',
            shortcut: 'B'
        }
    ];

    // Enhanced card wrapper with loading states
    const EnhancedCard = ({ children, title, subtitle, accent, isLoading = false, action, className = '' }) => {
        return (
            <div className={`bg-gradient-to-br from-[#23263a] via-[#23263a]/80 to-[#31344d] border border-[#31344d] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className={`text-sm font-medium ${accent}`}>{title}</h3>
                            {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
                        </div>
                        {action && (
                            <div className="flex items-center gap-2">
                                {action}
                            </div>
                        )}
                    </div>
                    
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="w-8 h-8 rounded-full border-4 border-[#31344d] border-t-[#01C38D] animate-spin"></div>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </div>
        );
    };

    // Recent transactions preview
    const RecentTransactionsPreview = () => (
        <EnhancedCard
            title={t('dashboard.recent_transactions')}
            subtitle={t('dashboard.last_5_transactions')}
            accent="text-white"
            action={
                <Link
                    to="/transactions"
                    className="text-[#01C38D] hover:text-[#01A071] text-sm font-medium"
                >
                    {t('dashboard.view_all')} →
                </Link>
            }
        >
            <div className="space-y-3">
                {dashboardData.recentTransactions.length > 0 ? (
                    dashboardData.recentTransactions.map((transaction, index) => (
                        <div key={transaction.id || index} className="flex items-center justify-between p-3 bg-[#191E29] rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    transaction.typeId === 1 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                }`}>
                                    {transaction.typeId === 1 ? (
                                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-medium">{transaction.description}</p>
                                    <p className="text-gray-400 text-sm">{transaction.category}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${transaction.typeId === 1 ? 'text-red-400' : 'text-green-400'}`}>
                                    {transaction.typeId === 1 ? '-' : '+'}${transaction.amount?.toFixed(2)}
                                </p>
                                <p className="text-gray-400 text-xs">{new Date(transaction.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-400">{t('dashboard.no_recent_transactions')}</p>
                        <Link to="/add-expense" className="text-[#01C38D] hover:text-[#01A071] text-sm font-medium mt-2 inline-block">
                            {t('dashboard.add_first_transaction')}
                        </Link>
                    </div>
                )}
            </div>
        </EnhancedCard>
    );

    // Quick actions grid
    const QuickActionsGrid = () => (
        <EnhancedCard
            title={t('dashboard.quick_actions')}
            subtitle={t('dashboard.quick_actions_desc')}
            accent="text-[#01C38D]"
        >
            <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => (
                    <Link
                        key={action.id}
                        to={action.path}
                        className={`group relative overflow-hidden rounded-xl bg-gradient-to-r ${action.color} p-4 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">{action.icon}</div>
                            <div className="flex-1">
                                <h4 className="text-white font-medium text-sm">{action.title}</h4>
                                <p className="text-white/80 text-xs mt-1">{action.description}</p>
                            </div>
                        </div>
                        
                        {/* Keyboard shortcut hint */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded">
                                ⌘{action.shortcut}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </EnhancedCard>
    );

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 text-balance">
                        {t('dashboard.welcome_back')}, {user?.user_metadata?.name || t('dashboard.user')}!
                    </h1>
                    <p className="text-gray-400 text-lg text-left">
                        {t('dashboard.welcome_subtitle')}
                    </p>
                </div>
                {subscriptionTier === 'premium' && (
                    <div className="hidden md:block">
                        <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            Premium
                        </span>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <QuickActionsGrid />

            {/* Financial Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <EnhancedCard 
                    title={t('dashboardPage.balance_card_title')} 
                    accent="text-[#01C38D]"
                    isLoading={isLoading}
                >
                    <BalanceCard selectedRange="all_time" />
                </EnhancedCard>

                <EnhancedCard 
                    title={t('dashboardPage.expense_chart_title')} 
                    accent="text-red-400"
                    isLoading={isLoading}
                >
                    <ExpenseChart selectedRange="all_time" />
                </EnhancedCard>

                <SavingsOverviewCard />
            </div>

            {/* Detailed Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <EnhancedCard 
                    title={t('dashboardPage.balance_per_month_title')} 
                    subtitle={t('dashboard.balance_chart_desc')}
                    accent="text-[#01C38D]"
                    isLoading={isLoading}
                    className="xl:col-span-1"
                >
                    <BalanceChart selectedRange="all_time" />
                </EnhancedCard>

                <RecentTransactionsPreview />
            </div>

            {/* AI Suggestions Card (Premium Feature) */}
            {subscriptionTier === 'premium' && (
                <EnhancedCard
                    title={t('dashboard.ai_insights')}
                    subtitle={t('dashboard.ai_insights_desc')}
                    accent="text-yellow-400"
                >
                    <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                🤖
                            </div>
                            <div>
                                <h4 className="text-yellow-400 font-medium text-sm">{t('dashboard.smart_categorization_active')}</h4>
                                <p className="text-gray-300 text-xs">{t('dashboard.ai_categorization_desc')}</p>
                            </div>
                        </div>
                    </div>
                </EnhancedCard>
            )}
        </div>
    );
};

export default EnhancedDashboard; 