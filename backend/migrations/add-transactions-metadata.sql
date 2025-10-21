-- Add metadata field to transactions table
-- This field will store additional information about transactions like savings goal references

-- Add metadata column if it doesn't exist
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add index for better performance on metadata queries
CREATE INDEX IF NOT EXISTS idx_transactions_metadata ON transactions USING GIN (metadata);

-- Add comment for documentation
COMMENT ON COLUMN transactions.metadata IS 'JSON metadata for transaction details, e.g. {"savings_goal_id": "uuid", "savings_goal_name": "Vacation", "operation": "allocate"}';
