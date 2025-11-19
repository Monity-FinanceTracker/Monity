import { useState } from "react";
import { BalanceCard, ExpensivePurchase, Savings, Container, Grid, Heading, Text } from "../ui";
// Removed static imports - using lazy components instead
import { LazyExpenseChart, LazyBalanceChart } from '../LazyComponents';
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/useAuth";
import { getDynamicGreeting } from "../../utils/greetings";

function ModernCard({ children, title, subtitle, accent, isLoading = false, action }) {
    return (
        <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl px-6 py-4 hover:border-[#3a3a3a] transition-all duration-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 text-left">
                    <h3 className={`text-xl font-bold ${accent || 'text-white'} mb-1`}>{title}</h3>
                    {subtitle && <p className="text-[#C2C0B6] text-sm">{subtitle}</p>}
                </div>
                {action && (
                    <div className="flex items-center">
                        {action}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="min-h-[120px]">
                {isLoading ? (
                    <div className="flex items-center justify-center min-h-[120px]">
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
}

function Dashboard() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

    // Get dynamic greeting based on time of day and user name
    const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || t('dashboard.user');
    const greeting = getDynamicGreeting(userName);

    return (
        <Container size="default" padding="default">
            <div className="space-y-8">
                {/* Welcome Section */}
                <div>
                    <h1 
                        className="text-3xl font-bold text-white mb-2 text-balance font-stratford"
                    >
                        {greeting}
                    </h1>
                    <p className="text-[#C2C0B6] text-lg text-left">
                        {t('dashboard.welcome_subtitle')}
                    </p>
                </div>

                {/* Financial Overview Cards */}
                <Grid 
                    cols={{ base: 1, lg: 3 }} 
                    gap="default"
                >
                <ModernCard 
                    title={t('dashboardPage.balance_card_title')} 
                    subtitle="Total available balance"
                    accent="text-[#56a69f]"
                >
                    <BalanceCard selectedRange="all_time" />
                </ModernCard>

                <ModernCard 
                    title={t('dashboardPage.expense_chart_title')} 
                    subtitle="Monthly spending breakdown"
                    accent="text-[#FAF9F5]"
                >
                    <LazyExpenseChart selectedRange="all_time" />
                </ModernCard>

                <ModernCard 
                    title={t('dashboardPage.savings_card_title')} 
                    subtitle="Your savings progress"
                    accent="text-[#A69F8E]"
                >
                    <Savings selectedRange="all_time" />
                </ModernCard>
                </Grid>
            
                {/* Detailed Analytics */}
                <Grid 
                    cols={{ base: 1, xl: 2 }} 
                    gap="default"
                >
                <ModernCard 
                    title={t('dashboardPage.balance_per_month_title')} 
                    subtitle="Track your balance over time"
                    accent="text-[#56a69f]"
                    action={
                        <Link 
                            to="/transactions" 
                            className="text-[#56a69f] hover:text-[#4a8f88] text-sm font-medium transition-colors"
                        >
                            View all →
                        </Link>
                    }
                >
                    <LazyBalanceChart selectedRange="all_time" />
                </ModernCard>

                <ModernCard 
                    title={t('dashboardPage.expensive_purchases_title')} 
                    subtitle="Your largest transactions"
                    accent="text-orange-400"
                    action={
                        <Link 
                            to="/transactions" 
                            className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
                        >
                            View all →
                        </Link>
                    }
                >
                    <ExpensivePurchase selectedRange="all_time" />
                </ModernCard>
                </Grid>
            
            {/* Quick Actions Floating Button */}
            <div className="fixed bottom-8 right-8 z-50">
                <div className="relative">
                    <button 
                        className="w-16 h-16 rounded-full bg-[#56a69f] flex items-center justify-center shadow-xl hover:bg-[#4a8f88] hover:scale-105 transition-all duration-300"
                        onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
                        aria-haspopup="true"
                        aria-expanded={isFabMenuOpen}
                    >
                        <svg className={`w-6 h-6 text-[#1F1E1D] transition-transform duration-300 ${isFabMenuOpen ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                    
                    <div 
                        className={`absolute bottom-full right-0 mb-4 transition-all duration-300 ${isFabMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
                    >
                        <div className="bg-[#1F1E1D] rounded-xl shadow-xl border border-[#262626] overflow-hidden min-w-[200px]">
                            <Link 
                                to="/add-income" 
                                className="flex items-center gap-3 px-4 py-3 text-green-400 hover:bg-[#1F1E1D] transition-colors"
                                onClick={() => setIsFabMenuOpen(false)}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="font-medium">{t('dashboardPage.fab_add_income')}</span>
                            </Link>
                            <Link 
                                to="/add-expense" 
                                className="flex items-center gap-3 px-4 py-3 text-[#FAF9F5] hover:bg-[#1F1E1D] transition-colors border-t border-[#262626]/50"
                                onClick={() => setIsFabMenuOpen(false)}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                                <span className="font-medium">{t('dashboardPage.fab_add_expense')}</span>
                            </Link>
                            <Link 
                                to="/categories" 
                                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-[#1F1E1D] transition-colors border-t border-[#262626]/50"
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
        </Container>
    );
}

export default Dashboard;