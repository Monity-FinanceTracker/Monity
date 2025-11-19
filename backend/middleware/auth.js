const { supabase } = require('../config');
const { logger } = require('../utils');

const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication token is required.' });
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            logger.warn('Authentication failed: Invalid token', { token });
            return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
        }

        // Fetch user profile to get role and subscription_tier from profiles table
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, subscription_tier')
            .eq('id', user.id)
            .single();

        // Enrich user object with profile data
        req.user = {
            ...user,
            role: profile?.role || user.user_metadata?.role || 'user',
            is_admin: profile?.role === 'admin' || user.user_metadata?.role === 'admin',
            subscription_tier: profile?.subscription_tier || user.user_metadata?.subscription_tier || 'free'
        };
        req.token = token;

        // Note: The logic for creating a role-specific Supabase client
        // will be handled differently in the new architecture.
        // For now, we attach the main client.
        req.supabase = supabase;

        next();
    } catch (err) {
        logger.error('Error in authentication middleware', { error: err });
        res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
    }
};

const checkPremium = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication is required for this feature.' });
    }

    try {
        const { data: profile, error } = await req.supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', req.user.id)
            .single();

        if (error || !profile) {
            logger.warn('Could not retrieve user profile for premium check', { userId: req.user.id, error });
            return res.status(404).json({ success: false, message: 'User profile not found.' });
        }

        if (profile.subscription_tier !== 'premium') {
            return res.status(403).json({ success: false, message: 'Forbidden: A premium subscription is required for this feature.' });
        }

        next();
    } catch (err) {
        logger.error('Error in premium check middleware', { userId: req.user.id, error: err });
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication is required.' });
        }

        // Check enriched role (from profiles table) first, then fallback to user_metadata
        const userRole = req.user.role || req.user.user_metadata?.role || 'user';

        if (userRole !== requiredRole) {
            return res.status(403).json({ success: false, message: 'Forbidden: You do not have the required permissions.' });
        }

        next();
    };
};


module.exports = {
    authenticate,
    checkPremium,
    requireRole
};
