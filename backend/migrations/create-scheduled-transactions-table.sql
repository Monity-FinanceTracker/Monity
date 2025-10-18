-- Create the scheduled_transactions table for the Cash Flow feature
-- This table stores scheduled and recurring transactions

CREATE TABLE IF NOT EXISTS scheduled_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    category TEXT NOT NULL,
    "typeId" INTEGER NOT NULL CHECK ("typeId" IN (1, 2, 3)),
    -- typeId: 1 = Expense, 2 = Income, 3 = Savings

    -- Recurrence settings
    recurrence_pattern TEXT NOT NULL DEFAULT 'once' CHECK (recurrence_pattern IN ('once', 'daily', 'weekly', 'monthly', 'yearly')),
    recurrence_interval INTEGER DEFAULT 1 CHECK (recurrence_interval > 0),
    recurrence_end_date DATE,

    -- Execution tracking
    next_execution_date DATE NOT NULL,
    last_executed_date DATE,
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scheduled_transactions_user ON scheduled_transactions("userId");
CREATE INDEX IF NOT EXISTS idx_scheduled_transactions_next_execution ON scheduled_transactions(next_execution_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_transactions_active ON scheduled_transactions(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_scheduled_transactions_user_active ON scheduled_transactions("userId", is_active) WHERE is_active = TRUE;

-- Enable Row Level Security
ALTER TABLE scheduled_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own scheduled transactions"
    ON scheduled_transactions FOR SELECT
    USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own scheduled transactions"
    ON scheduled_transactions FOR INSERT
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own scheduled transactions"
    ON scheduled_transactions FOR UPDATE
    USING (auth.uid() = "userId");

CREATE POLICY "Users can delete their own scheduled transactions"
    ON scheduled_transactions FOR DELETE
    USING (auth.uid() = "userId");

-- Create a trigger to update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_scheduled_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scheduled_transactions_updated_at
    BEFORE UPDATE ON scheduled_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduled_transactions_updated_at();

-- Add comment to the table
COMMENT ON TABLE scheduled_transactions IS 'Stores scheduled and recurring financial transactions for the Cash Flow calendar feature';
