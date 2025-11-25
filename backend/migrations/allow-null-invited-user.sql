-- Allow invited_user to be NULL for link-based invitations
-- This allows creating invitations with null invited_user (link-based invitations)

-- Alter the column to allow NULL values
ALTER TABLE group_invitations 
ALTER COLUMN invited_user DROP NOT NULL;

-- Add a comment explaining why null is allowed
COMMENT ON COLUMN group_invitations.invited_user IS 'User ID for direct invitations, NULL for link-based invitations that can be used by anyone';

