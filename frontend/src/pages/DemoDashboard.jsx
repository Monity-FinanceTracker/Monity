import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency, getAmountColor } from '../utils/currency';
import { getDynamicGreeting } from '../utils/greetings';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { LazyExpenseChart, LazyBalanceChart } from '../components/LazyComponents';
import { generateCompleteDemoData } from '../utils/demoData';

/**
 * Demo Dashboard - Separate page for showcasing Monity features with demo data
 * This is NOT the real dashboard - it's for unauthenticated users to explore
 */
const DemoDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectedRange, setSelectedRange] = React.useState('current_month');

    // Generate demo data
    const demoData = React.useMemo(() => generateCompleteDemoData(), []);

    // Demo user name
    const userName = 'Usuário';
    const greeting = getDynamicGreeting(userName, t);

    // Use demo transactions (first 3)
    const recentTransactions = demoData.transactions.slice(0, 3);
    const demoBalance = demoData.profile.balance;

    // Enhanced card wrapper
    const EnhancedCard = ({ children, title, subtitle, isLoading = false, headerAction, className = '' }) => {
        return (
            <div className={`bg-[#1F1E1D] border border-[#262626] rounded-xl hover:border-[#3a3a3a] transition-all duration-200 ${className}`}>
                <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1 text-left">
                            <h3 className="text-2xl font-bold text-[#C2C0B6]">{title}</h3>
                            {subtitle && <p className="text-[#C2C0B6] text-sm mt-1">{subtitle}</p>}
                        </div>
                        {headerAction && (
                            <div className="flex items-center">
                                {headerAction}
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

    const RecentTransactionsPreview = () => (
        <EnhancedCard
            title={t('dashboard.recent_transactions')}
            subtitle={t('dashboard.last_3_transactions')}
            accent="text-[#56a69f]"
        >
            <div className="space-y-3">
                {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction, index) => (
                        <div
                            key={transaction.id || index}
                            className="flex items-center p-3 bg-[#232323] rounded-lg gap-3"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        transaction.typeId === 1
                                            ? 'bg-[#D97757]/20'
                                            : transaction.typeId === 2
                                            ? 'bg-[#56a69f]/20'
                                            : 'bg-blue-500/20'
                                    }`}
                                >
                                    {transaction.typeId === 1 ? (
                                        <ArrowUp className="w-5 h-5 text-[#D97757]" />
                                    ) : (
                                        <ArrowDown className="w-5 h-5 text-[#56a69f]" />
                                    )}
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-[#FAF9F5]">
                                        {transaction.description}
                                    </div>
                                    <div className="text-xs text-[#C2C0B6]">
                                        {transaction.category}
                                    </div>
                                </div>
                            </div>
                            <div className="ml-auto text-right">
                                <div
                                    className={`font-semibold ${getAmountColor(
                                        transaction.typeId
                                    )}`}
                                >
                                    {formatCurrency(transaction.amount, transaction.typeId)}
                                </div>
                                <div className="text-xs text-[#C2C0B6]">
                                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                </div>
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

    const SavingsOverviewCard = () => {
        const demoGoals = demoData.savingsGoals || [];
        const totalAllocated = demoGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
        const totalTargets = demoGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
        const progressPercentage = totalTargets > 0 ? (totalAllocated / totalTargets) * 100 : 0;

        return (
            <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-6 hover:border-[#3a3a3a] transition-all duration-200">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-[#C2C0B6] text-left">
                        {t('savings_goals.title')}
                    </h3>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-baseline mb-3">
                        <div>
                            <span className="text-sm text-[#C2C0B6] block mb-1">
                                {t('savings_goals.current_amount')}
                            </span>
                            <span className="text-3xl font-bold text-white">
                                ${totalAllocated.toLocaleString()}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-sm text-[#C2C0B6] block mb-1">
                                {t('savings_goals.target_amount')}
                            </span>
                            <span className="text-3xl font-bold text-[#56a69f]">
                                ${totalTargets.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between text-sm text-[#C2C0B6] mb-2">
                        <span>{t('savings_goals.overall_progress')}</span>
                        <span className="font-bold text-[#56a69f]">{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-[#232323] rounded-full h-4">
                        <div
                            className="bg-[#56a69f] h-4 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 dashboard-overview">
            {/* Demo Badge */}
            <div className="flex justify-center mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#56a69f]/20 border border-[#56a69f]/30 rounded-full">
                    <div className="w-2 h-2 bg-[#56a69f] rounded-full animate-pulse"></div>
                    <span className="text-[#56a69f] font-medium text-sm">
                        {t('demo.mode_active', 'Modo Demonstração')}
                    </span>
                </div>
            </div>

            {/* Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 text-balance font-stratford">
                        {greeting}
                    </h1>
                    <p className="text-[#C2C0B6] text-lg text-left">
                        {t('dashboard.demo_subtitle')}
                    </p>
                </div>
            </div>

            {/* CTA Section - Prominent Sign Up Button */}
            <div className="bg-gradient-to-r from-[#56a69f]/10 to-[#4A8F88]/10 border border-[#56a69f]/30 rounded-xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {t('demo.ready_to_start', 'Pronto para começar?')}
                        </h3>
                        <p className="text-[#C2C0B6]">
                            {t('demo.signup_message', 'Crie sua conta gratuita e comece a gerenciar suas finanças hoje')}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-6 py-3 bg-[#56a69f] text-white rounded-lg hover:bg-[#4A8F88] transition-all font-semibold whitespace-nowrap"
                        >
                            {t('common.signup', 'Cadastrar')}
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-3 bg-[#232323] text-[#FAF9F5] rounded-lg hover:bg-[#2a2a2a] transition-all font-medium whitespace-nowrap"
                        >
                            {t('common.login', 'Entrar')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Balance Card - Full Width */}
            <EnhancedCard
                title={t('dashboardPage.balance_card_title')}
                accent="text-[#56a69f]"
            >
                <div className="flex items-center gap-4">
                    <h2 className="text-6xl font-bold text-white whitespace-nowrap overflow-hidden text-left">
                        R$ {demoBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-2 ml-auto">
                        <div className="relative group/tooltip">
                            <button
                                disabled
                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#56a69f]/20 flex items-center justify-center opacity-50 cursor-not-allowed"
                            >
                                <ArrowDown className="w-5 h-5 text-[#56a69f]" />
                            </button>
                        </div>

                        <div className="relative group/tooltip">
                            <button
                                disabled
                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#A69F8E]/20 flex items-center justify-center opacity-50 cursor-not-allowed"
                            >
                                <ArrowDown className="w-5 h-5 text-[#A69F8E]" />
                            </button>
                        </div>

                        <div className="relative group/tooltip">
                            <button
                                disabled
                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#D97757]/20 flex items-center justify-center opacity-50 cursor-not-allowed"
                            >
                                <ArrowUp className="w-5 h-5 text-[#D97757]" />
                            </button>
                        </div>
                    </div>
                </div>
            </EnhancedCard>

            {/* Recent Transactions and Savings Goals - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentTransactionsPreview />
                <SavingsOverviewCard />
            </div>

            {/* Charts - Balance Per Month and Expenses by Category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnhancedCard
                    title={t('dashboardPage.balance_per_month_title')}
                    subtitle={t('dashboard.balance_chart_desc')}
                    accent="text-[#56a69f]"
                    headerAction={
                        <select
                            value={selectedRange}
                            onChange={(e) => setSelectedRange(e.target.value)}
                            className="bg-[#232323] text-[#FAF9F5] border border-[#3a3a3a] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#56a69f]/50"
                        >
                            <option value="current_month">{t('common.current_month')}</option>
                            <option value="all_time">{t('dashboard.all_time')}</option>
                        </select>
                    }
                >
                    <LazyBalanceChart selectedRange={selectedRange} />
                </EnhancedCard>

                <EnhancedCard
                    title={t('dashboardPage.expense_chart_title')}
                    subtitle={t('dashboard.expense_chart_desc')}
                    accent="text-[#D97757]"
                >
                    <LazyExpenseChart />
                </EnhancedCard>
            </div>

            {/* Bottom CTA */}
            <div className="text-center py-8 bg-[#1F1E1D] border border-[#262626] rounded-xl">
                <h3 className="text-2xl font-bold text-white mb-3">
                    {t('demo.impressed', 'Gostou do que viu?')}
                </h3>
                <p className="text-[#C2C0B6] mb-6 max-w-2xl mx-auto">
                    {t('demo.full_features', 'Crie sua conta gratuita agora e tenha acesso a todas essas funcionalidades com seus dados reais')}
                </p>
                <button
                    onClick={() => navigate('/signup')}
                    className="px-8 py-4 bg-[#56a69f] text-white rounded-lg hover:bg-[#4A8F88] transition-all font-semibold text-lg"
                >
                    {t('demo.create_free_account', 'Criar Conta Gratuita')}
                </button>
            </div>
        </div>
    );
};

export default DemoDashboard;
