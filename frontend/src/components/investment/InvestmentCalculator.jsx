import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { post, get } from '../../utils/api';
import Spinner from '../ui/Spinner';
import InvestmentChart from './InvestmentChart';
import { TrendingUp, DollarSign, Target, Percent, AlertCircle, Crown } from 'lucide-react';

const InvestmentCalculator = () => {
    const { t } = useTranslation();
    
    // Form inputs
    const [initialInvestment, setInitialInvestment] = useState('1000');
    const [contributionAmount, setContributionAmount] = useState('100');
    const [contributionFrequency, setContributionFrequency] = useState('monthly');
    const [annualInterestRate, setAnnualInterestRate] = useState('8');
    const [goalDate, setGoalDate] = useState('');
    const [viewType, setViewType] = useState('monthly');
    
    // State
    const [results, setResults] = useState(null);
    const [growthData, setGrowthData] = useState([]);
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [limitReached, setLimitReached] = useState(false);

    // Set default goal date to 5 years from now
    useEffect(() => {
        const defaultDate = new Date();
        defaultDate.setFullYear(defaultDate.getFullYear() + 5);
        setGoalDate(defaultDate.toISOString().split('T')[0]);
    }, []);

    // Fetch usage on mount
    useEffect(() => {
        fetchUsage();
    }, []);

    const fetchUsage = async () => {
        try {
            const response = await get('/investment-calculator/usage');
            setUsage(response.data);
            
            if (!response.data.isPremium && 
                response.data.simulationsUsed >= response.data.simulationsLimit) {
                setLimitReached(true);
            }
        } catch (err) {
            console.error('Error fetching usage:', err);
        }
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await post('/investment-calculator/calculate', {
                initialInvestment: parseFloat(initialInvestment),
                contributionAmount: parseFloat(contributionAmount),
                contributionFrequency,
                annualInterestRate: parseFloat(annualInterestRate),
                goalDate,
                viewType
            });

            setResults(response.data.data.summary);
            setGrowthData(response.data.data.growthData);
            setUsage(response.data.data.usage);
            setLimitReached(false);
        } catch (err) {
            if (err.response?.status === 429) {
                setError(err.response.data.message);
                setLimitReached(true);
                setUsage({
                    simulationsUsed: err.response.data.used,
                    simulationsLimit: err.response.data.limit,
                    isPremium: false
                });
            } else if (err.response?.data?.errors) {
                setError(err.response.data.errors.join(', '));
            } else {
                setError(err.response?.data?.error || t('investmentCalculator.errorCalculating'));
            }
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-500/20 p-3 rounded-lg">
                                <TrendingUp className="w-8 h-8 text-green-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">
                                    {t('investmentCalculator.title')}
                                </h1>
                                <p className="text-gray-400 mt-1">
                                    {t('investmentCalculator.subtitle')}
                                </p>
                            </div>
                        </div>
                        
                        {/* Usage indicator */}
                        {usage && !usage.isPremium && (
                            <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                                <p className="text-sm text-gray-400">
                                    {t('investmentCalculator.simulationsUsed', {
                                        used: usage.simulationsUsed,
                                        limit: usage.simulationsLimit
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Limit Reached Banner */}
                {limitReached && (
                    <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-yellow-400 font-semibold mb-1">
                                {t('investmentCalculator.limitReached')}
                            </h3>
                            <p className="text-gray-300 text-sm mb-3">
                                {error || t('investmentCalculator.limitReachedMessage')}
                            </p>
                            <Link 
                                to="/subscription"
                                className="inline-flex items-center gap-2 bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                            >
                                <Crown className="w-4 h-4" />
                                {t('investmentCalculator.upgradeToPremium')}
                            </Link>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h2 className="text-xl font-semibold text-white mb-6">
                                {t('investmentCalculator.inputParameters')}
                            </h2>
                            
                            <form onSubmit={handleCalculate} className="space-y-5">
                                {/* Initial Investment */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('investmentCalculator.initialInvestment')}
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="number"
                                            value={initialInvestment}
                                            onChange={(e) => setInitialInvestment(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Contribution Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('investmentCalculator.contributionAmount')}
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="number"
                                            value={contributionAmount}
                                            onChange={(e) => setContributionAmount(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Contribution Frequency */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('investmentCalculator.contributionFrequency')}
                                    </label>
                                    <select
                                        value={contributionFrequency}
                                        onChange={(e) => setContributionFrequency(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                    >
                                        <option value="monthly">{t('investmentCalculator.monthly')}</option>
                                        <option value="semi-annually">{t('investmentCalculator.semiAnnually')}</option>
                                        <option value="annually">{t('investmentCalculator.annually')}</option>
                                    </select>
                                </div>

                                {/* Annual Interest Rate */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('investmentCalculator.annualInterestRate')}
                                    </label>
                                    <div className="relative">
                                        <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="number"
                                            value={annualInterestRate}
                                            onChange={(e) => setAnnualInterestRate(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 pr-10 py-2.5 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Goal Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('investmentCalculator.goalDate')}
                                    </label>
                                    <div className="relative">
                                        <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="date"
                                            value={goalDate}
                                            onChange={(e) => setGoalDate(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* View Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('investmentCalculator.chartView')}
                                    </label>
                                    <select
                                        value={viewType}
                                        onChange={(e) => setViewType(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                    >
                                        <option value="monthly">{t('investmentCalculator.monthlyView')}</option>
                                        <option value="annually">{t('investmentCalculator.annualView')}</option>
                                    </select>
                                </div>

                                {/* Error Display */}
                                {error && !limitReached && (
                                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Calculate Button */}
                                <button
                                    type="submit"
                                    disabled={loading || limitReached}
                                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                                        loading || limitReached
                                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                            : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Spinner />
                                            {t('investmentCalculator.calculating')}
                                        </span>
                                    ) : (
                                        t('investmentCalculator.calculate')
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-2 space-y-6">
                        {results ? (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/50 rounded-xl p-6">
                                        <h3 className="text-sm font-medium text-green-400 mb-2">
                                            {t('investmentCalculator.finalValue')}
                                        </h3>
                                        <p className="text-3xl font-bold text-white">
                                            {formatCurrency(results.finalValue)}
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/50 rounded-xl p-6">
                                        <h3 className="text-sm font-medium text-blue-400 mb-2">
                                            {t('investmentCalculator.totalInterest')}
                                        </h3>
                                        <p className="text-3xl font-bold text-white">
                                            {formatCurrency(results.totalInterest)}
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/50 rounded-xl p-6">
                                        <h3 className="text-sm font-medium text-purple-400 mb-2">
                                            {t('investmentCalculator.totalContributions')}
                                        </h3>
                                        <p className="text-3xl font-bold text-white">
                                            {formatCurrency(results.totalContributions)}
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50 rounded-xl p-6">
                                        <h3 className="text-sm font-medium text-yellow-400 mb-2">
                                            {t('investmentCalculator.roi')}
                                        </h3>
                                        <p className="text-3xl font-bold text-white">
                                            {results.roiPercentage.toFixed(2)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Chart */}
                                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                    <h2 className="text-xl font-semibold text-white mb-4">
                                        {t('investmentCalculator.growthProjection')}
                                    </h2>
                                    <InvestmentChart data={growthData} viewType={viewType} />
                                </div>
                            </>
                        ) : (
                            <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
                                <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                                    {t('investmentCalculator.noResults')}
                                </h3>
                                <p className="text-gray-500">
                                    {t('investmentCalculator.enterParameters')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestmentCalculator;

