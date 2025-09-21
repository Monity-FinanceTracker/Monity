import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { get } from '../../utils/api';
import { getPerformanceSummary, enablePerformanceDebug, disablePerformanceDebug } from '../../utils/webVitals';
import Spinner from '../ui/Spinner';
import { CheckCircle, XCircle, AlertTriangle, AlertCircle, Rocket } from 'lucide-react';
import { Icon } from '../../utils/iconMapping.jsx';

/**
 * Performance Dashboard Component
 * Displays frontend and backend performance metrics for admins
 */
const PerformanceDashboard = React.memo(() => {
    const { t } = useTranslation();
    const [performanceData, setPerformanceData] = useState(null);
    const [webVitals, setWebVitals] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
    const [autoRefresh, setAutoRefresh] = useState(false);

    // Fetch backend performance data
    const fetchPerformanceData = useCallback(async () => {
        try {
            const [healthResponse, statsResponse] = await Promise.all([
                get('/health'),
                get('/performance/stats').catch(() => ({ data: null })) // Might not be available
            ]);

            setPerformanceData({
                health: healthResponse.data || healthResponse,
                stats: statsResponse.data
            });

            // Get frontend Web Vitals
            const frontendMetrics = getPerformanceSummary();
            setWebVitals(frontendMetrics);

        } catch (err) {
            setError(err.message);
            console.error('Error fetching performance data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchPerformanceData();
    }, [fetchPerformanceData]);

    // Auto-refresh setup
    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(fetchPerformanceData, refreshInterval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, refreshInterval, fetchPerformanceData]);

    // Performance metrics card component
    const MetricsCard = React.memo(({ title, metrics, icon, className = "" }) => (
        <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
            <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{icon}</span>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            <div className="space-y-3">
                {Object.entries(metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={`font-mono ${getMetricColor(key, value)}`}>
                            {formatMetricValue(key, value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    ));

    // Format metric values
    const formatMetricValue = (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (value.value !== undefined) {
                return `${formatNumber(value.value)}${getMetricUnit(key)}`;
            }
            return JSON.stringify(value, null, 2);
        }
        
        if (typeof value === 'number') {
            return `${formatNumber(value)}${getMetricUnit(key)}`;
        }
        
        if (typeof value === 'boolean') {
            return value ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />;
        }
        
        return String(value);
    };

    // Format numbers with appropriate precision
    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        if (num % 1 === 0) {
            return num.toString();
        }
        return num.toFixed(2);
    };

    // Get metric unit
    const getMetricUnit = (key) => {
        const timeMetrics = ['responseTime', 'queryTime', 'averageResponseTime', 'averageQueryTime', 'LCP', 'FCP', 'FID', 'TTFB'];
        const percentageMetrics = ['hitRate', 'slowRequestRate', 'failureRate', 'usagePercentage'];
        const memoryMetrics = ['used', 'total', 'rss', 'usedJSHeapSize', 'totalJSHeapSize'];
        
        if (timeMetrics.some(metric => key.toLowerCase().includes(metric.toLowerCase()))) {
            return 'ms';
        }
        if (percentageMetrics.some(metric => key.toLowerCase().includes(metric.toLowerCase()))) {
            return '%';
        }
        if (memoryMetrics.some(metric => key.toLowerCase().includes(metric.toLowerCase()))) {
            return 'MB';
        }
        return '';
    };

    // Get color based on metric performance
    const getMetricColor = (key, value) => {
        if (typeof value === 'object' && value?.rating) {
            switch (value.rating) {
                case 'good': return 'text-green-400';
                case 'needs-improvement': return 'text-yellow-400';
                case 'poor': return 'text-red-400';
                default: return 'text-gray-300';
            }
        }

        // Status-based coloring
        if (key.toLowerCase().includes('status')) {
            switch (value) {
                case 'healthy': return 'text-green-400';
                case 'warning': return 'text-yellow-400';
                case 'critical': 
                case 'error': return 'text-red-400';
                default: return 'text-gray-300';
            }
        }

        // Rate-based coloring
        if (key.toLowerCase().includes('rate') && typeof value === 'number') {
            if (value < 0.05) return 'text-green-400'; // < 5%
            if (value < 0.15) return 'text-yellow-400'; // < 15%
            return 'text-red-400'; // >= 15%
        }

        return 'text-gray-300';
    };

    // System health indicator
    const HealthIndicator = React.memo(({ status }) => {
        const getStatusColor = (status) => {
            switch (status) {
                case 'healthy': return 'bg-green-500';
                case 'warning': return 'bg-yellow-500';
                case 'degraded': return 'bg-orange-500';
                case 'critical': return 'bg-red-500';
                default: return 'bg-gray-500';
            }
        };

        return (
            <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} animate-pulse`}></div>
                <span className="text-white font-medium capitalize">{status}</span>
            </div>
        );
    });

    // Alerts display
    const AlertsDisplay = React.memo(({ alerts }) => {
        if (!alerts || alerts.length === 0) {
            return (
                <div className="bg-green-800/20 border border-green-600 rounded-lg p-4">
                    <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                        <span className="text-green-300">No active alerts</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-2">
                {alerts.map((alert, index) => (
                    <div 
                        key={index}
                        className={`border rounded-lg p-4 ${
                            alert.severity === 'high' 
                                ? 'bg-red-800/20 border-red-600' 
                                : 'bg-yellow-800/20 border-yellow-600'
                        }`}
                    >
                        <div className="flex items-start">
                            <span className={`text-xl mr-2 ${
                                alert.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                                {alert.severity === 'high' ? <AlertCircle className="w-5 h-5 text-red-400" /> : <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                            </span>
                            <div className="flex-1">
                                <p className={`font-medium ${
                                    alert.severity === 'high' ? 'text-red-300' : 'text-yellow-300'
                                }`}>
                                    {alert.message}
                                </p>
                                {alert.action && (
                                    <p className="text-sm text-gray-400 mt-1">
                                        Action: {alert.action}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    });

    if (loading) {
        return <Spinner message={t('performanceDashboard.loading')} />;
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-400 mb-4">{t('performanceDashboard.error')}: {error}</p>
                <button
                    onClick={() => {
                        setError(null);
                        setLoading(true);
                        fetchPerformanceData();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    {t('financialHealth.retry')}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">{t('performanceDashboard.title')}</h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            autoRefresh 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'bg-gray-600 hover:bg-gray-700 text-white'
                        }`}
                    >
                        {autoRefresh ? <><Icon name="Pause" size="sm" className="mr-1" /> {t('performanceDashboard.pause')}</> : <><Icon name="Play" size="sm" className="mr-1" /> {t('performanceDashboard.auto_refresh')}</>}
                    </button>
                    <button
                        onClick={fetchPerformanceData}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        🔄 {t('performanceDashboard.refresh')}
                    </button>
                </div>
            </div>

            {/* System Health Overview */}
            {performanceData?.health && (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white">{t('performanceDashboard.system_health')}</h2>
                        <HealthIndicator status={performanceData.health.status} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-400">
                                {Math.round(performanceData.health.uptime / 3600)}h
                            </p>
                            <p className="text-gray-400">{t('performanceDashboard.uptime')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-400">
                                {performanceData.health.memory?.used || 0}MB
                            </p>
                            <p className="text-gray-400">{t('performanceDashboard.memory_usage')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-400">
                                {performanceData.health.cacheService?.redis?.connected ? t('performanceDashboard.connected') : t('performanceDashboard.memory_only')}
                            </p>
                            <p className="text-gray-400">{t('performanceDashboard.cache_status')}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Alerts */}
            {performanceData?.health?.performance?.alerts && (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold text-white mb-4">{t('performanceDashboard.active_alerts')}</h2>
                    <AlertsDisplay alerts={performanceData.health.performance.alerts} />
                </div>
            )}

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Frontend Web Vitals */}
                {Object.keys(webVitals).length > 0 && (
                    <MetricsCard
                        title={t('performanceDashboard.frontend_metrics')}
                        metrics={webVitals}
                        icon="🌐"
                        className="col-span-1"
                    />
                )}

                {/* Backend Performance */}
                {performanceData?.health?.performance?.requests && (
                    <MetricsCard
                        title={t('performanceDashboard.backend_metrics')}
                        metrics={performanceData.health.performance.requests}
                        icon={<Rocket className="w-5 h-5" />}
                        className="col-span-1"
                    />
                )}

                {/* Database Performance */}
                {performanceData?.health?.performance?.queries && (
                    <MetricsCard
                        title="Database Performance"
                        metrics={performanceData.health.performance.queries}
                        icon={<Icon name="Archive" size="sm" />}
                        className="col-span-1"
                    />
                )}

                {/* Cache Performance */}
                {performanceData?.health?.performance?.cache && (
                    <MetricsCard
                        title="Cache Performance"
                        metrics={performanceData.health.performance.cache}
                        icon="⚡"
                        className="col-span-1"
                    />
                )}

                {/* System Resources */}
                {performanceData?.health?.memory && (
                    <MetricsCard
                        title="System Resources"
                        metrics={performanceData.health.memory}
                        icon="💾"
                        className="col-span-1"
                    />
                )}
            </div>

            {/* Debug Controls */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">{t('performanceDashboard.debug_mode')}</h2>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={enablePerformanceDebug}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        {t('performanceDashboard.enable_debug')}
                    </button>
                    <button
                        onClick={disablePerformanceDebug}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        {t('performanceDashboard.disable_debug')}
                    </button>
                    <select
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(Number(e.target.value))}
                        className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={5000}>5 seconds</option>
                        <option value={15000}>15 seconds</option>
                        <option value={30000}>30 seconds</option>
                        <option value={60000}>1 minute</option>
                    </select>
                </div>
            </div>
        </div>
    );
});

PerformanceDashboard.displayName = 'PerformanceDashboard';

export default PerformanceDashboard; 