-- Add invitation link fields to group_invitations table
-- This migration adds support for link-based invitations

-- Add invitation_token column (UUID, unique, nullable for backward compatibility)
ALTER TABLE group_invitations 
ADD COLUMN IF NOT EXISTS invitation_token UUID UNIQUE;

-- Add expires_at column (timestamp with time zone)
ALTER TABLE group_invitations 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create index on invitation_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_group_invitations_token ON group_invitations(invitation_token);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_group_invitations_expires_at ON group_invitations(expires_at);

-- Add comment to explain the fields
COMMENT ON COLUMN group_invitations.invitation_token IS 'Unique token for link-based invitations';
COMMENT ON COLUMN group_invitations.expires_at IS 'Expiration date for the invitation link';

