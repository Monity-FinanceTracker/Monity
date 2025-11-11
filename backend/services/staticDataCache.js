const { LRUCache } = require('lru-cache');
const { logger } = require('../utils/logger');

// Create LRU cache for categories and transaction types
// These are relatively static data that change infrequently
// Cache up to 1000 users' data, expire after 10 minutes
const staticDataCache = new LRUCache({
    max: 2000,
    ttl: 10 * 60 * 1000, // 10 minutes in milliseconds
    updateAgeOnGet: true, // Refresh TTL on access (popular data stays cached)
    updateAgeOnHas: false,
});

// Cache key generators
const getCategoriesKey = (userId) => `categories:${userId}`;
const getTransactionTypesKey = () => 'transaction_types:all';

/**
 * Get cached categories for a user
 */
function getCachedCategories(userId) {
    const key = getCategoriesKey(userId);
    const cached = staticDataCache.get(key);

    if (cached) {
        logger.debug(`Cache HIT for categories: ${key}`);
        return cached;
    }

    logger.debug(`Cache MISS for categories: ${key}`);
    return null;
}

/**
 * Get cached transaction types
 */
function getCachedTransactionTypes() {
    const key = getTransactionTypesKey();
    const cached = staticDataCache.get(key);

    if (cached) {
        logger.debug(`Cache HIT for transaction types: ${key}`);
        return cached;
    }

    logger.debug(`Cache MISS for transaction types: ${key}`);
    return null;
}

/**
 * Set categories in cache
 */
function setCachedCategories(userId, categories) {
    const key = getCategoriesKey(userId);
    staticDataCache.set(key, categories);
    logger.debug(`Cached categories: ${key}, count: ${categories?.length || 0}`);
}

/**
 * Set transaction types in cache
 */
function setCachedTransactionTypes(types) {
    const key = getTransactionTypesKey();
    staticDataCache.set(key, types);
    logger.debug(`Cached transaction types: ${key}, count: ${types?.length || 0}`);
}

/**
 * Invalidate categories cache for a user
 * Called when user creates, updates, or deletes a category
 */
function invalidateUserCategories(userId) {
    const key = getCategoriesKey(userId);
    staticDataCache.delete(key);
    logger.debug(`Invalidated categories cache for user ${userId}`);
}

/**
 * Invalidate all transaction types cache
 * Called when transaction types are updated (rare)
 */
function invalidateTransactionTypes() {
    const key = getTransactionTypesKey();
    staticDataCache.delete(key);
    logger.debug('Invalidated transaction types cache');
}

/**
 * Clear all cache
 */
function clearAllCache() {
    staticDataCache.clear();
    logger.info('Cleared all static data cache');
}

/**
 * Get cache stats
 */
function getCacheStats() {
    return {
        size: staticDataCache.size,
        max: staticDataCache.max,
        calculatedSize: staticDataCache.calculatedSize,
    };
}

module.exports = {
    getCachedCategories,
    getCachedTransactionTypes,
    setCachedCategories,
    setCachedTransactionTypes,
    invalidateUserCategories,
    invalidateTransactionTypes,
    clearAllCache,
    getCacheStats,
};
