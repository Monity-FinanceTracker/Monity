const { LRUCache } = require('lru-cache');
const { logger } = require('../utils/logger');

// Create LRU cache for balance calculations
// Cache up to 1000 users' balances, expire after 2 minutes
const balanceCache = new LRUCache({
    max: 1000,
    ttl: 2 * 60 * 1000, // 2 minutes in milliseconds
    updateAgeOnGet: false,
    updateAgeOnHas: false,
});

// Cache key generators
const getCacheKey = (userId, type = 'all') => `balance:${userId}:${type}`;
const getMonthlyKey = (userId, month, year) => `balance:${userId}:${year}-${month}`;

/**
 * Get cached balance for a user
 */
function getCachedBalance(userId, type = 'all') {
    const key = getCacheKey(userId, type);
    const cached = balanceCache.get(key);

    if (cached) {
        logger.debug(`Cache HIT for balance: ${key}`);
        return cached;
    }

    logger.debug(`Cache MISS for balance: ${key}`);
    return null;
}

/**
 * Get cached monthly balance
 */
function getCachedMonthlyBalance(userId, month, year) {
    const key = getMonthlyKey(userId, month, year);
    const cached = balanceCache.get(key);

    if (cached) {
        logger.debug(`Cache HIT for monthly balance: ${key}`);
        return cached;
    }

    logger.debug(`Cache MISS for monthly balance: ${key}`);
    return null;
}

/**
 * Set balance in cache
 */
function setCachedBalance(userId, balance, type = 'all') {
    const key = getCacheKey(userId, type);
    balanceCache.set(key, balance);
    logger.debug(`Cached balance: ${key}`);
}

/**
 * Set monthly balance in cache
 */
function setCachedMonthlyBalance(userId, month, year, balance) {
    const key = getMonthlyKey(userId, month, year);
    balanceCache.set(key, balance);
    logger.debug(`Cached monthly balance: ${key}`);
}

/**
 * Invalidate all balance caches for a user
 * Called when transactions are created, updated, or deleted
 */
function invalidateUserBalance(userId) {
    // Clear all balance entries for this user
    const keys = Array.from(balanceCache.keys());
    const userKeys = keys.filter(key => key.startsWith(`balance:${userId}:`));

    userKeys.forEach(key => {
        balanceCache.delete(key);
    });

    logger.debug(`Invalidated ${userKeys.length} balance cache entries for user ${userId}`);
}

/**
 * Clear all cache
 */
function clearAllCache() {
    balanceCache.clear();
    logger.info('Cleared all balance cache');
}

/**
 * Get cache stats
 */
function getCacheStats() {
    return {
        size: balanceCache.size,
        max: balanceCache.max,
        calculatedSize: balanceCache.calculatedSize,
    };
}

module.exports = {
    getCachedBalance,
    getCachedMonthlyBalance,
    setCachedBalance,
    setCachedMonthlyBalance,
    invalidateUserBalance,
    clearAllCache,
    getCacheStats,
};
