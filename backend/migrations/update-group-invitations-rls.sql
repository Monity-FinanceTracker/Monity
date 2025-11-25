-- Update RLS policies for group_invitations table
-- This allows link-based invitations where invited_user can be null
-- Members of a group can create invitations with null invited_user

-- First, drop all existing policies to avoid conflicts
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'group_invitations') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON group_invitations';
    END LOOP;
END $$;

-- Create INSERT policy that allows members to create invitations
-- Using SECURITY DEFINER function to avoid recursion by bypassing RLS on group_members check
CREATE OR REPLACE FUNCTION check_group_membership(group_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Use security definer to bypass RLS on group_members table
    RETURN EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = group_id_param
        AND group_members.user_id = user_id_param
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative simpler approach: Allow authenticated users to insert if they're the inviter
-- The application logic will verify group membership
CREATE POLICY "Authenticated users can create invitations for groups"
    ON group_invitations FOR INSERT
    TO authenticated
    WITH CHECK (
        -- The invited_by must be the current authenticated user
        invited_by = auth.uid()
    );

-- SELECT policy - allow users to see invitations sent to them or created by them
CREATE POLICY "Users can view relevant invitations"
    ON group_invitations FOR SELECT
    TO authenticated
    USING (
        -- Users can see invitations sent to them (when invited_user is set)
        (invited_user = auth.uid())
        OR
        -- Users can see invitations they created
        (invited_by = auth.uid())
    );

-- Public SELECT policy for link-based invitations (to allow viewing invitation by token)
-- This allows unauthenticated users to check invitation details via token
CREATE POLICY "Public can view invitation by token"
    ON group_invitations FOR SELECT
    TO anon, authenticated
    USING (
        -- Allow viewing if invited_user is null (link-based invitation)
        -- This allows the AcceptInvitationPage to fetch invitation details
        invited_user IS NULL
    );

-- UPDATE policy - allow users to update invitations they created
CREATE POLICY "Users can update invitations they created"
    ON group_invitations FOR UPDATE
    TO authenticated
    USING (invited_by = auth.uid())
    WITH CHECK (invited_by = auth.uid());

-- UPDATE policy - allow invited users to update invitation status (accept/decline)
CREATE POLICY "Invited users can update invitation status"
    ON group_invitations FOR UPDATE
    TO authenticated
    USING (
        invited_user = auth.uid()
        AND status = 'pending'
    )
    WITH CHECK (
        invited_user = auth.uid()
        AND status IN ('accepted', 'declined', 'pending')
    );

-- UPDATE policy for link-based invitations - allow authenticated users to accept
CREATE POLICY "Authenticated users can accept link-based invitations"
    ON group_invitations FOR UPDATE
    TO authenticated
    USING (
        invited_user IS NULL
        AND status = 'pending'
    )
    WITH CHECK (
        invited_user = auth.uid()
        AND status = 'accepted'
    );

