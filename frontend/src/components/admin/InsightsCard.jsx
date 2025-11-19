import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';

/**
 * Insights Card
 *
 * Displays AI-generated insights and recommendations
 * Shows actionable insights from analytics data
 */
function InsightsCard({ insights, loading = false }) {
    const getIcon = (type) => {
        const iconProps = { className: "w-5 h-5" };
        switch (type) {
            case 'opportunity':
                return <TrendingUp {...iconProps} />;
            case 'warning':
                return <AlertTriangle {...iconProps} />;
            case 'success':
                return <CheckCircle {...iconProps} />;
            case 'info':
                return <Info {...iconProps} />;
            default:
                return <Lightbulb {...iconProps} />;
        }
    };

    const getColors = (type) => {
        switch (type) {
            case 'opportunity':
                return {
                    bg: 'from-[#56a69f]/20 to-[#56a69f]/5',
                    border: 'border-[#56a69f]/30',
                    icon: 'text-[#56a69f]',
                    iconBg: 'bg-[#56a69f]/10'
                };
            case 'warning':
                return {
                    bg: 'from-[#F59E0B]/20 to-[#F59E0B]/5',
                    border: 'border-[#F59E0B]/30',
                    icon: 'text-[#F59E0B]',
                    iconBg: 'bg-[#F59E0B]/10'
                };
            case 'success':
                return {
                    bg: 'from-green-500/20 to-green-500/5',
                    border: 'border-green-500/30',
                    icon: 'text-green-400',
                    iconBg: 'bg-green-500/10'
                };
            default:
                return {
                    bg: 'from-[#36A2EB]/20 to-[#36A2EB]/5',
                    border: 'border-[#36A2EB]/30',
                    icon: 'text-[#36A2EB]',
                    iconBg: 'bg-[#36A2EB]/10'
                };
        }
    };

    if (loading) {
        return (
            <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-6 animate-pulse">
                <div className="h-6 w-48 bg-[#262626]/50 rounded mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-[#262626]/50 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!insights || insights.length === 0) {
        return (
            <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-6">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#56a69f]/10 rounded-lg">
                        <Lightbulb className="w-5 h-5 text-[#56a69f]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                            AI Insights
                        </h3>
                        <p className="text-sm text-gray-400">
                            Analyzing your data... Insights will appear here as patterns emerge.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-6
                        hover:border-[#3a3a3a] transition-all duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#56a69f]/10 rounded-lg">
                    <Lightbulb className="w-6 h-6 text-[#56a69f]" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">
                        AI-Powered Insights
                    </h3>
                    <p className="text-xs text-gray-400">
                        Based on your analytics data
                    </p>
                </div>
            </div>

            {/* Insights List */}
            <div className="space-y-3">
                {insights.map((insight, index) => {
                    const colors = getColors(insight.type);

                    return (
                        <div key={index}
                             className={`bg-gradient-to-r ${colors.bg} border ${colors.border}
                                       rounded-lg p-4 hover:scale-[1.01] transition-transform duration-200`}>
                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className={`p-2 ${colors.iconBg} rounded-lg flex-shrink-0`}>
                                    <div className={colors.icon}>
                                        {getIcon(insight.type)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-white mb-1">
                                        {insight.title}
                                    </h4>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        {insight.description}
                                    </p>

                                    {/* Recommendation */}
                                    {insight.recommendation && (
                                        <div className="mt-2 pt-2 border-t border-[#262626]/50">
                                            <p className="text-xs text-gray-400">
                                                <span className="font-medium text-[#56a69f]">Recommendation:</span>
                                                {' '}{insight.recommendation}
                                            </p>
                                        </div>
                                    )}

                                    {/* Metrics */}
                                    {insight.metrics && Object.keys(insight.metrics).length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-3">
                                            {Object.entries(insight.metrics).map(([key, value]) => (
                                                <div key={key} className="text-xs">
                                                    <span className="text-gray-500">{key}:</span>
                                                    {' '}
                                                    <span className={`font-semibold ${colors.icon}`}>
                                                        {value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default InsightsCard;
