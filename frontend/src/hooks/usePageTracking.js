import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from './useAnalytics';

/**
 * usePageTracking Hook
 *
 * Automatically tracks page views when the route changes.
 * Add this hook to your main App component or layout.
 *
 * @example
 * function App() {
 *   usePageTracking();
 *   return <Routes>...</Routes>
 * }
 */
export function usePageTracking() {
    const location = useLocation();
    const { page } = useAnalytics();

    useEffect(() => {
        // Track page view whenever the route changes
        const pageName = location.pathname;
        const pageProperties = {
            path: pageName,
            search: location.search,
            hash: location.hash
        };

        console.log('[PageTracking] Tracking page view', { pageName, pageProperties });
        page(pageName, pageProperties);
    }, [location, page]);
}
