import { get, post, put, del } from './api';

/**
 * Optimized API utilities with request deduplication and caching
 */

// Request deduplication cache
const requestCache = new Map();
const CACHE_DURATION = 5000; // 5 seconds

/**
 * Generate cache key for request deduplication
 */
const generateCacheKey = (method, endpoint, data = null) => {
    return `${method}:${endpoint}:${data ? JSON.stringify(data) : ''}`;
};

/**
 * Check if request is in cache and still valid
 */
const getCachedRequest = (cacheKey) => {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.promise;
    }
    return null;
};

/**
 * Store request in cache
 */
const setCachedRequest = (cacheKey, promise) => {
    requestCache.set(cacheKey, {
        promise,
        timestamp: Date.now()
    });

    // Clean up cache entry after completion
    promise.finally(() => {
        setTimeout(() => {
            requestCache.delete(cacheKey);
        }, CACHE_DURATION);
    });

    return promise;
};

/**
 * Optimized GET request with deduplication
 */
export const optimizedGet = (endpoint) => {
    const cacheKey = generateCacheKey('GET', endpoint);
    const cached = getCachedRequest(cacheKey);
    
    if (cached) {
        return cached;
    }

    const promise = get(endpoint);
    return setCachedRequest(cacheKey, promise);
};

/**
 * Optimized POST request (no caching for mutations)
 */
export const optimizedPost = (endpoint, data) => {
    return post(endpoint, data);
};

/**
 * Optimized PUT request (no caching for mutations)
 */
export const optimizedPut = (endpoint, data) => {
    return put(endpoint, data);
};

/**
 * Optimized DELETE request (no caching for mutations)
 */
export const optimizedDel = (endpoint) => {
    return del(endpoint);
};

/**
 * Batch API requests for better performance
 */
export const batchRequests = async (requests) => {
    try {
        const promises = requests.map(({ method, endpoint, data }) => {
            switch (method.toUpperCase()) {
                case 'GET':
                    return optimizedGet(endpoint);
                case 'POST':
                    return optimizedPost(endpoint, data);
                case 'PUT':
                    return optimizedPut(endpoint, data);
                case 'DELETE':
                    return optimizedDel(endpoint);
                default:
                    throw new Error(`Unsupported method: ${method}`);
            }
        });

        return await Promise.allSettled(promises);
    } catch (error) {
        console.error('Batch request error:', error);
        throw error;
    }
};

/**
 * Clear all cached requests (useful for logout, etc.)
 */
export const clearRequestCache = () => {
    requestCache.clear();
};

/**
 * Prefetch data for better UX
 */
export const prefetchData = (endpoint) => {
    // Don't wait for response, just start the request
    optimizedGet(endpoint).catch(() => {
        // Silently handle prefetch errors
    });
};

/**
 * Optimized transaction fetching with filtering
 */
export const fetchTransactionsOptimized = async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            queryParams.append(key, value);
        }
    });

    const endpoint = `/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return optimizedGet(endpoint);
};

/**
 * Optimized categories fetching with type filtering
 */
export const fetchCategoriesOptimized = async (typeId = null) => {
    const endpoint = typeId ? `/categories?type=${typeId}` : '/categories';
    return optimizedGet(endpoint);
};

export default {
    get: optimizedGet,
    post: optimizedPost,
    put: optimizedPut,
    del: optimizedDel,
    batch: batchRequests,
    clearCache: clearRequestCache,
    prefetch: prefetchData,
    fetchTransactions: fetchTransactionsOptimized,
    fetchCategories: fetchCategoriesOptimized
};
