const cacheService = require('./cache-service');

/**
 * Database Optimization Service
 * Provides query optimization, pagination, and caching for Supabase operations
 */
class DatabaseOptimizer {
    constructor() {
        this.queryCache = new Map();
        this.defaultPageSize = 50;
        this.maxPageSize = 1000;
    }

    /**
     * Execute optimized query with caching and pagination
     */
    async executeQuery(supabase, table, options = {}) {
        const {
            select = '*',
            filters = {},
            orderBy = [],
            page = 1,
            pageSize = this.defaultPageSize,
            useCache = true,
            cacheTTL = 900, // 15 minutes
            userId = null
        } = options;

        // Validate page size
        const validPageSize = Math.min(Math.max(pageSize, 1), this.maxPageSize);
        const offset = (page - 1) * validPageSize;

        // Generate cache key
        const cacheKey = this.generateCacheKey(table, {
            select,
            filters,
            orderBy,
            page,
            pageSize: validPageSize,
            userId
        });

        // Try cache first
        if (useCache) {
            const cached = await cacheService.get(cacheKey);
            if (cached) {
                console.log(`[DB] Cache hit for ${table} query`);
                return cached;
            }
        }

        try {
            // Build query
            let query = supabase.from(table).select(select, { count: 'exact' });

            // Apply filters
            this.applyFilters(query, filters);

            // Apply ordering
            orderBy.forEach(order => {
                if (typeof order === 'string') {
                    query = query.order(order);
                } else if (order.column && order.ascending !== undefined) {
                    query = query.order(order.column, { ascending: order.ascending });
                }
            });

            // Apply pagination
            query = query.range(offset, offset + validPageSize - 1);

            // Execute query
            const { data, error, count } = await query;

            if (error) {
                console.error('[DB] Query error:', error);
                throw new Error(`Database query failed: ${error.message}`);
            }

            const result = {
                data: data || [],
                pagination: {
                    page,
                    pageSize: validPageSize,
                    totalItems: count || 0,
                    totalPages: Math.ceil((count || 0) / validPageSize),
                    hasMore: count > offset + validPageSize
                },
                meta: {
                    queryTime: Date.now(),
                    cached: false
                }
            };

            // Cache the result
            if (useCache && data) {
                await cacheService.set(cacheKey, result, cacheTTL);
                console.log(`[DB] Cached ${table} query result`);
            }

            return result;

        } catch (error) {
            console.error('[DB] Query execution error:', error);
            throw error;
        }
    }

    /**
     * Apply filters to query builder
     */
    applyFilters(query, filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value === null || value === undefined) return;

            if (typeof value === 'object' && !Array.isArray(value)) {
                // Handle special filter operations
                if (value.eq !== undefined) query = query.eq(key, value.eq);
                if (value.neq !== undefined) query = query.neq(key, value.neq);
                if (value.gt !== undefined) query = query.gt(key, value.gt);
                if (value.gte !== undefined) query = query.gte(key, value.gte);
                if (value.lt !== undefined) query = query.lt(key, value.lt);
                if (value.lte !== undefined) query = query.lte(key, value.lte);
                if (value.like !== undefined) query = query.like(key, value.like);
                if (value.ilike !== undefined) query = query.ilike(key, value.ilike);
                if (value.in !== undefined && Array.isArray(value.in)) query = query.in(key, value.in);
                if (value.contains !== undefined) query = query.contains(key, value.contains);
            } else if (Array.isArray(value)) {
                // Handle array filters (IN operation)
                query = query.in(key, value);
            } else {
                // Simple equality filter
                query = query.eq(key, value);
            }
        });

        return query;
    }

    /**
     * Get transactions with optimized query
     */
    async getTransactions(supabase, userId, options = {}) {
        const defaultFilters = { userId };
        const filters = { ...defaultFilters, ...options.filters };

        return this.executeQuery(supabase, 'transactions', {
            ...options,
            filters,
            orderBy: options.orderBy || [{ column: 'date', ascending: false }],
            useCache: true,
            cacheTTL: 300, // 5 minutes for transactions
            userId
        });
    }

    /**
     * Get categories with caching
     */
    async getCategories(supabase, userId, options = {}) {
        const filters = { userId };

        return this.executeQuery(supabase, 'categories', {
            ...options,
            filters,
            orderBy: [{ column: 'name', ascending: true }],
            useCache: true,
            cacheTTL: 1800, // 30 minutes for categories
            userId
        });
    }

    /**
     * Get budgets with optimization
     */
    async getBudgets(supabase, userId, options = {}) {
        const filters = { userId };

        return this.executeQuery(supabase, 'budgets', {
            ...options,
            filters,
            orderBy: [{ column: 'created_at', ascending: false }],
            useCache: true,
            cacheTTL: 600, // 10 minutes for budgets
            userId
        });
    }

    /**
     * Search transactions with full-text search optimization
     */
    async searchTransactions(supabase, userId, searchTerm, options = {}) {
        const cacheKey = `search:transactions:${userId}:${searchTerm}:${JSON.stringify(options)}`;
        
        // Check cache first
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            let query = supabase
                .from('transactions')
                .select('*', { count: 'exact' })
                .eq('userId', userId);

            // Apply text search on description field
            if (searchTerm) {
                query = query.or(`description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
            }

            // Apply additional filters
            if (options.filters) {
                this.applyFilters(query, options.filters);
            }

            // Pagination
            const page = options.page || 1;
            const pageSize = Math.min(options.pageSize || this.defaultPageSize, this.maxPageSize);
            const offset = (page - 1) * pageSize;

            query = query
                .order('date', { ascending: false })
                .range(offset, offset + pageSize - 1);

            const { data, error, count } = await query;

            if (error) throw error;

            const result = {
                data: data || [],
                pagination: {
                    page,
                    pageSize,
                    totalItems: count || 0,
                    totalPages: Math.ceil((count || 0) / pageSize),
                    hasMore: count > offset + pageSize
                },
                searchTerm,
                meta: {
                    queryTime: Date.now(),
                    cached: false
                }
            };

            // Cache search results for 5 minutes
            await cacheService.set(cacheKey, result, 300);

            return result;

        } catch (error) {
            console.error('[DB] Search error:', error);
            throw error;
        }
    }

    /**
     * Get dashboard analytics with heavy caching
     */
    async getDashboardAnalytics(supabase, userId) {
        const cacheKey = `analytics:dashboard:${userId}`;
        
        return cacheService.getOrSet(cacheKey, async () => {
            try {
                // Get recent transactions
                const { data: recentTransactions } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('userId', userId)
                    .order('date', { ascending: false })
                    .limit(10);

                // Get monthly summary
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const { data: monthlyData } = await supabase
                    .from('transactions')
                    .select('typeId, amount')
                    .eq('userId', userId)
                    .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

                // Calculate totals
                const expenses = monthlyData?.filter(t => t.typeId === 1) || [];
                const income = monthlyData?.filter(t => t.typeId === 2) || [];
                const savings = monthlyData?.filter(t => t.typeId === 3) || [];

                const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
                const totalIncome = income.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
                const totalSavings = savings.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

                return {
                    recentTransactions: recentTransactions || [],
                    monthlyTotals: {
                        expenses: totalExpenses,
                        income: totalIncome,
                        savings: totalSavings,
                        balance: totalIncome - totalExpenses
                    },
                    transactionCounts: {
                        expenses: expenses.length,
                        income: income.length,
                        savings: savings.length,
                        total: monthlyData?.length || 0
                    }
                };
            } catch (error) {
                console.error('[DB] Analytics query error:', error);
                throw error;
            }
        }, 600); // Cache for 10 minutes
    }

    /**
     * Invalidate cache for user-specific data
     */
    async invalidateUserCache(userId, table = null) {
        if (table) {
            await cacheService.invalidatePattern(`*:${table}:*${userId}*`);
            await cacheService.invalidatePattern(`query:${table}:*${userId}*`);
        } else {
            // Invalidate all user data
            await cacheService.invalidatePattern(`*:*${userId}*`);
            await cacheService.invalidatePattern(`analytics:*:${userId}`);
            await cacheService.invalidatePattern(`search:*:${userId}:*`);
        }
    }

    /**
     * Generate optimized cache key
     */
    generateCacheKey(table, params) {
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((result, key) => {
                result[key] = params[key];
                return result;
            }, {});
        
        return `optimized:${table}:${JSON.stringify(sortedParams)}`;
    }

    /**
     * Database health check and performance metrics
     */
    async getPerformanceMetrics(supabase) {
        const start = Date.now();
        
        try {
            // Simple query to test database performance
            await supabase.from('profiles').select('count').limit(1);
            
            const queryTime = Date.now() - start;
            const cacheStats = cacheService.getStats();
            
            return {
                database: {
                    queryTime,
                    status: queryTime < 1000 ? 'healthy' : 'slow',
                    timestamp: new Date().toISOString()
                },
                cache: cacheStats
            };
        } catch (error) {
            return {
                database: {
                    queryTime: Date.now() - start,
                    status: 'error',
                    error: error.message,
                    timestamp: new Date().toISOString()
                },
                cache: cacheService.getStats()
            };
        }
    }

    /**
     * Recommended database indexes for Supabase
     * Returns SQL commands that should be run on the database
     */
    getRecommendedIndexes() {
        return [
            // Transactions table indexes
            'CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(userId);',
            'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);',
            'CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(userId, date DESC);',
            'CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);',
            'CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(typeId);',
            'CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount);',
            
            // Categories table indexes
            'CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(userId);',
            'CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);',
            
            // Budgets table indexes
            'CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(userId);',
            'CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(categoryId);',
            'CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(period);',
            
            // Profiles table indexes
            'CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_tier);',
            'CREATE INDEX IF NOT EXISTS idx_profiles_created ON profiles(created_at);',
            
            // Full-text search indexes
            'CREATE INDEX IF NOT EXISTS idx_transactions_description_gin ON transactions USING gin(to_tsvector(\'english\', description));',
            'CREATE INDEX IF NOT EXISTS idx_categories_name_gin ON categories USING gin(to_tsvector(\'english\', name));',
            
            // Composite indexes for common queries
            'CREATE INDEX IF NOT EXISTS idx_transactions_user_type_date ON transactions(userId, typeId, date DESC);',
            'CREATE INDEX IF NOT EXISTS idx_transactions_user_category_date ON transactions(userId, category, date DESC);'
        ];
    }
}

// Create singleton instance
const dbOptimizer = new DatabaseOptimizer();

module.exports = dbOptimizer; 