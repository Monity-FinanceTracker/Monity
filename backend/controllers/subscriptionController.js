const { logger } = require('../utils/logger');
const { supabaseAdmin } = require('../config/supabase');


class SubscriptionController {
    constructor(supabase) {
        this.supabase = supabase;
    }

    async getSubscriptionTier(req, res) {
        try {
            // Check if user is authenticated
            if (!req.user || !req.user.id) {
                logger.warn('Subscription tier requested without authentication');
                return res.status(401).json({ error: 'Authentication required' });
            }

            const userId = req.user.id;
            logger.info('Fetching subscription tier for user', { userId });
            
            const { data, error } = await supabaseAdmin
                .from('profiles')
                .select('subscription_tier')
                .eq('id', userId)
                .single();

            if (error) {
                logger.error('Supabase error fetching subscription tier', { userId, error: error.message });
                // If user not found in profiles, return free tier
                if (error.code === 'PGRST116') {
                    return res.json({ subscription_tier: 'free' });
                }
                throw error;
            }

            if (!data) {
                logger.warn('User profile not found, returning free tier', { userId });
                return res.json({ subscription_tier: 'free' });
            }

            const tier = data.subscription_tier || 'free';
            logger.info('Successfully fetched subscription tier', { userId, tier });
            res.json({ subscription_tier: tier });
        } catch (error) {
            const userId = req.user?.id || 'unknown';
            logger.error('Failed to get subscription tier for user', { userId, error: error.message, stack: error.stack });
            res.status(500).json({ error: 'Failed to fetch subscription tier' });
        }
    }
}

module.exports = SubscriptionController;
