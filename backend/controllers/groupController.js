const Group = require('../models/Group');
const { logger } = require('../utils/logger');
const { getAuthenticatedSupabaseClient } = require('../utils/supabaseClient');
const { supabaseAdmin } = require('../config/supabase');

class GroupController {
    constructor(supabase) {
        this.supabase = supabase;
        this.groupModel = new Group(supabase);
    }

    /**
     * Get authenticated Supabase client for RLS policies
     * Uses user token if available, otherwise falls back to admin client
     */
    getAuthenticatedClient(req) {
        if (req.token) {
            try {
                return getAuthenticatedSupabaseClient(req.token);
            } catch (error) {
                logger.warn('Failed to create authenticated client, using admin client', { error: error.message });
                // Fallback to admin client if token is invalid
                return supabaseAdmin;
            }
        }
        // If no token, use admin client (RLS will be bypassed)
        // Note: Using admin client bypasses RLS, but backend validation ensures only group members can invite
        return supabaseAdmin;
    }

    async getAllGroups(req, res) {
        const userId = req.user.id;
        try {
            const groups = await this.groupModel.findByUser(userId);
            logger.info('Retrieved groups for user', { userId, groupCount: groups.length, groupIds: groups.map(g => g.id) });
            res.json(groups);
        } catch (error) {
            logger.error('Failed to get groups for user', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to fetch groups' });
        }
    }

    async getGroupById(req, res) {
        const userId = req.user.id;
        const groupId = req.params.id;
        
        logger.info('Attempting to get group by ID', { userId, groupId });
        
        try {
            const group = await this.groupModel.getById(groupId, userId);
            if (!group) {
                logger.warn('Group not found or user not a member', { userId, groupId });
                return res.status(404).json({ error: 'Group not found or you are not a member.' });
            }
            
            logger.info('Successfully retrieved group', { userId, groupId, memberCount: group.group_members?.length || 0 });
            res.json(group);
        } catch (error) {
            logger.error('Failed to get group by ID', { userId, groupId, error: error.message, stack: error.stack });
            res.status(500).json({ error: 'Failed to fetch group' });
        }
    }

    async createGroup(req, res) {
        const userId = req.user.id;
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Group name is required' });
        }

        try {
            const newGroup = await this.groupModel.create({ name, created_by: userId });
            res.status(201).json(newGroup);
        } catch (error) {
            logger.error('Failed to create group', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to create group' });
        }
    }

    async updateGroup(req, res) {
        const userId = req.user.id;
        const groupId = req.params.id;
        const { name } = req.body;

        try {
            const updatedGroup = await this.groupModel.update(groupId, userId, { name });
            if (!updatedGroup) {
                return res.status(404).json({ error: 'Group not found or you do not have permission to update it.' });
            }
            res.json(updatedGroup);
        } catch (error) {
            logger.error('Failed to update group', { userId, groupId, error: error.message });
            res.status(500).json({ error: 'Failed to update group' });
        }
    }

    async deleteGroup(req, res) {
        const userId = req.user.id;
        const groupId = req.params.id;

        try {
            const deletedGroup = await this.groupModel.delete(groupId, userId);
            if (!deletedGroup) {
                return res.status(404).json({ error: 'Group not found or you do not have permission to delete it.' });
            }
            res.json({ message: 'Group deleted successfully' });
        } catch (error) {
            logger.error('Failed to delete group', { userId, groupId, error: error.message });
            res.status(500).json({ error: 'Failed to delete group' });
        }
    }

    async addUserToGroup(req, res) {
        const groupId = req.params.id;
        const { userId: userToAdd } = req.body;
        const requesterId = req.user.id;

        try {
            // Check if the requester is a member of the group
            const isMember = await this.groupModel.isUserMember(groupId, requesterId);
            if (!isMember) {
                return res.status(403).json({ error: 'You must be a member of the group to add users.' });
            }

            const member = await this.groupModel.addMember(groupId, userToAdd);
            res.status(201).json(member);
        } catch (error) {
            logger.error('Failed to add user to group', { requesterId, groupId, userToAdd, error: error.message });
            if (error.code === '23505') { // Unique constraint violation
                return res.status(409).json({ error: 'User is already a member of this group.' });
            }
            res.status(500).json({ error: 'Failed to add user to group' });
        }
    }

    async addGroupMember(req, res) {
        const groupId = req.params.id;
        const { name } = req.body;
        const userId = req.user.id;

        try {
            // Check if the requester is a member of the group
            const isMember = await this.groupModel.isUserMember(groupId, userId);
            if (!isMember) {
                return res.status(403).json({ error: 'You must be a member of the group to add members.' });
            }

            // For now, we'll create a simple member entry
            // In a more complex system, you might want to create user accounts or send invitations
            const member = await this.groupModel.addMember(groupId, name);
            res.status(201).json(member);
        } catch (error) {
            logger.error('Failed to add group member', { userId, groupId, name, error: error.message });
            res.status(500).json({ error: 'Failed to add group member' });
        }
    }

    async removeGroupMember(req, res) {
        const groupId = req.params.id;
        const { userId: userToRemove } = req.params;
        const requesterId = req.user.id;

        try {
            // Check if the requester is a member of the group
            const isMember = await this.groupModel.isUserMember(groupId, requesterId);
            if (!isMember) {
                return res.status(403).json({ error: 'You must be a member of the group to remove members.' });
            }

            await this.groupModel.removeMember(groupId, userToRemove);
            res.json({ message: 'Member removed successfully' });
        } catch (error) {
            logger.error('Failed to remove group member', { requesterId, groupId, userToRemove, error: error.message });
            res.status(500).json({ error: 'Failed to remove group member' });
        }
    }

    async sendGroupInvitation(req, res) {
        const groupId = req.params.id;
        const userId = req.user.id;

        try {
            logger.info('Generating group invitation link', { 
                userId, 
                groupId,
                timestamp: new Date().toISOString()
            });

            // Check if the requester is a member of the group
            const isMember = await this.groupModel.isUserMember(groupId, userId);
            if (!isMember) {
                logger.warn('User attempted to generate invitation but is not a group member', { 
                    userId, 
                    groupId 
                });
                return res.status(403).json({ error: 'You must be a member of the group to send invitations.' });
            }

            logger.debug('User is a group member, proceeding with invitation generation', { userId, groupId });

            // Generate unique invitation token (UUID v4)
            const crypto = require('crypto');
            const invitationToken = crypto.randomUUID();

            // Calculate expiration date (7 days from now)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            logger.debug('Generated invitation token and expiration', { 
                userId, 
                groupId, 
                tokenLength: invitationToken.length,
                expiresAt: expiresAt.toISOString()
            });

            // Get authenticated Supabase client for RLS policies
            // This ensures auth.uid() works correctly in RLS policies
            const authenticatedClient = this.getAuthenticatedClient(req);

            // Create invitation record with token and expiration
            const { data: invitation, error: invitationError } = await authenticatedClient
                .from('group_invitations')
                .insert({
                    group_id: groupId,
                    invited_by: userId,
                    invited_user: null, // Link-based invitations don't require a specific user
                    status: 'pending',
                    invitation_token: invitationToken,
                    expires_at: expiresAt.toISOString(),
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (invitationError) {
                logger.error('Database error while creating invitation record', { 
                    userId, 
                    groupId, 
                    error: invitationError.message,
                    errorCode: invitationError.code,
                    errorDetails: invitationError.details
                });
                throw invitationError;
            }

            logger.debug('Invitation record created successfully', { 
                userId, 
                groupId, 
                invitationId: invitation.id 
            });

            // Build invitation link
            const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? 'https://app.monity-finance.com' : 'http://localhost:5173');
            const invitationLink = `${frontendUrl}/groups/invite/${invitationToken}`;
            
            logger.info('Group invitation link generated successfully', { 
                userId, 
                groupId, 
                invitationId: invitation.id,
                invitationToken: invitationToken.substring(0, 8) + '...', // Log apenas parte do token por segurança
                expiresAt: expiresAt.toISOString(),
                frontendUrl
            });
            
            res.json({ 
                message: 'Invitation link generated successfully', 
                invitationId: invitation.id,
                invitationToken: invitationToken,
                invitationLink: invitationLink,
                expiresAt: expiresAt.toISOString()
            });
        } catch (error) {
            // Check if it's a schema error (migration not run)
            const errorMessage = error.message || '';
            const isSchemaError = errorMessage.includes('expires_at') || 
                                 errorMessage.includes('invitation_token') ||
                                 errorMessage.includes('column') && (errorMessage.includes('expires_at') || errorMessage.includes('invitation_token')) ||
                                 errorMessage.includes('schema cache');
            
            if (isSchemaError) {
                logger.error('Database schema error - migration required', { 
                    userId, 
                    groupId, 
                    error: error.message,
                    errorCode: error.code,
                    errorDetails: error.details,
                    hint: error.hint
                });
                return res.status(500).json({ 
                    error: 'Database migration required. The invitation_token and expires_at columns do not exist in the group_invitations table.',
                    code: 'MIGRATION_REQUIRED',
                    migrationRequired: true,
                    instructions: 'Please run the migration SQL in Supabase SQL Editor to add the required columns.',
                    migrationSQL: `-- Run this SQL in Supabase SQL Editor:
-- 1. Go to https://app.supabase.com
-- 2. Select your project
-- 3. Open "SQL Editor"
-- 4. Copy and execute the following:

ALTER TABLE group_invitations 
ADD COLUMN IF NOT EXISTS invitation_token UUID UNIQUE;

ALTER TABLE group_invitations 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_group_invitations_token ON group_invitations(invitation_token);

CREATE INDEX IF NOT EXISTS idx_group_invitations_expires_at ON group_invitations(expires_at);`
                });
            }
            
            logger.error('Failed to generate group invitation link', { 
                userId, 
                groupId, 
                error: error.message,
                errorCode: error.code,
                errorDetails: error.details,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            
            res.status(500).json({ 
                error: 'Failed to generate invitation link',
                details: error.message || 'Unknown error occurred'
            });
        }
    }

    async addGroupExpense(req, res) {
        const groupId = req.params.id;
        const userId = req.user.id;
        const expenseData = req.body;

        try {
            // Check if the requester is a member of the group
            const isMember = await this.groupModel.isUserMember(groupId, userId);
            if (!isMember) {
                return res.status(403).json({ error: 'You must be a member of the group to add expenses.' });
            }

            const expense = await this.groupModel.addExpense(groupId, userId, expenseData);
            res.status(201).json(expense);
        } catch (error) {
            logger.error('Failed to add group expense', { userId, groupId, error: error.message });
            res.status(500).json({ error: 'Failed to add group expense' });
        }
    }

    async updateGroupExpense(req, res) {
        const { expenseId } = req.params;
        const userId = req.user.id;
        const updates = req.body;

        try {
            const expense = await this.groupModel.updateExpense(expenseId, updates);
            res.json(expense);
        } catch (error) {
            logger.error('Failed to update group expense', { userId, expenseId, error: error.message });
            res.status(500).json({ error: 'Failed to update group expense' });
        }
    }

    async deleteGroupExpense(req, res) {
        const { expenseId } = req.params;
        const userId = req.user.id;

        try {
            await this.groupModel.deleteExpense(expenseId);
            res.json({ message: 'Expense deleted successfully' });
        } catch (error) {
            logger.error('Failed to delete group expense', { userId, expenseId, error: error.message });
            res.status(500).json({ error: 'Failed to delete group expense' });
        }
    }

    async settleExpenseShare(req, res) {
        const { shareId } = req.params;
        const userId = req.user.id;

        try {
            const share = await this.groupModel.settleShare(shareId, userId);
            res.json(share);
        } catch (error) {
            logger.error('Failed to settle expense share', { userId, shareId, error: error.message });
            res.status(500).json({ error: 'Failed to settle expense share' });
        }
    }
}

module.exports = GroupController;
