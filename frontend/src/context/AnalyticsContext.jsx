import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import analytics, { track as trackEvent, page as trackPage, identify as identifyUser } from '../utils/analytics';
import { AnalyticsContext } from '../hooks/useAnalytics';

/**
 * Analytics Provider
 *
 * Provides analytics tracking context to the entire app.
 * Automatically identifies users when they log in.
 */
export function AnalyticsProvider({ children }) {
    const { user, subscriptionTier } = useAuth();
    const hasIdentified = useRef(false);

    // Identify user when they log in
    useEffect(() => {
        if (user && !hasIdentified.current) {
            identifyUser(user.id, {
                subscriptionTier,
                email: user.email,
                createdAt: user.created_at
            }).catch(err => {
                console.error('Failed to identify user for analytics:', err);
            });
            hasIdentified.current = true;
        } else if (!user) {
            // Reset identification flag when user logs out
            hasIdentified.current = false;
        }
    }, [user, subscriptionTier]);

    /**
     * Track an analytics event
     * @param {string} eventName - Name of the event
     * @param {Object} properties - Event properties
     * @returns {Promise<void>}
     */
    const track = useCallback(async (eventName, properties = {}) => {
        try {
            // Enrich properties with subscription tier
            const enrichedProperties = {
                ...properties,
                subscription_tier: subscriptionTier
            };

            await trackEvent(eventName, enrichedProperties);
        } catch (error) {
            console.error('Analytics tracking error:', error);
        }
    }, [subscriptionTier]);

    /**
     * Track a page view
     * @param {string} pageName - Name/path of the page
     * @param {Object} properties - Additional properties
     * @returns {Promise<void>}
     */
    const page = useCallback(async (pageName, properties = {}) => {
        try {
            await trackPage(pageName, properties);
        } catch (error) {
            console.error('Analytics page tracking error:', error);
        }
    }, []);

    /**
     * Identify a user
     * @param {string} userId - User ID
     * @param {Object} traits - User traits
     * @returns {Promise<void>}
     */
    const identify = useCallback(async (userId, traits = {}) => {
        try {
            await identifyUser(userId, traits);
        } catch (error) {
            console.error('Analytics identify error:', error);
        }
    }, []);

    const value = {
        track,
        page,
        identify
    };

    return (
        <AnalyticsContext.Provider value={value}>
            {children}
        </AnalyticsContext.Provider>
    );
}
