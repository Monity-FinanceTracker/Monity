const Redis = require('redis');
const { LRUCache } = require('lru-cache');
const { logger } = require('../utils/logger');

/**
 * Caching Service with Redis primary and LRU in-memory fallback
 * Provides high-performance caching for frequently accessed data
 */
class CacheService {
    constructor(dependencies = {}) {
        this.redis = dependencies.redis || null;
        this.isRedisConnected = false;
        
        // In-memory LRU cache as fallback
        this.memoryCache = new LRUCache({
            max: 1000, // Maximum 1000 items
            ttl: 1000 * 60 * 15, // 15 minutes TTL
            updateAgeOnGet: true,
            updateAgeOnHas: true,
        });

        if (!this.redis) {
            this.initializeRedis();
        }
    }

    /**
     * Initialize Redis connection with fallback handling
     */
    async initializeRedis() {
        try {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
            
            this.redis = Redis.createClient({
                url: redisUrl,
            });

            this.redis.on('error', (err) => {
                logger.warn('[Cache] Redis unavailable, falling back to memory cache', { error: err.message });
                this.isRedisConnected = false;
            });

            this.redis.on('connect', () => {
                logger.info('[Cache] Redis connected successfully');
                this.isRedisConnected = true;
            });

            this.redis.on('end', () => {
                logger.warn('[Cache] Redis connection ended, using memory cache');
                this.isRedisConnected = false;
            });

            await this.redis.connect();
        } catch (error) {
            logger.warn('[Cache] Redis initialization failed, using memory cache only', { error: error.message });
            this.isRedisConnected = false;
        }
    }

    /**
     * Get value from cache (Redis primary, memory fallback)
     * @param {string} key - The cache key
     * @returns {Promise<any>} - The cached value
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
            logger.warn('[Cache] Redis get error', { error: error.message, key });
        }

        // Fallback to memory cache
        return this.memoryCache.get(key);
    }

    /**
     * Set value in cache with TTL
     * @param {string} key - The cache key
     * @param {any} value - The value to cache
     * @param {number} ttlSeconds - Time-to-live in seconds
     */
    async set(key, value, ttlSeconds = 900) { // Default 15 minutes
        try {
            if (this.isRedisConnected && this.redis) {
                await this.redis.setEx(key, ttlSeconds, JSON.stringify(value));
            }
        } catch (error) {
            logger.warn('[Cache] Redis set error', { error: error.message, key });
        }

        // Always set in memory cache as backup
        this.memoryCache.set(key, value, { ttl: ttlSeconds * 1000 });
    }

    /**
     * Delete key from cache
     * @param {string} key - The cache key
     */
    async del(key) {
        try {
            if (this.isRedisConnected && this.redis) {
                await this.redis.del(key);
            }
        } catch (error) {
            logger.warn('[Cache] Redis del error', { error: error.message, key });
        }

        this.memoryCache.delete(key);
    }

    /**
     * Invalidate cache entries based on a pattern
     * @param {string} pattern - The pattern to match keys against
     */
    async invalidatePattern(pattern) {
        try {
            if (this.isRedisConnected && this.redis) {
                // Note: KEYS can be slow in production on large datasets. Use SCAN in production.
                const keys = await this.redis.keys(pattern);
                if (keys.length > 0) {
                    await this.redis.del(keys);
                    logger.info(`[Cache] Invalidated ${keys.length} keys matching pattern: ${pattern}`);
                }
            }
        } catch (error) {
            logger.warn('[Cache] Pattern invalidation error', { error: error.message, pattern });
        }

        // For memory cache, iterate through keys
        const memoryKeys = [...this.memoryCache.keys()];
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        
        memoryKeys.forEach(key => {
            if (regex.test(key)) {
                this.memoryCache.delete(key);
            }
        });
    }

    /**
     * Get or set cached value with function execution
     * @param {string} key - The cache key
     * @param {Function} fetchFunction - Function to execute if cache miss
     * @param {number} ttlSeconds - Time-to-live in seconds
     * @returns {Promise<any>}
     */
    async getOrSet(key, fetchFunction, ttlSeconds = 900) {
        let value = await this.get(key);
        
        if (value === undefined || value === null) {
            value = await fetchFunction();
            if (value !== undefined && value !== null) {
                await this.set(key, value, ttlSeconds);
            }
        }
        
        return value;
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
            if (this.redis && this.isRedisConnected) {
                await this.redis.quit();
            }
        } catch (error) {
            logger.warn('[Cache] Error closing Redis connection', { error: error.message });
        }

        this.memoryCache.clear();
    }
}

module.exports = CacheService;
