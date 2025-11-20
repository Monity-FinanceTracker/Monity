import api from './api';

/**
 * Analytics Utility
 *
 * Tracks user events and behavior for analytics purposes.
 * Events are batched and sent to the backend periodically.
 */

class Analytics {
    constructor() {
        this.sessionId = this.getOrCreateSessionId();
        this.eventQueue = [];
        this.batchSize = 10; // Send after 10 events
        this.flushInterval = 10000; // Flush every 10 seconds
        this.isEnabled = this.checkIfEnabled();
        this.sessionStartTime = Date.now();

        // Start batch processing
        this.startBatchProcessing();
        console.log('[Analytics] Analytics initialized', {
            isEnabled: this.isEnabled,
            sessionId: this.sessionId,
            batchSize: this.batchSize,
            flushInterval: this.flushInterval
        });

        // Track session start
        this.startSession();

        // Track session end on page unload
        this.setupSessionEndTracking();
    }

    /**
     * Check if analytics is enabled (respects user preferences and DNT)
     * @returns {boolean}
     */
    checkIfEnabled() {
        // Respect Do Not Track browser setting
        if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
            console.log('[Analytics] Analytics disabled due to Do Not Track setting');
            return false;
        }

        // Check localStorage for user consent
        const consent = localStorage.getItem('analytics_consent');
        if (consent === 'false') {
            console.log('[Analytics] Analytics disabled - user declined consent');
            return false;
        }

        return true;
    }

    /**
     * Set user consent for analytics
     * @param {boolean} enabled - Whether analytics is enabled
     */
    setConsent(enabled) {
        localStorage.setItem('analytics_consent', String(enabled));
        this.isEnabled = enabled;

        if (!enabled) {
            // Clear any queued events
            this.eventQueue = [];
        }
    }

    /**
     * Get or create a session ID
     * @returns {string}
     */
    getOrCreateSessionId() {
        let sessionId = sessionStorage.getItem('analytics_session_id');

        if (!sessionId) {
            // Generate new session ID
            sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
            sessionStorage.setItem('analytics_session_id', sessionId);
        }

        return sessionId;
    }

    /**
     * Start a new session
     */
    async startSession() {
        if (!this.isEnabled) {
            console.log('[Analytics] Session start skipped - analytics disabled');
            return;
        }

        console.log('[Analytics] Starting session', { sessionId: this.sessionId });
        try {
            await api.post('/analytics/session/start', {
                sessionId: this.sessionId
            });
            console.log('[Analytics] Session started successfully');
        } catch (error) {
            console.error('[Analytics] Failed to start analytics session:', error);
        }
    }

    /**
     * End the current session
     */
    async endSession() {
        if (!this.isEnabled) return;

        try {
            const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);

            // Flush any remaining events first
            await this.flush();

            // End session
            await api.post('/analytics/session/end', {
                sessionId: this.sessionId,
                duration
            });
        } catch (error) {
            console.error('Failed to end analytics session:', error);
        }
    }

    /**
     * Setup session end tracking
     */
    setupSessionEndTracking() {
        // Track session end on page unload
        window.addEventListener('beforeunload', () => {
            // Use sendBeacon for reliable delivery
            const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);

            if (this.isEnabled && navigator.sendBeacon) {
                const data = new Blob(
                    [JSON.stringify({
                        sessionId: this.sessionId,
                        duration
                    })],
                    { type: 'application/json' }
                );

                navigator.sendBeacon(
                    `${import.meta.env.VITE_API_URL}/analytics/session/end`,
                    data
                );
            }
        });

        // Track session end on visibility change (user switches tabs)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.flush().catch(err => console.error('Failed to flush on visibility change:', err));
            }
        });
    }

    /**
     * Start batch processing for events
     */
    startBatchProcessing() {
        this.flushTimer = setInterval(() => {
            if (this.eventQueue.length > 0) {
                this.flush().catch(err => console.error('Failed to flush events:', err));
            }
        }, this.flushInterval);
    }

    /**
     * Track an analytics event
     * @param {string} eventName - Name of the event
     * @param {Object} properties - Event properties
     * @returns {Promise<void>}
     */
    track(eventName, properties = {}) {
        if (!this.isEnabled) {
            console.log('[Analytics] Track skipped - analytics disabled', { eventName });
            return Promise.resolve();
        }

        console.log('[Analytics] Tracking event', { eventName, properties });

        const event = {
            sessionId: this.sessionId,
            eventName,
            properties,
            context: this.getContext()
        };

        // Add to queue
        this.eventQueue.push(event);
        console.log('[Analytics] Event added to queue', {
            eventName,
            queueSize: this.eventQueue.length,
            batchSize: this.batchSize
        });

        // Flush if batch size reached
        if (this.eventQueue.length >= this.batchSize) {
            console.log('[Analytics] Batch size reached, flushing now');
            return this.flush();
        }

        return Promise.resolve();
    }

    /**
     * Track a page view
     * @param {string} pageName - Name/path of the page
     * @param {Object} properties - Additional properties
     * @returns {Promise<void>}
     */
    page(pageName, properties = {}) {
        return this.track('page_viewed', {
            page_name: pageName,
            ...properties
        });
    }

    /**
     * Identify a user
     * @param {string} userId - User ID
     * @param {Object} traits - User traits
     * @returns {Promise<void>}
     */
    async identify(userId, traits = {}) {
        if (!this.isEnabled) return;

        try {
            await api.post('/analytics/identify', {
                sessionId: this.sessionId,
                traits
            });
        } catch (error) {
            console.error('Failed to identify user:', error);
        }
    }

    /**
     * Flush queued events to the backend
     * @returns {Promise<void>}
     */
    async flush() {
        if (this.eventQueue.length === 0) {
            console.log('[Analytics] Flush called but queue is empty');
            return;
        }

        const eventsToSend = [...this.eventQueue];
        this.eventQueue = [];

        console.log('[Analytics] Flushing events', {
            count: eventsToSend.length,
            events: eventsToSend.map(e => e.eventName)
        });

        try {
            if (eventsToSend.length === 1) {
                // Send single event
                console.log('[Analytics] Sending single event to /analytics/track');
                const response = await api.post('/analytics/track', eventsToSend[0]);
                console.log('[Analytics] Single event sent successfully', response);
            } else {
                // Send batch
                console.log('[Analytics] Sending batch to /analytics/batch');
                const response = await api.post('/analytics/batch', {
                    events: eventsToSend
                });
                console.log('[Analytics] Batch sent successfully', response);
            }
        } catch (error) {
            console.error('[Analytics] Failed to send analytics events:', error);
            console.error('[Analytics] Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            // Re-queue events if failed (but don't retry indefinitely)
            if (eventsToSend.length < 100) {
                this.eventQueue.unshift(...eventsToSend);
                console.log('[Analytics] Events re-queued for retry');
            }
        }
    }

    /**
     * Get current context for events
     * @returns {Object}
     */
    getContext() {
        return {
            pageUrl: window.location.href,
            pageTitle: document.title,
            referrer: document.referrer,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            userAgent: navigator.userAgent
        };
    }

    /**
     * Clean up - stop batch processing
     */
    destroy() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }

        // Flush remaining events
        this.flush().catch(err => console.error('Failed to flush on destroy:', err));
    }
}

// Create singleton instance
const analytics = new Analytics();

// Export convenience methods
export const track = (eventName, properties) => analytics.track(eventName, properties);
export const page = (pageName, properties) => analytics.page(pageName, properties);
export const identify = (userId, traits) => analytics.identify(userId, traits);
export const setConsent = (enabled) => analytics.setConsent(enabled);
export const flush = () => analytics.flush();

// Export class for advanced usage
export default analytics;
