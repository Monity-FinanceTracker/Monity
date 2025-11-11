/**
 * Performance monitoring utilities for the frontend
 */

import React from 'react';

// Performance metrics collection
const performanceMetrics = {
    componentRenderTimes: new Map(),
    apiCallTimes: new Map(),
    bundleLoadTimes: new Map()
};

/**
 * Monitor component render performance
 */
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
    return React.forwardRef((props, ref) => {
        const startTime = performance.now();
        
        React.useEffect(() => {
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            // Store render time
            const currentTimes = performanceMetrics.componentRenderTimes.get(componentName) || [];
            currentTimes.push(renderTime);
            performanceMetrics.componentRenderTimes.set(componentName, currentTimes);
            
            // Log slow renders in development
            if (import.meta.env.DEV && renderTime > 16) {
                console.warn(`Slow render detected for ${componentName}: ${renderTime.toFixed(2)}ms`);
            }
        });
        
        return React.createElement(WrappedComponent, { ...props, ref });
    });
};

/**
 * Monitor API call performance
 */
export const monitorApiCall = (endpoint, startTime, endTime, success = true) => {
    const duration = endTime - startTime;
    
    const key = `${endpoint}:${success ? 'success' : 'error'}`;
    const currentTimes = performanceMetrics.apiCallTimes.get(key) || [];
    currentTimes.push(duration);
    performanceMetrics.apiCallTimes.set(key, currentTimes);
    
    // Log slow API calls in development
    if (import.meta.env.DEV && duration > 1000) {
        console.warn(`Slow API call detected for ${endpoint}: ${duration.toFixed(2)}ms`);
    }
};

/**
 * Monitor bundle loading performance
 */
export const monitorBundleLoad = (bundleName, loadTime) => {
    performanceMetrics.bundleLoadTimes.set(bundleName, loadTime);
    
    if (import.meta.env.DEV && loadTime > 500) {
        console.warn(`Slow bundle load detected for ${bundleName}: ${loadTime.toFixed(2)}ms`);
    }
};

/**
 * Get performance summary
 */
export const getPerformanceSummary = () => {
    const summary = {
        componentRenders: {},
        apiCalls: {},
        bundles: Object.fromEntries(performanceMetrics.bundleLoadTimes)
    };
    
    // Calculate average render times
    for (const [component, times] of performanceMetrics.componentRenderTimes) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const max = Math.max(...times);
        summary.componentRenders[component] = {
            average: Math.round(avg * 100) / 100,
            max: Math.round(max * 100) / 100,
            count: times.length
        };
    }
    
    // Calculate average API call times
    for (const [endpoint, times] of performanceMetrics.apiCallTimes) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const max = Math.max(...times);
        summary.apiCalls[endpoint] = {
            average: Math.round(avg * 100) / 100,
            max: Math.round(max * 100) / 100,
            count: times.length
        };
    }
    
    return summary;
};

/**
 * Clear performance metrics
 */
export const clearPerformanceMetrics = () => {
    performanceMetrics.componentRenderTimes.clear();
    performanceMetrics.apiCallTimes.clear();
    performanceMetrics.bundleLoadTimes.clear();
};

/**
 * Web Vitals monitoring
 */
export const initWebVitalsMonitoring = () => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        // Monitor Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry.startTime > 2500) {
                console.warn(`Poor LCP detected: ${lastEntry.startTime.toFixed(2)}ms`);
            }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Monitor First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                if (entry.processingStart - entry.startTime > 100) {
                    console.warn(`Poor FID detected: ${(entry.processingStart - entry.startTime).toFixed(2)}ms`);
                }
            });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        
        // Monitor Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            if (clsValue > 0.1) {
                console.warn(`Poor CLS detected: ${clsValue.toFixed(4)}`);
            }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
};

/**
 * Memory usage monitoring
 */
export const monitorMemoryUsage = () => {
    if (performance.memory) {
        const memory = {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        };
        
        if (memory.used / memory.limit > 0.8) {
            console.warn('High memory usage detected:', memory);
        }
        
        return memory;
    }
    return null;
};

export default {
    withPerformanceMonitoring,
    monitorApiCall,
    monitorBundleLoad,
    getPerformanceSummary,
    clearPerformanceMetrics,
    initWebVitalsMonitoring,
    monitorMemoryUsage
};
