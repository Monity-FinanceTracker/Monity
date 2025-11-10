-- Performance Optimization Indexes
-- Run this migration on your Supabase database to improve query performance

-- 1. Index on transactions.userId for fast user transaction queries
-- Most common query: SELECT * FROM transactions WHERE userId = ?
CREATE INDEX IF NOT EXISTS idx_transactions_user_id
ON transactions(userId);

-- 2. Composite index on transactions for balance calculations
-- Speeds up queries that filter by user and order by date
CREATE INDEX IF NOT EXISTS idx_transactions_user_date
ON transactions(userId, date DESC);

-- 3. Index on transactions.typeId for filtering by transaction type
CREATE INDEX IF NOT EXISTS idx_transactions_type
ON transactions(typeId);

-- 4. Composite index for common transaction queries (user + type)
CREATE INDEX IF NOT EXISTS idx_transactions_user_type
ON transactions(userId, typeId);

-- 5. Index on categories.userId for fast category lookups
CREATE INDEX IF NOT EXISTS idx_categories_user_id
ON categories(userId);

-- 6. Index on savings_goals.user_id for fast savings goal queries
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id
ON savings_goals(user_id);

-- 7. Index on budgets.userId for fast budget lookups
CREATE INDEX IF NOT EXISTS idx_budgets_user_id
ON budgets(userId);

-- 8. Index on transactions.category for category-based queries and counts
CREATE INDEX IF NOT EXISTS idx_transactions_category
ON transactions(category);

-- 9. Composite index for monthly balance queries
-- Speeds up queries that filter by user and date range
CREATE INDEX IF NOT EXISTS idx_transactions_user_date_range
ON transactions(userId, date);

-- 10. Index on transactions.createdAt for ordering and recent queries
CREATE INDEX IF NOT EXISTS idx_transactions_created_at
ON transactions(createdAt DESC);

-- Analyze tables to update statistics for the query planner
ANALYZE transactions;
ANALYZE categories;
ANALYZE savings_goals;
ANALYZE budgets;

-- Display index information
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('transactions', 'categories', 'savings_goals', 'budgets')
ORDER BY tablename, indexname;
