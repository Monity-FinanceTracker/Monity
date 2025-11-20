const { logger } = require('../utils/logger');

class AnalyticsInsightsService {
    constructor(supabase, queryService) {
        this.supabase = supabase;
        this.queryService = queryService;
    }

    /**
     * Generate AI-powered insights from analytics data
     * @param {Object} options - Query options (startDate, endDate)
     * @returns {Promise<Array>} Array of insights
     */
    async generateInsights(options = {}) {
        try {
            const insights = [];

            // Get all the data we need
            const [metrics, funnel, features, events] = await Promise.all([
                this.queryService.getKeyMetrics(options),
                this.queryService.getConversionFunnel(options),
                this.queryService.getFeatureAdoption(options),
                this.queryService.getEventCounts(options)
            ]);

            // Analyze conversion rate
            insights.push(...await this.analyzeConversionRate(metrics, funnel));

            // Analyze user engagement
            insights.push(...await this.analyzeEngagement(metrics, events));

            // Analyze feature adoption
            insights.push(...await this.analyzeFeatureAdoption(features));

            // Analyze funnel drop-offs
            insights.push(...await this.analyzeFunnelDropoffs(funnel));

            // Analyze growth trends
            insights.push(...await this.analyzeGrowthTrends(metrics));

            // Sort by priority (warnings first, then opportunities, then info)
            const priority = { warning: 1, opportunity: 2, success: 3, info: 4 };
            insights.sort((a, b) => (priority[a.type] || 5) - (priority[b.type] || 5));

            return insights.slice(0, 6); // Return top 6 insights

        } catch (error) {
            logger.error('Failed to generate insights', { error: error.message });
            return [];
        }
    }

    /**
     * Analyze conversion rate and identify issues/opportunities
     * @private
     */
    async analyzeConversionRate(metrics, funnel) {
        const insights = [];

        if (!metrics || !funnel || funnel.length === 0) return insights;

        const conversionRate = metrics.conversionRate || 0;

        // Low conversion rate warning
        if (conversionRate < 5) {
            insights.push({
                type: 'warning',
                title: 'Low Conversion Rate Detected',
                description: `Only ${conversionRate.toFixed(1)}% of signups convert to premium. Industry average is 8-12%.`,
                recommendation: 'Consider improving your onboarding flow, highlighting premium features earlier, or offering a trial period.',
                metrics: {
                    'Current Rate': `${conversionRate.toFixed(1)}%`,
                    'Target': '8-12%'
                }
            });
        }

        // High conversion rate success
        if (conversionRate > 15) {
            insights.push({
                type: 'success',
                title: 'Excellent Conversion Performance',
                description: `Your conversion rate of ${conversionRate.toFixed(1)}% is significantly above average!`,
                recommendation: 'Keep doing what you\'re doing. Consider case studies to share your success.',
                metrics: {
                    'Conversion Rate': `${conversionRate.toFixed(1)}%`,
                    'vs Average': '+' + (conversionRate - 10).toFixed(1) + '%'
                }
            });
        }

        return insights;
    }

    /**
     * Analyze user engagement metrics
     * @private
     */
    async analyzeEngagement(metrics, events) {
        const insights = [];

        if (!metrics || !events) return insights;

        const { dau, mau, newSignups } = metrics;

        // Calculate DAU/MAU ratio (stickiness)
        if (mau > 0) {
            const stickiness = (dau / mau) * 100;

            if (stickiness < 20) {
                insights.push({
                    type: 'opportunity',
                    title: 'Low User Stickiness',
                    description: `Only ${stickiness.toFixed(0)}% of monthly users are active daily. Users may not be forming habits.`,
                    recommendation: 'Implement email reminders, push notifications, or daily streak features to increase engagement.',
                    metrics: {
                        'DAU/MAU Ratio': `${stickiness.toFixed(0)}%`,
                        'Target': '25-40%'
                    }
                });
            } else if (stickiness > 35) {
                insights.push({
                    type: 'success',
                    title: 'Strong User Engagement',
                    description: `Your DAU/MAU ratio of ${stickiness.toFixed(0)}% shows users are highly engaged!`,
                    metrics: {
                        'DAU/MAU Ratio': `${stickiness.toFixed(0)}%`
                    }
                });
            }
        }

        // Analyze new signups
        if (newSignups > 0 && mau > 0) {
            const signupRate = (newSignups / mau) * 100;

            if (signupRate > 20) {
                insights.push({
                    type: 'opportunity',
                    title: 'Rapid User Growth',
                    description: `${newSignups} new signups this period represents ${signupRate.toFixed(0)}% growth!`,
                    recommendation: 'Focus on retention strategies to convert new users into active, long-term users.',
                    metrics: {
                        'New Signups': newSignups.toString(),
                        'Growth Rate': `${signupRate.toFixed(0)}%`
                    }
                });
            }
        }

        return insights;
    }

    /**
     * Analyze feature adoption patterns
     * @private
     */
    async analyzeFeatureAdoption(features) {
        const insights = [];

        if (!features || features.length === 0) return insights;

        // Find underutilized premium features
        const premiumFeatures = features.filter(f =>
            f.feature.toLowerCase().includes('ai chat') ||
            f.feature.toLowerCase().includes('cashflow') ||
            f.feature.toLowerCase().includes('investment')
        );

        if (premiumFeatures.length > 0) {
            const totalUsers = Math.max(...features.map(f => f.users));
            const lowAdoptionFeatures = premiumFeatures.filter(f => f.users < totalUsers * 0.1);

            if (lowAdoptionFeatures.length > 0) {
                insights.push({
                    type: 'opportunity',
                    title: 'Underutilized Premium Features',
                    description: `Features like ${lowAdoptionFeatures.map(f => f.feature).join(', ')} have low adoption rates.`,
                    recommendation: 'Create in-app tutorials, tooltips, or email campaigns to educate users about these features.',
                    metrics: {
                        'Features': lowAdoptionFeatures.length.toString()
                    }
                });
            }
        }

        // Highlight most popular feature
        if (features.length > 0) {
            const topFeature = features[0];
            insights.push({
                type: 'info',
                title: 'Most Popular Feature',
                description: `"${topFeature.feature}" is your most-used feature with ${topFeature.users} users generating ${topFeature.events} events.`,
                metrics: {
                    'Users': topFeature.users.toString(),
                    'Events': topFeature.events.toString()
                }
            });
        }

        return insights;
    }

    /**
     * Analyze conversion funnel for drop-off points
     * @private
     */
    async analyzeFunnelDropoffs(funnel) {
        const insights = [];

        if (!funnel || funnel.length < 2) return insights;

        // Find the biggest drop-off
        const dropoffs = funnel
            .filter(step => step.dropoff !== null && step.dropoff > 0)
            .sort((a, b) => b.dropoff - a.dropoff);

        if (dropoffs.length > 0) {
            const biggestDropoff = dropoffs[0];

            if (biggestDropoff.dropoff > 30) {
                insights.push({
                    type: 'warning',
                    title: 'Critical Funnel Drop-off',
                    description: `${biggestDropoff.dropoff}% of users drop off at "${biggestDropoff.step}". This is your biggest conversion blocker.`,
                    recommendation: 'Investigate why users leave at this step. Consider A/B testing different approaches or reducing friction.',
                    metrics: {
                        'Drop-off Rate': `${biggestDropoff.dropoff}%`,
                        'Users Lost': Math.round(funnel[0].count * (biggestDropoff.dropoff / 100)).toString()
                    }
                });
            }
        }

        return insights;
    }

    /**
     * Analyze growth trends
     * @private
     */
    async analyzeGrowthTrends(metrics) {
        const insights = [];

        if (!metrics) return insights;

        const { dau, wau, mau } = metrics;

        // Check if metrics are growing
        if (dau > 0 && mau > 0) {
            // If DAU is a good percentage of MAU, engagement is healthy
            const ratio = (dau / mau) * 100;

            if (ratio >= 25) {
                insights.push({
                    type: 'success',
                    title: 'Healthy Daily Engagement',
                    description: `${ratio.toFixed(0)}% of your monthly users are active daily, indicating strong product-market fit.`,
                    metrics: {
                        'Daily Active': dau.toString(),
                        'Monthly Active': mau.toString()
                    }
                });
            }
        }

        return insights;
    }
}

module.exports = AnalyticsInsightsService;
