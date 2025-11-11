/**
 * Bundle optimization utilities and code splitting helpers
 */

/**
 * Dynamic import with error handling and retry logic
 */
export const dynamicImport = (importFn, retries = 3, delay = 1000) => {
    return new Promise((resolve, reject) => {
        const attemptImport = (attempt) => {
            importFn()
                .then(resolve)
                .catch((error) => {
                    if (attempt < retries) {
                        console.warn(`Import failed, retrying (${attempt}/${retries}):`, error);
                        setTimeout(() => attemptImport(attempt + 1), delay);
                    } else {
                        reject(error);
                    }
                });
        };
        attemptImport(1);
    });
};

/**
 * Preload critical chunks
 */
export const preloadCriticalChunks = () => {
    // Preload dashboard components (most commonly accessed)
    // Note: These components are now statically imported, so we only preload truly lazy components
    const criticalImports = [
        // Only include components that are actually lazy loaded
        () => import('../components/groups/Groups'),
        () => import('../components/settings/EnhancedSettings'),
        () => import('../components/settings/EnhancedBudgets')
        // Removed ImprovedTransactionList - it's now statically imported
    ];

    criticalImports.forEach((importFn, index) => {
        // Stagger preloads to avoid overwhelming the network
        setTimeout(() => {
            importFn().catch(() => {
                // Silently handle preload failures
            });
        }, index * 500);
    });
};

/**
 * Chunk loading optimization
 */
export const optimizeChunkLoading = () => {
    // Set up intersection observer for route-based preloading
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const link = entry.target;
                    const href = link.getAttribute('href');
                    
                    // Preload route-specific chunks (only for lazy-loaded components)
                    if (href === '/settings') {
                        import('../components/settings/EnhancedSettings').catch(() => {});
                    } else if (href === '/groups') {
                        import('../components/groups/Groups').catch(() => {});
                    }
                    // Removed /transactions preload - ImprovedTransactionList is now statically imported
                }
            });
        }, { rootMargin: '50px' });

        // Observe navigation links
        document.querySelectorAll('a[href^="/"]').forEach((link) => {
            observer.observe(link);
        });
    }
};

/**
 * Bundle size analyzer (development only)
 */
export const analyzeBundleSize = () => {
    if (!import.meta.env.DEV) return;

    const scripts = document.querySelectorAll('script[src]');
    const chunks = [];

    scripts.forEach((script) => {
        const src = script.src;
        if (src.includes('assets/')) {
            chunks.push({
                name: src.split('/').pop(),
                url: src
            });
        }
    });

    console.group('📦 Bundle Analysis');
    console.table(chunks);
    console.groupEnd();

    // Estimate bundle sizes (approximate)
    return chunks;
};

/**
 * Tree shaking optimization helper
 */
export const optimizeImports = {
    // Lodash optimization
    lodash: {
        // Instead of: import _ from 'lodash'
        // Use: import { debounce } from 'lodash/debounce'
        recommended: 'Use specific imports: import { debounce } from "lodash/debounce"'
    },
    
    // React Icons optimization
    reactIcons: {
        // Instead of: import { FaUser, FaHome } from 'react-icons/fa'
        // Use: import FaUser from 'react-icons/fa/FaUser'
        recommended: 'Use specific imports for react-icons to reduce bundle size'
    },
    
    // Date libraries optimization
    dateFns: {
        // Instead of: import * as dateFns from 'date-fns'
        // Use: import { format } from 'date-fns/format'
        recommended: 'Use specific date-fns imports'
    }
};

/**
 * Runtime chunk optimization
 */
export const optimizeRuntimeChunks = () => {
    // Optimize Vite chunk splitting
    const chunkOptimization = {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        ui: ['lucide-react', '@tanstack/react-query'],
        charts: ['chart.js', 'react-chartjs-2', 'recharts'],
        utils: ['axios', 'date-fns']
    };

    return chunkOptimization;
};

/**
 * Performance budget monitoring
 */
export const monitorPerformanceBudget = () => {
    const budgets = {
        maxBundleSize: 2 * 1024 * 1024, // 2MB
        maxChunkSize: 500 * 1024, // 500KB
        maxInitialLoad: 1 * 1024 * 1024 // 1MB
    };

    if (performance.navigation) {
        const loadTime = performance.navigation.loadEventEnd - performance.navigation.navigationStart;
        
        if (loadTime > 3000) {
            console.warn(`[PERFORMANCE] Initial load time exceeded budget: ${loadTime}ms`);
        }
    }

    return budgets;
};

/**
 * Service Worker optimization for caching
 */
export const optimizeServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        // Cache strategy for different resource types
        const cacheStrategies = {
            static: 'CacheFirst', // CSS, JS, images
            api: 'NetworkFirst', // API calls
            pages: 'StaleWhileRevalidate' // HTML pages
        };

        return cacheStrategies;
    }
    return null;
};

export default {
    dynamicImport,
    preloadCriticalChunks,
    optimizeChunkLoading,
    analyzeBundleSize,
    optimizeImports,
    optimizeRuntimeChunks,
    monitorPerformanceBudget,
    optimizeServiceWorker
};
