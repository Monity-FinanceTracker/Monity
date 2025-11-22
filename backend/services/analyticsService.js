const { logger } = require('../utils/logger');
const crypto = require('crypto');

class AnalyticsService {
    constructor(supabase) {
        this.supabase = supabase;
        this.eventQueue = [];
        this.batchSize = 50; // Send events in batches
        this.flushInterval = 10000; // Flush every 10 seconds
        this.setupBatchProcessing();
    }

    /**
     * Set up automatic batch processing for events
     * @private
     */
    setupBatchProcessing() {
        // Flush events periodically
        this.flushTimer = setInterval(() => {
            if (this.eventQueue.length > 0) {
                this.flushEvents().catch(err => {
                    logger.error('Failed to flush analytics events', { error: err.message });
                });
            }
        }, this.flushInterval);
    }

    /**
     * Track a single analytics event
     * @param {Object} eventData - The event data
     * @param {string} eventData.userId - User ID (optional for anonymous events)
     * @param {string} eventData.sessionId - Session ID
     * @param {string} eventData.eventName - Name of the event
     * @param {Object} eventData.properties - Event properties
     * @param {Object} eventData.context - Context information (device, browser, etc.)
     * @returns {Promise<Object>}
     */
    async track(eventData) {
        try {
            const {
                userId = null,
                sessionId,
                eventName,
                properties = {},
                context = {}
            } = eventData;

            // Validate required fields
            if (!eventName) {
                throw new Error('Event name is required');
            }

            if (!sessionId) {
                throw new Error('Session ID is required');
            }

            // Parse context
            const deviceInfo = this.parseUserAgent(context.userAgent || '');
            const country = context.country || null;
            const ipHash = context.ip ? this.hashIP(context.ip) : null;

            // Build event record
            const event = {
                user_id: userId,
                session_id: sessionId,
                event_name: eventName,
                event_properties: properties,
                page_url: context.pageUrl || null,
                page_title: context.pageTitle || null,
                referrer: context.referrer || null,
                device_type: deviceInfo.deviceType,
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                country: country,
                user_agent: context.userAgent || null,
                subscription_tier: context.subscriptionTier || 'free',
                timestamp: new Date().toISOString()
            };

            // Add to queue for batch processing
            this.eventQueue.push(event);

            // Flush immediately if batch size reached
            if (this.eventQueue.length >= this.batchSize) {
                await this.flushEvents();
            }

            // Also update session
            if (userId && sessionId) {
                await this.updateSession(sessionId, userId, context);
            }

            logger.debug(`Analytics event tracked: ${eventName}`, {
                userId,
                sessionId,
                eventName
            });

            return { success: true, eventName, sessionId };

        } catch (error) {
            logger.error('Failed to track analytics event', {
                error: error.message,
                eventName: eventData.eventName
            });
            throw error;
        }
    }

    /**
     * Track multiple events in a batch
     * @param {Array<Object>} events - Array of event data objects
     * @returns {Promise<Object>}
     */
    async trackBatch(events) {
        try {
            if (!Array.isArray(events) || events.length === 0) {
                throw new Error('Events must be a non-empty array');
            }

            const results = await Promise.allSettled(
                events.map(event => this.track(event))
            );

            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            logger.info(`Batch tracking completed: ${successful} succeeded, ${failed} failed`);

            return {
                success: true,
                total: events.length,
                successful,
                failed
            };

        } catch (error) {
            logger.error('Failed to track batch events', { error: error.message });
            throw error;
        }
    }

    /**
     * Flush queued events to database
     * @private
     * @returns {Promise<void>}
     */
    async flushEvents() {
        if (this.eventQueue.length === 0) return;

        const eventsToInsert = [...this.eventQueue];
        this.eventQueue = [];

        try {
            logger.info(`Attempting to flush ${eventsToInsert.length} analytics events`, {
                sampleEvent: eventsToInsert[0],
                tableName: 'analytics_events'
            });

            const { data, error } = await this.supabase
                .from('analytics_events')
                .insert(eventsToInsert)
                .select();

            if (error) {
                logger.error('Failed to insert analytics events', {
                    error: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                    count: eventsToInsert.length,
                    sampleEvent: eventsToInsert[0]
                });
                throw error;
            }

            logger.info(`Successfully flushed ${eventsToInsert.length} analytics events`, {
                insertedCount: data?.length || 0
            });

        } catch (error) {
            logger.error('Exception while flushing analytics events', {
                error: error.message,
                stack: error.stack,
                count: eventsToInsert.length
            });

            // Re-queue events if flush failed (but limit queue size to prevent memory issues)
            if (this.eventQueue.length < 500) {
                this.eventQueue.unshift(...eventsToInsert);
            } else {
                logger.warn('Analytics event queue is full, dropping events', {
                    queueSize: this.eventQueue.length,
                    droppedCount: eventsToInsert.length
                });
            }
            throw error;
        }
    }

    /**
     * Start or update a user session
     * @param {string} sessionId - Session ID
     * @param {string} userId - User ID (optional)
     * @param {Object} context - Session context
     * @returns {Promise<Object>}
     */
    async startSession(sessionId, userId = null, context = {}) {
        try {
            const deviceInfo = this.parseUserAgent(context.userAgent || '');
            const country = context.country || null;
            const ipHash = context.ip ? this.hashIP(context.ip) : null;

            const session = {
                session_id: sessionId,
                user_id: userId,
                started_at: new Date().toISOString(),
                device_type: deviceInfo.deviceType,
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                country: country,
                user_agent: context.userAgent || null,
                ip_hash: ipHash,
                subscription_tier: context.subscriptionTier || 'free',
                page_views: 0,
                events_count: 0
            };

            const { data, error } = await this.supabase
                .from('analytics_sessions')
                .insert(session)
                .select()
                .single();

            if (error) throw error;

            logger.info(`Analytics session started: ${sessionId}`, { userId });

            return data;

        } catch (error) {
            logger.error('Failed to start analytics session', {
                error: error.message,
                sessionId
            });
            throw error;
        }
    }

    /**
     * Update an existing session
     * @param {string} sessionId - Session ID
     * @param {string} userId - User ID
     * @param {Object} context - Session context
     * @returns {Promise<void>}
     */
    async updateSession(sessionId, userId, context = {}) {
        try {
            // Increment page views if it's a page view event
            const { data: session, error: fetchError } = await this.supabase
                .from('analytics_sessions')
                .select('page_views, events_count')
                .eq('session_id', sessionId)
                .single();

            if (fetchError || !session) {
                // Session doesn't exist, create it
                await this.startSession(sessionId, userId, context);
                return;
            }

            // Update session stats
            const { error: updateError } = await this.supabase
                .from('analytics_sessions')
                .update({
                    events_count: (session.events_count || 0) + 1,
                    user_id: userId || session.user_id, // Update user_id if session was anonymous
                    subscription_tier: context.subscriptionTier || session.subscription_tier
                })
                .eq('session_id', sessionId);

            if (updateError) throw updateError;

        } catch (error) {
            logger.error('Failed to update analytics session', {
                error: error.message,
                sessionId
            });
            // Don't throw - session update is not critical
        }
    }

    /**
     * End a user session
     * @param {string} sessionId - Session ID
     * @param {number} duration - Session duration in seconds
     * @returns {Promise<void>}
     */
    async endSession(sessionId, duration) {
        try {
            const { error } = await this.supabase
                .from('analytics_sessions')
                .update({
                    ended_at: new Date().toISOString(),
                    duration_seconds: duration
                })
                .eq('session_id', sessionId);

            if (error) throw error;

            logger.info(`Analytics session ended: ${sessionId}`, { duration });

        } catch (error) {
            logger.error('Failed to end analytics session', {
                error: error.message,
                sessionId
            });
            // Don't throw - session end is not critical
        }
    }

    /**
     * Track a page view
     * @param {Object} pageViewData - Page view data
     * @returns {Promise<Object>}
     */
    async trackPageView(pageViewData) {
        try {
            const { sessionId, userId, context } = pageViewData;

            // Increment page_views in session
            const { data: session } = await this.supabase
                .from('analytics_sessions')
                .select('page_views')
                .eq('session_id', sessionId)
                .single();

            if (session) {
                await this.supabase
                    .from('analytics_sessions')
                    .update({ page_views: (session.page_views || 0) + 1 })
                    .eq('session_id', sessionId);
            }

            // Track as event
            return await this.track({
                userId,
                sessionId,
                eventName: 'page_viewed',
                properties: {
                    page_url: context.pageUrl,
                    page_title: context.pageTitle,
                    referrer: context.referrer
                },
                context
            });

        } catch (error) {
            logger.error('Failed to track page view', { error: error.message });
            throw error;
        }
    }

    /**
     * Identify a user (associate anonymous session with user)
     * @param {string} userId - User ID
     * @param {string} sessionId - Session ID
     * @param {Object} traits - User traits
     * @returns {Promise<void>}
     */
    async identify(userId, sessionId, traits = {}) {
        try {
            // Update session with user ID
            await this.supabase
                .from('analytics_sessions')
                .update({
                    user_id: userId,
                    subscription_tier: traits.subscriptionTier || 'free'
                })
                .eq('session_id', sessionId);

            // Update all events in this session with user ID
            await this.supabase
                .from('analytics_events')
                .update({
                    user_id: userId,
                    subscription_tier: traits.subscriptionTier || 'free'
                })
                .eq('session_id', sessionId)
                .is('user_id', null);

            logger.info(`User identified: ${userId} for session ${sessionId}`);

        } catch (error) {
            logger.error('Failed to identify user', {
                error: error.message,
                userId,
                sessionId
            });
            // Don't throw - identification is not critical
        }
    }

    /**
     * Parse user agent string to extract device info
     * @private
     * @param {string} userAgent - User agent string
     * @returns {Object} Device information
     */
    parseUserAgent(userAgent) {
        const ua = userAgent.toLowerCase();

        // Detect device type
        let deviceType = 'desktop';
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent)) {
            deviceType = 'tablet';
        } else if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi/i.test(userAgent)) {
            deviceType = 'mobile';
        }

        // Detect browser
        let browser = 'unknown';
        if (ua.includes('firefox')) browser = 'Firefox';
        else if (ua.includes('edg')) browser = 'Edge';
        else if (ua.includes('chrome')) browser = 'Chrome';
        else if (ua.includes('safari')) browser = 'Safari';
        else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

        // Detect OS
        let os = 'unknown';
        if (ua.includes('windows')) os = 'Windows';
        else if (ua.includes('mac')) os = 'macOS';
        else if (ua.includes('linux')) os = 'Linux';
        else if (ua.includes('android')) os = 'Android';
        else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

        return { deviceType, browser, os };
    }

    /**
     * Hash IP address for privacy (GDPR compliance)
     * @private
     * @param {string} ip - IP address
     * @returns {string} Hashed IP
     */
    hashIP(ip) {
        return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
    }

    /**
     * Clean up - stop batch processing
     */
    destroy() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        // Flush any remaining events
        if (this.eventQueue.length > 0) {
            this.flushEvents().catch(err => {
                logger.error('Failed to flush events on destroy', { error: err.message });
            });
        }
    }
}

module.exports = AnalyticsService;
