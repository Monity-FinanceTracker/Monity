-- Add metadata field to categories table for internationalization support
-- This is 100% backward compatible - existing categories will have empty metadata

ALTER TABLE categories ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add index for better performance on metadata queries
CREATE INDEX IF NOT EXISTS idx_categories_metadata ON categories USING GIN (metadata);

-- Add comment for documentation
COMMENT ON COLUMN categories.metadata IS 'JSON metadata for category behavior, e.g. {"savings_behavior": "investment", "subcategory": "retirement"}';
