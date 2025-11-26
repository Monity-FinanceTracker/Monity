-- Update RLS policies for group_invitations table (SIMPLE VERSION)
-- This allows link-based invitations where invited_user can be null
-- Avoids recursion by not checking group_members table in policies

-- Drop all existing policies first
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

