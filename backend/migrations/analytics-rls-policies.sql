-- Analytics Tables RLS Policies
-- This file configures Row Level Security policies for analytics tables
-- Run this in Supabase SQL Editor after creating the analytics tables

-- ============================================
-- ENABLE RLS ON ANALYTICS TABLES
-- ============================================

ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP EXISTING POLICIES (if any)
-- ============================================

DROP POLICY IF EXISTS "Service role can do everything on analytics_sessions" ON analytics_sessions;
DROP POLICY IF EXISTS "Service role can do everything on analytics_events" ON analytics_events;
DROP POLICY IF EXISTS "Users can insert their own analytics sessions" ON analytics_sessions;
DROP POLICY IF EXISTS "Users can insert their own analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Anonymous users can insert analytics sessions" ON analytics_sessions;
DROP POLICY IF EXISTS "Anonymous users can insert analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Admins can read all analytics sessions" ON analytics_sessions;
DROP POLICY IF EXISTS "Admins can read all analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Users can update their own sessions" ON analytics_sessions;

-- ============================================
-- SERVICE ROLE POLICIES (Backend API)
-- ============================================

-- Service role can do everything (for backend operations)
CREATE POLICY "Service role can do everything on analytics_sessions"
ON analytics_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can do everything on analytics_events"
ON analytics_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- AUTHENTICATED USER POLICIES
-- ============================================

-- Authenticated users can insert their own analytics sessions
CREATE POLICY "Users can insert their own analytics sessions"
ON analytics_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Authenticated users can insert their own analytics events
CREATE POLICY "Users can insert their own analytics events"
ON analytics_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Authenticated users can update their own sessions (for session end)
CREATE POLICY "Users can update their own sessions"
ON analytics_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================
-- ANONYMOUS USER POLICIES
-- ============================================

-- Anonymous users can insert analytics sessions (for tracking before login)
CREATE POLICY "Anonymous users can insert analytics sessions"
ON analytics_sessions
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Anonymous users can insert analytics events (for tracking before login)
CREATE POLICY "Anonymous users can insert analytics events"
ON analytics_events
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- ============================================
-- ADMIN READ POLICIES
-- ============================================

-- Admin users can read all analytics sessions
CREATE POLICY "Admins can read all analytics sessions"
ON analytics_sessions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Admin users can read all analytics events
CREATE POLICY "Admins can read all analytics events"
ON analytics_events
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these queries to verify the policies were created:

-- Check policies on analytics_sessions
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'analytics_sessions'
ORDER BY policyname;

-- Check policies on analytics_events
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'analytics_events'
ORDER BY policyname;

-- Test insert as service role (should work)
-- This will be done by the backend API

-- Test insert as anonymous (should work with user_id = NULL)
-- This will be tested via the API endpoint

-- ============================================
-- NOTES
-- ============================================

/*
IMPORTANT NOTES:

1. Service Role Key:
   - The backend MUST use the service role key (not anon key) for analytics operations
   - This is configured in backend/config/supabase.js as `supabaseAdmin`

2. Anonymous Tracking:
   - Anonymous users can only insert records with user_id = NULL
   - Once a user logs in, their session should be updated with their user_id

3. Admin Access:
   - Only users with role = 'admin' in the profiles table can read analytics data
   - This is enforced at the database level

4. Testing:
   - Use backend/test-analytics.js to test the analytics system
   - Check the backend logs for any RLS policy violations

5. Troubleshooting:
   - If inserts fail with "new row violates row-level security policy"
     → Check that the backend is using supabaseAdmin (service role)
   - If anonymous inserts fail
     → Verify user_id is NULL for anonymous events
   - If admin queries return empty
     → Check the user has role = 'admin' in profiles table
*/

