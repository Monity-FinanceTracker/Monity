-- Create the scheduled_transaction_executions table
-- This table tracks each execution of a scheduled transaction to prevent duplicates

CREATE TABLE IF NOT EXISTS scheduled_transaction_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheduled_transaction_id UUID NOT NULL REFERENCES scheduled_transactions(id) ON DELETE CASCADE,
    execution_date DATE NOT NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique constraint prevents duplicate executions for the same scheduled transaction on the same date
    UNIQUE(scheduled_transaction_id, execution_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scheduled_executions_scheduled_tx ON scheduled_transaction_executions(scheduled_transaction_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_executions_date ON scheduled_transaction_executions(execution_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_executions_transaction ON scheduled_transaction_executions(transaction_id);

-- Enable Row Level Security
ALTER TABLE scheduled_transaction_executions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (inherit from parent scheduled_transaction)
CREATE POLICY "Users can view their own scheduled transaction executions"
    ON scheduled_transaction_executions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM scheduled_transactions st
            WHERE st.id = scheduled_transaction_executions.scheduled_transaction_id
            AND st."userId" = auth.uid()
        )
    );

CREATE POLICY "System can insert scheduled transaction executions"
    ON scheduled_transaction_executions FOR INSERT
    WITH CHECK (true);  -- Allow system to insert, user access controlled via scheduled_transactions

-- Add comment to the table
COMMENT ON TABLE scheduled_transaction_executions IS 'Tracks executions of scheduled transactions to prevent duplicates and maintain history';
