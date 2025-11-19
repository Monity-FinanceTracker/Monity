const { logger } = require('../utils/logger');

class AnalyticsQueryService {
    constructor(supabase) {
        this.supabase = supabase;
    }

    /**
     * Get key metrics (MAU, DAU, WAU, etc.)
     * @param {Object} options - Query options
     * @param {Date} options.startDate - Start date
     * @param {Date} options.endDate - End date
     * @returns {Promise<Object>} Key metrics
     */
    async getKeyMetrics(options = {}) {
        try {
            const { startDate, endDate } = this.getDateRange(options);

            // Get DAU (Daily Active Users)
            const dau = await this.getActiveUsers(startDate, endDate, 1);

            // Get WAU (Weekly Active Users)
            const wau = await this.getActiveUsers(startDate, endDate, 7);

            // Get MAU (Monthly Active Users)
            const mau = await this.getActiveUsers(startDate, endDate, 30);

            // Get new signups
            const newSignups = await this.getNewSignups(startDate, endDate);

            // Get subscription breakdown
            const subscriptionBreakdown = await this.getSubscriptionBreakdown();

            // Get conversion rate
            const conversionRate = await this.getConversionRate(startDate, endDate);

            // Get total sessions
            const { count: totalSessions } = await this.supabase
                .from('analytics_sessions')
                .select('*', { count: 'exact', head: true })
                .gte('started_at', startDate.toISOString())
                .lte('started_at', endDate.toISOString());

            // Get total events
            const { count: totalEvents } = await this.supabase
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })
                .gte('timestamp', startDate.toISOString())
                .lte('timestamp', endDate.toISOString());

            return {
                dau,
                wau,
                mau,
                newSignups,
                totalSessions: totalSessions || 0,
                totalEvents: totalEvents || 0,
                subscriptionBreakdown,
                conversionRate,
                period: {
                    start: startDate,
                    end: endDate
                }
            };

        } catch (error) {
            logger.error('Failed to get key metrics', { error: error.message });
            throw error;
        }
    }

    /**
     * Get active users for a specific period
     * @private
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {number} days - Number of days to look back
     * @returns {Promise<number>} Count of active users
     */
    async getActiveUsers(startDate, endDate, days) {
        try {
            const lookbackDate = new Date(endDate);
            lookbackDate.setDate(lookbackDate.getDate() - days);

            const { data, error } = await this.supabase
                .from('analytics_events')
                .select('user_id')
                .gte('timestamp', lookbackDate.toISOString())
                .lte('timestamp', endDate.toISOString())
                .not('user_id', 'is', null);

            if (error) throw error;

            // Get unique user IDs
            const uniqueUsers = new Set(data.map(e => e.user_id));
            return uniqueUsers.size;

        } catch (error) {
            logger.error(`Failed to get active users for ${days} days`, { error: error.message });
            return 0;
        }
    }

    /**
     * Get new signups count
     * @private
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Promise<number>} Count of new signups
     */
    async getNewSignups(startDate, endDate) {
        try {
            const { count } = await this.supabase
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })
                .eq('event_name', 'user_signed_up')
                .gte('timestamp', startDate.toISOString())
                .lte('timestamp', endDate.toISOString());

            return count || 0;

        } catch (error) {
            logger.error('Failed to get new signups', { error: error.message });
            return 0;
        }
    }

    /**
     * Get subscription breakdown (free vs premium)
     * @private
     * @returns {Promise<Object>} Subscription breakdown
     */
    async getSubscriptionBreakdown() {
        try {
            const { data, error } = await this.supabase
                .from('analytics_events')
                .select('user_id, subscription_tier')
                .not('user_id', 'is', null)
                .order('timestamp', { ascending: false });

            if (error) throw error;

            // Get latest subscription tier for each user
            const userTiers = new Map();
            data.forEach(event => {
                if (!userTiers.has(event.user_id)) {
                    userTiers.set(event.user_id, event.subscription_tier);
                }
            });

            const breakdown = { free: 0, premium: 0, pro: 0 };
            userTiers.forEach(tier => {
                if (tier in breakdown) {
                    breakdown[tier]++;
                } else {
                    breakdown.free++;
                }
            });

            return breakdown;

        } catch (error) {
            logger.error('Failed to get subscription breakdown', { error: error.message });
            return { free: 0, premium: 0, pro: 0 };
        }
    }

    /**
     * Get conversion rate (free to premium)
     * @private
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Promise<number>} Conversion rate as percentage
     */
    async getConversionRate(startDate, endDate) {
        try {
            // Get total signups
            const totalSignups = await this.getNewSignups(startDate, endDate);

            if (totalSignups === 0) return 0;

            // Get conversions (subscription_upgraded events)
            const { count: conversions } = await this.supabase
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })
                .eq('event_name', 'subscription_upgraded')
                .gte('timestamp', startDate.toISOString())
                .lte('timestamp', endDate.toISOString());

            const conversionRate = ((conversions || 0) / totalSignups) * 100;
            return Math.round(conversionRate * 100) / 100; // Round to 2 decimals

        } catch (error) {
            logger.error('Failed to get conversion rate', { error: error.message });
            return 0;
        }
    }

    /**
     * Get feature adoption rates
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Feature adoption data
     */
    async getFeatureAdoption(options = {}) {
        try {
            const { startDate, endDate } = this.getDateRange(options);

            const features = [
                'transaction_created',
                'budget_created',
                'savings_goal_created',
                'group_created',
                'ai_chat_message_sent',
                'cashflow_calendar_viewed',
                'investment_calculator_used',
                'data_export_requested'
            ];

            const adoptionData = await Promise.all(
                features.map(async (feature) => {
                    const { data, error } = await this.supabase
                        .from('analytics_events')
                        .select('user_id')
                        .eq('event_name', feature)
                        .gte('timestamp', startDate.toISOString())
                        .lte('timestamp', endDate.toISOString())
                        .not('user_id', 'is', null);

                    if (error) throw error;

                    const uniqueUsers = new Set(data.map(e => e.user_id));

                    return {
                        feature: feature.replace(/_/g, ' '),
                        users: uniqueUsers.size,
                        events: data.length
                    };
                })
            );

            return adoptionData.sort((a, b) => b.users - a.users);

        } catch (error) {
            logger.error('Failed to get feature adoption', { error: error.message });
            throw error;
        }
    }

    /**
     * Get conversion funnel data
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Funnel data
     */
    async getConversionFunnel(options = {}) {
        try {
            const { startDate, endDate } = this.getDateRange(options);

            const funnelSteps = [
                { name: 'Signed Up', event: 'user_signed_up' },
                { name: 'Email Verified', event: 'email_verified' },
                { name: 'First Transaction', event: 'transaction_created' },
                { name: 'Viewed Subscription', event: 'subscription_page_viewed' },
                { name: 'Upgraded to Premium', event: 'subscription_upgraded' }
            ];

            const funnelData = await Promise.all(
                funnelSteps.map(async (step, index) => {
                    const { data, error } = await this.supabase
                        .from('analytics_events')
                        .select('user_id')
                        .eq('event_name', step.event)
                        .gte('timestamp', startDate.toISOString())
                        .lte('timestamp', endDate.toISOString());

                    if (error) throw error;

                    const uniqueUsers = new Set(data.map(e => e.user_id));
                    const count = uniqueUsers.size;

                    return {
                        step: step.name,
                        count,
                        dropoff: index > 0 ? null : 0 // Will calculate below
                    };
                })
            );

            // Calculate dropoff rates
            for (let i = 1; i < funnelData.length; i++) {
                const previous = funnelData[i - 1].count;
                const current = funnelData[i].count;
                const dropoff = previous > 0 ? Math.round(((previous - current) / previous) * 100) : 0;
                funnelData[i].dropoff = dropoff;
            }

            return funnelData;

        } catch (error) {
            logger.error('Failed to get conversion funnel', { error: error.message });
            throw error;
        }
    }

    /**
     * Get user retention cohorts
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Retention cohort data
     */
    async getRetentionCohorts(options = {}) {
        try {
            const { startDate, endDate } = this.getDateRange(options);

            // Get user signup dates
            const { data: signups, error: signupError } = await this.supabase
                .from('analytics_events')
                .select('user_id, timestamp')
                .eq('event_name', 'user_signed_up')
                .gte('timestamp', startDate.toISOString())
                .lte('timestamp', endDate.toISOString());

            if (signupError) throw signupError;

            // Calculate retention for each cohort
            const cohorts = {};
            for (const signup of signups) {
                const cohortMonth = signup.timestamp.substring(0, 7); // YYYY-MM
                if (!cohorts[cohortMonth]) {
                    cohorts[cohortMonth] = {
                        month: cohortMonth,
                        users: new Set(),
                        day1: new Set(),
                        day7: new Set(),
                        day30: new Set()
                    };
                }
                cohorts[cohortMonth].users.add(signup.user_id);
            }

            // Check retention for each period
            for (const [month, cohort] of Object.entries(cohorts)) {
                for (const userId of cohort.users) {
                    // Day 1 retention
                    const day1 = await this.isUserActive(userId, month, 1);
                    if (day1) cohort.day1.add(userId);

                    // Day 7 retention
                    const day7 = await this.isUserActive(userId, month, 7);
                    if (day7) cohort.day7.add(userId);

                    // Day 30 retention
                    const day30 = await this.isUserActive(userId, month, 30);
                    if (day30) cohort.day30.add(userId);
                }
            }

            // Format results
            return Object.values(cohorts).map(c => ({
                month: c.month,
                totalUsers: c.users.size,
                day1Retention: Math.round((c.day1.size / c.users.size) * 100),
                day7Retention: Math.round((c.day7.size / c.users.size) * 100),
                day30Retention: Math.round((c.day30.size / c.users.size) * 100)
            }));

        } catch (error) {
            logger.error('Failed to get retention cohorts', { error: error.message });
            throw error;
        }
    }

    /**
     * Check if user was active N days after cohort month
     * @private
     * @param {string} userId - User ID
     * @param {string} cohortMonth - Cohort month (YYYY-MM)
     * @param {number} days - Number of days
     * @returns {Promise<boolean>}
     */
    async isUserActive(userId, cohortMonth, days) {
        try {
            const cohortDate = new Date(cohortMonth + '-01');
            const checkDate = new Date(cohortDate);
            checkDate.setDate(checkDate.getDate() + days);

            const endDate = new Date(checkDate);
            endDate.setDate(endDate.getDate() + 1); // Check for the entire day

            const { count } = await this.supabase
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('timestamp', checkDate.toISOString())
                .lt('timestamp', endDate.toISOString());

            return (count || 0) > 0;

        } catch (error) {
            return false;
        }
    }

    /**
     * Get events by name with counts
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Event counts
     */
    async getEventCounts(options = {}) {
        try {
            const { startDate, endDate } = this.getDateRange(options);

            const { data, error } = await this.supabase
                .from('analytics_events')
                .select('event_name')
                .gte('timestamp', startDate.toISOString())
                .lte('timestamp', endDate.toISOString());

            if (error) throw error;

            // Count events by name
            const counts = {};
            data.forEach(e => {
                counts[e.event_name] = (counts[e.event_name] || 0) + 1;
            });

            return Object.entries(counts)
                .map(([name, count]) => ({ eventName: name, count }))
                .sort((a, b) => b.count - a.count);

        } catch (error) {
            logger.error('Failed to get event counts', { error: error.message });
            throw error;
        }
    }

    /**
     * Get average session duration
     * @param {Object} options - Query options
     * @returns {Promise<number>} Average session duration in seconds
     */
    async getAverageSessionDuration(options = {}) {
        try {
            const { startDate, endDate } = this.getDateRange(options);

            const { data, error } = await this.supabase
                .from('analytics_sessions')
                .select('duration_seconds')
                .not('duration_seconds', 'is', null)
                .gte('started_at', startDate.toISOString())
                .lte('started_at', endDate.toISOString());

            if (error) throw error;

            if (data.length === 0) return 0;

            const total = data.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
            return Math.round(total / data.length);

        } catch (error) {
            logger.error('Failed to get average session duration', { error: error.message });
            return 0;
        }
    }

    /**
     * Get AI suggestion acceptance rate
     * @param {Object} options - Query options
     * @returns {Promise<number>} Acceptance rate as percentage
     */
    async getAISuggestionAcceptanceRate(options = {}) {
        try {
            const { startDate, endDate } = this.getDateRange(options);

            const { data, error } = await this.supabase
                .from('analytics_events')
                .select('event_properties')
                .eq('event_name', 'ai_category_suggested')
                .gte('timestamp', startDate.toISOString())
                .lte('timestamp', endDate.toISOString());

            if (error) throw error;

            if (data.length === 0) return 0;

            const accepted = data.filter(e => e.event_properties?.accepted === true).length;
            return Math.round((accepted / data.length) * 100);

        } catch (error) {
            logger.error('Failed to get AI acceptance rate', { error: error.message });
            return 0;
        }
    }

    /**
     * Get date range from options or use defaults
     * @private
     * @param {Object} options - Options object
     * @returns {Object} Start and end dates
     */
    getDateRange(options) {
        const endDate = options.endDate ? new Date(options.endDate) : new Date();
        const startDate = options.startDate
            ? new Date(options.startDate)
            : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

        return { startDate, endDate };
    }
}

module.exports = AnalyticsQueryService;
