import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { get } from '../../utils/api';
import Spinner from '../ui/Spinner';
import { Banknote, Lightbulb, BarChart3 } from 'lucide-react';
import { Icon } from '../../utils/iconMapping.jsx';

/**
 * Financial Health Component - Personal financial health dashboard
 */
const FinancialHealth = () => {
    const { t } = useTranslation();
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFinancialHealth();
    }, []);

    const fetchFinancialHealth = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await get('/auth/financial-health');
            setHealthData(response.data);
        } catch (err) {
            console.error('Error fetching financial health:', err);
            setError('Failed to load financial health data');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-blue-400';
        if (score >= 40) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreGradient = (score) => {
        if (score >= 80) return 'from-green-500 to-green-600';
        if (score >= 60) return 'from-blue-500 to-blue-600';
        if (score >= 40) return 'from-yellow-500 to-yellow-600';
        return 'from-red-500 to-red-600';
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-green-500/20 text-green-400 border-green-500/30';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    if (loading) {
        return <Spinner message={t('financialHealth.loading')} />;
    }

    if (error) {
        return (
            <div className="text-white p-4 md:p-0">
                <div className="bg-red-500/20 border border-red-500 rounded-2xl p-6 text-red-200">
                    <h2 className="text-xl font-bold mb-2">{t('financialHealth.error_loading')}</h2>
                    <p>{error}</p>
                    <button 
                        onClick={fetchFinancialHealth}
                        className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                    >
                        {t('financialHealth.retry')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="text-white p-4 md:p-0 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">{t('financialHealth.title')}</h1>
                    <p className="text-gray-400 mt-1">
                        {t('financialHealth.subtitle')}
                    </p>
                </div>
                <div className="text-sm text-gray-400">
                    {t('financialHealth.last_updated')}: {new Date(healthData.lastUpdated).toLocaleDateString()}
                </div>
            </div>

            {/* Health Score Card */}
            <div className="bg-[#1F1E1D] p-8 rounded-2xl border border-[#262626]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">{t('financialHealth.health_score')}</h2>
                    <span className="text-sm bg-[#56a69f]/20 text-[#56a69f] px-3 py-1 rounded-full">
                        {healthData.period}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Score Display */}
                    <div className="text-center lg:text-left">
                        <div className={`text-6xl font-bold mb-2 ${getScoreColor(healthData.score)}`}>
                            {healthData.score}
                        </div>
                        <div className="text-2xl font-semibold text-gray-300 mb-4">
                            {healthData.category}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-[#1F1E1D] rounded-full h-3 mb-4 border border-[#262626]">
                            <div 
                                className={`h-3 rounded-full bg-gradient-to-r ${getScoreGradient(healthData.score)} transition-all duration-1000`}
                                style={{ width: `${healthData.score}%` }}
                            ></div>
                        </div>
                        
                        <p className="text-gray-400 text-sm">
                            {t('financialHealth.based_on_period', { period: healthData.period })}
                        </p>
                    </div>

                    {/* Quick Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#1F1E1D] p-4 rounded-xl border border-[#262626]">
                            <div className="text-2xl font-bold text-[#56a69f]">
                                {healthData.metrics.savingsRate}%
                            </div>
                            <div className="text-sm text-gray-400">{t('financialHealth.savings_rate')}</div>
                        </div>
                        <div className="bg-[#1F1E1D] p-4 rounded-xl border border-[#262626]">
                            <div className="text-2xl font-bold text-[#36A2EB]">
                                {healthData.metrics.expenseRatio}%
                            </div>
                            <div className="text-sm text-gray-400">{t('financialHealth.expense_ratio')}</div>
                        </div>
                        <div className="bg-[#1F1E1D] p-4 rounded-xl border border-[#262626]">
                            <div className="text-2xl font-bold text-[#FFCE56]">
                                {formatCurrency(healthData.metrics.totalSavings)}
                            </div>
                            <div className="text-sm text-gray-400">{t('financialHealth.total_savings')}</div>
                        </div>
                        <div className="bg-[#1F1E1D] p-4 rounded-xl border border-[#262626]">
                            <div className="text-2xl font-bold text-[#FF6384]">
                                {healthData.metrics.transactionCount}
                            </div>
                            <div className="text-sm text-gray-400">{t('financialHealth.transactions')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1F1E1D] p-6 rounded-2xl border border-[#262626]">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Banknote className="w-5 h-5 mr-2" />
                        {t('financialHealth.income')}
                    </h3>
                    <div className="text-3xl font-bold text-[#56a69f] mb-2">
                        {formatCurrency(healthData.metrics.totalIncome)}
                    </div>
                    <p className="text-gray-400 text-sm">{t('financialHealth.total_income_period', { period: healthData.period })}</p>
                </div>

                <div className="bg-[#1F1E1D] p-6 rounded-2xl border border-[#262626]">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Icon name="CreditCard" size="sm" className="mr-2" />
                        {t('financialHealth.expenses')}
                    </h3>
                    <div className="text-3xl font-bold text-red-400 mb-2">
                        {formatCurrency(healthData.metrics.totalExpenses)}
                    </div>
                    <p className="text-gray-400 text-sm">{t('financialHealth.total_expenses_period', { period: healthData.period })}</p>
                </div>

                <div className="bg-[#1F1E1D] p-6 rounded-2xl border border-[#262626]">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <span className="mr-2">🏦</span>
                        {t('financialHealth.net_savings')}
                    </h3>
                    <div className={`text-3xl font-bold mb-2 ${healthData.metrics.totalSavings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(healthData.metrics.totalSavings)}
                    </div>
                    <p className="text-gray-400 text-sm">{t('financialHealth.net_savings_period', { period: healthData.period })}</p>
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-[#1F1E1D] p-6 rounded-2xl border border-[#262626]">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    {t('financialHealth.personalized_recommendations')}
                </h2>
                
                <div className="space-y-4">
                    {healthData.recommendations.map((rec, index) => (
                        <div 
                            key={index}
                            className={`p-4 rounded-xl border ${getPriorityColor(rec.priority)}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-2">{rec.title}</h3>
                                    <p className="text-sm mb-3 opacity-90">{rec.description}</p>
                                    <p className="text-sm font-medium">{rec.actionable}</p>
                                </div>
                                <span className="text-xs px-2 py-1 rounded uppercase font-bold">
                                    {rec.priority}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Health Score Explanation */}
            <div className="bg-[#1F1E1D] p-6 rounded-2xl border border-[#262626]">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    {t('financialHealth.how_score_calculated')}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-2 text-green-400">{t('financialHealth.positive_factors')}</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>{t('financialHealth.savings_rate_above')}</li>
                            <li>{t('financialHealth.expense_ratio_below')}</li>
                            <li>{t('financialHealth.consistent_patterns')}</li>
                            <li>{t('financialHealth.emergency_fund')}</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2 text-red-400">{t('financialHealth.areas_for_improvement')}</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>{t('financialHealth.low_savings_rate')}</li>
                            <li>{t('financialHealth.high_expense_ratio')}</li>
                            <li>{t('financialHealth.irregular_income')}</li>
                            <li>{t('financialHealth.lack_diversification')}</li>
                        </ul>
                    </div>
                </div>
                
                <div className="mt-6 p-4 bg-[#1F1E1D] rounded-lg border border-[#262626]">
                    <h4 className="font-semibold mb-2">{t('financialHealth.score_ranges')}:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div><span className="text-green-400">80-100:</span> {t('financialHealth.excellent')}</div>
                        <div><span className="text-blue-400">60-79:</span> {t('financialHealth.good')}</div>
                        <div><span className="text-yellow-400">40-59:</span> {t('financialHealth.fair')}</div>
                        <div><span className="text-red-400">0-39:</span> {t('financialHealth.poor')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialHealth;
