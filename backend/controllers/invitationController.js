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
                    invited_email,
                    status,
                    created_at,
                    groups (
                        id,
                        name,
                        description
                    )
                `)
                .eq('invited_email', req.user.email)
                .eq('status', 'pending');

            if (error) {
                throw error;
            }

            res.json(invitations || []);
        } catch (error) {
            logger.error('Failed to get pending invitations', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to fetch pending invitations' });
        }
    }
}

module.exports = InvitationController;
