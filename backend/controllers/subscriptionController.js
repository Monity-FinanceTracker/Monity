const { logger } = require('../utils/logger');
const { supabaseAdmin } = require('../config/supabase');


class SubscriptionController {
    constructor(supabase) {
        this.supabase = supabase;
    }

    async getSubscriptionTier(req, res) {
        const userId = req.user.id;
        try {
            const { data, error } = await supabaseAdmin
                .from('profiles')
                .select('subscription_tier')
                .eq('id', userId)
                .single();

            if (error) {
                throw error;
            }

            if (!data) {
                return res.status(404).json({ error: 'User profile not found' });
            }

            res.json({ subscription_tier: data.subscription_tier });
        } catch (error) {
            logger.error('Failed to get subscription tier for user', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to fetch subscription tier' });
        }
    }
}

module.exports = SubscriptionController;
