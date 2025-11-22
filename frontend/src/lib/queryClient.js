import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 * Optimized for performance with smart caching and background updates
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 2 minutes (reduced from 5 for fresher data)
      staleTime: 2 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 1 time
      retry: 1,
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Disable background refetch (prevents excessive API calls)
      refetchInterval: false,
    },
    mutations: {
      // Retry failed mutations 1 time
      retry: 1,
    },
  },
});

// Query Keys - Centralized and typed
export const queryKeys = {
  // Balance queries
  balance: {
    all: ['balance'],
    monthly: (month, year) => ['balance', 'monthly', month, year],
    allTime: () => ['balance', 'all-time'],
  },
  // Transaction queries
  transactions: {
    all: ['transactions'],
    list: (filters) => ['transactions', 'list', filters],
    byId: (id) => ['transactions', 'by-id', id],
  },
  // Category queries
  categories: {
    all: ['categories'],
    byType: (typeId) => ['categories', 'by-type', typeId],
  },
  // Savings queries
  savings: {
    all: ['savings'],
    goals: ['savings', 'goals'],
    progress: (goalId) => ['savings', 'progress', goalId],
  },
  // Budget queries
  budgets: {
    all: ['budgets'],
    current: ['budgets', 'current'],
    byId: (id) => ['budgets', 'by-id', id],
  },
  // Group queries
  groups: {
    all: ['groups'],
    byId: (id) => ['groups', 'by-id', id],
    members: (id) => ['groups', 'members', id],
  },
};
