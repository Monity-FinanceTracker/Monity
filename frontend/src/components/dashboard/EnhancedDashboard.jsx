import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/useAuth';
import { get } from '../../utils/api';
import { formatCurrency, getAmountColor } from '../../utils/currency';
import { BalanceCard, Savings, SavingsOverviewCard, DashboardSkeleton } from '../ui';
// Removed static imports - using lazy components instead
import { ArrowUp, ArrowDown } from 'lucide-react';
import { LazyExpenseChart, LazyBalanceChart } from '../LazyComponents';

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
            // Fetch only the 3 most recent transactions (optimized query)
            const { data: transactions } = await get('/transactions?limit=3');
            const recentTransactions = Array.isArray(transactions)
                ? transactions
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

    // Enhanced card wrapper with loading states
    const EnhancedCard = ({ children, title, subtitle, accent, isLoading = false, action, className = '' }) => {
        return (
            <div className={`bg-[#1F1E1D] border border-[#262626] rounded-xl hover:border-[#3a3a3a] transition-all duration-200 ${className}`}>
                <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1 text-left">
                            <h3 className={`text-xl font-bold ${accent || 'text-white'} mb-1`}>{title}</h3>
                            {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
                        </div>
                        {action && (
                            <div className="flex items-center">
                                {action}
                            </div>
                        )}
                    </div>
                    
                    {isLoading ? (
                        <div className="flex justify-center items-center min-h-[120px]">
                            <div className="w-8 h-8 rounded-full border-4 border-[#242532] border-t-[#56a69f] animate-spin"></div>
                        </div>
                    ) : (
                        <div className="w-full text-left">
                            {children}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Recent transactions preview
    const RecentTransactionsPreview = () => (
        <EnhancedCard
            title={t('dashboard.recent_transactions')}
            subtitle={t('dashboard.last_3_transactions')}
            accent="text-white"
            action={
                <Link
                    to="/transactions"
                    className="text-[#56a69f] hover:text-[#4a8f88] text-sm font-medium"
                >
                    {t('dashboard.view_all')} →
                </Link>
            }
        >
            <div className="space-y-3">
                {dashboardData.recentTransactions.length > 0 ? (
                    dashboardData.recentTransactions.map((transaction, index) => (
                        <div key={transaction.id || index} className="flex items-center justify-between p-4 bg-[#262626]/30 hover:bg-[#262626]/50 rounded-lg transition-colors border border-[#262626]">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    transaction.typeId === 1 ? 'bg-[#FAF9F5]/20' : 'bg-[#56a69f]/20'
                                }`}>
                                    {transaction.typeId === 1 ? (
                                        <ArrowUp className="w-5 h-5 text-[#FAF9F5]" />
                                    ) : (
                                        <ArrowDown className="w-5 h-5 text-[#56a69f]" />
                                    )}
                                </div>
                                <div className="flex flex-col items-start text-left">
                                    <p className="text-white font-medium text-left">
                                        {transaction.description}
                                    </p>
                                    <p className="text-gray-400 text-sm text-left">
                                        {transaction.category}
                                    </p>
                                </div>
                            </div>
                            <div className="ml-auto text-right">
                                <p className={`font-bold ${getAmountColor(transaction.typeId)}`}>
                                    {formatCurrency(transaction.amount || 0, transaction.typeId)}
                                </p>
                                <p className="text-gray-400 text-xs">
                                    {new Date(transaction.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-left py-8">
                        <p className="text-gray-400">{t('dashboard.no_recent_transactions')}</p>
                        <Link to="/add-expense" className="text-[#56a69f] hover:text-[#4a8f88] text-sm font-medium mt-2 inline-block">
                            {t('dashboard.add_first_transaction')}
                        </Link>
                    </div>
                )}
            </div>
        </EnhancedCard>
    );

    // Show skeleton while loading to prevent CLS
    if (isLoading) {
        return <DashboardSkeleton />;
    }

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
            </div>

            {/* Balance Card - Full Width */}
            <EnhancedCard 
                title={t('dashboardPage.balance_card_title')} 
                accent="text-[#56a69f]"
                isLoading={isLoading}
                className="w-full"
            >
                <div className="text-left">
                    <BalanceCard selectedRange="all_time" />
                </div>
            </EnhancedCard>

            {/* Recent Transactions and Savings Goals - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentTransactionsPreview />

                <SavingsOverviewCard />
            </div>

            {/* Detailed Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <EnhancedCard 
                    title={t('dashboardPage.balance_per_month_title')} 
                    subtitle={t('dashboard.balance_chart_desc')}
                    accent="text-[#56a69f]"
                    isLoading={isLoading}
                    className="xl:col-span-1"
                >
                    <LazyBalanceChart selectedRange="all_time" />
                </EnhancedCard>

                <EnhancedCard 
                    title={t('dashboardPage.expense_chart_title')} 
                    accent="text-[#FAF9F5]"
                    isLoading={isLoading}
                >
                    <LazyExpenseChart selectedRange="all_time" />
                </EnhancedCard>
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
                                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
                                </svg>
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