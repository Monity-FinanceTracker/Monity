-- Create Investment Calculator tables
-- These tables store simulation data and track monthly usage limits for free users

-- Table for storing investment simulations (optional - primarily for premium users)
CREATE TABLE IF NOT EXISTS investment_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    initial_investment DECIMAL(15, 2) NOT NULL,
    contribution_amount DECIMAL(15, 2) NOT NULL,
    contribution_frequency TEXT NOT NULL CHECK (contribution_frequency IN ('monthly', 'semi-annually', 'annually')),
    annual_interest_rate DECIMAL(5, 2) NOT NULL,
    goal_date DATE NOT NULL,
    final_value DECIMAL(15, 2) NOT NULL,
    total_contributions DECIMAL(15, 2) NOT NULL,
    total_interest DECIMAL(15, 2) NOT NULL,
    roi_percentage DECIMAL(8, 2) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking monthly usage (similar to AI chat pattern)
CREATE TABLE IF NOT EXISTS investment_calculator_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month DATE NOT NULL, -- First day of the month (YYYY-MM-01)
    simulation_count INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("userId", month)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_investment_simulations_user ON investment_simulations("userId");
CREATE INDEX IF NOT EXISTS idx_investment_simulations_created ON investment_simulations("createdAt");
CREATE INDEX IF NOT EXISTS idx_investment_simulations_user_created ON investment_simulations("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_investment_calculator_usage_user_month ON investment_calculator_usage("userId", month);

-- Enable Row Level Security
ALTER TABLE investment_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_calculator_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for investment_simulations
CREATE POLICY "Users can view their own simulations"
    ON investment_simulations FOR SELECT
    USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own simulations"
    ON investment_simulations FOR INSERT
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can delete their own simulations"
    ON investment_simulations FOR DELETE
    USING (auth.uid() = "userId");

-- Create RLS policies for investment_calculator_usage
CREATE POLICY "Users can view their own usage"
    ON investment_calculator_usage FOR SELECT
    USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own usage"
    ON investment_calculator_usage FOR INSERT
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own usage"
    ON investment_calculator_usage FOR UPDATE
    USING (auth.uid() = "userId");

-- Create a trigger to update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_investment_calculator_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER investment_calculator_usage_updated_at
    BEFORE UPDATE ON investment_calculator_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_investment_calculator_usage_updated_at();

-- Add comments to the tables
COMMENT ON TABLE investment_simulations IS 'Stores investment calculator simulation data for users';
COMMENT ON TABLE investment_calculator_usage IS 'Tracks monthly simulation usage for implementing free tier limits (2 simulations/month)';

