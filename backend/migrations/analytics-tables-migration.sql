-- Analytics Tables Migration
-- Generated: 2025-11-18T11:10:53.137Z

-- 1. Create analytics_sessions table

            CREATE TABLE IF NOT EXISTS analytics_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                session_id TEXT NOT NULL UNIQUE,
                started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                ended_at TIMESTAMPTZ,
                duration_seconds INTEGER,
                page_views INTEGER DEFAULT 0,
                events_count INTEGER DEFAULT 0,
                device_type TEXT,
                browser TEXT,
                os TEXT,
                country TEXT,
                user_agent TEXT,
                ip_hash TEXT,
                subscription_tier TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        

-- 2. Create analytics_events table

            CREATE TABLE IF NOT EXISTS analytics_events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                session_id TEXT,
                event_name TEXT NOT NULL,
                event_properties JSONB DEFAULT '{}'::jsonb,
                page_url TEXT,
                page_title TEXT,
                referrer TEXT,
                timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                device_type TEXT,
                browser TEXT,
                os TEXT,
                country TEXT,
                user_agent TEXT,
                subscription_tier TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        

-- 3. Create indexes

            -- Sessions indexes
            CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id
                ON analytics_sessions(user_id);
            CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id
                ON analytics_sessions(session_id);
            CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at
                ON analytics_sessions(started_at DESC);
            CREATE INDEX IF NOT EXISTS idx_analytics_sessions_subscription_tier
                ON analytics_sessions(subscription_tier);

            -- Events indexes
            CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id
                ON analytics_events(user_id);
            CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id
                ON analytics_events(session_id);
            CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name
                ON analytics_events(event_name);
            CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp
                ON analytics_events(timestamp DESC);
            CREATE INDEX IF NOT EXISTS idx_analytics_events_subscription_tier
                ON analytics_events(subscription_tier);
            CREATE INDEX IF NOT EXISTS idx_analytics_events_properties
                ON analytics_events USING GIN (event_properties);

            -- Composite index for common queries
            CREATE INDEX IF NOT EXISTS idx_analytics_events_user_event_time
                ON analytics_events(user_id, event_name, timestamp DESC);
        

-- 4. Create trigger function

            CREATE OR REPLACE FUNCTION update_analytics_sessions_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        

-- 5. Create trigger

            DROP TRIGGER IF EXISTS trigger_analytics_sessions_updated_at
                ON analytics_sessions;

            CREATE TRIGGER trigger_analytics_sessions_updated_at
                BEFORE UPDATE ON analytics_sessions
                FOR EACH ROW
                EXECUTE FUNCTION update_analytics_sessions_updated_at();
        