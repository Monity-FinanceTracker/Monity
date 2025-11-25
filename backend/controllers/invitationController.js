const { logger } = require('../utils/logger');
const { getAuthenticatedSupabaseClient } = require('../utils/supabaseClient');
const { supabaseAdmin } = require('../config/supabase');

class InvitationController {
    constructor(supabase) {
        this.supabase = supabase;
        // In the future, a model would be initialized here:
        // this.invitationModel = new Invitation(supabase);
    }

    /**
     * Get authenticated Supabase client for RLS policies
     * Uses user token if available, otherwise uses default client
     */
    getAuthenticatedClient(req) {
        if (req.token && req.user) {
            try {
                return getAuthenticatedSupabaseClient(req.token);
            } catch (error) {
                logger.warn('Failed to create authenticated client, using default client', { error: error.message });
                // Fallback to default client
                return this.supabase;
            }
        }
        // For public routes (getInvitationByToken), use default client which can view public invitations
        return this.supabase;
    }

    async getPendingInvitations(req, res) {
        const userId = req.user.id;
        try {
            logger.info('Fetching pending invitations for user', { userId });
            
            const { data: invitations, error } = await this.supabase
                .from('group_invitations')
                .select(`
                    id,
                    group_id,
                    invited_user,
                    invited_by,
                    status,
                    created_at,
                    groups (
                        id,
                        name,
                        created_by,
                        created_at
                    )
                `)
                .eq('invited_user', req.user.id)
                .eq('status', 'pending');

            if (error) {
                throw error;
            }

            // Fetch profile information for invited_by users separately
            if (invitations && invitations.length > 0) {
                const invitedByIds = [...new Set(invitations.map(inv => inv.invited_by))];
                const { data: profiles } = await this.supabase
                    .from('profiles')
                    .select('id, name, email')
                    .in('id', invitedByIds);

                // Add profile information to invitations
                const profilesMap = profiles ? profiles.reduce((acc, profile) => {
                    acc[profile.id] = profile;
                    return acc;
                }, {}) : {};

                invitations.forEach(invitation => {
                    invitation.profiles = profilesMap[invitation.invited_by];
                });
            }

            res.json(invitations || []);
        } catch (error) {
            logger.error('Failed to get pending invitations', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to fetch pending invitations' });
        }
    }

    async respondToInvitation(req, res) {
        const { invitationId } = req.params;
        const { response } = req.body; // 'accepted' or 'declined'
        const userId = req.user.id;

        try {
            logger.info('Responding to invitation', { userId, invitationId, response });

            // Validate response value
            if (!['accepted', 'declined'].includes(response)) {
                return res.status(400).json({ error: 'Invalid response. Must be "accepted" or "declined".' });
            }

            // Get the invitation to verify it belongs to the current user
            const { data: invitation, error: fetchError } = await this.supabase
                .from('group_invitations')
                .select('id, group_id, invited_user, status')
                .eq('id', invitationId)
                .eq('invited_user', userId)
                .eq('status', 'pending')
                .single();

            if (fetchError || !invitation) {
                return res.status(404).json({ error: 'Invitation not found or not accessible.' });
            }

            // Update invitation status
            const { error: updateError } = await this.supabase
                .from('group_invitations')
                .update({
                    status: response,
                    responded_at: new Date().toISOString()
                })
                .eq('id', invitationId);

            if (updateError) {
                throw updateError;
            }

            // If accepted, add user to the group
            if (response === 'accepted') {
                const { error: memberError } = await this.supabase
                    .from('group_members')
                    .insert({
                        group_id: invitation.group_id,
                        user_id: userId,
                        joined_at: new Date().toISOString()
                    });

                if (memberError) {
                    // If adding to group fails, revert the invitation status
                    await this.supabase
                        .from('group_invitations')
                        .update({ status: 'pending', responded_at: null })
                        .eq('id', invitationId);
                    
                    throw memberError;
                }
            }

            res.json({
                success: true,
                message: `Invitation ${response} successfully`,
                response
            });

        } catch (error) {
            logger.error('Failed to respond to invitation', { userId, invitationId, response, error: error.message });
            res.status(500).json({ error: 'Failed to respond to invitation' });
        }
    }

    async getInvitationByToken(req, res) {
        const { token } = req.params;

        try {
            logger.info('Fetching invitation by token', { token });

            // Get invitation by token
            const { data: invitation, error: fetchError } = await this.supabase
                .from('group_invitations')
                .select(`
                    id,
                    group_id,
                    invited_by,
                    invited_user,
                    status,
                    invitation_token,
                    expires_at,
                    created_at,
                    groups (
                        id,
                        name,
                        created_by,
                        created_at
                    )
                `)
                .eq('invitation_token', token)
                .single();

            if (fetchError || !invitation) {
                return res.status(404).json({ error: 'Invitation not found or invalid token.' });
            }

            // Check if invitation has expired
            if (invitation.expires_at) {
                const expiresAt = new Date(invitation.expires_at);
                const now = new Date();
                if (now > expiresAt) {
                    return res.status(410).json({ 
                        error: 'Invitation link has expired.',
                        expired: true,
                        expiresAt: invitation.expires_at
                    });
                }
            }

            // Check if invitation is still pending
            if (invitation.status !== 'pending') {
                return res.status(410).json({ 
                    error: 'This invitation has already been used.',
                    status: invitation.status
                });
            }

            // Fetch profile information for the person who sent the invitation
            let inviterProfile = null;
            if (invitation.invited_by) {
                const { data: profile } = await this.supabase
                    .from('profiles')
                    .select('id, name, email')
                    .eq('id', invitation.invited_by)
                    .single();
                inviterProfile = profile;
            }

            res.json({
                invitation: {
                    id: invitation.id,
                    groupId: invitation.group_id,
                    groupName: invitation.groups?.name,
                    inviter: inviterProfile,
                    expiresAt: invitation.expires_at,
                    createdAt: invitation.created_at
                }
            });

        } catch (error) {
            logger.error('Failed to get invitation by token', { token, error: error.message });
            res.status(500).json({ error: 'Failed to fetch invitation' });
        }
    }

    async acceptInvitationByLink(req, res) {
        const { token } = req.params;
        const userId = req.user?.id; // Optional - user might not be logged in

        try {
            logger.info('Accepting invitation by link', { token, userId });

            // Get invitation by token
            const { data: invitation, error: fetchError } = await this.supabase
                .from('group_invitations')
                .select('id, group_id, invited_by, invited_user, status, invitation_token, expires_at')
                .eq('invitation_token', token)
                .single();

            if (fetchError || !invitation) {
                return res.status(404).json({ error: 'Invitation not found or invalid token.' });
            }

            // Check if invitation has expired
            if (invitation.expires_at) {
                const expiresAt = new Date(invitation.expires_at);
                const now = new Date();
                if (now > expiresAt) {
                    return res.status(410).json({ 
                        error: 'Invitation link has expired.',
                        expired: true
                    });
                }
            }

            // Check if invitation is still pending
            if (invitation.status !== 'pending') {
                return res.status(410).json({ 
                    error: 'This invitation has already been used.',
                    status: invitation.status
                });
            }

            // If user is not logged in, return a response indicating they need to log in
            if (!userId) {
                return res.status(401).json({ 
                    error: 'You must be logged in to accept this invitation.',
                    requiresAuth: true
                });
            }

            // Get authenticated client for RLS policies
            const authenticatedClient = this.getAuthenticatedClient(req);

            // Check if user is already a member of the group
            const { data: existingMember } = await authenticatedClient
                .from('group_members')
                .select('id')
                .eq('group_id', invitation.group_id)
                .eq('user_id', userId)
                .single();

            if (existingMember) {
                // Update invitation status even if user is already a member
                await authenticatedClient
                    .from('group_invitations')
                    .update({
                        status: 'accepted',
                        invited_user: userId,
                        responded_at: new Date().toISOString()
                    })
                    .eq('id', invitation.id);

                return res.status(409).json({ 
                    error: 'You are already a member of this group.',
                    alreadyMember: true
                });
            }

            // Update invitation status
            const { error: updateError } = await authenticatedClient
                .from('group_invitations')
                .update({
                    status: 'accepted',
                    invited_user: userId,
                    responded_at: new Date().toISOString()
                })
                .eq('id', invitation.id);

            if (updateError) {
                throw updateError;
            }

            // Add user to the group
            const { error: memberError } = await authenticatedClient
                .from('group_members')
                .insert({
                    group_id: invitation.group_id,
                    user_id: userId,
                    joined_at: new Date().toISOString()
                });

            if (memberError) {
                // If adding to group fails, revert the invitation status
                await authenticatedClient
                    .from('group_invitations')
                    .update({ 
                        status: 'pending', 
                        invited_user: null,
                        responded_at: null 
                    })
                    .eq('id', invitation.id);
                
                throw memberError;
            }

            res.json({
                success: true,
                message: 'Invitation accepted successfully. You have been added to the group.',
                groupId: invitation.group_id
            });

        } catch (error) {
            logger.error('Failed to accept invitation by link', { token, userId, error: error.message });
            res.status(500).json({ error: 'Failed to accept invitation' });
        }
    }
}

module.exports = InvitationController;
