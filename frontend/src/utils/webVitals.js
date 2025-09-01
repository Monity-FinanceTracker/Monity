import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

/**
 * Web Vitals Performance Monitoring
 * Tracks Core Web Vitals and sends data for analysis
 */
class WebVitalsMonitor {
    constructor() {
        this.metrics = new Map();
        this.apiEndpoint = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
        this.sessionId = this.generateSessionId();
        this.isEnabled = import.meta.env.PROD; // Only in production by default
        
        // Initialize monitoring if enabled
        if (this.isEnabled || localStorage.getItem('webvitals-debug') === 'true') {
            this.initializeMonitoring();
        }
    }

    /**
     * Generate unique session ID for tracking
     */
    generateSessionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Initialize Web Vitals monitoring
     */
    initializeMonitoring() {
        console.log('[WebVitals] Monitoring initialized');

        // Core Web Vitals
        getCLS(this.handleMetric.bind(this), true);
        getFID(this.handleMetric.bind(this));
        getFCP(this.handleMetric.bind(this));
        getLCP(this.handleMetric.bind(this), true);
        getTTFB(this.handleMetric.bind(this));

        // Custom performance metrics
        this.trackNavigationTiming();
        this.trackResourceTiming();
        this.trackCustomMetrics();

        // Send metrics periodically
        this.scheduleMetricsSending();
    }

    /**
     * Handle Web Vitals metric
     */
    handleMetric(metric) {
        const enhancedMetric = {
            ...metric,
            sessionId: this.sessionId,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            connection: this.getConnectionInfo(),
            viewport: this.getViewportInfo(),
        };

        this.metrics.set(metric.name, enhancedMetric);
        
        // Log in development
        if (!import.meta.env.PROD) {
            console.log('[WebVitals]', metric.name, metric.value, metric);
        }

        // Send critical metrics immediately
        if (this.isCriticalMetric(metric)) {
            this.sendMetric(enhancedMetric);
        }
    }

    /**
     * Check if metric is critical and needs immediate sending
     */
    isCriticalMetric(metric) {
        const thresholds = {
            CLS: 0.25, // Bad CLS threshold
            FID: 300,  // Bad FID threshold (ms)
            LCP: 4000, // Bad LCP threshold (ms)
            FCP: 3000, // Bad FCP threshold (ms)
            TTFB: 1500 // Bad TTFB threshold (ms)
        };

        return metric.value > (thresholds[metric.name] || Infinity);
    }

    /**
     * Track Navigation Timing API metrics
     */
    trackNavigationTiming() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                const navMetrics = {
                    name: 'navigation-timing',
                    sessionId: this.sessionId,
                    timestamp: Date.now(),
                    metrics: {
                        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                        domComplete: navigation.domComplete - navigation.domLoading,
                        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                        redirectTime: navigation.redirectEnd - navigation.redirectStart,
                        dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
                        connectTime: navigation.connectEnd - navigation.connectStart,
                        requestTime: navigation.responseStart - navigation.requestStart,
                        responseTime: navigation.responseEnd - navigation.responseStart,
                        renderTime: navigation.domComplete - navigation.responseEnd
                    }
                };

                this.metrics.set('navigation-timing', navMetrics);
            }
        }
    }

    /**
     * Track Resource Timing for critical resources
     */
    trackResourceTiming() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            const resources = performance.getEntriesByType('resource');
            const criticalResources = resources.filter(resource => 
                resource.name.includes('.js') || 
                resource.name.includes('.css') ||
                resource.name.includes('/api/')
            );

            const resourceMetrics = {
                name: 'resource-timing',
                sessionId: this.sessionId,
                timestamp: Date.now(),
                metrics: {
                    totalResources: resources.length,
                    jsResources: resources.filter(r => r.name.includes('.js')).length,
                    cssResources: resources.filter(r => r.name.includes('.css')).length,
                    apiCalls: resources.filter(r => r.name.includes('/api/')).length,
                    slowResources: criticalResources.filter(r => r.duration > 1000).length,
                    avgDuration: criticalResources.reduce((sum, r) => sum + r.duration, 0) / criticalResources.length || 0
                }
            };

            this.metrics.set('resource-timing', resourceMetrics);
        }
    }

    /**
     * Track custom performance metrics
     */
    trackCustomMetrics() {
        // Time to Interactive approximation
        this.trackTimeToInteractive();
        
        // Memory usage (if available)
        this.trackMemoryUsage();
        
        // Bundle size metrics
        this.trackBundleMetrics();
    }

    /**
     * Approximate Time to Interactive
     */
    trackTimeToInteractive() {
        // Simple TTI approximation: when main thread is quiet for 5 seconds
        let quietPeriodStart = null;
        const checkQuietPeriod = () => {
            const now = performance.now();
            
            // Check if there are any long tasks in the last 5 seconds
            const longTasks = performance.getEntriesByType('longtask');
            const recentLongTasks = longTasks.filter(task => 
                now - task.startTime < 5000 && task.duration > 50
            );

            if (recentLongTasks.length === 0) {
                if (!quietPeriodStart) {
                    quietPeriodStart = now;
                } else if (now - quietPeriodStart >= 5000) {
                    // 5 seconds of quiet period
                    const tti = {
                        name: 'TTI',
                        value: quietPeriodStart,
                        sessionId: this.sessionId,
                        timestamp: Date.now()
                    };
                    this.metrics.set('TTI', tti);
                    return; // Stop checking
                }
            } else {
                quietPeriodStart = null;
            }

            // Continue checking
            setTimeout(checkQuietPeriod, 1000);
        };

        // Start checking after initial load
        setTimeout(checkQuietPeriod, 2000);
    }

    /**
     * Track memory usage if available
     */
    trackMemoryUsage() {
        if ('memory' in performance) {
            const memoryMetric = {
                name: 'memory-usage',
                sessionId: this.sessionId,
                timestamp: Date.now(),
                metrics: {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                    usagePercentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
                }
            };

            this.metrics.set('memory-usage', memoryMetric);
        }
    }

    /**
     * Track bundle size metrics
     */
    trackBundleMetrics() {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        
        const bundleMetric = {
            name: 'bundle-metrics',
            sessionId: this.sessionId,
            timestamp: Date.now(),
            metrics: {
                scriptCount: scripts.length,
                styleCount: styles.length,
                chunkCount: scripts.filter(script => script.src.includes('chunk')).length,
                vendorChunks: scripts.filter(script => script.src.includes('vendor')).length
            }
        };

        this.metrics.set('bundle-metrics', bundleMetric);
    }

    /**
     * Get connection information
     */
    getConnectionInfo() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            return {
                effectiveType: conn.effectiveType,
                downlink: conn.downlink,
                rtt: conn.rtt,
                saveData: conn.saveData
            };
        }
        return null;
    }

    /**
     * Get viewport information
     */
    getViewportInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio || 1,
            orientation: screen.orientation?.angle || 0
        };
    }

    /**
     * Send metric to backend
     */
    async sendMetric(metric) {
        try {
            // In a real implementation, you'd send to your analytics endpoint
            if (import.meta.env.DEV) {
                console.log('[WebVitals] Would send metric:', metric);
                return;
            }

            await fetch(`${this.apiEndpoint}/analytics/webvitals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(metric),
                keepalive: true // Ensure metric is sent even if page is unloading
            });
        } catch (error) {
            console.error('[WebVitals] Failed to send metric:', error);
        }
    }

    /**
     * Send all collected metrics
     */
    async sendAllMetrics() {
        const metricsArray = Array.from(this.metrics.values());
        
        if (metricsArray.length === 0) return;

        try {
            await fetch(`${this.apiEndpoint}/analytics/webvitals/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    metrics: metricsArray,
                    timestamp: Date.now()
                }),
                keepalive: true
            });

            // Clear sent metrics
            this.metrics.clear();
        } catch (error) {
            console.error('[WebVitals] Failed to send metrics batch:', error);
        }
    }

    /**
     * Schedule periodic metrics sending
     */
    scheduleMetricsSending() {
        // Send metrics every 30 seconds
        setInterval(() => {
            this.sendAllMetrics();
        }, 30000);

        // Send metrics on page unload
        window.addEventListener('beforeunload', () => {
            this.sendAllMetrics();
        });

        // Send metrics on visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.sendAllMetrics();
            }
        });
    }

    /**
     * Get current metrics summary
     */
    getMetricsSummary() {
        const summary = {};
        
        for (const [name, metric] of this.metrics) {
            if (typeof metric.value === 'number') {
                summary[name] = {
                    value: metric.value,
                    rating: this.getRating(name, metric.value),
                    timestamp: metric.timestamp
                };
            }
        }

        return summary;
    }

    /**
     * Get performance rating for a metric
     */
    getRating(metricName, value) {
        const thresholds = {
            CLS: { good: 0.1, poor: 0.25 },
            FID: { good: 100, poor: 300 },
            LCP: { good: 2500, poor: 4000 },
            FCP: { good: 1800, poor: 3000 },
            TTFB: { good: 800, poor: 1800 }
        };

        const threshold = thresholds[metricName];
        if (!threshold) return 'unknown';

        if (value <= threshold.good) return 'good';
        if (value <= threshold.poor) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Enable debug mode
     */
    enableDebug() {
        localStorage.setItem('webvitals-debug', 'true');
        this.isEnabled = true;
        this.initializeMonitoring();
    }

    /**
     * Disable debug mode
     */
    disableDebug() {
        localStorage.removeItem('webvitals-debug');
        this.isEnabled = import.meta.env.PROD;
    }
}

// Create singleton instance
const webVitalsMonitor = new WebVitalsMonitor();

// Export for manual usage
export default webVitalsMonitor;

// Export helper functions
export const reportWebVitals = (onPerfEntry) => {
    if (onPerfEntry && onPerfEntry instanceof Function) {
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
    }
};

export const getPerformanceSummary = () => {
    return webVitalsMonitor.getMetricsSummary();
};

export const enablePerformanceDebug = () => {
    webVitalsMonitor.enableDebug();
};

export const disablePerformanceDebug = () => {
    webVitalsMonitor.disableDebug();
}; 