import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../utils/api';
import { queryKeys } from '../lib/queryClient';

/**
 * Custom hooks for React Query - Optimized for performance
 * These hooks provide caching, background updates, and error handling
 */

// Balance Queries
export const useBalance = (selectedRange = 'all_time', options = {}) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: selectedRange === 'all_time' 
      ? queryKeys.balance.allTime() 
      : queryKeys.balance.monthly(
          new Date().getMonth() + 1, 
          new Date().getFullYear()
        ),
    queryFn: async () => {
      if (selectedRange === 'current_month') {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const response = await get(`/balance/${month}/${year}`);
        return response.data;
      } else {
        const response = await get('/balance/all');
        return response.data;
      }
    },
    select: (data) => data?.balance || 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for balance data
    enabled,
  });
};

// Categories Query
export const useCategories = (typeId = null, includeCounts = false) => {
  return useQuery({
    queryKey: typeId 
      ? queryKeys.categories.byType(typeId) 
      : includeCounts 
        ? [...queryKeys.categories.all, 'withCounts'] 
        : queryKeys.categories.all,
    queryFn: async () => {
      const url = includeCounts ? '/categories?includeCounts=true' : '/categories';
      const response = await get(url);
      return response.data;
    },
    select: (data) => {
      if (!typeId) return data;
      return data.filter(category =>
        category.typeId === typeId || category.typeId === 3
      );
    },
    staleTime: includeCounts ? 1 * 60 * 1000 : 10 * 60 * 1000, // Shorter cache for counts
  });
};

// Transactions Query
export const useTransactions = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: async () => {
      const response = await get('/transactions');
      return response.data;
    },
    select: (data) => Array.isArray(data) ? data : [],
    staleTime: 1 * 60 * 1000, // 1 minute for transactions
  });
};

// Savings Goals Query
export const useSavingsGoals = () => {
  return useQuery({
    queryKey: queryKeys.savings.goals,
    queryFn: async () => {
      const response = await get('/savings-goals');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for savings goals
  });
};

// Budgets Query
export const useBudgets = () => {
  return useQuery({
    queryKey: queryKeys.budgets.all,
    queryFn: async () => {
      const response = await get('/budgets');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for budgets
  });
};

// Groups Query
export const useGroups = () => {
  return useQuery({
    queryKey: queryKeys.groups.all,
    queryFn: async () => {
      const response = await get('/groups');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for groups
  });
};

// Group by ID Query
export const useGroupById = (id) => {
  return useQuery({
    queryKey: queryKeys.groups.byId(id),
    queryFn: async () => {
      const response = await get(`/groups/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes for individual group
  });
};

// Mutation Hooks
export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transactionData) => {
      const response = await post('/transactions', transactionData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.balance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
  });
};

export const useAddCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryData) => {
      const response = await post('/categories', categoryData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate categories cache
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
};

export const useAddSavingsGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (goalData) => {
      const response = await post('/savings-goals', goalData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate savings cache
      queryClient.invalidateQueries({ queryKey: queryKeys.savings.all });
    },
  });
};

// Group Mutations
export const useAddGroupExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ groupId, expenseData }) => {
      const response = await post(`/groups/${groupId}/expenses`, expenseData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate group queries
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.byId(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
  });
};

export const useInviteGroupMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ groupId }) => {
      const response = await post(`/groups/${groupId}/invite`);
      if (response && response.data) {
        return response.data;
      }
      throw new Error('Invalid response from server');
    },
    onSuccess: (data, variables) => {
      // Invalidate group queries
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.byId(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
    onError: (error) => {
      // Log error for debugging
      console.error('Invite group member mutation error:', error);
    },
  });
};

export const useSettleExpenseShare = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (shareId) => {
      const response = await post(`/groups/shares/${shareId}/settle`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all group queries to refresh expense data
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
  });
};
