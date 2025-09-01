const cacheService = require('./cache-service');
const dbOptimizer = require('./database-optimizer');

/**
 * Performance Monitoring Service
 * Tracks API performance, query times, and system health metrics
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            requests: new Map(),
            queries: new Map(),
            errors: new Map(),
            cache: new Map()
        };
        
        this.thresholds = {
            slowQuery: 1000, // 1 second
            slowRequest: 2000, // 2 seconds
            errorRate: 0.05, // 5%
            cacheHitRate: 0.8 // 80%
        };

        // Clean up old metrics every hour
        setInterval(() => this.cleanupOldMetrics(), 60 * 60 * 1000);
    }

    /**
     * Record API request metrics
     */
    recordRequest(req, res, responseTime) {
        const key = `${req.method}:${req.route?.path || req.path}`;
        const timestamp = Date.now();
        
        const metric = {
            method: req.method,
            path: req.route?.path || req.path,
            statusCode: res.statusCode,
            responseTime,
            timestamp,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            userId: req.user?.id
        };

        if (!this.metrics.requests.has(key)) {
            this.metrics.requests.set(key, []);
        }
        
        this.metrics.requests.get(key).push(metric);

        // Log slow requests
        if (responseTime > this.thresholds.slowRequest) {
            console.warn(`[Performance] Slow request: ${key} took ${responseTime}ms`);
        }

        // Log errors
        if (res.statusCode >= 400) {
            this.recordError(key, res.statusCode, req, responseTime);
        }
    }

    /**
     * Record database query metrics
     */
    recordQuery(table, operation, queryTime, success = true) {
        const key = `${table}:${operation}`;
        const timestamp = Date.now();
        
        const metric = {
            table,
            operation,
            queryTime,
            success,
            timestamp
        };

        if (!this.metrics.queries.has(key)) {
            this.metrics.queries.set(key, []);
        }
        
        this.metrics.queries.get(key).push(metric);

        // Log slow queries
        if (queryTime > this.thresholds.slowQuery) {
            console.warn(`[Performance] Slow query: ${key} took ${queryTime}ms`);
        }
    }

    /**
     * Record error metrics
     */
    recordError(endpoint, statusCode, req, responseTime) {
        const key = `${endpoint}:${statusCode}`;
        const timestamp = Date.now();
        
        const metric = {
            endpoint,
            statusCode,
            responseTime,
            timestamp,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            userId: req.user?.id,
            error: true
        };

        if (!this.metrics.errors.has(key)) {
            this.metrics.errors.set(key, []);
        }
        
        this.metrics.errors.get(key).push(metric);
    }

    /**
     * Record cache hit/miss metrics
     */
    recordCacheOperation(operation, key, hit, responseTime) {
        const cacheKey = `cache:${operation}`;
        const timestamp = Date.now();
        
        const metric = {
            operation,
            key,
            hit,
            responseTime,
            timestamp
        };

        if (!this.metrics.cache.has(cacheKey)) {
            this.metrics.cache.set(cacheKey, []);
        }
        
        this.metrics.cache.get(cacheKey).push(metric);
    }

    /**
     * Get performance statistics for the last hour
     */
    getHourlyStats() {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        
        // Request statistics
        const requestStats = this.calculateRequestStats(oneHourAgo);
        const queryStats = this.calculateQueryStats(oneHourAgo);
        const errorStats = this.calculateErrorStats(oneHourAgo);
        const cacheStats = this.calculateCacheStats(oneHourAgo);

        return {
            timeWindow: '1 hour',
            requests: requestStats,
            queries: queryStats,
            errors: errorStats,
            cache: cacheStats,
            alerts: this.generateAlerts(requestStats, queryStats, errorStats, cacheStats),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Calculate request statistics
     */
    calculateRequestStats(since) {
        let totalRequests = 0;
        let totalResponseTime = 0;
        let slowRequests = 0;
        const statusCodes = {};
        const endpoints = {};

        for (const [endpoint, metrics] of this.metrics.requests) {
            const recentMetrics = metrics.filter(m => m.timestamp > since);
            
            recentMetrics.forEach(metric => {
                totalRequests++;
                totalResponseTime += metric.responseTime;
                
                if (metric.responseTime > this.thresholds.slowRequest) {
                    slowRequests++;
                }
                
                statusCodes[metric.statusCode] = (statusCodes[metric.statusCode] || 0) + 1;
                endpoints[endpoint] = (endpoints[endpoint] || 0) + 1;
            });
        }

        return {
            total: totalRequests,
            averageResponseTime: totalRequests > 0 ? Math.round(totalResponseTime / totalRequests) : 0,
            slowRequests,
            slowRequestRate: totalRequests > 0 ? (slowRequests / totalRequests) : 0,
            statusCodes,
            topEndpoints: Object.entries(endpoints)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
        };
    }

    /**
     * Calculate query statistics
     */
    calculateQueryStats(since) {
        let totalQueries = 0;
        let totalQueryTime = 0;
        let slowQueries = 0;
        let failedQueries = 0;
        const tables = {};

        for (const [table, metrics] of this.metrics.queries) {
            const recentMetrics = metrics.filter(m => m.timestamp > since);
            
            recentMetrics.forEach(metric => {
                totalQueries++;
                totalQueryTime += metric.queryTime;
                
                if (metric.queryTime > this.thresholds.slowQuery) {
                    slowQueries++;
                }
                
                if (!metric.success) {
                    failedQueries++;
                }
                
                tables[metric.table] = (tables[metric.table] || 0) + 1;
            });
        }

        return {
            total: totalQueries,
            averageQueryTime: totalQueries > 0 ? Math.round(totalQueryTime / totalQueries) : 0,
            slowQueries,
            failedQueries,
            slowQueryRate: totalQueries > 0 ? (slowQueries / totalQueries) : 0,
            failureRate: totalQueries > 0 ? (failedQueries / totalQueries) : 0,
            tableActivity: tables
        };
    }

    /**
     * Calculate error statistics
     */
    calculateErrorStats(since) {
        let totalErrors = 0;
        const errorsByCode = {};
        const errorsByEndpoint = {};

        for (const [errorKey, metrics] of this.metrics.errors) {
            const recentMetrics = metrics.filter(m => m.timestamp > since);
            
            recentMetrics.forEach(metric => {
                totalErrors++;
                errorsByCode[metric.statusCode] = (errorsByCode[metric.statusCode] || 0) + 1;
                errorsByEndpoint[metric.endpoint] = (errorsByEndpoint[metric.endpoint] || 0) + 1;
            });
        }

        return {
            total: totalErrors,
            byStatusCode: errorsByCode,
            byEndpoint: errorsByEndpoint
        };
    }

    /**
     * Calculate cache statistics
     */
    calculateCacheStats(since) {
        let totalOperations = 0;
        let hits = 0;
        let totalResponseTime = 0;

        for (const [operation, metrics] of this.metrics.cache) {
            const recentMetrics = metrics.filter(m => m.timestamp > since);
            
            recentMetrics.forEach(metric => {
                totalOperations++;
                totalResponseTime += metric.responseTime;
                
                if (metric.hit) {
                    hits++;
                }
            });
        }

        const hitRate = totalOperations > 0 ? (hits / totalOperations) : 0;

        return {
            total: totalOperations,
            hits,
            misses: totalOperations - hits,
            hitRate,
            averageResponseTime: totalOperations > 0 ? Math.round(totalResponseTime / totalOperations) : 0
        };
    }

    /**
     * Generate performance alerts
     */
    generateAlerts(requestStats, queryStats, errorStats, cacheStats) {
        const alerts = [];

        // High error rate alert
        const errorRate = requestStats.total > 0 ? (errorStats.total / requestStats.total) : 0;
        if (errorRate > this.thresholds.errorRate) {
            alerts.push({
                type: 'error_rate',
                severity: 'high',
                message: `High error rate: ${(errorRate * 100).toFixed(2)}% (threshold: ${(this.thresholds.errorRate * 100)}%)`,
                value: errorRate,
                threshold: this.thresholds.errorRate
            });
        }

        // Slow response times
        if (requestStats.averageResponseTime > this.thresholds.slowRequest) {
            alerts.push({
                type: 'slow_responses',
                severity: 'medium',
                message: `Slow average response time: ${requestStats.averageResponseTime}ms (threshold: ${this.thresholds.slowRequest}ms)`,
                value: requestStats.averageResponseTime,
                threshold: this.thresholds.slowRequest
            });
        }

        // Low cache hit rate
        if (cacheStats.hitRate < this.thresholds.cacheHitRate && cacheStats.total > 10) {
            alerts.push({
                type: 'cache_hit_rate',
                severity: 'medium',
                message: `Low cache hit rate: ${(cacheStats.hitRate * 100).toFixed(2)}% (threshold: ${(this.thresholds.cacheHitRate * 100)}%)`,
                value: cacheStats.hitRate,
                threshold: this.thresholds.cacheHitRate
            });
        }

        // High query failure rate
        if (queryStats.failureRate > 0.01 && queryStats.total > 10) { // 1%
            alerts.push({
                type: 'query_failures',
                severity: 'high',
                message: `High query failure rate: ${(queryStats.failureRate * 100).toFixed(2)}%`,
                value: queryStats.failureRate,
                threshold: 0.01
            });
        }

        return alerts;
    }

    /**
     * Express middleware to track request performance
     */
    middleware() {
        return (req, res, next) => {
            const startTime = Date.now();
            
            // Override res.end to capture response time
            const originalEnd = res.end;
            res.end = function(...args) {
                const responseTime = Date.now() - startTime;
                performanceMonitor.recordRequest(req, res, responseTime);
                return originalEnd.apply(this, args);
            };

            next();
        };
    }

    /**
     * Clean up old metrics (older than 24 hours)
     */
    cleanupOldMetrics() {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        
        // Clean up requests
        for (const [key, metrics] of this.metrics.requests) {
            this.metrics.requests.set(key, metrics.filter(m => m.timestamp > oneDayAgo));
        }

        // Clean up queries
        for (const [key, metrics] of this.metrics.queries) {
            this.metrics.queries.set(key, metrics.filter(m => m.timestamp > oneDayAgo));
        }

        // Clean up errors
        for (const [key, metrics] of this.metrics.errors) {
            this.metrics.errors.set(key, metrics.filter(m => m.timestamp > oneDayAgo));
        }

        // Clean up cache metrics
        for (const [key, metrics] of this.metrics.cache) {
            this.metrics.cache.set(key, metrics.filter(m => m.timestamp > oneDayAgo));
        }

        console.log('[Performance] Cleaned up metrics older than 24 hours');
    }

    /**
     * Get system health status
     */
    async getSystemHealth() {
        try {
            const stats = this.getHourlyStats();
            const cacheServiceStats = cacheService.getStats();
            
            // Determine overall health
            let overallHealth = 'healthy';
            const criticalAlerts = stats.alerts.filter(a => a.severity === 'high');
            const mediumAlerts = stats.alerts.filter(a => a.severity === 'medium');

            if (criticalAlerts.length > 0) {
                overallHealth = 'critical';
            } else if (mediumAlerts.length > 2) {
                overallHealth = 'degraded';
            } else if (mediumAlerts.length > 0) {
                overallHealth = 'warning';
            }

            return {
                status: overallHealth,
                timestamp: new Date().toISOString(),
                performance: stats,
                cacheService: cacheServiceStats,
                uptime: process.uptime(),
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                    rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
                }
            };
        } catch (error) {
            console.error('[Performance] Error getting system health:', error);
            return {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor; 