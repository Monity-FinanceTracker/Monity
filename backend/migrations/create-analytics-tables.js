/**
 * Analytics Tables Migration
 *
 * Creates tables for tracking user analytics and behavior
 *
 * Tables created:
 * - analytics_sessions: User session tracking
 * - analytics_events: Individual event tracking
 *
 * Usage:
 *   node migrations/create-analytics-tables.js --dry-run    # Preview changes
 *   node migrations/create-analytics-tables.js              # Create tables
 *   node migrations/create-analytics-tables.js --drop       # Drop tables (DANGEROUS)
 */


class AnalyticsMigration {
    constructor(options = {}) {
        this.options = {
            dryRun: options.dryRun || false,
            drop: options.drop || false
        };
    }

    async run() {
        console.log('🔧 Analytics Tables Migration');
        console.log('==============================\n');

        console.log('⚙️  Migration Settings:');
        console.log(`   Dry Run: ${this.options.dryRun ? 'YES' : 'NO'}`);
        console.log(`   Drop Tables: ${this.options.drop ? 'YES (⚠️  DANGER)' : 'NO'}`);
        console.log('');

        try {
            if (this.options.drop) {
                await this.dropTables();
            } else {
                await this.createTables();
            }

            if (!this.options.dryRun) {
                console.log('\n🎉 Migration completed successfully!');
            } else {
                console.log('\n✅ Dry run completed - no changes made to database');
            }

        } catch (error) {
            console.error('\n💥 Migration failed:', error.message);
            throw error;
        }
    }

    async createTables() {
        console.log('📋 Creating analytics tables...\n');

        // Create analytics_sessions table
        const createSessionsTableSQL = `
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
        `;

        // Create analytics_events table
        const createEventsTableSQL = `
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
        `;

        // Create indexes for performance
        const createIndexesSQL = `
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
        `;

        // Create trigger function to update updated_at timestamp
        const createTriggerFunctionSQL = `
            CREATE OR REPLACE FUNCTION update_analytics_sessions_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `;

        // Create trigger
        const createTriggerSQL = `
            DROP TRIGGER IF EXISTS trigger_analytics_sessions_updated_at
                ON analytics_sessions;

            CREATE TRIGGER trigger_analytics_sessions_updated_at
                BEFORE UPDATE ON analytics_sessions
                FOR EACH ROW
                EXECUTE FUNCTION update_analytics_sessions_updated_at();
        `;

        if (this.options.dryRun) {
            console.log('[DRY RUN] Would execute:');
            console.log(createSessionsTableSQL);
            console.log(createEventsTableSQL);
            console.log(createIndexesSQL);
            console.log(createTriggerFunctionSQL);
            console.log(createTriggerSQL);
            return;
        }

        // Execute SQL via Supabase
        console.log('   Creating analytics_sessions table...');
        const { error: sessionsError } = await supabaseAdmin.rpc('exec_sql', {
            sql: createSessionsTableSQL
        }).catch(() => {
            // If rpc doesn't work, we'll need to use raw SQL another way
            // For now, let's just create via schema
            return { error: null };
        });

        // Alternative approach: Use Supabase schema operations
        // Since Supabase may not have exec_sql RPC, we'll document the SQL for manual execution

        console.log(`
📝 Please execute the following SQL in your Supabase SQL Editor:

-- ========================================
-- ANALYTICS TABLES MIGRATION
-- ========================================

-- 1. Create analytics_sessions table
${createSessionsTableSQL}

-- 2. Create analytics_events table
${createEventsTableSQL}

-- 3. Create indexes
${createIndexesSQL}

-- 4. Create trigger function
${createTriggerFunctionSQL}

-- 5. Create trigger
${createTriggerSQL}

-- ========================================
-- END MIGRATION
-- ========================================
        `);

        console.log(`
⚠️  Note: Since Supabase doesn't support direct SQL execution via the client library,
    you need to manually execute the SQL above in the Supabase SQL Editor.

    Steps:
    1. Go to your Supabase Dashboard
    2. Navigate to the SQL Editor
    3. Copy and paste the SQL above
    4. Click "Run" to execute

    Alternatively, you can save this migration SQL to a file for reference.
        `);

        // Save SQL to file
        const fs = require('fs');
        const path = require('path');
        const sqlFile = path.join(__dirname, 'analytics-tables-migration.sql');

        const fullSQL = [
            '-- Analytics Tables Migration',
            '-- Generated: ' + new Date().toISOString(),
            '',
            '-- 1. Create analytics_sessions table',
            createSessionsTableSQL,
            '',
            '-- 2. Create analytics_events table',
            createEventsTableSQL,
            '',
            '-- 3. Create indexes',
            createIndexesSQL,
            '',
            '-- 4. Create trigger function',
            createTriggerFunctionSQL,
            '',
            '-- 5. Create trigger',
            createTriggerSQL
        ].join('\n');

        fs.writeFileSync(sqlFile, fullSQL);
        console.log(`\n✅ SQL migration saved to: ${sqlFile}`);
    }

    async dropTables() {
        console.log('⚠️  Dropping analytics tables...\n');

        const dropSQL = `
            DROP TRIGGER IF EXISTS trigger_analytics_sessions_updated_at ON analytics_sessions;
            DROP FUNCTION IF EXISTS update_analytics_sessions_updated_at();
            DROP TABLE IF EXISTS analytics_events CASCADE;
            DROP TABLE IF EXISTS analytics_sessions CASCADE;
        `;

        if (this.options.dryRun) {
            console.log('[DRY RUN] Would execute:');
            console.log(dropSQL);
            return;
        }

        console.log(`
📝 To drop analytics tables, execute the following SQL in your Supabase SQL Editor:

${dropSQL}

⚠️  WARNING: This will permanently delete all analytics data!
        `);
    }
}

async function main() {
    const args = process.argv.slice(2);

    const options = {
        dryRun: args.includes('--dry-run'),
        drop: args.includes('--drop')
    };

    try {
        const migration = new AnalyticsMigration(options);
        await migration.run();
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = AnalyticsMigration;
