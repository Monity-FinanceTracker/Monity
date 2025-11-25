-- ============================================
-- COMPLETE MIGRATION: Invitation Link System
-- ============================================
-- Execute this ONE SQL file in Supabase SQL Editor
-- This migration:
-- 1. Adds invitation_token and expires_at columns
-- 2. Allows invited_user to be NULL (for link-based invitations)
-- 3. Updates RLS policies to support link-based invitations
-- ============================================

-- STEP 1: Add invitation link fields
-- Add invitation_token column (UUID, unique, nullable for backward compatibility)
ALTER TABLE group_invitations 
ADD COLUMN IF NOT EXISTS invitation_token UUID UNIQUE;

-- Add expires_at column (timestamp with time zone)
ALTER TABLE group_invitations 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_invitations_token ON group_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_group_invitations_expires_at ON group_invitations(expires_at);

-- STEP 2: Allow invited_user to be NULL (required for link-based invitations)
ALTER TABLE group_invitations 
ALTER COLUMN invited_user DROP NOT NULL;

-- STEP 3: Update RLS policies to support link-based invitations
-- Drop all existing policies first to avoid conflicts
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'group_invitations') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON group_invitations';
    END LOOP;
END $$;

-- INSERT policy: Allow authenticated users to create invitations
-- Backend validates group membership to avoid recursion
-- Allows invited_user to be null (for link-based invitations)
CREATE POLICY "Authenticated users can create invitations"
    ON group_invitations FOR INSERT
    TO authenticated
    WITH CHECK (invited_by = auth.uid());

-- SELECT policy: Allow users to see invitations sent to them or created by them
-- Also allow public viewing of link-based invitations (invited_user IS NULL)
CREATE POLICY "Users can view relevant invitations"
    ON group_invitations FOR SELECT
    USING (
        (invited_user = auth.uid())  -- Invitations sent to them
        OR
        (invited_by = auth.uid())    -- Invitations they created
        OR
        (invited_user IS NULL)       -- Link-based invitations (public)
    );

-- UPDATE policy: Allow users to update invitations they created
CREATE POLICY "Users can update invitations they created"
    ON group_invitations FOR UPDATE
    TO authenticated
    USING (invited_by = auth.uid())
    WITH CHECK (invited_by = auth.uid());

-- UPDATE policy: Allow invited users to accept/decline invitations
CREATE POLICY "Invited users can update status"
    ON group_invitations FOR UPDATE
    TO authenticated
    USING (invited_user = auth.uid() AND status = 'pending')
    WITH CHECK (invited_user = auth.uid() AND status IN ('accepted', 'declined', 'pending'));

-- UPDATE policy: Allow authenticated users to accept link-based invitations
-- This updates invited_user from NULL to the accepting user's ID
CREATE POLICY "Users can accept link invitations"
    ON group_invitations FOR UPDATE
    TO authenticated
    USING (invited_user IS NULL AND status = 'pending')
    WITH CHECK (invited_user = auth.uid() AND status = 'accepted');

-- Add comments to explain the fields
COMMENT ON COLUMN group_invitations.invitation_token IS 'Unique token for link-based invitations';
COMMENT ON COLUMN group_invitations.expires_at IS 'Expiration date for the invitation link';
COMMENT ON COLUMN group_invitations.invited_user IS 'User ID for direct invitations, NULL for link-based invitations that can be used by anyone';

