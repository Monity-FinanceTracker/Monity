import { ChevronRightIcon } from 'lucide-react';

/**
 * Conversion Funnel Chart
 *
 * Visual funnel showing conversion steps with drop-off rates
 * Each step shows count and percentage lost to next step
 */
function ConversionFunnelChart({ steps, loading = false }) {
    if (loading) {
        return (
            <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-6 animate-pulse">
                <div className="h-6 w-48 bg-[#262626]/50 rounded mb-6"></div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-[#262626]/50 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!steps || steps.length === 0) {
        return (
            <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-6">
                <p className="text-gray-400 text-center py-8">No funnel data available</p>
            </div>
        );
    }

    // Calculate max count for width scaling
    const maxCount = Math.max(...steps.map(s => s.count));

    return (
        <div className="bg-[#1F1E1D] border border-[#262626] rounded-xl p-6
                        hover:border-[#3a3a3a] transition-all duration-200">
            <h3 className="text-lg font-semibold text-white mb-6">
                Conversion Funnel
            </h3>

            <div className="space-y-3">
                {steps.map((step, index) => {
                    const widthPercent = (step.count / maxCount) * 100;
                    const isFirst = index === 0;
                    const isLast = index === steps.length - 1;

                    // Color gradient based on position in funnel
                    const getColor = () => {
                        if (isFirst) return 'from-[#56a69f]/30 to-[#56a69f]/10';
                        if (isLast) return 'from-[#36A2EB]/30 to-[#36A2EB]/10';
                        return 'from-[#8F8D85]/20 to-[#8F8D85]/5';
                    };

                    return (
                        <div key={index}>
                            {/* Funnel Step */}
                            <div className={`relative bg-gradient-to-r ${getColor()}
                                          border border-[#262626] rounded-lg p-4
                                          hover:border-[#56a69f]/30 transition-all duration-200`}
                                 style={{ width: `${widthPercent}%`, minWidth: '60%' }}>

                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-medium text-[#56a69f]
                                                           bg-[#56a69f]/10 px-2 py-0.5 rounded">
                                                Step {index + 1}
                                            </span>
                                            <h4 className="text-sm font-semibold text-white">
                                                {step.step}
                                            </h4>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <p className="text-2xl font-bold text-[#56a69f]">
                                                {step.count.toLocaleString()}
                                            </p>
                                            {!isFirst && (
                                                <span className="text-xs text-gray-400">
                                                    {((step.count / steps[0].count) * 100).toFixed(1)}% of total
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {!isLast && (
                                        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                                    )}
                                </div>
                            </div>

                            {/* Drop-off Indicator */}
                            {!isLast && step.dropoff !== null && step.dropoff > 0 && (
                                <div className="flex items-center gap-2 py-2 px-4">
                                    <div className="flex-1 h-px bg-gradient-to-r from-red-500/50 to-transparent"></div>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <span className="text-red-400 font-semibold">
                                            -{step.dropoff}%
                                        </span>
                                        <span className="text-gray-500">drop-off</span>
                                    </div>
                                    <div className="flex-1 h-px bg-gradient-to-l from-red-500/50 to-transparent"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-6 border-t border-[#262626]">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Overall Conversion</p>
                        <p className="text-lg font-bold text-[#56a69f]">
                            {steps.length > 0
                                ? ((steps[steps.length - 1].count / steps[0].count) * 100).toFixed(1)
                                : 0}%
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Total Drop-off</p>
                        <p className="text-lg font-bold text-red-400">
                            {steps.length > 0
                                ? (((steps[0].count - steps[steps.length - 1].count) / steps[0].count) * 100).toFixed(1)
                                : 0}%
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConversionFunnelChart;
