import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { Users, TrendingUp, UserPlus, Target, Clock, Brain, RefreshCw, Download } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

// Import new components
import EnhancedMetricCard from './EnhancedMetricCard';
import TrendLineChart from './TrendLineChart';
import ConversionFunnelChart from './ConversionFunnelChart';
import DataSection from './DataSection';
import InsightsCard from './InsightsCard';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function AnalyticsDashboard() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState([]);
    const [insightsLoading, setInsightsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [dateRange, setDateRange] = useState('30'); // Last 30 days by default
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAnalytics();
        fetchInsights();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(dateRange));

            const response = await api.get('/analytics/dashboard', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            });

            setDashboardData(response.data);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const fetchInsights = async () => {
        try {
            setInsightsLoading(true);

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(dateRange));

            const response = await api.get('/analytics/insights', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            });

            setInsights(response.data);
        } catch (err) {
            console.error('Failed to fetch insights:', err);
            setInsights([]);
        } finally {
            setInsightsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchAnalytics(), fetchInsights()]);
        setRefreshing(false);
    };

    const handleExport = () => {
        if (!dashboardData) return;

        const exportData = {
            dateRange: `Last ${dateRange} days`,
            exportedAt: new Date().toISOString(),
            metrics: dashboardData.metrics,
            features: dashboardData.features,
            funnel: dashboardData.funnel
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `monity-analytics-${Date.now()}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    if (loading && !dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#262624]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-[#262626]
                                  border-t-[#56a69f] animate-spin"></div>
                    <p className="text-gray-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#262624] p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
                        <h3 className="font-semibold mb-2">Error Loading Analytics</h3>
                        <p>{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return null;
    }

    const { metrics, features, funnel, events, avgSessionDuration, aiAcceptanceRate } = dashboardData;

    // Prepare subscription chart data
    const subscriptionData = {
        labels: ['Free Users', 'Premium Users', 'Pro Users'],
        datasets: [{
            data: [
                metrics.subscriptionBreakdown.free || 0,
                metrics.subscriptionBreakdown.premium || 0,
                metrics.subscriptionBreakdown.pro || 0
            ],
            backgroundColor: ['#8F8D85', '#56a69f', '#36A2EB'],
            borderWidth: 0,
        }]
    };

    const chartOptions = {
        plugins: {
            legend: {
                position: 'bottom',
                align: 'center',
                labels: {
                    color: '#FAF9F5',
                    font: { size: 12, weight: '500' },
                    padding: 16,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: '#1F1E1D',
                titleColor: '#FAF9F5',
                bodyColor: '#8F8D85',
                borderColor: '#262626',
                borderWidth: 1,
                padding: 12
            }
        },
        cutout: '65%',
        maintainAspectRatio: true
    };

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    };

    return (
        <div className="min-h-screen bg-[#262624] p-4 md:p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            Analytics Dashboard
                        </h1>
                        <p className="text-gray-400">
                            Track user behavior, engagement, and app performance
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                        {/* Date Range Selector */}
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="bg-[#1F1E1D] border border-[#262626] text-white rounded-lg
                                     px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#56a69f]
                                     hover:border-[#3a3a3a] transition-colors"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                        </select>

                        {/* Refresh Button */}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2 bg-[#1F1E1D] border border-[#262626] rounded-lg
                                     hover:border-[#56a69f]/50 transition-colors disabled:opacity-50"
                            title="Refresh data"
                        >
                            <RefreshCw className={`w-5 h-5 text-[#56a69f] ${refreshing ? 'animate-spin' : ''}`} />
                        </button>

                        {/* Export Button */}
                        <button
                            onClick={handleExport}
                            className="p-2 bg-[#1F1E1D] border border-[#262626] rounded-lg
                                     hover:border-[#56a69f]/50 transition-colors"
                            title="Export data"
                        >
                            <Download className="w-5 h-5 text-[#56a69f]" />
                        </button>
                    </div>
                </div>

                {/* AI Insights Section */}
                <DataSection>
                    <InsightsCard insights={insights} loading={insightsLoading} />
                </DataSection>

                {/* Overview Metrics */}
                <DataSection
                    title="Overview Metrics"
                    subtitle="Key performance indicators at a glance"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <EnhancedMetricCard
                            title="Daily Active Users"
                            value={metrics.dau?.toLocaleString() || '0'}
                            icon={<Users className="w-6 h-6" />}
                            color="text-[#56a69f]"
                            bgGradient="from-[#56a69f]/20 to-[#56a69f]/5"
                            loading={loading}
                        />
                        <EnhancedMetricCard
                            title="Monthly Active Users"
                            value={metrics.mau?.toLocaleString() || '0'}
                            icon={<TrendingUp className="w-6 h-6" />}
                            color="text-[#36A2EB]"
                            bgGradient="from-[#36A2EB]/20 to-[#36A2EB]/5"
                            loading={loading}
                        />
                        <EnhancedMetricCard
                            title="New Signups"
                            value={metrics.newSignups?.toLocaleString() || '0'}
                            icon={<UserPlus className="w-6 h-6" />}
                            color="text-[#FFCE56]"
                            bgGradient="from-[#FFCE56]/20 to-[#FFCE56]/5"
                            loading={loading}
                        />
                        <EnhancedMetricCard
                            title="Conversion Rate"
                            value={`${metrics.conversionRate?.toFixed(1) || '0'}%`}
                            icon={<Target className="w-6 h-6" />}
                            color="text-green-400"
                            bgGradient="from-green-500/20 to-green-500/5"
                            loading={loading}
                        />
                    </div>
                </DataSection>

                {/* Engagement Metrics */}
                <DataSection
                    title="Engagement Insights"
                    subtitle="How users interact with your app"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <EnhancedMetricCard
                            title="Total Sessions"
                            value={metrics.totalSessions?.toLocaleString() || '0'}
                            subtitle="User sessions tracked"
                            color="text-[#56a69f]"
                            bgGradient="from-[#56a69f]/20 to-[#56a69f]/5"
                            loading={loading}
                        />
                        <EnhancedMetricCard
                            title="Avg Session Duration"
                            value={formatDuration(avgSessionDuration || 0)}
                            icon={<Clock className="w-6 h-6" />}
                            color="text-[#36A2EB]"
                            bgGradient="from-[#36A2EB]/20 to-[#36A2EB]/5"
                            loading={loading}
                        />
                        <EnhancedMetricCard
                            title="AI Acceptance Rate"
                            value={`${aiAcceptanceRate || 0}%`}
                            icon={<Brain className="w-6 h-6" />}
                            color="text-purple-400"
                            bgGradient="from-purple-500/20 to-purple-500/5"
                            loading={loading}
                        />
                    </div>
                </DataSection>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Subscription Distribution */}
                    <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-6
                                  hover:border-[#3a3a3a] transition-all duration-200">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            User Distribution
                        </h3>
                        <div className="h-64 flex items-center justify-center">
                            <Doughnut data={subscriptionData} options={chartOptions} />
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#262626]">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-gray-500">Free</p>
                                    <p className="text-lg font-bold text-gray-400">
                                        {metrics.subscriptionBreakdown.free || 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Premium</p>
                                    <p className="text-lg font-bold text-[#56a69f]">
                                        {metrics.subscriptionBreakdown.premium || 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Pro</p>
                                    <p className="text-lg font-bold text-[#36A2EB]">
                                        {metrics.subscriptionBreakdown.pro || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Events */}
                    <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-6
                                  hover:border-[#3a3a3a] transition-all duration-200">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Top User Actions
                        </h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2
                                      scrollbar-thin scrollbar-thumb-[#262626] scrollbar-track-transparent">
                            {events && events.length > 0 ? (
                                events.slice(0, 10).map((event, index) => (
                                    <div key={index} className="flex items-center justify-between
                                                               p-3 bg-gradient-to-r from-[#56a69f]/10 to-transparent
                                                               rounded-lg border border-[#262626]/50
                                                               hover:border-[#56a69f]/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-medium text-[#56a69f]
                                                           bg-[#56a69f]/10 px-2 py-1 rounded">
                                                #{index + 1}
                                            </span>
                                            <span className="text-sm text-white font-medium">
                                                {event.eventName.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-[#56a69f]">
                                            {event.count.toLocaleString()}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-400 py-8">No events tracked yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Conversion Funnel */}
                <DataSection
                    title="Conversion Funnel"
                    subtitle="Track user journey from signup to premium conversion"
                >
                    <ConversionFunnelChart steps={funnel} loading={loading} />
                </DataSection>

                {/* Feature Adoption */}
                <DataSection
                    title="Feature Adoption"
                    subtitle="Most used features and their engagement rates"
                >
                    <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-6
                                  hover:border-[#3a3a3a] transition-all duration-200">
                        {features && features.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {features.slice(0, 8).map((feature, index) => (
                                    <div key={index} className="p-4 bg-gradient-to-r from-[#56a69f]/10 to-transparent
                                                               rounded-lg border border-[#262626]/50
                                                               hover:border-[#56a69f]/30 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="text-sm font-semibold text-white capitalize">
                                                {feature.feature}
                                            </h4>
                                            <span className="text-xs text-[#56a69f] bg-[#56a69f]/10 px-2 py-1 rounded">
                                                #{index + 1}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Users</p>
                                                <p className="text-lg font-bold text-[#56a69f]">
                                                    {feature.users}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Events</p>
                                                <p className="text-lg font-bold text-gray-400">
                                                    {feature.events.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-400 py-8">No feature data available yet</p>
                        )}
                    </div>
                </DataSection>
            </div>
        </div>
    );
}

export default AnalyticsDashboard;
