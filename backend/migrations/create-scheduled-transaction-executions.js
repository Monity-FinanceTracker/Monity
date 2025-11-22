/**
 * Scheduled Transaction Executions Table Migration
 *
 * Creates table for tracking executions of scheduled transactions
 * to prevent duplicates
 *
 * Usage:
 *   node migrations/create-scheduled-transaction-executions.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    console.log('🔧 Scheduled Transaction Executions Table Migration');
    console.log('===================================================\n');

    // Create Supabase admin client
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    try {
        console.log('📋 Reading SQL migration file...\n');

        // Read the SQL file
        const sqlPath = path.join(__dirname, 'create-scheduled-transaction-executions-table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🔨 Executing migration...\n');

        // Execute the SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
            // If exec_sql function doesn't exist, try direct execution
            // Split by semicolon and execute each statement
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

            for (const statement of statements) {
                const { error: stmtError } = await supabase.rpc('exec', { query: statement });
                if (stmtError) {
                    throw stmtError;
                }
            }

            return { data: null, error: null };
        });

        if (error) {
            // Try alternative: use raw SQL execution via from() with a dummy select
            console.log('⚠️  RPC method failed, trying alternative approach...\n');

            // For Supabase, we need to execute SQL via PostgreSQL connection
            // Since we can't execute raw SQL directly via the JS client, we'll log instructions
            console.log('📝 Please run the following SQL file manually in your Supabase SQL editor:');
            console.log(`   File: ${sqlPath}`);
            console.log('\nOr run via psql:');
            console.log(`   psql $DATABASE_URL -f ${sqlPath}`);

            throw error;
        }

        console.log('✅ Table created successfully!');
        console.log('   - scheduled_transaction_executions table');
        console.log('   - Indexes created');
        console.log('   - RLS policies enabled');
        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('\n💥 Migration failed:', error.message);
        console.log('\n📝 Manual migration required:');
        console.log('   1. Open Supabase SQL Editor');
        console.log('   2. Copy and paste the contents of:');
        console.log('      migrations/create-scheduled-transaction-executions-table.sql');
        console.log('   3. Execute the SQL\n');
        process.exit(1);
    }
}

// Run migration
runMigration();
