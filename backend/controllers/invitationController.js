const { logger } = require('../utils/logger');

class InvitationController {
    constructor(supabase) {
        this.supabase = supabase;
        // In the future, a model would be initialized here:
        // this.invitationModel = new Invitation(supabase);
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
}

module.exports = InvitationController;
