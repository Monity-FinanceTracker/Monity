const { logger } = require('../utils/logger');
const AnalyticsService = require('../services/analyticsService');
const AnalyticsQueryService = require('../services/analyticsQueryService');
const AnalyticsInsightsService = require('../services/analyticsInsightsService');

class AnalyticsController {
    constructor(supabase) {
        this.supabase = supabase;
        this.analyticsService = new AnalyticsService(supabase);
        this.queryService = new AnalyticsQueryService(supabase);
        this.insightsService = new AnalyticsInsightsService(supabase, this.queryService);
    }

    /**
     * Track a single analytics event
     * POST /api/v1/analytics/track
     */
    async track(req, res) {
        try {
            const {
                sessionId,
                eventName,
                properties,
                context
            } = req.body;

            if (!sessionId || !eventName) {
                return res.status(400).json({
                    error: 'Session ID and event name are required'
                });
            }

            // Get user ID from request (if authenticated)
            const userId = req.user?.id || null;

            // Get subscription tier from user context
            const subscriptionTier = req.user?.subscription_tier || context?.subscriptionTier || 'free';

            const result = await this.analyticsService.track({
                userId,
                sessionId,
                eventName,
                properties,
                context: {
                    ...context,
                    subscriptionTier,
                    userAgent: req.headers['user-agent'],
                    ip: req.ip || req.connection.remoteAddress
                }
            });

            res.status(200).json(result);

        } catch (error) {
            logger.error('Failed to track analytics event', {
                error: error.message,
                body: req.body
            });
            res.status(500).json({ error: 'Failed to track event' });
        }
    }

    /**
     * Track multiple events in batch
     * POST /api/v1/analytics/batch
     */
    async trackBatch(req, res) {
        try {
            const { events } = req.body;

            if (!Array.isArray(events) || events.length === 0) {
                return res.status(400).json({
                    error: 'Events array is required and must not be empty'
                });
            }

            const userId = req.user?.id || null;
            const subscriptionTier = req.user?.subscription_tier || 'free';

            // Enrich each event with user context
            const enrichedEvents = events.map(event => ({
                ...event,
                userId: userId || event.userId,
                context: {
                    ...event.context,
                    subscriptionTier,
                    userAgent: req.headers['user-agent'],
                    ip: req.ip || req.connection.remoteAddress
                }
            }));

            const result = await this.analyticsService.trackBatch(enrichedEvents);

            res.status(200).json(result);

        } catch (error) {
            logger.error('Failed to track batch events', { error: error.message });
            res.status(500).json({ error: 'Failed to track batch events' });
        }
    }

    /**
     * Start a new session
     * POST /api/v1/analytics/session/start
     */
    async startSession(req, res) {
        try {
            const { sessionId } = req.body;

            if (!sessionId) {
                return res.status(400).json({ error: 'Session ID is required' });
            }

            const userId = req.user?.id || null;
            const subscriptionTier = req.user?.subscription_tier || 'free';

            const session = await this.analyticsService.startSession(
                sessionId,
                userId,
                {
                    subscriptionTier,
                    userAgent: req.headers['user-agent'],
                    ip: req.ip || req.connection.remoteAddress
                }
            );

            res.status(201).json(session);

        } catch (error) {
            logger.error('Failed to start session', { error: error.message });
            res.status(500).json({ error: 'Failed to start session' });
        }
    }

    /**
     * End a session
     * POST /api/v1/analytics/session/end
     */
    async endSession(req, res) {
        try {
            const { sessionId, duration } = req.body;

            if (!sessionId || duration === undefined) {
                return res.status(400).json({
                    error: 'Session ID and duration are required'
                });
            }

            await this.analyticsService.endSession(sessionId, duration);

            res.status(200).json({ success: true });

        } catch (error) {
            logger.error('Failed to end session', { error: error.message });
            res.status(500).json({ error: 'Failed to end session' });
        }
    }

    /**
     * Identify a user (associate session with user)
     * POST /api/v1/analytics/identify
     */
    async identify(req, res) {
        try {
            const { sessionId, traits } = req.body;

            if (!sessionId) {
                return res.status(400).json({ error: 'Session ID is required' });
            }

            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User must be authenticated' });
            }

            await this.analyticsService.identify(userId, sessionId, {
                ...traits,
                subscriptionTier: req.user?.subscription_tier || 'free'
            });

            res.status(200).json({ success: true });

        } catch (error) {
            logger.error('Failed to identify user', { error: error.message });
            res.status(500).json({ error: 'Failed to identify user' });
        }
    }

    /**
     * Get key analytics metrics (Admin only)
     * GET /api/v1/analytics/metrics
     */
    async getMetrics(req, res) {
        try {
            // Check if user is admin
            if (!req.user?.is_admin && req.user?.role !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }

            const { startDate, endDate } = req.query;

            const metrics = await this.queryService.getKeyMetrics({
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined
            });

            res.status(200).json(metrics);

        } catch (error) {
            logger.error('Failed to get metrics', { error: error.message });
            res.status(500).json({ error: 'Failed to get metrics' });
        }
    }

    /**
     * Get feature adoption data (Admin only)
     * GET /api/v1/analytics/features
     */
    async getFeatureAdoption(req, res) {
        try {
            if (!req.user?.is_admin && req.user?.role !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }

            const { startDate, endDate } = req.query;

            const features = await this.queryService.getFeatureAdoption({
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined
            });

            res.status(200).json(features);

        } catch (error) {
            logger.error('Failed to get feature adoption', { error: error.message });
            res.status(500).json({ error: 'Failed to get feature adoption' });
        }
    }

    /**
     * Get conversion funnel data (Admin only)
     * GET /api/v1/analytics/funnel
     */
    async getFunnel(req, res) {
        try {
            if (!req.user?.is_admin && req.user?.role !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }

            const { startDate, endDate } = req.query;

            const funnel = await this.queryService.getConversionFunnel({
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined
            });

            res.status(200).json(funnel);

        } catch (error) {
            logger.error('Failed to get funnel data', { error: error.message });
            res.status(500).json({ error: 'Failed to get funnel data' });
        }
    }

    /**
     * Get retention cohorts (Admin only)
     * GET /api/v1/analytics/retention
     */
    async getRetention(req, res) {
        try {
            if (!req.user?.is_admin && req.user?.role !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }

            const { startDate, endDate } = req.query;

            const retention = await this.queryService.getRetentionCohorts({
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined
            });

            res.status(200).json(retention);

        } catch (error) {
            logger.error('Failed to get retention data', { error: error.message });
            res.status(500).json({ error: 'Failed to get retention data' });
        }
    }

    /**
     * Get event counts (Admin only)
     * GET /api/v1/analytics/events
     */
    async getEventCounts(req, res) {
        try {
            if (!req.user?.is_admin && req.user?.role !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }

            const { startDate, endDate } = req.query;

            const events = await this.queryService.getEventCounts({
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined
            });

            res.status(200).json(events);

        } catch (error) {
            logger.error('Failed to get event counts', { error: error.message });
            res.status(500).json({ error: 'Failed to get event counts' });
        }
    }

    /**
     * Get analytics dashboard data (Admin only)
     * GET /api/v1/analytics/dashboard
     */
    async getDashboard(req, res) {
        try {
            if (!req.user?.is_admin && req.user?.role !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }

            const { startDate, endDate } = req.query;

            const options = {
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined
            };

            // Get all analytics data for dashboard
            const [
                metrics,
                features,
                funnel,
                events,
                avgSessionDuration,
                aiAcceptanceRate
            ] = await Promise.all([
                this.queryService.getKeyMetrics(options),
                this.queryService.getFeatureAdoption(options),
                this.queryService.getConversionFunnel(options),
                this.queryService.getEventCounts(options),
                this.queryService.getAverageSessionDuration(options),
                this.queryService.getAISuggestionAcceptanceRate(options)
            ]);

            res.status(200).json({
                metrics,
                features,
                funnel,
                events: events.slice(0, 20), // Top 20 events
                avgSessionDuration,
                aiAcceptanceRate
            });

        } catch (error) {
            logger.error('Failed to get dashboard data', { error: error.message });
            res.status(500).json({ error: 'Failed to get dashboard data' });
        }
    }

    /**
     * Get AI-generated insights (Admin only)
     * GET /api/v1/analytics/insights
     */
    async getInsights(req, res) {
        try {
            if (!req.user?.is_admin && req.user?.role !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }

            const { startDate, endDate } = req.query;

            const insights = await this.insightsService.generateInsights({
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined
            });

            res.status(200).json(insights);

        } catch (error) {
            logger.error('Failed to generate insights', { error: error.message });
            res.status(500).json({ error: 'Failed to generate insights' });
        }
    }
}

module.exports = AnalyticsController;
