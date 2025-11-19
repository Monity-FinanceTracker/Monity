import { useContext, createContext } from 'react';

/**
 * Analytics Context
 *
 * Provides analytics tracking capabilities throughout the app
 */
export const AnalyticsContext = createContext(null);

/**
 * useAnalytics Hook
 *
 * Provides access to analytics tracking methods
 *
 * @returns {Object} Analytics methods
 * @returns {Function} return.track - Track an event
 * @returns {Function} return.page - Track a page view
 * @returns {Function} return.identify - Identify a user
 */
export function useAnalytics() {
    const context = useContext(AnalyticsContext);

    if (!context) {
        console.warn('useAnalytics must be used within an AnalyticsProvider');
        // Return no-op functions if used outside provider
        return {
            track: () => Promise.resolve(),
            page: () => Promise.resolve(),
            identify: () => Promise.resolve()
        };
    }

    return context;
}
