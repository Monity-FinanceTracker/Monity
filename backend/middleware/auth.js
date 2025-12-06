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
            logger.warn('Authentication failed: Invalid token', { 
                error: error?.message || 'No user returned',
                path: req.path,
                method: req.method,
                tokenPrefix: token ? `${token.substring(0, 20)}...` : 'missing'
            });
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
        // Use subscription_tier from req.user which was set by authenticate middleware
        // If not available or is 'free', query the profile as fallback using admin client
        let subscriptionTier = req.user.subscription_tier;

        // If subscription_tier is not 'premium', try to fetch from database with admin client
        // This handles cases where the profile might not have been loaded correctly
        if (subscriptionTier !== 'premium') {
            const { supabaseAdmin } = require('../config/supabase');
            const { data: profile, error } = await supabaseAdmin
                .from('profiles')
                .select('subscription_tier')
                .eq('id', req.user.id)
                .single();

            if (error) {
                logger.warn('Could not retrieve user profile for premium check', { userId: req.user.id, error });
                // If profile doesn't exist or query fails, treat as free tier (not premium)
                return res.status(403).json({ success: false, message: 'Forbidden: A premium subscription is required for this feature.' });
            }

            if (profile) {
                subscriptionTier = profile.subscription_tier;
            }
        }

        if (subscriptionTier !== 'premium') {
            return res.status(403).json({ success: false, message: 'Forbidden: A premium subscription is required for this feature.' });
        }

        next();
    } catch (err) {
        logger.error('Error in premium check middleware', { userId: req.user.id, error: err });
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const optionalAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    // If no token, continue without authentication
    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            // Token is invalid, but we allow the request to continue
            req.user = null;
            return next();
        }

        // Fetch user profile to get role and subscription_tier
        const { data: profile } = await supabase
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
        req.supabase = supabase;

        next();
    } catch (err) {
        // On error, continue without authentication
        logger.warn('Optional authentication failed, continuing without auth', { 
            error: err.message,
            path: req.path 
        });
        req.user = null;
        next();
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
    optionalAuth,
    checkPremium,
    requireRole
};
