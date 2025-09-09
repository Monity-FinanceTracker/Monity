import { useState } from "react";
import { BalanceCard, ExpensivePurchase, Savings } from "../ui";
import { BalanceChart, ExpenseChart } from "../charts";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function ModernCard({ children, title, subtitle, icon, accent, isLoading = false, action }) {
    return (
        <div className="bg-[#23263a] border border-[#31344d] rounded-xl p-6 hover:border-[#31344d]/80 transition-all duration-200 group">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent === 'text-[#01C38D]' ? 'bg-[#01C38D]/10' : accent === 'text-red-400' ? 'bg-red-400/10' : 'bg-[#01C38D]/10'}`}>
                            {icon}
                        </div>
                    )}
                    <div>
                        <h3 className={`text-lg font-semibold ${accent || 'text-white'}`}>{title}</h3>
                        {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
                    </div>
                </div>
                {action && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {action}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="min-h-[120px] flex items-center justify-center">
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-4 border-[#31344d] border-t-[#01C38D] animate-spin"></div>
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}

function Dashboard() {
    const { t } = useTranslation();
    const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

    return (
        <div className="space-y-8 p-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-[#01C38D] to-[#01A071] rounded-xl p-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                    {t('dashboard.welcome_back')} 👋
                </h1>
                <p className="text-white/80">
                    {t('dashboard.welcome_subtitle')}
                </p>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ModernCard 
                    title={t('dashboardPage.balance_card_title')} 
                    subtitle="Total available balance"
                    accent="text-[#01C38D]"
                    icon={
                        <svg className="w-6 h-6 text-[#01C38D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
                        </svg>
                    }
                >
                    <BalanceCard selectedRange="all_time" />
                </ModernCard>

                <ModernCard 
                    title={t('dashboardPage.expense_chart_title')} 
                    subtitle="Monthly spending breakdown"
                    accent="text-red-400"
                    icon={
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                    }
                >
                    <ExpenseChart selectedRange="all_time" />
                </ModernCard>

                <ModernCard 
                    title={t('dashboardPage.savings_card_title')} 
                    subtitle="Your savings progress"
                    accent="text-green-400"
                    icon={
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    }
                >
                    <Savings selectedRange="all_time" />
                </ModernCard>
            </div>
            
            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ModernCard 
                    title={t('dashboardPage.balance_per_month_title')} 
                    subtitle="Track your balance over time"
                    accent="text-[#01C38D]"
                    icon={
                        <svg className="w-6 h-6 text-[#01C38D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    }
                    action={
                        <Link 
                            to="/transactions" 
                            className="text-[#01C38D] hover:text-[#01A071] text-sm font-medium"
                        >
                            View all →
                        </Link>
                    }
                >
                    <BalanceChart selectedRange="all_time" />
                </ModernCard>

                <ModernCard 
                    title={t('dashboardPage.expensive_purchases_title')} 
                    subtitle="Your largest transactions"
                    accent="text-orange-400"
                    icon={
                        <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
                        </svg>
                    }
                    action={
                        <Link 
                            to="/transactions" 
                            className="text-orange-400 hover:text-orange-300 text-sm font-medium"
                        >
                            View all →
                        </Link>
                    }
                >
                    <ExpensivePurchase selectedRange="all_time" />
                </ModernCard>
            </div>
            
            {/* Quick Actions Floating Button */}
            <div className="fixed bottom-8 right-8 z-50">
                <div className="relative">
                    <button 
                        className="w-16 h-16 rounded-full bg-[#01C38D] flex items-center justify-center shadow-xl hover:bg-[#01A071] hover:scale-105 transition-all duration-300"
                        onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
                        aria-haspopup="true"
                        aria-expanded={isFabMenuOpen}
                    >
                        <svg className={`w-6 h-6 text-[#191E29] transition-transform duration-300 ${isFabMenuOpen ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                    
                    <div 
                        className={`absolute bottom-full right-0 mb-4 transition-all duration-300 ${isFabMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
                    >
                        <div className="bg-[#23263a] rounded-xl shadow-xl border border-[#31344d] overflow-hidden min-w-[200px]">
                            <Link 
                                to="/add-income" 
                                className="flex items-center gap-3 px-4 py-3 text-green-400 hover:bg-[#31344d] transition-colors"
                                onClick={() => setIsFabMenuOpen(false)}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="font-medium">{t('dashboardPage.fab_add_income')}</span>
                            </Link>
                            <Link 
                                to="/add-expense" 
                                className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-[#31344d] transition-colors border-t border-[#31344d]/50"
                                onClick={() => setIsFabMenuOpen(false)}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                                <span className="font-medium">{t('dashboardPage.fab_add_expense')}</span>
                            </Link>
                            <Link 
                                to="/categories" 
                                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-[#31344d] transition-colors border-t border-[#31344d]/50"
                                onClick={() => setIsFabMenuOpen(false)}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                <span className="font-medium">{t('dashboardPage.fab_manage_categories')}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;