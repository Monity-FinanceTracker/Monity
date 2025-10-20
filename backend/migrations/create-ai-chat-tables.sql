-- Create AI chat tables for the AI Financial Assistant feature
-- These tables store chat messages and track daily usage limits

-- Table for storing chat messages
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking daily usage
CREATE TABLE IF NOT EXISTS ai_chat_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    message_count INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("userId", date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_user ON ai_chat_messages("userId");
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_created ON ai_chat_messages("createdAt");
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_user_created ON ai_chat_messages("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_usage_user_date ON ai_chat_usage("userId", date);

-- Enable Row Level Security
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_chat_messages
CREATE POLICY "Users can view their own chat messages"
    ON ai_chat_messages FOR SELECT
    USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own chat messages"
    ON ai_chat_messages FOR INSERT
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can delete their own chat messages"
    ON ai_chat_messages FOR DELETE
    USING (auth.uid() = "userId");

-- Create RLS policies for ai_chat_usage
CREATE POLICY "Users can view their own usage"
    ON ai_chat_usage FOR SELECT
    USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own usage"
    ON ai_chat_usage FOR INSERT
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own usage"
    ON ai_chat_usage FOR UPDATE
    USING (auth.uid() = "userId");

-- Create a trigger to update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_ai_chat_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_chat_usage_updated_at
    BEFORE UPDATE ON ai_chat_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_chat_usage_updated_at();

-- Add comments to the tables
COMMENT ON TABLE ai_chat_messages IS 'Stores AI chat conversation history between users and the financial assistant';
COMMENT ON TABLE ai_chat_usage IS 'Tracks daily message usage for implementing free tier limits (3 messages/day)';
