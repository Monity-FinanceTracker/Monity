const Redis = require('redis');
const { LRUCache } = require('lru-cache');

/**
 * Caching Service with Redis primary and LRU in-memory fallback
 * Provides high-performance caching for frequently accessed data
 */
class CacheService {
    constructor() {
        this.redis = null;
        this.isRedisConnected = false;
        
        // In-memory LRU cache as fallback
        this.memoryCache = new LRUCache({
            max: 1000, // Maximum 1000 items
            ttl: 1000 * 60 * 15, // 15 minutes TTL
            updateAgeOnGet: true,
            updateAgeOnHas: true,
        });

        this.initializeRedis();
    }

    /**
     * Initialize Redis connection with fallback handling
     */
    async initializeRedis() {
        try {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
            let redisErrorLogged = false; // Prevent spam logging
            
            this.redis = Redis.createClient({
                url: redisUrl,
                retry_strategy: (options) => {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        if (!redisErrorLogged) {
                            console.warn('[Cache] Redis connection refused, using memory cache only');
                            console.warn('[Cache] To enable Redis: install Redis server or set REDIS_URL env variable');
                            redisErrorLogged = true;
                        }
                        return false;
                    }
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        console.warn('[Cache] Redis retry time exhausted, using memory cache');
                        return false;
                    }
                    return Math.min(options.attempt * 100, 3000);
                }
            });

            this.redis.on('error', (err) => {
                if (!redisErrorLogged) {
                    console.warn('[Cache] Redis unavailable, falling back to memory cache');
                    console.warn('[Cache] Error:', err.message);
                    redisErrorLogged = true;
                }
                this.isRedisConnected = false;
            });

            this.redis.on('connect', () => {
                console.log('[Cache] Redis connected successfully');
                this.isRedisConnected = true;
            });

            this.redis.on('disconnect', () => {
                console.warn('[Cache] Redis disconnected, using memory cache');
                this.isRedisConnected = false;
            });

            await this.redis.connect();
        } catch (error) {
            console.warn('[Cache] Redis initialization failed, using memory cache only:', error.message);
            this.isRedisConnected = false;
        }
    }

    /**
     * Get value from cache (Redis primary, memory fallback)
     */
    async get(key) {
        try {
            if (this.isRedisConnected && this.redis) {
                const value = await this.redis.get(key);
                if (value) {
                    return JSON.parse(value);
                }
            }
        } catch (error) {
            console.warn('[Cache] Redis get error:', error.message);
        }

        // Fallback to memory cache
        return this.memoryCache.get(key);
    }

    /**
     * Set value in cache with TTL
     */
    async set(key, value, ttlSeconds = 900) { // Default 15 minutes
        try {
            if (this.isRedisConnected && this.redis) {
                await this.redis.setEx(key, ttlSeconds, JSON.stringify(value));
            }
        } catch (error) {
            console.warn('[Cache] Redis set error:', error.message);
        }

        // Always set in memory cache as backup
        this.memoryCache.set(key, value, { ttl: ttlSeconds * 1000 });
    }

    /**
     * Delete key from cache
     */
    async del(key) {
        try {
            if (this.isRedisConnected && this.redis) {
                await this.redis.del(key);
            }
        } catch (error) {
            console.warn('[Cache] Redis del error:', error.message);
        }

        this.memoryCache.delete(key);
    }

    /**
     * Check if key exists in cache
     */
    async has(key) {
        try {
            if (this.isRedisConnected && this.redis) {
                const exists = await this.redis.exists(key);
                if (exists) return true;
            }
        } catch (error) {
            console.warn('[Cache] Redis has error:', error.message);
        }

        return this.memoryCache.has(key);
    }

    /**
     * Clear all cache entries
     */
    async clear() {
        try {
            if (this.isRedisConnected && this.redis) {
                await this.redis.flushDb();
            }
        } catch (error) {
            console.warn('[Cache] Redis clear error:', error.message);
        }

        this.memoryCache.clear();
    }

    /**
     * Get or set cached value with function execution
     */
    async getOrSet(key, fetchFunction, ttlSeconds = 900) {
        let value = await this.get(key);
        
        if (value === undefined) {
            value = await fetchFunction();
            if (value !== undefined && value !== null) {
                await this.set(key, value, ttlSeconds);
            }
        }
        
        return value;
    }

    /**
     * Cache middleware for Express routes
     */
    middleware(ttlSeconds = 900) {
        return async (req, res, next) => {
            // Only cache GET requests
            if (req.method !== 'GET') {
                return next();
            }

            const cacheKey = `route:${req.originalUrl}:${req.user?.id || 'anonymous'}`;
            
            try {
                const cachedData = await this.get(cacheKey);
                
                if (cachedData) {
                    console.log(`[Cache] Cache hit for ${cacheKey}`);
                    return res.json(cachedData);
                }

                // Override res.json to cache the response
                const originalJson = res.json;
                res.json = async function(body) {
                    if (res.statusCode === 200) {
                        await cacheService.set(cacheKey, body, ttlSeconds);
                        console.log(`[Cache] Cached response for ${cacheKey}`);
                    }
                    return originalJson.call(this, body);
                };

                next();
            } catch (error) {
                console.warn('[Cache] Middleware error:', error.message);
                next();
            }
        };
    }

    /**
     * Generate cache key for database queries
     */
    generateQueryKey(table, params = {}) {
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((result, key) => {
                result[key] = params[key];
                return result;
            }, {});
        
        return `query:${table}:${JSON.stringify(sortedParams)}`;
    }

    /**
     * Cache invalidation patterns
     */
    async invalidatePattern(pattern) {
        try {
            if (this.isRedisConnected && this.redis) {
                const keys = await this.redis.keys(pattern);
                if (keys.length > 0) {
                    await this.redis.del(keys);
                    console.log(`[Cache] Invalidated ${keys.length} keys matching pattern: ${pattern}`);
                }
            }
        } catch (error) {
            console.warn('[Cache] Pattern invalidation error:', error.message);
        }

        // For memory cache, we'll need to iterate through keys
        // This is less efficient but necessary for pattern matching
        const memoryKeys = [...this.memoryCache.keys()];
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        
        memoryKeys.forEach(key => {
            if (regex.test(key)) {
                this.memoryCache.delete(key);
            }
        });
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            redis: {
                connected: this.isRedisConnected,
                client: this.redis ? 'initialized' : 'not initialized'
            },
            memory: {
                size: this.memoryCache.size,
                max: this.memoryCache.max,
                calculatedSize: this.memoryCache.calculatedSize
            }
        };
    }

    /**
     * Gracefully close connections
     */
    async close() {
        try {
            if (this.redis) {
                await this.redis.quit();
            }
        } catch (error) {
            console.warn('[Cache] Error closing Redis connection:', error.message);
        }

        this.memoryCache.clear();
    }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService; 