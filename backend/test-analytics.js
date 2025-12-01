#!/usr/bin/env node

/**
 * Analytics System Test Script
 * 
 * This script tests the analytics system end-to-end:
 * 1. Verifies database tables exist
 * 2. Tests session creation
 * 3. Tests event tracking
 * 4. Verifies data was inserted
 * 
 * Usage:
 *   node test-analytics.js
 */

const { supabaseAdmin } = require('./config');
const { logger } = require('./utils');

const TEST_SESSION_ID = `test-session-${Date.now()}`;
const TEST_USER_ID = null; // Test anonymous tracking

async function testAnalytics() {
    console.log('🧪 Testing Analytics System\n');
    console.log('=' .repeat(50));

    try {
        // Step 1: Check if tables exist
        console.log('\n📋 Step 1: Checking if analytics tables exist...');
        const tablesExist = await checkTablesExist();
        if (!tablesExist) {
            console.error('❌ Analytics tables do not exist!');
            console.log('\n💡 Solution: Run the migration SQL in Supabase SQL Editor');
            console.log('   File: backend/migrations/analytics-tables-migration.sql\n');
            process.exit(1);
        }
        console.log('✅ Analytics tables exist');

        // Step 2: Test session creation
        console.log('\n📋 Step 2: Testing session creation...');
        const session = await testSessionCreation();
        console.log('✅ Session created:', session.session_id);

        // Step 3: Test event tracking
        console.log('\n📋 Step 3: Testing event tracking...');
        await testEventTracking();
        console.log('✅ Events tracked successfully');

        // Step 4: Verify data was inserted
        console.log('\n📋 Step 4: Verifying data in database...');
        await verifyDataInserted();
        console.log('✅ Data verified in database');

        // Step 5: Test batch event tracking
        console.log('\n📋 Step 5: Testing batch event tracking...');
        await testBatchEventTracking();
        console.log('✅ Batch events tracked successfully');

        // Step 6: Cleanup test data
        console.log('\n📋 Step 6: Cleaning up test data...');
        await cleanupTestData();
        console.log('✅ Test data cleaned up');

        console.log('\n' + '='.repeat(50));
        console.log('🎉 All analytics tests passed!\n');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('\nError details:', error);
        process.exit(1);
    }
}

async function checkTablesExist() {
    try {
        const { data: sessions, error: sessionsError } = await supabaseAdmin
            .from('analytics_sessions')
            .select('id')
            .limit(1);

        const { data: events, error: eventsError } = await supabaseAdmin
            .from('analytics_events')
            .select('id')
            .limit(1);

        if (sessionsError || eventsError) {
            console.error('Table check errors:', { sessionsError, eventsError });
            return false;
        }

        return true;
    } catch (error) {
        console.error('Exception checking tables:', error);
        return false;
    }
}

async function testSessionCreation() {
    const sessionData = {
        session_id: TEST_SESSION_ID,
        user_id: TEST_USER_ID,
        started_at: new Date().toISOString(),
        device_type: 'desktop',
        browser: 'Chrome',
        os: 'macOS',
        subscription_tier: 'free',
        page_views: 0,
        events_count: 0
    };

    const { data, error } = await supabaseAdmin
        .from('analytics_sessions')
        .insert(sessionData)
        .select()
        .single();

    if (error) {
        console.error('Session creation error:', error);
        throw new Error(`Failed to create session: ${error.message}`);
    }

    return data;
}

async function testEventTracking() {
    const events = [
        {
            user_id: TEST_USER_ID,
            session_id: TEST_SESSION_ID,
            event_name: 'test_page_view',
            event_properties: { page: '/test' },
            page_url: 'http://localhost:3000/test',
            page_title: 'Test Page',
            device_type: 'desktop',
            browser: 'Chrome',
            os: 'macOS',
            subscription_tier: 'free',
            timestamp: new Date().toISOString()
        },
        {
            user_id: TEST_USER_ID,
            session_id: TEST_SESSION_ID,
            event_name: 'test_button_click',
            event_properties: { button: 'test_button' },
            device_type: 'desktop',
            browser: 'Chrome',
            os: 'macOS',
            subscription_tier: 'free',
            timestamp: new Date().toISOString()
        }
    ];

    const { data, error } = await supabaseAdmin
        .from('analytics_events')
        .insert(events)
        .select();

    if (error) {
        console.error('Event tracking error:', error);
        throw new Error(`Failed to track events: ${error.message}`);
    }

    console.log(`   Inserted ${data.length} events`);
    return data;
}

async function testBatchEventTracking() {
    const batchEvents = Array.from({ length: 10 }, (_, i) => ({
        user_id: TEST_USER_ID,
        session_id: TEST_SESSION_ID,
        event_name: `test_batch_event_${i}`,
        event_properties: { index: i },
        device_type: 'desktop',
        browser: 'Chrome',
        os: 'macOS',
        subscription_tier: 'free',
        timestamp: new Date().toISOString()
    }));

    const { data, error } = await supabaseAdmin
        .from('analytics_events')
        .insert(batchEvents)
        .select();

    if (error) {
        console.error('Batch event tracking error:', error);
        throw new Error(`Failed to track batch events: ${error.message}`);
    }

    console.log(`   Inserted ${data.length} batch events`);
    return data;
}

async function verifyDataInserted() {
    // Check session
    const { data: session, error: sessionError } = await supabaseAdmin
        .from('analytics_sessions')
        .select('*')
        .eq('session_id', TEST_SESSION_ID)
        .single();

    if (sessionError || !session) {
        throw new Error('Session not found in database');
    }

    console.log('   Session found:', {
        id: session.id,
        session_id: session.session_id,
        created_at: session.created_at
    });

    // Check events
    const { data: events, error: eventsError } = await supabaseAdmin
        .from('analytics_events')
        .select('*')
        .eq('session_id', TEST_SESSION_ID);

    if (eventsError) {
        throw new Error(`Failed to query events: ${eventsError.message}`);
    }

    console.log(`   Found ${events.length} events for session`);

    // Verify event types
    const eventNames = events.map(e => e.event_name);
    console.log('   Event types:', [...new Set(eventNames)].join(', '));

    return { session, events };
}

async function cleanupTestData() {
    // Delete test events
    const { error: eventsError } = await supabaseAdmin
        .from('analytics_events')
        .delete()
        .eq('session_id', TEST_SESSION_ID);

    if (eventsError) {
        console.warn('   Warning: Failed to delete test events:', eventsError.message);
    }

    // Delete test session
    const { error: sessionError } = await supabaseAdmin
        .from('analytics_sessions')
        .delete()
        .eq('session_id', TEST_SESSION_ID);

    if (sessionError) {
        console.warn('   Warning: Failed to delete test session:', sessionError.message);
    }
}

// Run tests
testAnalytics().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});





