import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/useAuth';
import { get } from '../../utils/api';
import { formatCurrency, getAmountColor } from '../../utils/currency';
import { getDynamicGreeting } from '../../utils/greetings';
import { BalanceCard, Savings, SavingsOverviewCard, DashboardSkeleton } from '../ui';
// Removed static imports - using lazy components instead
import { ArrowUp, ArrowDown } from 'lucide-react';
import { LazyExpenseChart, LazyBalanceChart } from '../LazyComponents';

/**
 * Enhanced Dashboard with improved UX, quick actions, and better visual hierarchy
 */
const EnhancedDashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState({
        recentTransactions: [],
        upcomingBills: [],
        budgetAlerts: [],
        savingsProgress: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    // Removed activeQuickAction state to prevent unnecessary re-renders on hover

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

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

        fetchDashboardData();
    }, [user]);
    // Enhanced card wrapper with loading states
    const EnhancedCard = ({ children, title, subtitle, accent, isLoading = false, action, className = '' }) => {
        return (
            <div className={`bg-[#1F1E1D] border border-[#262626] rounded-xl hover:border-[#3a3a3a] transition-all duration-200 ${className}`}>
                <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1 text-left">
                            <h3 className={`text-2xl font-bold ${accent || 'text-white'}`}>{title}</h3>
                            {subtitle && <p className="text-[#C2C0B6] text-sm mt-1">{subtitle}</p>}
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
            accent="text-[#56a69f]"
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
                {!user ? (
                    <div className="text-center py-8">
                        <p className="text-gray-400">
                            {t('dashboard.login_to_view_data', 'Faça login para ver suas últimas transações.')}
                        </p>
                    </div>
                ) : dashboardData.recentTransactions.length > 0 ? (
                    dashboardData.recentTransactions.map((transaction, index) => (
                        <div
                            key={transaction.id || index}
                            className="flex items-center p-3 bg-[#232323] rounded-lg gap-3"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        transaction.typeId === 1
                                            ? 'bg-[#FAF9F5]/20'
                                            : transaction.typeId === 2
                                            ? 'bg-[#56a69f]/20'
                                            : 'bg-blue-500/20'
                                    }`}
                                >
                                    {transaction.typeId === 1 ? (
                                        <ArrowUp className="w-5 h-5 text-[#FAF9F5]" />
                                    ) : transaction.typeId === 2 ? (
                                        <ArrowDown className="w-5 h-5 text-[#56a69f]" />
                                    ) : (
                                        <ArrowDown className="w-5 h-5 text-blue-500" />
                                    )}
                                </div>
                                <div className="flex flex-col items-start text-left">
                                    <p className="text-white font-medium text-left">
                                        {transaction.description}
                                    </p>
                                    <p className="text-[#C2C0B6] text-sm text-left">
                                        {transaction.category}
                                    </p>
                                </div>
                            </div>
                            <div className="ml-auto text-right">
                                <p className={`font-bold ${getAmountColor(transaction.typeId)}`}>
                                    {formatCurrency(transaction.amount || 0, transaction.typeId)}
                                </p>
                                <p className="text-[#C2C0B6] text-xs">
                                    {new Date(transaction.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-left">
                        <p className="text-[#C2C0B6]">{t('dashboard.no_recent_transactions')}</p>
                    </div>
                )}
            </div>
        </EnhancedCard>
    );

    // Show skeleton while loading to prevent CLS
    if (isLoading) {
        return <DashboardSkeleton />;
    }

    // Get dynamic greeting based on time of day and user name
    const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || t('dashboard.user');
    const greeting = getDynamicGreeting(userName, t);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-left">
                <h1 
                    className="text-3xl font-bold text-white mb-2 text-left font-stratford"
                >
                    {greeting}
                </h1>
                <p className="text-[#C2C0B6] text-lg text-left">
                    {t('dashboard.welcome_subtitle')}
                </p>
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
                    accent="text-[#56a69f]"
                    isLoading={isLoading}
                    className="xl:col-span-1"
                >
                    <LazyBalanceChart selectedRange="all_time" />
                </EnhancedCard>

                <EnhancedCard 
                    title={t('dashboardPage.expense_chart_title')} 
                    accent="text-[#56a69f]"
                    isLoading={isLoading}
                >
                    <LazyExpenseChart selectedRange="all_time" />
                </EnhancedCard>
            </div>
        </div>
    );
};

export default EnhancedDashboard; 