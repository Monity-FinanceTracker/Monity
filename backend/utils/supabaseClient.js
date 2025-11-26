const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_ANON_KEY } = require('../config/env');

/**
 * Creates an authenticated Supabase client with user context
 * This allows RLS policies to work correctly by using auth.uid()
 * 
 * @param {string} accessToken - JWT access token from the authenticated user
 * @returns {object} Supabase client configured with the user's token
 */
function getAuthenticatedSupabaseClient(accessToken) {
    if (!accessToken) {
        throw new Error('Access token is required to create authenticated Supabase client');
    }

    // Create client with global headers to pass token in all requests
    // This ensures RLS policies can access auth.uid() via the Authorization header
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        },
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            // Manually set the session using the access token
            storage: {
                getItem: () => null,
                setItem: () => {},
                removeItem: () => {}
            }
        }
    });

    // Manually set the access token in the auth state
    // This is required for RLS policies to work correctly
    supabase.auth['_accessToken'] = accessToken;
    
    // Set session synchronously if possible
    supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: null // Will be resolved on first query
    }).catch(() => {
        // Ignore errors - header-based auth should work
    });

    return supabase;
}

module.exports = {
    getAuthenticatedSupabaseClient
};

