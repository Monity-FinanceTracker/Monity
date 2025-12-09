import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';

/**
 * Enhanced Metric Card
 *
 * Displays a metric with trend indicator, percentage change, and icon
 * Matches Monity's design system with gradient backgrounds
 */
function EnhancedMetricCard({
    title,
    value,
    trend = null,  // percentage change (e.g., 12.5 for +12.5%)
    icon,
    color = 'text-[#56a69f]',
    bgGradient = 'from-[#232420] to-[#1F1E1D]',
    subtitle = null,
    loading = false
}) {
    const getTrendIcon = () => {
        if (trend === null || trend === 0) {
            return <MinusIcon className="w-4 h-4" />;
        }
        return trend > 0
            ? <ArrowUpIcon className="w-4 h-4" />
            : <ArrowDownIcon className="w-4 h-4" />;
    };

    const getTrendColor = () => {
        if (trend === null || trend === 0) return 'text-gray-400';
        return trend > 0 ? 'text-green-400' : 'text-red-400';
    };

    const formatTrend = () => {
        if (trend === null) return null;
        const absValue = Math.abs(trend).toFixed(1);
        return `${trend > 0 ? '+' : ''}${absValue}%`;
    };

    if (loading) {
        return (
            <div className={`bg-gradient-to-br ${bgGradient} p-4 md:p-6 rounded-2xl border border-[#242532] animate-pulse`}>
                <div className="h-6 w-24 bg-[#262626]/50 rounded mb-3"></div>
                <div className="h-8 w-32 bg-[#262626]/50 rounded mb-2"></div>
                <div className="h-4 w-16 bg-[#262626]/50 rounded"></div>
            </div>
        );
    }

    return (
        <div className={`bg-gradient-to-br ${bgGradient} p-4 md:p-6 rounded-2xl border border-[#242532]
                        hover:border-[#56a69f]/30 transition-all duration-300 group`}>
            {/* Header with icon */}
            <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    {title}
                </h4>
                {icon && (
                    <div className={`${color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                        {icon}
                    </div>
                )}
            </div>

            {/* Value */}
            <p className={`text-2xl md:text-3xl font-bold ${color} mb-2`}>
                {value}
            </p>

            {/* Trend indicator or subtitle */}
            <div className="flex items-center gap-2">
                {trend !== null ? (
                    <>
                        <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                            {getTrendIcon()}
                            <span className="text-sm font-semibold">
                                {formatTrend()}
                            </span>
                        </div>
                        <span className="text-xs text-gray-500">vs last period</span>
                    </>
                ) : subtitle ? (
                    <span className="text-sm text-gray-400">{subtitle}</span>
                ) : null}
            </div>
        </div>
    );
}

export default EnhancedMetricCard;
