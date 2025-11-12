/**
 * Integrated optimization that combines React Query with custom optimizations
 * This shows how React Query and our custom optimizations work together
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { optimizedGet, batchRequests } from './optimizedApi';
import { useSearchDebounce } from '../hooks/useDebounce';
import { monitorApiCall } from './performanceMonitor';

/**
 * Enhanced useQuery hook that combines React Query with our optimizations
 */
export const useOptimizedQuery = (queryKey, queryFn, options = {}) => {
    const queryResult = useQuery({
        queryKey,
        queryFn: async () => {
            const startTime = performance.now();
            try {
                // Use our optimized API calls (with deduplication)
                const result = await queryFn();
                const endTime = performance.now();
                
                // Monitor performance
                monitorApiCall(queryKey.join('/'), startTime, endTime, true);
                
                return result;
            } catch (error) {
                const endTime = performance.now();
                monitorApiCall(queryKey.join('/'), startTime, endTime, false);
                throw error;
            }
        },
        ...options
    });

    return queryResult;
};

/**
 * Enhanced transactions hook with debounced search
 */
export const useOptimizedTransactions = (filters = {}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useSearchDebounce(searchQuery, 300);
    
    // Combine search with React Query
    const queryKey = ['transactions', 'list', { ...filters, search: debouncedSearch }];
    
    return {
        ...useOptimizedQuery(queryKey, () => optimizedGet('/transactions'), {
            select: (data) => {
                // Client-side filtering for immediate response
                let filtered = data;
                
                if (debouncedSearch) {
                    const searchLower = debouncedSearch.toLowerCase();
                    filtered = filtered.filter(transaction =>
                        transaction.description?.toLowerCase().includes(searchLower) ||
                        transaction.category?.toLowerCase().includes(searchLower)
                    );
                }
                
                return filtered;
            },
            staleTime: 2 * 60 * 1000, // 2 minutes
        }),
        searchQuery,
        setSearchQuery
    };
};

/**
 * Batch multiple React Query operations
 */
export const useBatchQueries = (queries) => {
    return useQuery({
        queryKey: ['batch', queries.map(q => q.queryKey)],
        queryFn: async () => {
            const startTime = performance.now();
            
            // Use our batch API optimization
            const requests = queries.map(({ endpoint, method = 'GET', data }) => ({
                method,
                endpoint,
                data
            }));
            
            const results = await batchRequests(requests);
            const endTime = performance.now();
            
            monitorApiCall('batch-requests', startTime, endTime, true);
            
            return results;
        },
        staleTime: 1 * 60 * 1000, // 1 minute for batch data
    });
};

/**
 * Optimized mutation with performance monitoring
 */
export const useOptimizedMutation = (mutationFn, options = {}) => {
    return useMutation({
        mutationFn: async (variables) => {
            const startTime = performance.now();
            try {
                const result = await mutationFn(variables);
                const endTime = performance.now();
                
                monitorApiCall('mutation', startTime, endTime, true);
                return result;
            } catch (error) {
                const endTime = performance.now();
                monitorApiCall('mutation', startTime, endTime, false);
                throw error;
            }
        },
        ...options
    });
};

/**
 * Smart prefetching that works with React Query
 */
export const useSmartPrefetch = () => {
    const queryClient = useQueryClient();
    
    const prefetchTransactions = useCallback(() => {
        queryClient.prefetchQuery({
            queryKey: ['transactions', 'list'],
            queryFn: () => optimizedGet('/transactions'),
            staleTime: 2 * 60 * 1000
        });
    }, [queryClient]);
    
    const prefetchCategories = useCallback(() => {
        queryClient.prefetchQuery({
            queryKey: ['categories', 'all'],
            queryFn: () => optimizedGet('/categories'),
            staleTime: 10 * 60 * 1000
        });
    }, [queryClient]);
    
    return {
        prefetchTransactions,
        prefetchCategories
    };
};

export default {
    useOptimizedQuery,
    useOptimizedTransactions,
    useBatchQueries,
    useOptimizedMutation,
    useSmartPrefetch
};
