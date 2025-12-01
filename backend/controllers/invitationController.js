const { logger } = require('../utils/logger');
const { getAuthenticatedSupabaseClient } = require('../utils/supabaseClient');
const { supabaseAdmin } = require('../config/supabase');
const { 
    maskToken, 
    validateInvitation 
} = require('../utils/invitationHelpers');

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
            logger.info('Fetching pending invitations for user', { 
                userId,
                timestamp: new Date().toISOString()
            });
            
            const { data: allInvitations, error } = await this.supabase
                .from('group_invitations')
                .select(`
                    id,
                    group_id,
                    invited_user,
                    invited_by,
                    status,
                    expires_at,
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
                logger.error('Database error while fetching pending invitations', {
                    userId,
                    error: error.message,
                    errorCode: error.code,
                    errorDetails: error.details
                });
                throw error;
            }

            // Filter out expired invitations
            const now = new Date();
            const invitations = (allInvitations || []).filter(inv => {
                if (!inv.expires_at) return true; // No expiration date means it doesn't expire
                const expiresAt = new Date(inv.expires_at);
                return expiresAt > now;
            });

            if (error) {
                logger.error('Database error while fetching pending invitations', {
                    userId,
                    error: error.message,
                    errorCode: error.code,
                    errorDetails: error.details
                });
                throw error;
            }

            logger.debug('Found pending invitations', { 
                userId, 
                count: invitations?.length || 0 
            });

            // Fetch profile information for invited_by users separately
            if (invitations && invitations.length > 0) {
                const invitedByIds = [...new Set(invitations.map(inv => inv.invited_by))];
                logger.debug('Fetching profiles for inviters', { 
                    userId, 
                    inviterIds: invitedByIds 
                });

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

                logger.debug('Profiles mapped to invitations', { 
                    userId, 
                    profilesFound: Object.keys(profilesMap).length 
                });
            }

            logger.info('Successfully retrieved pending invitations', { 
                userId, 
                count: invitations?.length || 0 
            });

            res.json(invitations || []);
        } catch (error) {
            logger.error('Failed to get pending invitations', { 
                userId, 
                error: error.message,
                errorCode: error.code,
                errorDetails: error.details,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            res.status(500).json({ error: 'Failed to fetch pending invitations' });
        }
    }

    async respondToInvitation(req, res) {
        const { invitationId } = req.params;
        const { response } = req.body; // 'accepted' or 'declined'
        const userId = req.user.id;

        try {
            logger.info('User responding to invitation', { 
                userId, 
                invitationId, 
                response,
                timestamp: new Date().toISOString()
            });

            // Validate response value
            if (!['accepted', 'declined'].includes(response)) {
                logger.warn('Invalid response value provided', { 
                    userId, 
                    invitationId, 
                    response 
                });
                return res.status(400).json({ error: 'Invalid response. Must be "accepted" or "declined".' });
            }

            // Get the invitation to verify it belongs to the current user
            const { data: invitation, error: fetchError } = await this.supabase
                .from('group_invitations')
                .select('id, group_id, invited_user, status, expires_at')
                .eq('id', invitationId)
                .eq('invited_user', userId)
                .eq('status', 'pending')
                .single();

            if (fetchError || !invitation) {
                logger.warn('Invitation not found or not accessible', { 
                    userId, 
                    invitationId,
                    error: fetchError?.message,
                    invitationExists: !!invitation
                });
                return res.status(404).json({ error: 'Invitation not found or not accessible.' });
            }

            // Validate invitation (expiration and status)
            const validation = validateInvitation(invitation);
            if (!validation.valid) {
                logger.warn('Invitation validation failed', { 
                    userId, 
                    invitationId,
                    error: validation.error,
                    expired: validation.expired,
                    status: validation.status
                });
                return res.status(validation.statusCode).json({
                    error: validation.error,
                    ...(validation.expired && { expired: true, expiresAt: validation.expiresAt }),
                    ...(validation.status && { status: validation.status })
                });
            }

            logger.debug('Invitation found and validated', { 
                userId, 
                invitationId, 
                groupId: invitation.group_id 
            });

            // Update invitation status
            const { error: updateError } = await this.supabase
                .from('group_invitations')
                .update({
                    status: response,
                    responded_at: new Date().toISOString()
                })
                .eq('id', invitationId);

            if (updateError) {
                logger.error('Failed to update invitation status', { 
                    userId, 
                    invitationId, 
                    response,
                    error: updateError.message,
                    errorCode: updateError.code
                });
                throw updateError;
            }

            logger.debug('Invitation status updated', { 
                userId, 
                invitationId, 
                newStatus: response 
            });

            // If accepted, add user to the group
            if (response === 'accepted') {
                logger.debug('Adding user to group after acceptance', { 
                    userId, 
                    groupId: invitation.group_id 
                });

                const { error: memberError } = await this.supabase
                    .from('group_members')
                    .insert({
                        group_id: invitation.group_id,
                        user_id: userId,
                        joined_at: new Date().toISOString()
                    });

                if (memberError) {
                    logger.error('Failed to add user to group, reverting invitation status', { 
                        userId, 
                        invitationId, 
                        groupId: invitation.group_id,
                        error: memberError.message,
                        errorCode: memberError.code
                    });
                    
                    // If adding to group fails, revert the invitation status
                    await this.supabase
                        .from('group_invitations')
                        .update({ status: 'pending', responded_at: null })
                        .eq('id', invitationId);
                    
                    throw memberError;
                }

                logger.info('User successfully added to group', { 
                    userId, 
                    groupId: invitation.group_id,
                    invitationId
                });
            }

            logger.info('Invitation response processed successfully', { 
                userId, 
                invitationId, 
                response,
                groupId: invitation.group_id
            });

            res.json({
                success: true,
                message: `Invitation ${response} successfully`,
                response
            });

        } catch (error) {
            logger.error('Failed to respond to invitation', { 
                userId, 
                invitationId, 
                response, 
                error: error.message,
                errorCode: error.code,
                errorDetails: error.details,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            res.status(500).json({ error: 'Failed to respond to invitation' });
        }
    }

    async getInvitationByToken(req, res) {
        const { token } = req.params;

        try {
            logger.info('Fetching invitation by token', { 
                token: maskToken(token),
                timestamp: new Date().toISOString()
            });

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
                logger.warn('Invitation not found by token', { 
                    token: maskToken(token),
                    error: fetchError?.message,
                    errorCode: fetchError?.code
                });
                return res.status(404).json({ error: 'Invitation not found or invalid token.' });
            }

            logger.debug('Invitation found by token', { 
                invitationId: invitation.id,
                groupId: invitation.group_id,
                status: invitation.status
            });

            // Validate invitation (expiration and status)
            const validation = validateInvitation(invitation);
            if (!validation.valid) {
                return res.status(validation.statusCode).json({
                    error: validation.error,
                    ...(validation.expired && { expired: true, expiresAt: validation.expiresAt }),
                    ...(validation.status && { status: validation.status })
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
                
                logger.debug('Inviter profile fetched', { 
                    invitationId: invitation.id,
                    inviterId: invitation.invited_by
                });
            }

            logger.info('Invitation retrieved successfully by token', { 
                invitationId: invitation.id,
                groupId: invitation.group_id,
                groupName: invitation.groups?.name
            });

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
            logger.error('Failed to get invitation by token', { 
                token: maskToken(token),
                error: error.message,
                errorCode: error.code,
                errorDetails: error.details,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            res.status(500).json({ error: 'Failed to fetch invitation' });
        }
    }

    async acceptInvitationByLink(req, res) {
        const { token } = req.params;
        const userId = req.user?.id; // Optional - user might not be logged in

        try {
            logger.info('Accepting invitation by link', { 
                token: maskToken(token),
                userId: userId || 'anonymous',
                timestamp: new Date().toISOString()
            });

            // Get invitation by token
            const { data: invitation, error: fetchError } = await this.supabase
                .from('group_invitations')
                .select('id, group_id, invited_by, invited_user, status, invitation_token, expires_at')
                .eq('invitation_token', token)
                .single();

            if (fetchError || !invitation) {
                logger.warn('Invitation not found by token for acceptance', { 
                    token: maskToken(token),
                    error: fetchError?.message,
                    errorCode: fetchError?.code
                });
                return res.status(404).json({ error: 'Invitation not found or invalid token.' });
            }

            logger.debug('Invitation found for acceptance', { 
                invitationId: invitation.id,
                groupId: invitation.group_id,
                status: invitation.status
            });

            // Validate invitation (expiration and status)
            const validation = validateInvitation(invitation);
            if (!validation.valid) {
                return res.status(validation.statusCode).json({
                    error: validation.error,
                    ...(validation.expired && { expired: true }),
                    ...(validation.status && { status: validation.status })
                });
            }

            // If user is not logged in, return a response indicating they need to log in
            if (!userId) {
                logger.info('User not authenticated, requiring login for invitation acceptance', { 
                    invitationId: invitation.id
                });
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
                logger.info('User already a member, updating invitation status', { 
                    userId, 
                    groupId: invitation.group_id,
                    invitationId: invitation.id
                });
                
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

            logger.debug('Updating invitation status to accepted', { 
                userId, 
                invitationId: invitation.id 
            });

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
                logger.error('Failed to update invitation status', { 
                    userId, 
                    invitationId: invitation.id,
                    error: updateError.message,
                    errorCode: updateError.code
                });
                throw updateError;
            }

            logger.debug('Adding user to group', { 
                userId, 
                groupId: invitation.group_id 
            });

            // Add user to the group
            const { error: memberError } = await authenticatedClient
                .from('group_members')
                .insert({
                    group_id: invitation.group_id,
                    user_id: userId,
                    joined_at: new Date().toISOString()
                });

            if (memberError) {
                logger.error('Failed to add user to group, reverting invitation status', { 
                    userId, 
                    invitationId: invitation.id,
                    groupId: invitation.group_id,
                    error: memberError.message,
                    errorCode: memberError.code
                });
                
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

            logger.info('Invitation accepted successfully by link', { 
                userId, 
                invitationId: invitation.id,
                groupId: invitation.group_id
            });

            res.json({
                success: true,
                message: 'Invitation accepted successfully. You have been added to the group.',
                groupId: invitation.group_id
            });

        } catch (error) {
            logger.error('Failed to accept invitation by link', { 
                token: maskToken(token),
                userId: userId || 'anonymous',
                error: error.message,
                errorCode: error.code,
                errorDetails: error.details,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            res.status(500).json({ error: 'Failed to accept invitation' });
        }
    }
}

module.exports = InvitationController;
